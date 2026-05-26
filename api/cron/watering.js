// Called by Vercel Cron at 08:00 daily
const pool = require('../../server/database');

module.exports = async (req, res) => {
  // Protect against random web requests
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}` && process.env.CRON_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const today = new Date().toISOString().split('T')[0];
    const { rows: duePlants } = await pool.query(
      `SELECT p.id, p.common_name, p.user_id, p.next_watering_at
       FROM plants p WHERE DATE(p.next_watering_at) <= $1`, [today]
    );

    let created = 0;
    for (const plant of duePlants) {
      const { rows: existing } = await pool.query(
        `SELECT id FROM notifications WHERE plant_id = $1 AND type = 'watering_reminder' AND read = FALSE AND DATE(created_at) = $2`,
        [plant.id, today]
      );
      if (existing.length) continue;

      const dueDate = new Date(plant.next_watering_at);
      const overdueDays = Math.floor((new Date() - dueDate) / (1000 * 60 * 60 * 24));
      const message = overdueDays > 0
        ? `💧 ${plant.common_name} is ${overdueDays} day${overdueDays !== 1 ? 's' : ''} overdue for watering`
        : `💧 ${plant.common_name} needs watering today`;

      await pool.query(
        `INSERT INTO notifications (user_id, plant_id, type, message) VALUES ($1, $2, 'watering_reminder', $3)`,
        [plant.user_id, plant.id, message]
      );
      created++;
    }

    res.json({ ok: true, checked: duePlants.length, created });
  } catch (err) {
    console.error('Cron error:', err.message);
    res.status(500).json({ error: err.message });
  }
};
