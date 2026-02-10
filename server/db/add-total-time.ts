// Add missing total_time_ms column
import { db } from './client';
import { sql } from 'drizzle-orm';

async function addColumn() {
  try {
    console.log('Adding total_time_ms column...');
    await db.execute(sql.raw(`
      ALTER TABLE assessment_sessions
      ADD COLUMN IF NOT EXISTS total_time_ms INTEGER DEFAULT 0 NOT NULL
    `));
    console.log('✅ Column added');

    // Also check dimension_states for correct_count
    const dimResult = await db.execute(sql.raw(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'dimension_states'
      ORDER BY ordinal_position
    `));

    const hasCorrectCount = dimResult.rows.some((r: any) => r.column_name === 'correct_count');
    console.log('\ndimension_states correct_count:', hasCorrectCount ? '✅' : '❌ MISSING');

    if (!hasCorrectCount) {
      console.log('Adding correct_count column...');
      await db.execute(sql.raw(`
        ALTER TABLE dimension_states
        ADD COLUMN IF NOT EXISTS correct_count INTEGER DEFAULT 0 NOT NULL
      `));
      console.log('✅ correct_count added');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

addColumn();
