// Local dev only — on Vercel this is handled by api/cron/watering.js
const cron = require('node-cron');
const pool = require('../database');

function startCronJobs() {
  if (process.env.VERCEL) return; // Vercel handles cron separately

  cron.schedule('0 8 * * *', async () => {
    console.log('[cron] Running watering reminder check...');
    try {
      const today = new Date().toISOString().split('T')[0];
      const { rows: duePlants } = await pool.query(
        `SELECT p.id, p.common_name, p.user_id FROM plants p WHERE DATE(p.next_watering_at) <= $1`, [today]
      );
      for (const plant of duePlants) {
        const { rows } = await pool.query(
          `SELECT id FROM notifications WHERE plant_id = $1 AND type = 'watering_reminder' AND read = FALSE AND DATE(created_at) = $2`,
          [plant.id, today]
        );
        if (rows.length) continue;
        await pool.query(
          `INSERT INTO notifications (user_id, plant_id, type, message) VALUES ($1, $2, 'watering_reminder', $3)`,
          [plant.user_id, plant.id, `💧 ${plant.common_name} needs watering`]
        );
      }
      console.log(`[cron] Reminders created for ${duePlants.length} plant(s).`);
    } catch (err) { console.error('[cron] Error:', err.message); }
  });

  console.log('[cron] Watering reminder scheduled (daily 08:00).');
}

module.exports = { startCronJobs };
