import express from 'express';
import { auth } from '../middleware/auth.js';
import { sql } from '../config/db.js';

export const locationRoutes = express.Router();

// Update own location
locationRoutes.put('/me/location', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { lat, lng } = req.body;

    if (typeof lat !== 'number' || typeof lng !== 'number') {
      return res.status(400).json({ error: 'lat och lng måste vara nummer' });
    }

    await sql`
      UPDATE users
      SET location_lat = ${lat},
          location_lng = ${lng},
          location_updated_at = now()
      WHERE id = ${userId}
    `;

    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: 'Kunde inte uppdatera position', details: e.message });
  }
});

// Toggle location sharing on/off
locationRoutes.patch('/me/location-sharing', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { sharing } = req.body;

    if (typeof sharing !== 'boolean') {
      return res.status(400).json({ error: 'sharing måste vara true eller false' });
    }

    // Clear location when turning off (privacy)
    if (!sharing) {
      await sql`
        UPDATE users
        SET location_sharing = false,
            location_lat = null,
            location_lng = null,
            location_updated_at = null
        WHERE id = ${userId}
      `;
    } else {
      await sql`
        UPDATE users SET location_sharing = true WHERE id = ${userId}
      `;
    }

    return res.status(200).json({ sharing });
  } catch (e) {
    return res.status(500).json({ error: 'Kunde inte uppdatera delning', details: e.message });
  }
});

// Get all users currently sharing location (updated within last 15 minutes)
locationRoutes.get('/locations', auth, async (req, res) => {
  try {
    const userId = req.user.userId;

    const users = await sql`
      SELECT
        id,
        username,
        name,
        avatar_url,
        car_make,
        car_model,
        location_lat,
        location_lng,
        location_updated_at
      FROM users
      WHERE location_sharing = true
        AND location_lat IS NOT NULL
        AND location_lng IS NOT NULL
        AND location_updated_at > now() - INTERVAL '15 minutes'
        AND id != ${userId}
    `;

    return res.status(200).json({ users });
  } catch (e) {
    return res.status(500).json({ error: 'Kunde inte hämta positioner', details: e.message });
  }
});
