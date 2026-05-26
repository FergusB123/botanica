const { Pool } = require('@neondatabase/serverless');

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required. See .env.example');
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function initDatabase() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      push_subscription TEXT
    );

    CREATE TABLE IF NOT EXISTS plants (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      common_name TEXT NOT NULL,
      scientific_name TEXT,
      family TEXT,
      room TEXT DEFAULT 'Unassigned',
      watering_frequency_days INTEGER DEFAULT 7,
      sunlight TEXT,
      temp_min REAL,
      temp_max REAL,
      humidity TEXT,
      difficulty TEXT DEFAULT 'Easy',
      toxic BOOLEAN DEFAULT FALSE,
      growth_rate TEXT,
      typical_lifespan TEXT,
      care_tips TEXT,
      fun_fact TEXT,
      notes TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      last_watered_at TIMESTAMPTZ,
      next_watering_at TIMESTAMPTZ,
      health_score INTEGER,
      cover_photo_path TEXT
    );

    CREATE TABLE IF NOT EXISTS plant_photos (
      id SERIAL PRIMARY KEY,
      plant_id INTEGER NOT NULL REFERENCES plants(id) ON DELETE CASCADE,
      file_path TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      is_cover BOOLEAN DEFAULT FALSE
    );

    CREATE TABLE IF NOT EXISTS journal_entries (
      id SERIAL PRIMARY KEY,
      plant_id INTEGER NOT NULL REFERENCES plants(id) ON DELETE CASCADE,
      type TEXT DEFAULT 'manual',
      content TEXT,
      photo_path TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS health_checks (
      id SERIAL PRIMARY KEY,
      plant_id INTEGER NOT NULL REFERENCES plants(id) ON DELETE CASCADE,
      photo_path TEXT,
      health_score INTEGER,
      overall_status TEXT,
      diagnosis TEXT,
      recommendations TEXT,
      issues TEXT,
      positive_signs TEXT,
      urgency TEXT DEFAULT 'Healthy',
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      plant_id INTEGER,
      type TEXT,
      message TEXT,
      read BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);
  console.log('Database schema ready.');
}

module.exports = pool;
module.exports.initDatabase = initDatabase;
