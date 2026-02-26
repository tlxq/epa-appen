import express from 'express';
import bcrypt from 'bcrypt';
import { sql } from '../config/db.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

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
      { expiresIn: process.env.JWT_EXPIRES_IN },
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
    console.error(error);
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
    // 1. kolla invite
    const invite = await sql`
      SELECT * FROM invites
      WHERE token = ${token} AND used = false
    `;

    if (invite.length === 0) {
      return res.status(400).json({ error: 'Ogiltig eller använd invite' });
    }

    const email = invite[0].email;
    const password_hash = await bcrypt.hash(password, 12);

    // 2. skapa user
    const user = await sql`
      INSERT INTO users (email, username, password_hash)
      VALUES (${email}, ${username}, ${password_hash})
      RETURNING id, email, username
    `;

    // 3. markera invite som använd
    await sql`
      UPDATE invites
      SET used = true
      WHERE token = ${token}
    `;

    res.status(201).json({ user: user[0] });
  } catch (error) {
    if (error.message.includes('unique')) {
      return res
        .status(400)
        .json({ error: 'Username eller email finns redan' });
    }

    console.error(error);
    res.status(500).json({ error: 'Registrering misslyckades' });
  }
});

export default router;
