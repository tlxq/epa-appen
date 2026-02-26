import jwt from 'jsonwebtoken';
import { sql } from '../config/db.js';

if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET saknas i env!');

export const adminAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing token' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { userId, email }

    // Kolla role i DB
    const users = await sql`
      SELECT role
      FROM users
      WHERE id = ${decoded.userId}
    `;

    if (users.length === 0 || users[0].role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    next();
  } catch (err) {
    console.error('❌ AdminAuth middleware:', err.message);
    res.status(401).json({ error: 'Invalid token' });
  }
};
