import pg from 'pg';

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('Missing DATABASE_URL environment variable.');
}

const sslMode = process.env.PGSSL === 'true' || process.env.PGSSLMODE === 'require';

export const db = new Pool({
  connectionString,
  ssl: sslMode ? { rejectUnauthorized: false } : undefined,
});

export const query = (text, params = []) => db.query(text, params);
