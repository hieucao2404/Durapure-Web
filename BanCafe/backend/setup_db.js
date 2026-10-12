const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function initializeDatabase() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is required');
  }

  const useDatabaseSsl = process.env.DATABASE_SSL === 'true';
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: useDatabaseSsl ? { rejectUnauthorized: false } : false
  });

  try {
    const existing = await pool.query(`
      SELECT COUNT(*)::int AS count
      FROM pg_catalog.pg_tables
      WHERE schemaname = 'public'
        AND tablename = ANY($1::text[])
    `, [[
      'products', 'orders', 'orderitems', 'customdesigns',
      'blogs', 'settings', 'farm_videos'
    ]]);

    if (existing.rows[0].count === 7) {
      console.log('Database schema already exists; initialization skipped.');
      return;
    }

    const sql = fs.readFileSync(path.join(__dirname, 'init_supabase.sql'), 'utf8');
    console.log('Initializing database schema and sample content...');
    await pool.query(`BEGIN;\n${sql}\nCOMMIT;`);
    console.log('Database initialized successfully.');
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  initializeDatabase().catch(err => {
    console.error('Database initialization failed:', err);
    process.exitCode = 1;
  });
}

module.exports = { initializeDatabase };