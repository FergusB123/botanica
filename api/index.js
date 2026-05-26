// Vercel serverless entry point — wraps the Express app
const app = require('../server/app');
const { initDatabase } = require('../server/database');

// Run schema migration on cold start (idempotent)
let initialised = false;
const originalHandler = app;

module.exports = async (req, res) => {
  if (!initialised) {
    try { await initDatabase(); initialised = true; } catch (e) { console.error('DB init error:', e.message); }
  }
  return originalHandler(req, res);
};
