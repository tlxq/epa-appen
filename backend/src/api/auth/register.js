import express from 'express';
import bcrypt from 'bcrypt';
import { sql } from '../../config/db.js';

const router = express.Router();

router.post('/', async (req, res) => {
  const { token, username, password } = req.body;

  if (!token || !username || !password) {
    return res
      .status(400)
      .json({ error: 'Token, username och lösenord krävs' });
  }

  if (password.length < 8) {
    return res.status(400).json({ error: 'Lösenordet är för kort' });
  }

  try {
    // Kolla invite-token
    const invites = await sql`
      SELECT email
      FROM invites
      WHERE token = ${token} AND used = false AND expires_at > now()
    `;

    if (invites.length === 0) {
      return res.status(400).json({ error: 'Ogiltig eller använd invite' });
    }

    const email = invites[0].email;
    const passwordHash = await bcrypt.hash(password, 10);

    try {
      await sql.begin(async (sql) => {
        await sql`
          INSERT INTO users (email, username, password_hash)
          VALUES (${email}, ${username}, ${passwordHash})
        `;

        await sql`
          UPDATE invites
          SET used = true
          WHERE token = ${token}
        `;
      });
    } catch (error) {
      if (error.code === '23505') {
        return res
          .status(400)
          .json({ error: 'Email eller användarnamn redan upptaget' });
      }
      throw error;
    }

    res.status(201).json({ message: 'Användare registrerad' });
  } catch (error) {
    console.error('❌ Register error:', error);
    res.status(500).json({ error: 'Registrering misslyckades' });
  }
});

export default router;
