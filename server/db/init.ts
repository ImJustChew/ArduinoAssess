// Database initialization script
// Run this once to create all necessary tables and indexes

import { initializeDatabase } from './client';

async function main() {
  console.log('🔧 Initializing ArduinoAssess database...\n');

  try {
    await initializeDatabase();
    console.log('\n✅ Database initialization complete!');
    console.log('\nNext steps:');
    console.log('1. Seed the question bank with initial questions');
    console.log('2. Start the server with: bun run dev');
    console.log('3. Visit http://localhost:3000 to begin assessments\n');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Database initialization failed:');
    console.error(error);
    process.exit(1);
  }
}

main();
