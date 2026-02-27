import jwt from 'jsonwebtoken';

if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET saknas i env!');

export const auth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing token' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
  } catch (err) {
    console.error('❌ Auth middleware:', err.message);
    return res.status(401).json({ error: 'Invalid token' });
  }
};
