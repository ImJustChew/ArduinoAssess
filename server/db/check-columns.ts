// Check if columns exist
import { db } from './client';
import { sql } from 'drizzle-orm';

async function checkColumns() {
  try {
    const result = await db.execute(sql.raw(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'assessment_sessions'
      ORDER BY ordinal_position
    `));

    console.log('assessment_sessions columns:');
    console.log(result.rows.map((r: any) => r.column_name).join(', '));

    const hasTimeMs = result.rows.some((r: any) => r.column_name === 'total_time_ms');
    const hasHints = result.rows.some((r: any) => r.column_name === 'hints_used');
    const hasPartial = result.rows.some((r: any) => r.column_name === 'partial_credits');

    console.log('\nMigration status:');
    console.log('- total_time_ms:', hasTimeMs ? '✅' : '❌ MISSING');
    console.log('- hints_used:', hasHints ? '✅' : '❌ MISSING');
    console.log('- partial_credits:', hasPartial ? '✅' : '❌ MISSING');

    if (!hasTimeMs || !hasHints || !hasPartial) {
      console.log('\n⚠️  Migration not applied! Run: bun run db:migrate');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkColumns();
