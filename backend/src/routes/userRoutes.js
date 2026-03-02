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
      SELECT id, email, username, role, created_at, avatar_url
      FROM users
      WHERE id = ${userId}
    `;

    if (users.length === 0) {
      return res.status(404).json({ error: 'Användare hittades inte' });
    }

    return res.status(200).json({ user: users[0] });
  } catch (e) {
    return res
      .status(500)
      .json({ error: 'Kunde inte hämta profil', details: e.message });
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

      const allowed = ['image/jpeg', 'image/png', 'image/webp'];
      if (!allowed.includes(req.file.mimetype)) {
        return res
          .status(400)
          .json({ error: 'Endast jpg/png/webp är tillåtet' });
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
      return res
        .status(500)
        .json({ error: 'Kunde inte ladda upp avatar', details: e.message });
    }
  },
);
