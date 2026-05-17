import pg from 'pg';

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is required');
}

const sslEnabled = process.env.PGSSL === 'true' || process.env.PGSSLMODE === 'require';

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: sslEnabled ? { rejectUnauthorized: false } : undefined,
});

pool.on('error', (err) => {
  console.error('PostgreSQL pool error:', err.message);
});
