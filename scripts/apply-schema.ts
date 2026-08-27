/**
 * Applies scripts/schema.sql to the Neon database. One-shot DDL runner for
 * environments without psql.
 *
 *   npx tsx scripts/apply-schema.ts
 */
import { readFileSync } from 'node:fs';
import { neon } from '@neondatabase/serverless';

process.loadEnvFile('.env.local');

const url = process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL;
if (!url) {
  console.error('Missing DATABASE_URL(_UNPOOLED) in .env.local');
  process.exit(1);
}

const sql = neon(url);
const file = readFileSync('scripts/schema.sql', 'utf8');

// Strip `--` line comments, then split into individual statements. Safe here
// because schema.sql has no dollar-quoted bodies or semicolons inside literals.
const statements = file
  .replace(/--.*$/gm, '')
  .split(';')
  .map((s) => s.trim())
  .filter(Boolean);

async function main() {
  for (const stmt of statements) {
    await sql.query(stmt);
  }
  console.log(`✓ Applied ${statements.length} statements from schema.sql`);
}

main().catch((e) => {
  console.error('✗ Schema apply failed:', e);
  process.exit(1);
});
