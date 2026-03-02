import express from 'express';
import { auth } from '../middleware/auth.js';
import { sql } from '../config/db.js';

export const userRoutes = express.Router();

userRoutes.get('/me', auth, async (req, res) => {
  try {
    const userId = req.user.userId;

    const users = await sql`
      SELECT id, email, username, role, created_at
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
