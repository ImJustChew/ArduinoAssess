// Run SQL migration
import { db } from './client';
import { sql } from 'drizzle-orm';
import * as fs from 'fs';

async function runMigration() {
  const migrationFiles = [
    'add-session-state.sql',
    'add-hint-tracking.sql',
    'add-current-question.sql',
  ];

  for (const file of migrationFiles) {
    console.log(`🔧 Running migration: ${file}\n`);

    const filePath = `./server/db/migrations/${file}`;
    if (!fs.existsSync(filePath)) {
      console.log(`⏭️  Skipping ${file} (not found)\n`);
      continue;
    }

    const migrationSQL = fs.readFileSync(filePath, 'utf-8');

    try {
      // Split by semicolon and run each statement
      const statements = migrationSQL
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'));

      for (const statement of statements) {
        console.log('Executing:', statement.substring(0, 60) + '...');
        await db.execute(sql.raw(statement));
      }

      console.log(`✅ ${file} complete!\n`);
    } catch (error) {
      console.error(`\n❌ Migration ${file} failed:`, error);
      process.exit(1);
    }
  }

  console.log('✅ All migrations complete!');
  process.exit(0);
}

runMigration();
