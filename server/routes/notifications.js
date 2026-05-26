const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const pool = require('../database');

router.get('/', auth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT n.*, p.common_name as plant_name, p.cover_photo_path
       FROM notifications n LEFT JOIN plants p ON n.plant_id = p.id
       WHERE n.user_id = $1 ORDER BY n.created_at DESC LIMIT 50`, [req.user.id]);
    const { rows: cnt } = await pool.query('SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND read = FALSE', [req.user.id]);
    res.json({ notifications: rows, unreadCount: parseInt(cnt[0].count) });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/read-all', auth, async (req, res) => {
  try {
    await pool.query('UPDATE notifications SET read = TRUE WHERE user_id = $1', [req.user.id]);
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id/read', auth, async (req, res) => {
  try {
    await pool.query('UPDATE notifications SET read = TRUE WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    await pool.query('DELETE FROM notifications WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
