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

// GET /api/users/me
userRoutes.get('/me', auth, async (req, res) => {
  try {
    const userId = req.user.userId;

    const users = await sql`
      SELECT id, email, username, role, created_at, avatar_url
      FROM users
      WHERE id = ${userId}
    `;

    if (users.length === 0)
      return res.status(404).json({ error: 'Anv��ndare hittades inte' });

    return res.status(200).json({ user: users[0] });
  } catch (e) {
    return res
      .status(500)
      .json({ error: 'Kunde inte hämta profil', details: e.message });
  }
});

// PUT /api/users/me  (uppdatera username)
userRoutes.put('/me', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { username } = req.body;

    if (!username || typeof username !== 'string') {
      return res.status(400).json({ error: 'username krävs' });
    }

    if (!/^[a-zA-Z0-9_]{3,32}$/.test(username)) {
      return res
        .status(400)
        .json({ error: 'Ogiltigt användarnamn (3-32 tecken, a-z 0-9 _)' });
    }

    const updated = await sql`
      UPDATE users
      SET username = ${username}
      WHERE id = ${userId}
      RETURNING id, email, username, role, created_at, avatar_url
    `;

    return res.status(200).json({ user: updated[0] });
  } catch (e) {
    if (e.code === '23505') {
      return res
        .status(400)
        .json({ error: 'Användarnamnet är redan upptaget' });
    }

    return res
      .status(500)
      .json({ error: 'Kunde inte uppdatera profil', details: e.message });
  }
});

// POST /api/users/me/avatar  (upload till Cloudinary + spara URL)
userRoutes.post(
  '/me/avatar',
  auth,
  upload.single('avatar'),
  async (req, res) => {
    try {
      const userId = req.user.userId;

      if (!req.file)
        return res.status(400).json({ error: 'Ingen fil mottagen' });

      // Mer tolerant lista (Android/iOS kan variera)
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
        public_id: `user_${userId}`, // samma id => ersätter tidigare avatar
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
      // Viktigt: logga hela felet i backend-terminalen
      console.error('Avatar upload error:', e);

      return res
        .status(500)
        .json({ error: 'Kunde inte ladda upp avatar', details: e.message });
    }
  },
);
