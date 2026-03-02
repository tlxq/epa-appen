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

    if (
      name !== undefined &&
      (typeof name !== 'string' || name.trim().length < 2)
    ) {
      return res.status(400).json({ error: 'Namn måste vara minst 2 tecken' });
    }

    if (bio !== undefined && (typeof bio !== 'string' || bio.length > 280)) {
      return res.status(400).json({ error: 'Bio får max vara 280 tecken' });
    }

    if (
      car_make !== undefined &&
      (typeof car_make !== 'string' || car_make.length > 40)
    ) {
      return res.status(400).json({ error: 'Bil-märke är för långt' });
    }

    if (
      car_model !== undefined &&
      (typeof car_model !== 'string' || car_model.length > 40)
    ) {
      return res.status(400).json({ error: 'Bil-modell är för långt' });
    }

    const updated = await sql`
      UPDATE users
      SET
        name = COALESCE(${name}, name),
        bio = COALESCE(${bio}, bio),
        car_make = COALESCE(${car_make}, car_make),
        car_model = COALESCE(${car_model}, car_model)
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
