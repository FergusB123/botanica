require('dotenv').config({ override: true });
const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/auth');
const plantsRoutes = require('./routes/plants');
const journalRoutes = require('./routes/journal');
const notificationsRoutes = require('./routes/notifications');
const roomsRoutes = require('./routes/rooms');
const dashboardRoutes = require('./routes/dashboard');
const configRoutes = require('./routes/config');

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve local uploads in development
if (!process.env.VERCEL) {
  app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
}

app.use('/api/auth', authRoutes);
app.use('/api/plants', plantsRoutes);
app.use('/api/journal', journalRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/rooms', roomsRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/config', configRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

module.exports = app;
