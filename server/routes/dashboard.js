const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const pool = require('../database');
const claude = require('../services/claude');

router.get('/', auth, async (req, res) => {
  try {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const { rows: allPlants } = await pool.query('SELECT * FROM plants WHERE user_id = $1', [req.user.id]);
    const waterToday = allPlants.filter(p => p.next_watering_at && new Date(p.next_watering_at).toISOString().split('T')[0] === todayStr);
    const overdue = allPlants.filter(p => p.next_watering_at && new Date(p.next_watering_at) < today && new Date(p.next_watering_at).toISOString().split('T')[0] !== todayStr);
    const healthAlerts = allPlants.filter(p => p.health_score !== null && p.health_score <= 4);
    const { rows: recentPlants } = await pool.query('SELECT * FROM plants WHERE user_id = $1 ORDER BY created_at DESC LIMIT 4', [req.user.id]);
    const seasonalTip = await claude.getSeasonalTip(today.getMonth() + 1).catch(() => ({ title: 'Keep an eye on your plants', tip: 'Regular observation helps you catch issues early.', emoji: '🌱' }));
    res.json({
      stats: { totalPlants: allPlants.length, waterToday: waterToday.length, overdue: overdue.length, healthAlerts: healthAlerts.length },
      waterTodayPlants: waterToday.map(p => ({ id: p.id, common_name: p.common_name, cover_photo_path: p.cover_photo_path, room: p.room })),
      overduePlants: overdue.map(p => ({ id: p.id, common_name: p.common_name, cover_photo_path: p.cover_photo_path, next_watering_at: p.next_watering_at })),
      recentPlants,
      seasonalTip
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
