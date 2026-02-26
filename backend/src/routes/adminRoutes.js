import express from 'express';
import { sql } from '../config/db.js';
import { generateToken } from '../utils/generateToken.js';
import { adminAuth } from '../middleware/adminAuth.js';
import { sendInviteEmail } from '../services/mailService.js';

const router = express.Router();

// POST /api/admin/invite
router.post('/invite', adminAuth, async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email krävs' });
  }

  try {
    const token = generateToken();

    await sql`
      INSERT INTO invites (email, token)
      VALUES (${email}, ${token})
    `;

    const inviteLink = `${process.env.FRONTEND_URL}/register?token=${token}`;

    await sendInviteEmail({
      to: email,
      inviteLink,
    });

    res.status(201).json({ message: 'Invite skickad' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Kunde inte skapa invite' });
  }
});

export default router;
