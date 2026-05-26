const express = require('express');
const router = express.Router();
const multer = require('multer');
const auth = require('../middleware/auth');
const pool = require('../database');
const claude = require('../services/claude');
const { uploadFile, deleteFile } = require('../services/storage');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

function parsePlant(p) {
  if (!p) return p;
  return { ...p, care_tips: tryParse(p.care_tips, []), toxic: Boolean(p.toxic) };
}
function tryParse(s, fb) { try { return JSON.parse(s); } catch { return fb; } }

// GET /api/plants
router.get('/', auth, async (req, res) => {
  const { room, difficulty, sort } = req.query;
  const orderMap = { next_watering: 'next_watering_at ASC NULLS LAST', recently_added: 'created_at DESC', name: 'common_name ASC', health: 'health_score DESC NULLS LAST' };
  let query = 'SELECT * FROM plants WHERE user_id = $1';
  const params = [req.user.id];
  if (room) { query += ` AND room = $${params.push(room)}`; }
  if (difficulty) { query += ` AND difficulty = $${params.push(difficulty)}`; }
  query += ` ORDER BY ${orderMap[sort] || 'created_at DESC'}`;
  try {
    const { rows } = await pool.query(query, params);
    res.json({ plants: rows.map(parsePlant) });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/plants/identify
router.post('/identify', auth, upload.array('photos', 5), async (req, res) => {
  if (!req.files?.length) return res.status(400).json({ error: 'At least one photo is required' });
  try {
    const imageData = req.files.map(f => ({ buffer: f.buffer, mimetype: f.mimetype }));
    const identification = await claude.identifyPlant(imageData);
    // Upload photos to storage and return URLs
    const photos = await Promise.all(req.files.map(f => uploadFile(f.buffer, f.originalname, f.mimetype)));
    res.json({ identification, photos });
  } catch (err) {
    console.error('Identify error:', err.message);
    res.status(500).json({ error: 'Plant identification failed. Check your API key and try again.' });
  }
});

// POST /api/plants
router.post('/', auth, upload.array('photos', 5), async (req, res) => {
  const { common_name, scientific_name, family, room, watering_frequency_days, sunlight, temp_min, temp_max, humidity, difficulty, toxic, growth_rate, typical_lifespan, care_tips, fun_fact, notes, existing_photos } = req.body;
  if (!common_name) return res.status(400).json({ error: 'Plant name is required' });
  try {
    const freqDays = parseInt(watering_frequency_days) || 7;
    const nextWatering = new Date(); nextWatering.setDate(nextWatering.getDate() + freqDays);
    const { rows } = await pool.query(
      `INSERT INTO plants (user_id, common_name, scientific_name, family, room, watering_frequency_days, sunlight, temp_min, temp_max, humidity, difficulty, toxic, growth_rate, typical_lifespan, care_tips, fun_fact, notes, next_watering_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18) RETURNING *`,
      [req.user.id, common_name, scientific_name || null, family || null, room || 'Unassigned', freqDays, sunlight || null,
       temp_min ? parseFloat(temp_min) : null, temp_max ? parseFloat(temp_max) : null, humidity || null, difficulty || 'Easy',
       (toxic === 'true' || toxic === true), growth_rate || null, typical_lifespan || null,
       Array.isArray(care_tips) ? JSON.stringify(care_tips) : (care_tips || null), fun_fact || null, notes || null, nextWatering.toISOString()]
    );
    const plant = rows[0];

    const allPhotos = [];
    if (existing_photos) allPhotos.push(...(Array.isArray(existing_photos) ? existing_photos : existing_photos.split(',')).filter(Boolean));
    if (req.files?.length) {
      const uploaded = await Promise.all(req.files.map(f => uploadFile(f.buffer, f.originalname, f.mimetype)));
      allPhotos.push(...uploaded);
    }

    let coverPhoto = null;
    for (let i = 0; i < allPhotos.length; i++) {
      if (i === 0) coverPhoto = allPhotos[i];
      await pool.query('INSERT INTO plant_photos (plant_id, file_path, is_cover) VALUES ($1, $2, $3)', [plant.id, allPhotos[i], i === 0]);
    }
    if (coverPhoto) await pool.query('UPDATE plants SET cover_photo_path = $1 WHERE id = $2', [coverPhoto, plant.id]);

    await pool.query(`INSERT INTO journal_entries (plant_id, type, content, photo_path) VALUES ($1, 'added', $2, $3)`,
      [plant.id, `${common_name} was added to the collection`, coverPhoto]);

    const { rows: updated } = await pool.query('SELECT * FROM plants WHERE id = $1', [plant.id]);
    res.status(201).json({ plant: parsePlant(updated[0]) });
  } catch (err) { console.error(err); res.status(500).json({ error: err.message }); }
});

// GET /api/plants/:id
router.get('/:id', auth, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM plants WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
    if (!rows[0]) return res.status(404).json({ error: 'Plant not found' });
    const plant = parsePlant(rows[0]);
    const { rows: photos } = await pool.query('SELECT * FROM plant_photos WHERE plant_id = $1 ORDER BY is_cover DESC, created_at DESC', [plant.id]);
    const { rows: hc } = await pool.query('SELECT * FROM health_checks WHERE plant_id = $1 ORDER BY created_at DESC LIMIT 1', [plant.id]);
    const lh = hc[0] ? { ...hc[0], recommendations: tryParse(hc[0].recommendations, []), issues: tryParse(hc[0].issues, []), positive_signs: tryParse(hc[0].positive_signs, []) } : null;
    res.json({ plant, photos, latestHealth: lh });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PUT /api/plants/:id
router.put('/:id', auth, async (req, res) => {
  try {
    const { rows: existing } = await pool.query('SELECT * FROM plants WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
    if (!existing[0]) return res.status(404).json({ error: 'Plant not found' });
    const p = existing[0];
    const { common_name, scientific_name, family, room, watering_frequency_days, sunlight, temp_min, temp_max, humidity, difficulty, toxic, growth_rate, typical_lifespan, care_tips, fun_fact, notes } = req.body;
    const freqDays = parseInt(watering_frequency_days) || p.watering_frequency_days;
    let nextWatering = p.next_watering_at;
    if (freqDays !== p.watering_frequency_days && p.last_watered_at) {
      const base = new Date(p.last_watered_at); base.setDate(base.getDate() + freqDays); nextWatering = base.toISOString();
    }
    await pool.query(
      `UPDATE plants SET common_name=$1, scientific_name=$2, family=$3, room=$4, watering_frequency_days=$5, sunlight=$6, temp_min=$7, temp_max=$8, humidity=$9, difficulty=$10, toxic=$11, growth_rate=$12, typical_lifespan=$13, care_tips=$14, fun_fact=$15, notes=$16, next_watering_at=$17 WHERE id=$18 AND user_id=$19`,
      [common_name||p.common_name, scientific_name??p.scientific_name, family??p.family, room||p.room, freqDays,
       sunlight??p.sunlight, temp_min!==undefined?parseFloat(temp_min):p.temp_min, temp_max!==undefined?parseFloat(temp_max):p.temp_max,
       humidity??p.humidity, difficulty||p.difficulty, (toxic==='true'||toxic===true), growth_rate??p.growth_rate,
       typical_lifespan??p.typical_lifespan, Array.isArray(care_tips)?JSON.stringify(care_tips):(care_tips??p.care_tips),
       fun_fact??p.fun_fact, notes??p.notes, nextWatering, req.params.id, req.user.id]
    );
    const { rows } = await pool.query('SELECT * FROM plants WHERE id = $1', [req.params.id]);
    res.json({ plant: parsePlant(rows[0]) });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE /api/plants/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT id FROM plants WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
    if (!rows[0]) return res.status(404).json({ error: 'Plant not found' });
    await pool.query('DELETE FROM plants WHERE id = $1', [req.params.id]);
    res.json({ message: 'Plant deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/plants/:id/water
router.post('/:id/water', auth, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM plants WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
    if (!rows[0]) return res.status(404).json({ error: 'Plant not found' });
    const plant = rows[0];
    const now = new Date(); const next = new Date(now); next.setDate(next.getDate() + plant.watering_frequency_days);
    await pool.query('UPDATE plants SET last_watered_at = $1, next_watering_at = $2 WHERE id = $3', [now.toISOString(), next.toISOString(), plant.id]);
    await pool.query(`INSERT INTO journal_entries (plant_id, type, content) VALUES ($1, 'watered', $2)`, [plant.id, `${plant.common_name} was watered`]);
    await pool.query(`UPDATE notifications SET read = TRUE WHERE plant_id = $1 AND type = 'watering_reminder' AND read = FALSE`, [plant.id]);
    const { rows: updated } = await pool.query('SELECT * FROM plants WHERE id = $1', [plant.id]);
    res.json({ plant: parsePlant(updated[0]) });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/plants/:id/photos
router.post('/:id/photos', auth, upload.array('photos', 5), async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT id FROM plants WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
    if (!rows[0]) return res.status(404).json({ error: 'Plant not found' });
    if (!req.files?.length) return res.status(400).json({ error: 'No photos provided' });
    const photos = await Promise.all(req.files.map(async f => {
      const url = await uploadFile(f.buffer, f.originalname, f.mimetype);
      await pool.query('INSERT INTO plant_photos (plant_id, file_path, is_cover) VALUES ($1, $2, FALSE)', [req.params.id, url]);
      return url;
    }));
    res.json({ photos });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE /api/plants/:id/photos/:photoId
router.delete('/:id/photos/:photoId', auth, async (req, res) => {
  try {
    const { rows: plant } = await pool.query('SELECT id FROM plants WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
    if (!plant[0]) return res.status(404).json({ error: 'Plant not found' });
    const { rows: photo } = await pool.query('SELECT * FROM plant_photos WHERE id = $1 AND plant_id = $2', [req.params.photoId, req.params.id]);
    if (!photo[0]) return res.status(404).json({ error: 'Photo not found' });
    await pool.query('DELETE FROM plant_photos WHERE id = $1', [photo[0].id]);
    await deleteFile(photo[0].file_path);
    if (photo[0].is_cover) {
      const { rows: next } = await pool.query('SELECT * FROM plant_photos WHERE plant_id = $1 LIMIT 1', [req.params.id]);
      if (next[0]) {
        await pool.query('UPDATE plant_photos SET is_cover = TRUE WHERE id = $1', [next[0].id]);
        await pool.query('UPDATE plants SET cover_photo_path = $1 WHERE id = $2', [next[0].file_path, req.params.id]);
      } else {
        await pool.query('UPDATE plants SET cover_photo_path = NULL WHERE id = $1', [req.params.id]);
      }
    }
    res.json({ message: 'Photo deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/plants/:id/health-check
router.post('/:id/health-check', auth, upload.single('photo'), async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM plants WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
    if (!rows[0]) return res.status(404).json({ error: 'Plant not found' });
    if (!req.file) return res.status(400).json({ error: 'Photo required' });
    const plant = rows[0];
    const result = await claude.healthCheck({ buffer: req.file.buffer, mimetype: req.file.mimetype }, plant.common_name, req.body.symptoms);
    const photoPath = await uploadFile(req.file.buffer, req.file.originalname, req.file.mimetype);
    const { rows: hc } = await pool.query(
      `INSERT INTO health_checks (plant_id, photo_path, health_score, overall_status, diagnosis, recommendations, issues, positive_signs, urgency)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [plant.id, photoPath, result.health_score, result.overall_status, result.diagnosis,
       JSON.stringify(result.recommendations||[]), JSON.stringify(result.issues||[]), JSON.stringify(result.positive_signs||[]), result.urgency]
    );
    await pool.query('UPDATE plants SET health_score = $1 WHERE id = $2', [result.health_score, plant.id]);
    await pool.query(`INSERT INTO journal_entries (plant_id, type, content, photo_path) VALUES ($1, 'health_check', $2, $3)`,
      [plant.id, `Health check: ${result.health_score}/10 — ${result.urgency}`, photoPath]);
    if (result.urgency === 'Urgent') {
      await pool.query(`INSERT INTO notifications (user_id, plant_id, type, message) VALUES ($1, $2, 'health_alert', $3)`,
        [req.user.id, plant.id, `🚨 ${plant.common_name} needs urgent attention! Health score: ${result.health_score}/10`]);
    }
    res.json({ healthCheck: { ...hc[0], recommendations: result.recommendations, issues: result.issues, positive_signs: result.positive_signs } });
  } catch (err) { console.error('Health check error:', err.message); res.status(500).json({ error: 'Health check failed. Please try again.' }); }
});

// GET /api/plants/:id/health-checks
router.get('/:id/health-checks', auth, async (req, res) => {
  try {
    const { rows: plant } = await pool.query('SELECT id FROM plants WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
    if (!plant[0]) return res.status(404).json({ error: 'Plant not found' });
    const { rows } = await pool.query('SELECT * FROM health_checks WHERE plant_id = $1 ORDER BY created_at DESC', [req.params.id]);
    res.json({ healthChecks: rows.map(h => ({ ...h, recommendations: tryParse(h.recommendations,[]), issues: tryParse(h.issues,[]), positive_signs: tryParse(h.positive_signs,[]) })) });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/plants/:id/propagate
router.post('/:id/propagate', auth, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM plants WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
    if (!rows[0]) return res.status(404).json({ error: 'Plant not found' });
    const guide = await claude.getPropagationGuide(rows[0].common_name, rows[0].scientific_name);
    res.json({ guide });
  } catch (err) { res.status(500).json({ error: 'Could not generate propagation guide. Please try again.' }); }
});

module.exports = router;
