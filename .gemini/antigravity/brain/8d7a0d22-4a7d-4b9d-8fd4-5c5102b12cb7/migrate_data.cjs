const sqlite3 = require('better-sqlite3');
const pg = require('pg');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const sqlitePath = path.resolve('sqlite.db');
const pgUrl = process.env.DATABASE_URL;

if (!pgUrl) {
  console.error('DATABASE_URL is missing');
  process.exit(1);
}

async function migrate() {
  let db;
  try {
    db = new sqlite3(sqlitePath);
    console.log('Connected to SQLite.');
  } catch (err) {
    console.error('Could not connect to SQLite:', err.message);
    return;
  }
  
  const pool = new pg.Pool({ connectionString: pgUrl });

  const tables = [
    'users', 'team_members', 'portfolio_companies', 'contact_submissions',
    'newsletter_signups', 'site_content', 'media_uploads', 'site_pages',
    'content_sections', 'navigation_links', 'global_settings'
  ];

  for (const table of tables) {
    try {
      console.log(`Migrating ${table}...`);
      const rows = db.prepare(`SELECT * FROM ${table}`).all();
      
      if (rows.length === 0) {
        console.log(`Table ${table} is empty.`);
        continue;
      }

      const columns = Object.keys(rows[0]);
      const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
      const colNames = columns.map(c => `"${c}"`).join(', ');
      
      const insertQuery = `INSERT INTO "${table}" (${colNames}) VALUES (${placeholders}) ON CONFLICT DO NOTHING`;

      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        for (const row of rows) {
          const values = Object.values(row).map(v => {
            if (v !== null && typeof v === 'object') return JSON.stringify(v);
            return v;
          });
          await client.query(insertQuery, values);
        }
        await client.query('COMMIT');
        console.log(`Successfully migrated ${rows.length} rows into ${table}`);
      } catch (err) {
        await client.query('ROLLBACK');
        console.error(`Error in table ${table}:`, err.message);
      } finally {
        client.release();
      }
    } catch (err) {
      console.error(`Skipping table ${table} due to error:`, err.message);
    }
  }

  await pool.end();
  db.close();
  console.log('Migration finished!');
}

migrate();
