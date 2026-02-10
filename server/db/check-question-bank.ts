// Check question bank
import { db } from './client';
import { sql } from 'drizzle-orm';

async function checkBank() {
  try {
    const result = await db.execute(sql.raw(`
      SELECT dimension, difficulty, COUNT(*) as count
      FROM question_bank
      GROUP BY dimension, difficulty
      ORDER BY dimension, difficulty
    `));

    console.log('Question bank distribution:');
    for (const row of result.rows as any[]) {
      console.log(`${row.dimension} difficulty ${row.difficulty}: ${row.count} questions`);
    }

    // Check for duplicate prompts
    const dupes = await db.execute(sql.raw(`
      SELECT
        dimension,
        difficulty,
        question_data->>'prompt' as prompt,
        COUNT(*) as count
      FROM question_bank
      GROUP BY dimension, difficulty, question_data->>'prompt'
      HAVING COUNT(*) > 1
    `));

    if (dupes.rows.length > 0) {
      console.log('\n⚠️  Duplicate questions found:');
      for (const row of dupes.rows as any[]) {
        console.log(`${row.dimension} diff ${row.difficulty}: "${row.prompt?.substring(0, 50)}..." (${row.count} copies)`);
      }
    } else {
      console.log('\n✅ No duplicate questions');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkBank();
