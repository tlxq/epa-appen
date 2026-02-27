import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { sql } from '../config/db.js';
import { generateToken } from '../utils/generateToken.js';
import { sendInviteEmail } from './mailService.js';

const BCRYPT_SALT_ROUNDS = 12;

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function loginUser({ email, password }) {
  if (!email || !password)
    throw { status: 400, message: 'Email och lösenord krävs' };
  const users = await sql`
    SELECT id, email, username, password_hash, role FROM users WHERE email = ${email}
  `;
  if (users.length === 0) throw { status: 401, message: 'Fel inloggning' };
  const user = users[0];

  const validPassword = await bcrypt.compare(password, user.password_hash);
  if (!validPassword) throw { status: 401, message: 'Fel inloggning' };

  const payload = { userId: user.id, email: user.email, role: user.role };
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  });
  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    },
  };
}

export async function registerUser({ token, username, password }) {
  if (!token || !username || !password)
    throw { status: 400, message: 'Token, username och lösenord krävs' };
  if (password.length < 8)
    throw { status: 400, message: 'Lösenordet är för kort' };
  if (!/^[a-zA-Z0-9_]{3,32}$/.test(username))
    throw { status: 400, message: 'Ogiltigt användarnamn' };

  const invites = await sql`
    SELECT email FROM invites WHERE token = ${token} AND used = false AND expires_at > now()
  `;
  if (invites.length === 0)
    throw { status: 400, message: 'Ogiltig eller använd invite' };

  const email = invites[0].email;
  if (!validateEmail(email))
    throw { status: 400, message: 'Ogiltigt email-format (invite)' };

  const passwordHash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

  try {
    await sql.begin(async (sql) => {
      await sql`
        INSERT INTO users (email, username, password_hash)
        VALUES (${email}, ${username}, ${passwordHash})
      `;
      await sql`
        UPDATE invites SET used = true WHERE token = ${token}
      `;
    });
  } catch (error) {
    if (error.code === '23505')
      throw { status: 400, message: 'Email eller användarnamn redan upptaget' };
    throw { status: 500, message: 'Registrering misslyckades' };
  }
}

export async function sendInvite({ email }) {
  if (!email || !validateEmail(email))
    throw { status: 400, message: 'Korrekt email krävs' };
  const token = generateToken();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  await sql`
    INSERT INTO invites (email, token, expires_at) VALUES (${email}, ${token}, ${expiresAt})
  `;

  const inviteLink = `${process.env.FRONTEND_URL}/epadunk/invite-register?token=${token}`;
  await sendInviteEmail({ to: email, inviteLink });

  return { inviteLink };
}
