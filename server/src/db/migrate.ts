import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { pool } from './pool.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

export async function runMigrations(): Promise<void> {
  const sql = readFileSync(
    join(__dirname, 'migrations', '001_init.sql'),
    'utf-8'
  );
  await pool.query(sql);
  console.log('Migrations complete');
}
