import express from 'express';
import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

import { auth } from '../middleware/auth.js';
import { sql } from '../config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const userRoutes = express.Router();

const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase() || '.jpg';
    const userId = req.user.userId;
    cb(null, `avatar_${userId}_${Date.now()}${ext}`);
  },
});

function fileFilter(req, file, cb) {
  const ok = ['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype);
  if (!ok) return cb(new Error('Endast jpg/png/webp är tillåtet'));
  cb(null, true);
}

const upload = multer({
  storage,
  fileFilter,
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
      if (!req.file)
        return res.status(400).json({ error: 'Ingen fil mottagen' });

      const userId = req.user.userId;

      const avatarUrl = `/uploads/${req.file.filename}`;

      await sql`
        UPDATE users
        SET avatar_url = ${avatarUrl}
        WHERE id = ${userId}
      `;

      return res.status(200).json({ avatarUrl });
    } catch (e) {
      return res
        .status(500)
        .json({ error: 'Kunde inte spara avatar', details: e.message });
    }
  },
);
