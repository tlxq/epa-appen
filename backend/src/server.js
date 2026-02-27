import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { testDBConnection } from './config/db.js';
import { authRoutes } from './routes/authRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(
  cors({
    origin: [
      process.env.FRONTEND_URL || 'http://localhost:3000',
      'http://localhost:3000',
      'http://localhost:19006',
    ],
    credentials: true,
  }),
);

app.use(express.json());

app.use('/api/auth', authRoutes);

app.get('/api/health', async (req, res) => {
  try {
    await testDBConnection();
    res.status(200).json({ status: 'ok', db: 'connected' });
  } catch (error) {
    res
      .status(500)
      .json({ status: 'fail', db: 'failed', error: error.message });
  }
});

app.use((req, res) => res.status(404).json({ error: 'Not found' }));

const startServer = async () => {
  try {
    await testDBConnection();
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
