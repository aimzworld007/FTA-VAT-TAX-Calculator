import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { query } from './query.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function ensureSchema() {
  const sql = await fs.readFile(path.join(__dirname, 'schema.sql'), 'utf8');
  await query(sql);
}
