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
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

    await sql`
      INSERT INTO invites (email, token, expires_at)
      VALUES (${email}, ${token}, ${expiresAt})
    `;

    // Använd rätt route för invites!
    const inviteLink = `${process.env.FRONTEND_URL}/epadunk/invite-register?token=${token}`;

    await sendInviteEmail({
      to: email,
      inviteLink,
    });

    res.status(201).json({ message: 'Invite skickad', inviteLink });
  } catch (error) {
    console.error('❌ Admin invite error:', error);
    res.status(500).json({ error: 'Kunde inte skapa invite' });
  }
});

export default router;
