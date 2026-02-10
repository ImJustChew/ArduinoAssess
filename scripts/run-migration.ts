#!/usr/bin/env bun
// Run PostgreSQL migration

import { Pool } from 'pg';
import { readFileSync } from 'fs';
import { join } from 'path';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL not set');
  process.exit(1);
}

const pool = new Pool({
  connectionString: DATABASE_URL,
});

async function runMigration() {
  const migrationFile = join(__dirname, '../server/db/migrations/004_fix_postgres_bounds_decimal.sql');
  const sql = readFileSync(migrationFile, 'utf-8');

  console.log('🔄 Running migration: 004_fix_postgres_bounds_decimal.sql');
  console.log(sql);

  try {
    await pool.query(sql);
    console.log('✅ Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigration();
