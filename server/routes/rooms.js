const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const pool = require('../database');

const DEFAULT_ROOMS = ['Living Room','Bedroom','Kitchen','Bathroom','Office','Outdoors','Balcony','Hallway'];

router.get('/', auth, async (req, res) => {
  try {
    const { rows: plants } = await pool.query(
      'SELECT id, common_name, room, cover_photo_path, next_watering_at, last_watered_at, difficulty, health_score FROM plants WHERE user_id = $1 ORDER BY common_name ASC',
      [req.user.id]
    );
    const today = new Date();
    const roomMap = {};
    DEFAULT_ROOMS.forEach(r => { roomMap[r] = { name: r, plants: [], overdueCount: 0, isDefault: true }; });
    for (const plant of plants) {
      const r = plant.room || 'Unassigned';
      if (!roomMap[r]) roomMap[r] = { name: r, plants: [], overdueCount: 0, isDefault: false };
      const isOverdue = plant.next_watering_at && new Date(plant.next_watering_at) < today;
      if (isOverdue) roomMap[r].overdueCount++;
      roomMap[r].plants.push({ ...plant, isOverdue });
    }
    const rooms = Object.values(roomMap).filter(r => r.plants.length > 0).sort((a, b) => b.plants.length - a.plants.length);
    res.json({ rooms, defaultRooms: DEFAULT_ROOMS });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
