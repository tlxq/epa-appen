import express from 'express';
import { auth } from '../middleware/auth.js';
import { sql } from '../config/db.js';

export const chatRoutes = express.Router();

// List conversations (one per unique user I've chatted with)
chatRoutes.get('/', auth, async (req, res) => {
  try {
    const userId = req.user.userId;

    const conversations = await sql`
      WITH last_messages AS (
        SELECT DISTINCT ON (
          LEAST(from_user_id, to_user_id),
          GREATEST(from_user_id, to_user_id)
        )
          id,
          from_user_id,
          to_user_id,
          content,
          created_at,
          read_at
        FROM messages
        WHERE from_user_id = ${userId} OR to_user_id = ${userId}
        ORDER BY
          LEAST(from_user_id, to_user_id),
          GREATEST(from_user_id, to_user_id),
          created_at DESC
      ),
      unread_counts AS (
        SELECT from_user_id AS other_id, COUNT(*) AS unread
        FROM messages
        WHERE to_user_id = ${userId} AND read_at IS NULL
        GROUP BY from_user_id
      )
      SELECT
        lm.*,
        CASE
          WHEN lm.from_user_id = ${userId} THEN lm.to_user_id
          ELSE lm.from_user_id
        END AS other_user_id,
        u.username AS other_username,
        u.name AS other_name,
        u.avatar_url AS other_avatar_url,
        COALESCE(uc.unread, 0) AS unread_count
      FROM last_messages lm
      JOIN users u ON u.id = CASE
        WHEN lm.from_user_id = ${userId} THEN lm.to_user_id
        ELSE lm.from_user_id
      END
      LEFT JOIN unread_counts uc ON uc.other_id = CASE
        WHEN lm.from_user_id = ${userId} THEN lm.to_user_id
        ELSE lm.from_user_id
      END
      ORDER BY lm.created_at DESC
    `;

    return res.status(200).json({ conversations });
  } catch (e) {
    return res.status(500).json({ error: 'Kunde inte hämta konversationer', details: e.message });
  }
});

// Get messages with a specific user (paginated, newest first)
chatRoutes.get('/:userId', auth, async (req, res) => {
  try {
    const myId = req.user.userId;
    const otherId = req.params.userId;
    const limit = Math.min(parseInt(req.query.limit) || 50, 100);
    const before = req.query.before; // cursor: ISO timestamp

    const msgs = before
      ? await sql`
          SELECT m.id, m.from_user_id, m.to_user_id, m.content, m.created_at, m.read_at
          FROM messages m
          WHERE (
            (m.from_user_id = ${myId} AND m.to_user_id = ${otherId}) OR
            (m.from_user_id = ${otherId} AND m.to_user_id = ${myId})
          )
          AND m.created_at < ${before}
          ORDER BY m.created_at DESC
          LIMIT ${limit}
        `
      : await sql`
          SELECT m.id, m.from_user_id, m.to_user_id, m.content, m.created_at, m.read_at
          FROM messages m
          WHERE (
            (m.from_user_id = ${myId} AND m.to_user_id = ${otherId}) OR
            (m.from_user_id = ${otherId} AND m.to_user_id = ${myId})
          )
          ORDER BY m.created_at DESC
          LIMIT ${limit}
        `;

    // Mark received messages as read
    await sql`
      UPDATE messages
      SET read_at = now()
      WHERE from_user_id = ${otherId}
        AND to_user_id = ${myId}
        AND read_at IS NULL
    `;

    return res.status(200).json({ messages: msgs.reverse() });
  } catch (e) {
    return res.status(500).json({ error: 'Kunde inte hämta meddelanden', details: e.message });
  }
});

// Send a message to a user
chatRoutes.post('/:userId', auth, async (req, res) => {
  try {
    const myId = req.user.userId;
    const toId = req.params.userId;
    const { content } = req.body;

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return res.status(400).json({ error: 'Meddelande får inte vara tomt' });
    }
    if (content.length > 1000) {
      return res.status(400).json({ error: 'Meddelande är för långt (max 1000 tecken)' });
    }
    if (myId === toId) {
      return res.status(400).json({ error: 'Du kan inte skicka meddelande till dig själv' });
    }

    // Ensure recipient exists
    const recipient = await sql`SELECT id FROM users WHERE id = ${toId}`;
    if (recipient.length === 0) {
      return res.status(404).json({ error: 'Mottagare hittades inte' });
    }

    const [msg] = await sql`
      INSERT INTO messages (from_user_id, to_user_id, content)
      VALUES (${myId}, ${toId}, ${content.trim()})
      RETURNING id, from_user_id, to_user_id, content, created_at, read_at
    `;

    return res.status(201).json({ message: msg });
  } catch (e) {
    return res.status(500).json({ error: 'Kunde inte skicka meddelande', details: e.message });
  }
});
