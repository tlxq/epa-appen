import jwt from 'jsonwebtoken';
import { sql } from '../config/db.js';

export const adminAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer '))
    return res.status(401).json({ error: 'Token saknas eller ogiltig' });

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    const users = await sql`
      SELECT role FROM users WHERE id = ${decoded.userId}
    `;
    if (users.length === 0 || users[0].role !== 'admin')
      return res.status(403).json({ error: 'Endast admin åtkomst tillåten' });

    next();
  } catch (err) {
    console.error('❌ AdminAuth middleware:', err.message);
    res.status(401).json({ error: 'Ogiltig eller utgången token' });
  }
};
