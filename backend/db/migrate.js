import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { query } from './query.js';
import { pool } from './pool.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function run() {
  const sql = await fs.readFile(path.join(__dirname, 'schema.sql'), 'utf8');
  await query('BEGIN');
  try {
    await query(sql);
    await query('COMMIT');
    console.log('Migration applied successfully.');
  } catch (e) {
    await query('ROLLBACK');
    console.error('Migration failed:', e.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}
run();
