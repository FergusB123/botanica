const app = require('./app');
const { initDatabase } = require('./database');
const { startCronJobs } = require('./services/cron');

const PORT = process.env.PORT || 3001;

initDatabase()
  .then(() => {
    startCronJobs();
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🌿 Botanica running on http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('Failed to start:', err.message);
    process.exit(1);
  });
