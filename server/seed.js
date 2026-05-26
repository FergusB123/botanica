require('dotenv').config();
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');
const db = require('./database');
const { initDatabase } = require('./database');

initDatabase();

// ── helpers ──────────────────────────────────────────────────────────────────

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

function daysFromNow(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString();
}

// Simple SVG placeholder for each plant (base64-embeddable or saved as file)
function writeSvgPlaceholder(filename, bgColor, label) {
  const uploadsDir = path.join(__dirname, 'uploads');
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
  <rect width="400" height="400" fill="${bgColor}"/>
  <text x="200" y="180" font-family="Georgia, serif" font-size="64" fill="rgba(255,255,255,0.4)" text-anchor="middle">🌿</text>
  <text x="200" y="240" font-family="Georgia, serif" font-size="22" fill="rgba(255,255,255,0.7)" text-anchor="middle">${label}</text>
</svg>`;

  const filePath = path.join(uploadsDir, filename);
  fs.writeFileSync(filePath, svg);
  return `/uploads/${filename}`;
}

// ── wipe existing demo data ───────────────────────────────────────────────────

const existing = db.prepare('SELECT id FROM users WHERE email = ?').get('demo@botanica.app');
if (existing) {
  db.prepare('DELETE FROM users WHERE id = ?').run(existing.id);
  console.log('Removed existing demo user.');
}

// ── create demo user ──────────────────────────────────────────────────────────

const passwordHash = bcrypt.hashSync('demo1234', 12);
const userResult = db.prepare(
  'INSERT INTO users (email, name, password_hash) VALUES (?, ?, ?)'
).run('demo@botanica.app', 'Alex Green', passwordHash);
const userId = userResult.lastInsertRowid;
console.log(`Created demo user (id=${userId}).`);

// ── create placeholder images ─────────────────────────────────────────────────

const photos = {
  monstera:    writeSvgPlaceholder('seed-monstera.svg',    '#2D4A3E', 'Monstera'),
  fiddleLeaf:  writeSvgPlaceholder('seed-fiddleleaf.svg',  '#3d5a3e', 'Fiddle Leaf'),
  snakePlant:  writeSvgPlaceholder('seed-snake.svg',       '#4a6741', 'Snake Plant'),
  pothos:      writeSvgPlaceholder('seed-pothos.svg',      '#5c7a4a', 'Pothos'),
};

// ── plant data ────────────────────────────────────────────────────────────────

const plants = [
  {
    common_name: 'Monstera Deliciosa',
    scientific_name: 'Monstera deliciosa',
    family: 'Araceae',
    room: 'Living Room',
    watering_frequency_days: 7,
    sunlight: 'Bright indirect',
    temp_min: 18,
    temp_max: 30,
    humidity: 'Medium',
    difficulty: 'Easy',
    toxic: 1,
    growth_rate: 'Moderate',
    typical_lifespan: 'Decades',
    care_tips: JSON.stringify([
      'Wipe leaves monthly to keep them dust-free and photosynthesising efficiently',
      'Use a moss pole to encourage larger, fenestrated leaves',
      'Yellow leaves usually mean overwatering — always check the soil before watering'
    ]),
    fun_fact: 'The name "Monstera" comes from the Latin word for "monstrous" — referring to the enormous leaves this plant can produce in the wild.',
    cover_photo_path: photos.monstera,
    last_watered_at: daysAgo(3),
    next_watering_at: daysFromNow(4),
    health_score: 9
  },
  {
    common_name: 'Fiddle Leaf Fig',
    scientific_name: 'Ficus lyrata',
    family: 'Moraceae',
    room: 'Bedroom',
    watering_frequency_days: 10,
    sunlight: 'Bright indirect',
    temp_min: 16,
    temp_max: 27,
    humidity: 'Medium',
    difficulty: 'Hard',
    toxic: 1,
    growth_rate: 'Slow',
    typical_lifespan: '25 years',
    care_tips: JSON.stringify([
      'Never move the pot — fiddle leaf figs hate being relocated',
      'Water only when the top inch of soil is dry',
      'Avoid cold draughts and air conditioning vents'
    ]),
    fun_fact: 'In the wild, Ficus lyrata grows as an epiphyte — it starts life on another tree before its roots reach the ground.',
    cover_photo_path: photos.fiddleLeaf,
    last_watered_at: daysAgo(12),
    next_watering_at: daysAgo(2),   // overdue
    health_score: 6
  },
  {
    common_name: 'Snake Plant',
    scientific_name: 'Dracaena trifasciata',
    family: 'Asparagaceae',
    room: 'Office',
    watering_frequency_days: 21,
    sunlight: 'Low light',
    temp_min: 13,
    temp_max: 32,
    humidity: 'Low',
    difficulty: 'Easy',
    toxic: 1,
    growth_rate: 'Slow',
    typical_lifespan: 'Decades',
    care_tips: JSON.stringify([
      'Allow soil to dry out completely between waterings',
      'Tolerates low light but grows faster in bright indirect light',
      'One of the best plants for improving indoor air quality'
    ]),
    fun_fact: 'Snake plants are one of few plants that continue to produce oxygen at night, making them excellent bedroom companions.',
    cover_photo_path: photos.snakePlant,
    last_watered_at: daysAgo(28),
    next_watering_at: daysAgo(7),   // overdue
    health_score: 8
  },
  {
    common_name: 'Golden Pothos',
    scientific_name: 'Epipremnum aureum',
    family: 'Araceae',
    room: 'Kitchen',
    watering_frequency_days: 7,
    sunlight: 'Low to medium indirect',
    temp_min: 15,
    temp_max: 30,
    humidity: 'Medium',
    difficulty: 'Easy',
    toxic: 1,
    growth_rate: 'Fast',
    typical_lifespan: '10+ years',
    care_tips: JSON.stringify([
      'Trail the vines along a shelf for a beautiful cascading effect',
      'Can be propagated by cutting just below a node and placing in water',
      'Tolerates neglect better than almost any other houseplant'
    ]),
    fun_fact: 'Pothos is nicknamed "Devil\'s Ivy" because it stays green even in dark conditions where most plants would die.',
    cover_photo_path: photos.pothos,
    last_watered_at: daysAgo(5),
    next_watering_at: daysFromNow(2),
    health_score: 10
  }
];

// ── insert plants + journal + health checks ───────────────────────────────────

for (const p of plants) {
  const result = db.prepare(`
    INSERT INTO plants (
      user_id, common_name, scientific_name, family, room,
      watering_frequency_days, sunlight, temp_min, temp_max, humidity,
      difficulty, toxic, growth_rate, typical_lifespan, care_tips, fun_fact,
      cover_photo_path, last_watered_at, next_watering_at, health_score
    ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
  `).run(
    userId, p.common_name, p.scientific_name, p.family, p.room,
    p.watering_frequency_days, p.sunlight, p.temp_min, p.temp_max, p.humidity,
    p.difficulty, p.toxic, p.growth_rate, p.typical_lifespan, p.care_tips, p.fun_fact,
    p.cover_photo_path, p.last_watered_at, p.next_watering_at, p.health_score
  );

  const plantId = result.lastInsertRowid;

  // Cover photo
  db.prepare('INSERT INTO plant_photos (plant_id, file_path, is_cover) VALUES (?,?,1)').run(plantId, p.cover_photo_path);

  // Journal entries
  db.prepare(`INSERT INTO journal_entries (plant_id, type, content, created_at) VALUES (?, 'added', ?, ?)`)
    .run(plantId, `${p.common_name} was added to the collection`, daysAgo(30));

  if (p.last_watered_at) {
    db.prepare(`INSERT INTO journal_entries (plant_id, type, content, created_at) VALUES (?, 'watered', ?, ?)`)
      .run(plantId, `${p.common_name} was watered`, p.last_watered_at);
  }

  // Health check
  db.prepare(`
    INSERT INTO health_checks (plant_id, photo_path, health_score, overall_status, diagnosis, recommendations, issues, positive_signs, urgency, created_at)
    VALUES (?,?,?,?,?,?,?,?,?,?)
  `).run(
    plantId, p.cover_photo_path, p.health_score,
    p.health_score >= 8 ? 'Thriving' : p.health_score >= 5 ? 'Needs attention' : 'Struggling',
    p.health_score >= 8
      ? `${p.common_name} looks healthy with vibrant foliage and good colour.`
      : `${p.common_name} shows some signs of stress. Review watering schedule and light conditions.`,
    JSON.stringify(['Maintain current care routine', 'Wipe leaves to remove dust', 'Check soil moisture before watering']),
    JSON.stringify([]),
    JSON.stringify(['Good leaf colour', 'No visible pests', 'Upright growth']),
    p.health_score >= 8 ? 'Healthy' : p.health_score >= 5 ? 'Monitor' : 'Urgent',
    daysAgo(14)
  );

  console.log(`  ✓ ${p.common_name} (id=${plantId})`);
}

// ── watering notifications for overdue plants ────────────────────────────────

const overdue = db.prepare(`SELECT id, common_name FROM plants WHERE user_id = ? AND date(next_watering_at) < date('now')`)
  .all(userId);

for (const p of overdue) {
  db.prepare(`INSERT INTO notifications (user_id, plant_id, type, message) VALUES (?,?,'watering_reminder',?)`)
    .run(userId, p.id, `💧 ${p.common_name} is overdue for watering`);
}

console.log('\n✅ Seed complete!');
console.log('   Email:    demo@botanica.app');
console.log('   Password: demo1234\n');
