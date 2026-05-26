const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const auth = require('../middleware/auth');

const ENV_PATH = path.join(__dirname, '..', '.env');

function writeEnvKey(key, value) {
  let content = fs.existsSync(ENV_PATH) ? fs.readFileSync(ENV_PATH, 'utf8').replace(/^﻿/, '') : '';
  const regex = new RegExp(`^${key}=.*$\\r?`, 'gm');
  content = content.replace(regex, '');
  content = `${key}=${value}\n` + content.replace(/^\n+/, '');
  fs.writeFileSync(ENV_PATH, content, { encoding: 'utf8' });
}

// GET /api/config
router.get('/', auth, (req, res) => {
  const key = process.env.ANTHROPIC_API_KEY || '';
  const configured = Boolean(key && key !== 'your_anthropic_api_key_here');
  res.json({
    apiKeyConfigured: configured,
    apiKeyPreview: configured ? key.slice(0, 8) + '…' + key.slice(-4) : null,
    isVercel: !!process.env.VERCEL
  });
});

// POST /api/config/api-key — local dev only
router.post('/api-key', auth, (req, res) => {
  if (process.env.VERCEL) {
    return res.status(400).json({ error: 'On Vercel, set ANTHROPIC_API_KEY in the Vercel dashboard → Settings → Environment Variables.' });
  }
  const { apiKey } = req.body;
  if (!apiKey?.trim()) return res.status(400).json({ error: 'API key is required' });
  const trimmed = apiKey.trim();
  writeEnvKey('ANTHROPIC_API_KEY', trimmed);
  process.env.ANTHROPIC_API_KEY = trimmed;
  res.json({ ok: true, preview: trimmed.slice(0, 8) + '…' + trimmed.slice(-4) });
});

module.exports = router;
