import express from 'express';
import dotenv from 'dotenv';
import { sql, testDBConnection } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import { authMiddleware } from './middleware/authMiddleware.js';
import inviteRoutes from './api/auth/invite.js';
import registerRoutes from './api/auth/register.js';
import loginRoutes from './api/auth/login.js';
import { auth } from './middleware/auth.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(express.json());

app.get('/api/me', authMiddleware, (req, res) => {
  res.json({
    message: 'Du är inloggad',
    user: req.user,
  });
});

app.get('/api/me', auth, async (req, res) => {
  res.status(200).json({
    message: 'Du är inloggad',
    user: req.user,
  });
});

/* -------------------- HEALTH ROUTE ------------------- */
app.get('/api/health', async (req, res) => {
  try {
    const result = await sql`SELECT 1 AS connected`;
    res.status(200).json({
      status: 'ok',
      db: result[0].connected === 1 ? 'connected' : 'failed',
    });
  } catch (error) {
    res.status(500).json({ status: 'ok', db: 'failed', error: error.message });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/auth/invite', inviteRoutes);
app.use('/api/auth/register', registerRoutes);
app.use('/api/auth/login', loginRoutes);

/* ------------------- START SERVER -------------------- */
const startServer = async () => {
  try {
    await testDBConnection();

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch {
    process.exit(1);
  }
};

startServer();
