const express = require('express');
const router = express.Router();
const multer = require('multer');
const auth = require('../middleware/auth');
const pool = require('../database');
const { uploadFile } = require('../services/storage');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

async function ownsPlant(plantId, userId) {
  const { rows } = await pool.query('SELECT id FROM plants WHERE id = $1 AND user_id = $2', [plantId, userId]);
  return rows[0];
}

router.get('/:plantId', auth, async (req, res) => {
  try {
    if (!await ownsPlant(req.params.plantId, req.user.id)) return res.status(404).json({ error: 'Plant not found' });
    const { rows } = await pool.query('SELECT * FROM journal_entries WHERE plant_id = $1 ORDER BY created_at DESC', [req.params.plantId]);
    res.json({ entries: rows });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/:plantId', auth, upload.single('photo'), async (req, res) => {
  try {
    if (!await ownsPlant(req.params.plantId, req.user.id)) return res.status(404).json({ error: 'Plant not found' });
    const { content } = req.body;
    if (!content && !req.file) return res.status(400).json({ error: 'Content or photo required' });
    const photoPath = req.file ? await uploadFile(req.file.buffer, req.file.originalname, req.file.mimetype) : null;
    const { rows } = await pool.query(
      `INSERT INTO journal_entries (plant_id, type, content, photo_path) VALUES ($1, 'manual', $2, $3) RETURNING *`,
      [req.params.plantId, content || null, photoPath]
    );
    res.status(201).json({ entry: rows[0] });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:plantId/:entryId', auth, async (req, res) => {
  try {
    if (!await ownsPlant(req.params.plantId, req.user.id)) return res.status(404).json({ error: 'Plant not found' });
    const { rows } = await pool.query(`SELECT id FROM journal_entries WHERE id = $1 AND plant_id = $2 AND type = 'manual'`, [req.params.entryId, req.params.plantId]);
    if (!rows[0]) return res.status(404).json({ error: 'Entry not found or not deletable' });
    await pool.query('DELETE FROM journal_entries WHERE id = $1', [rows[0].id]);
    res.json({ message: 'Entry deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
