import express from 'express';
import multer from 'multer';

import { auth } from '../middleware/auth.js';
import { sql } from '../config/db.js';
import { cloudinary } from '../config/cloudinary.js';

export const userRoutes = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 3 * 1024 * 1024 }, // 3MB
});

userRoutes.get('/me', auth, async (req, res) => {
  try {
    const userId = req.user.userId;

    const users = await sql`
      SELECT
        id,
        email,
        username,
        role,
        created_at,
        avatar_url,
        name,
        bio,
        car_make,
        car_model
      FROM users
      WHERE id = ${userId}
    `;

    if (users.length === 0)
      return res.status(404).json({ error: 'Användare hittades inte' });

    return res.status(200).json({ user: users[0] });
  } catch (e) {
    return res
      .status(500)
      .json({ error: 'Kunde inte hämta profil', details: e.message });
  }
});

userRoutes.put('/me', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { name, bio, car_make, car_model } = req.body;

    // Treat empty string as "clear field" (null), undefined as "no change"
    const normName = name === '' ? undefined : name;
    const normBio = bio === undefined ? undefined : bio === '' ? null : bio;
    const normCarMake = car_make === undefined ? undefined : car_make === '' ? null : car_make;
    const normCarModel = car_model === undefined ? undefined : car_model === '' ? null : car_model;

    if (
      normName !== undefined &&
      (typeof normName !== 'string' || normName.trim().length < 2)
    ) {
      return res.status(400).json({ error: 'Namn måste vara minst 2 tecken' });
    }

    if (
      normBio !== undefined &&
      normBio !== null &&
      (typeof normBio !== 'string' || normBio.length > 280)
    ) {
      return res.status(400).json({ error: 'Bio får max vara 280 tecken' });
    }

    if (
      normCarMake !== undefined &&
      normCarMake !== null &&
      (typeof normCarMake !== 'string' || normCarMake.length > 40)
    ) {
      return res.status(400).json({ error: 'Bil-märke är för långt' });
    }

    if (
      normCarModel !== undefined &&
      normCarModel !== null &&
      (typeof normCarModel !== 'string' || normCarModel.length > 40)
    ) {
      return res.status(400).json({ error: 'Bil-modell är för långt' });
    }

    // Fetch current values so we can merge (avoids COALESCE + null confusion)
    const current = await sql`
      SELECT name, bio, car_make, car_model FROM users WHERE id = ${userId}
    `;
    if (current.length === 0)
      return res.status(404).json({ error: 'Användare hittades inte' });

    const curr = current[0];
    const newName      = normName      !== undefined ? normName.trim()  : curr.name;
    const newBio       = normBio       !== undefined ? normBio          : curr.bio;
    const newCarMake   = normCarMake   !== undefined ? normCarMake      : curr.car_make;
    const newCarModel  = normCarModel  !== undefined ? normCarModel     : curr.car_model;

    const updated = await sql`
      UPDATE users
      SET
        name      = ${newName},
        bio       = ${newBio},
        car_make  = ${newCarMake},
        car_model = ${newCarModel}
      WHERE id = ${userId}
      RETURNING
        id,
        email,
        username,
        role,
        created_at,
        avatar_url,
        name,
        bio,
        car_make,
        car_model
    `;

    return res.status(200).json({ user: updated[0] });
  } catch (e) {
    return res
      .status(500)
      .json({ error: 'Kunde inte uppdatera profil', details: e.message });
  }
});

userRoutes.post(
  '/me/avatar',
  auth,
  upload.single('avatar'),
  async (req, res) => {
    try {
      const userId = req.user.userId;

      if (!req.file)
        return res.status(400).json({ error: 'Ingen fil mottagen' });

      const allowed = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/webp',
        'image/heic',
        'image/heif',
      ];
      if (!allowed.includes(req.file.mimetype)) {
        return res.status(400).json({
          error: `Endast bilder är tillåtna (jpg/jpeg/png/webp/heic). Fick: ${req.file.mimetype}`,
        });
      }

      const base64 = req.file.buffer.toString('base64');
      const dataUri = `data:${req.file.mimetype};base64,${base64}`;

      const uploadResult = await cloudinary.uploader.upload(dataUri, {
        folder: 'epa-appen/avatars',
        public_id: `user_${userId}`,
        overwrite: true,
        resource_type: 'image',
        transformation: [
          { width: 512, height: 512, crop: 'fill' },
          { quality: 'auto' },
          { fetch_format: 'auto' },
        ],
      });

      const avatarUrl = uploadResult.secure_url;

      await sql`
      UPDATE users
      SET avatar_url = ${avatarUrl}
      WHERE id = ${userId}
    `;

      return res.status(200).json({ avatarUrl });
    } catch (e) {
      console.error('Avatar upload error:', e);
      return res
        .status(500)
        .json({ error: 'Kunde inte ladda upp avatar', details: e.message });
    }
  },
);
