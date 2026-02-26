import express from 'express';
import bcrypt from 'bcrypt';
import { sql } from '../config/db.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET saknas i env!');

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email och lösenord krävs' });
  }

  try {
    const users = await sql`
      SELECT id, email, username, password_hash
      FROM users
      WHERE email = ${email}
    `;

    if (users.length === 0) {
      return res.status(401).json({ error: 'Fel inloggning' });
    }

    const user = users[0];
    const validPassword = await bcrypt.compare(password, user.password_hash);

    if (!validPassword) {
      return res.status(401).json({ error: 'Fel inloggning' });
    }

    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' },
    );

    res.status(200).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
      },
    });
  } catch (error) {
    console.error('❌ Auth login error:', error);
    res.status(500).json({ error: 'Serverfel' });
  }
});

// POST /api/auth/register
router.post('/register', async (req, res) => {
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
    // Kolla invite-token: både used=false och ej expired!
    const invites = await sql`
      SELECT email
      FROM invites
      WHERE token = ${token} AND used = false AND expires_at > now()
    `;

    if (invites.length === 0) {
      return res.status(400).json({ error: 'Ogiltig eller använd invite' });
    }

    const email = invites[0].email;
    const passwordHash = await bcrypt.hash(password, 12);

    // Atomic: skapa user + markera invite som used
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
        // Unique violation (användarnamn, email etc)
        return res
          .status(400)
          .json({ error: 'Username eller email finns redan' });
      }
      throw error;
    }

    res.status(201).json({ message: 'Användare registrerad' });
  } catch (error) {
    console.error('❌ Auth register error:', error);
    res.status(500).json({ error: 'Registrering misslyckades' });
  }
});

export default router;
