// Instructor API Routes
// Password-protected endpoints for viewing and managing assessment data

import { Hono } from 'hono';
import { db } from '../db/client';
import { assessmentSessions, questionResponses, hintEvents, dimensionStates, aiTokenUsage } from '../db/drizzle-schema';
import { eq } from 'drizzle-orm';
import { generateAssessmentProfile } from '../lib/ai';

const instructor = new Hono();

// Simple password check (stored in .env)
const INSTRUCTOR_PASSWORD = process.env.INSTRUCTOR_PASSWORD || 'admin123';

// Middleware to check password
const authenticate = async (c: any, next: any) => {
  const token = c.req.header('Authorization')?.replace('Bearer ', '');

  if (token !== INSTRUCTOR_PASSWORD) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  await next();
};

// Login endpoint
instructor.post('/login', async (c) => {
  const { password } = await c.req.json();

  if (password === INSTRUCTOR_PASSWORD) {
    return c.json({ token: INSTRUCTOR_PASSWORD, success: true });
  }

  return c.json({ error: 'Invalid password' }, 401);
});

// Get all completed assessments
instructor.get('/assessments', async (c) => {
  // For simplicity, we're not using middleware here - check token manually
  const token = c.req.header('Authorization')?.replace('Bearer ', '');
  if (token !== INSTRUCTOR_PASSWORD) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    // Get all assessment sessions (completedAt is a timestamp, NULL means not complete)
    const sessions = await db
      .select()
      .from(assessmentSessions);

    // For each session, rebuild the full assessment result
    const assessments = [];

    for (const session of sessions) {
      // Skip if not completed (completedAt is NULL)
      if (!session.completedAt || !session.result) continue;

      assessments.push(session.result);
    }

    console.log(`Found ${assessments.length} completed assessments`);
    return c.json({ assessments });
  } catch (error) {
    console.error('Error fetching assessments:', error);
    return c.json({ error: 'Failed to fetch assessments' }, 500);
  }
});

// Clear all assessment data
instructor.post('/clear-all', async (c) => {
  const token = c.req.header('Authorization')?.replace('Bearer ', '');
  if (token !== INSTRUCTOR_PASSWORD) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    // Delete in correct order to respect foreign key constraints
    // 1. Delete hint_events first (references question_responses)
    await db.delete(hintEvents);

    // 2. Delete question_responses (references assessment_sessions)
    await db.delete(questionResponses);

    // 3. Delete dimension_states (references assessment_sessions)
    await db.delete(dimensionStates);

    // 4. Delete ai_token_usage (references assessment_sessions)
    await db.delete(aiTokenUsage);

    // 5. Finally delete assessment_sessions
    await db.delete(assessmentSessions);

    console.log('✅ All assessment data cleared');
    return c.json({ success: true, message: 'All data cleared' });
  } catch (error) {
    console.error('Error clearing data:', error);
    return c.json({ error: 'Failed to clear data' }, 500);
  }
});

export default instructor;
