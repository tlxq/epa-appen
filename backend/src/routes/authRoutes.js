import express from 'express';
import {
  loginUser,
  registerUser,
  sendInvite,
} from '../services/authService.js';
import { auth } from '../middleware/auth.js';
import { adminAuth } from '../middleware/adminAuth.js';

export const authRoutes = express.Router();

authRoutes.post('/login', async (req, res) => {
  try {
    const result = await loginUser(req.body);
    return res.status(200).json(result);
  } catch (e) {
    return res.status(e.status || 500).json({ error: e.message });
  }
});

authRoutes.post('/register', async (req, res) => {
  try {
    await registerUser(req.body);
    return res.status(201).json({ message: 'Användare registrerad' });
  } catch (e) {
    return res.status(e.status || 500).json({ error: e.message });
  }
});

authRoutes.post('/invite', adminAuth, async (req, res) => {
  try {
    const { inviteLink } = await sendInvite(req.body);
    return res.status(201).json({ message: 'Invite skickad', inviteLink });
  } catch (e) {
    return res.status(e.status || 500).json({ error: e.message });
  }
});

authRoutes.get('/me', auth, (req, res) => {
  res.status(200).json({
    message: 'Du är inloggad',
    user: req.user,
  });
});
