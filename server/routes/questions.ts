// Question Bank Routes
// Handles CRUD operations for pre-seeded questions

import { Hono } from 'hono';
import { z } from 'zod';
import { db } from '../db/client';
import { dbOps } from '../db/client';
import { questionBank } from '../db/drizzle-schema';
import { eq, and } from 'drizzle-orm';
import type { Dimension, QuestionType } from '../../frontend/src/types';

const app = new Hono();

// Validation schemas
const CreateQuestionSchema = z.object({
  dimension: z.enum(['low_level', 'control_flow', 'hardware_io', 'code_reading', 'decomposition']),
  difficulty: z.number().min(1).max(5),
  questionType: z.enum(['one_liner', 'multiple_choice', 'code_ide', 'trace']),
  questionData: z.object({
    prompt: z.string(),
    expectedAnswer: z.string().optional(),
    choices: z.array(z.string()).optional(),
    correctChoiceIndex: z.number().optional(),
    starterCode: z.string().optional(),
    testCases: z.array(z.any()).optional(),
    codeToTrace: z.string().optional(),
    traceQuestion: z.string().optional(),
    traceAnswer: z.string().optional(),
  }),
  answerData: z.object({
    correctAnswer: z.any(),
    rubric: z.string().optional(),
    partialCreditCriteria: z.array(z.string()).optional(),
  }),
});

// GET /api/questions
// List all questions in the bank, optionally filtered
app.get('/', async (c) => {
  try {
    const dimension = c.req.query('dimension');
    const difficulty = c.req.query('difficulty');

    let query = db.select().from(questionBank);

    if (dimension && difficulty) {
      const results = await query.where(
        and(
          eq(questionBank.dimension, dimension as any),
          eq(questionBank.difficulty, parseInt(difficulty))
        )
      );
      return c.json({ questions: results, count: results.length });
    } else if (dimension) {
      const results = await query.where(eq(questionBank.dimension, dimension as any));
      return c.json({ questions: results, count: results.length });
    } else if (difficulty) {
      const results = await query.where(eq(questionBank.difficulty, parseInt(difficulty)));
      return c.json({ questions: results, count: results.length });
    }

    const results = await query;
    return c.json({ questions: results, count: results.length });
  } catch (error) {
    console.error('Error fetching questions:', error);
    return c.json({ error: 'Failed to fetch questions' }, 500);
  }
});

// GET /api/questions/:id
// Get a specific question by ID
app.get('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const question = await dbOps.getQuestionById(id);

    if (!question) {
      return c.json({ error: 'Question not found' }, 404);
    }

    return c.json({ question });
  } catch (error) {
    console.error('Error fetching question:', error);
    return c.json({ error: 'Failed to fetch question' }, 500);
  }
});

// POST /api/questions
// Create a new question in the bank
app.post('/', async (c) => {
  try {
    const body = await c.req.json();
    const validated = CreateQuestionSchema.parse(body);

    const result = await db.insert(questionBank).values({
      dimension: validated.dimension as any,
      difficulty: validated.difficulty,
      questionType: validated.questionType as any,
      questionData: validated.questionData,
      answerData: validated.answerData,
      usageCount: 0,
    }).returning();

    return c.json({
      message: 'Question created successfully',
      question: result[0],
    }, 201);
  } catch (error) {
    console.error('Error creating question:', error);
    return c.json({ error: 'Failed to create question' }, 500);
  }
});

// PUT /api/questions/:id
// Update a question
app.put('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    const validated = CreateQuestionSchema.parse(body);

    const result = await db
      .update(questionBank)
      .set({
        dimension: validated.dimension as any,
        difficulty: validated.difficulty,
        questionType: validated.questionType as any,
        questionData: validated.questionData,
        answerData: validated.answerData,
      })
      .where(eq(questionBank.id, id))
      .returning();

    if (result.length === 0) {
      return c.json({ error: 'Question not found' }, 404);
    }

    return c.json({
      message: 'Question updated successfully',
      question: result[0],
    });
  } catch (error) {
    console.error('Error updating question:', error);
    return c.json({ error: 'Failed to update question' }, 500);
  }
});

// DELETE /api/questions/:id
// Delete a question
app.delete('/:id', async (c) => {
  try {
    const id = c.req.param('id');

    const result = await db
      .delete(questionBank)
      .where(eq(questionBank.id, id))
      .returning();

    if (result.length === 0) {
      return c.json({ error: 'Question not found' }, 404);
    }

    return c.json({
      message: 'Question deleted successfully',
      question: result[0],
    });
  } catch (error) {
    console.error('Error deleting question:', error);
    return c.json({ error: 'Failed to delete question' }, 500);
  }
});

// GET /api/questions/stats/usage
// Get usage statistics for questions
app.get('/stats/usage', async (c) => {
  try {
    const allQuestions = await db.select().from(questionBank);

    const totalQuestions = allQuestions.length;

    const byDimension: Record<string, number> = {};
    const byDifficulty: Record<number, number> = {};

    allQuestions.forEach(q => {
      byDimension[q.dimension] = (byDimension[q.dimension] || 0) + 1;
      byDifficulty[q.difficulty] = (byDifficulty[q.difficulty] || 0) + 1;
    });

    return c.json({
      totalQuestions,
      byDimension,
      byDifficulty,
      mostUsed: allQuestions
        .sort((a, b) => b.usageCount - a.usageCount)
        .slice(0, 10)
        .map(q => ({
          id: q.id,
          dimension: q.dimension,
          difficulty: q.difficulty,
          usageCount: q.usageCount,
          prompt: q.questionData.prompt?.substring(0, 100) + '...',
        })),
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return c.json({ error: 'Failed to fetch statistics' }, 500);
  }
});

export default app;
