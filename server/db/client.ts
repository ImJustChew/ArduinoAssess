// Drizzle ORM Database Client for ArduinoAssess
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { eq, and } from "drizzle-orm";
import * as schema from "./drizzle-schema";

// Get database URL from environment
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

// Create SQL client
const sql = neon(DATABASE_URL);
export const db = drizzle(sql, { schema });

// Type-safe database operations
export const dbOps = {
  // Student operations
  async createStudent(name: string, email?: string) {
    const [student] = await db
      .insert(schema.students)
      .values({ name, email })
      .returning();
    return student;
  },

  async getStudent(id: string) {
    const [student] = await db
      .select()
      .from(schema.students)
      .where(eq(schema.students.id, id));
    return student || null;
  },

  // Assessment session operations
  async createAssessment(studentId: string) {
    const [assessment] = await db
      .insert(schema.assessmentSessions)
      .values({
        studentId,
        currentPhase: "exploration",
        questionsAnswered: 0,
      })
      .returning();
    return assessment;
  },

  async getAssessment(id: string) {
    const [assessment] = await db
      .select()
      .from(schema.assessmentSessions)
      .where(eq(schema.assessmentSessions.id, id));
    return assessment || null;
  },

  async updateAssessmentPhase(
    id: string,
    phase: "exploration" | "convergence" | "complete",
  ) {
    await db
      .update(schema.assessmentSessions)
      .set({ currentPhase: phase, updatedAt: new Date() })
      .where(eq(schema.assessmentSessions.id, id));
  },

  async incrementQuestionsAnswered(id: string) {
    const [assessment] = await db
      .select()
      .from(schema.assessmentSessions)
      .where(eq(schema.assessmentSessions.id, id));
    if (assessment) {
      await db
        .update(schema.assessmentSessions)
        .set({
          questionsAnswered: assessment.questionsAnswered + 1,
          updatedAt: new Date(),
        })
        .where(eq(schema.assessmentSessions.id, id));
    }
  },

  async completeAssessment(id: string, result?: any) {
    console.log('\n=== COMPLETE ASSESSMENT DB CALL ===');
    console.log('Session ID:', id);
    console.log('Result provided:', !!result);
    console.log('Result keys:', result ? Object.keys(result).join(', ') : 'none');

    await db
      .update(schema.assessmentSessions)
      .set({
        completedAt: new Date(),
        currentPhase: "complete",
        result: result || null, // Save the result object as JSONB
        updatedAt: new Date(),
      })
      .where(eq(schema.assessmentSessions.id, id));

    console.log('✅ Assessment marked complete in DB');
  },

  // Dimension state operations
  async createDimensionState(assessmentId: string, dimension: string) {
    const [state] = await db
      .insert(schema.dimensionStates)
      .values({
        assessmentId,
        dimension: dimension as any,
        lowerBound: 1,
        upperBound: 5,
        tested: false,
        questionsAsked: 0,
      })
      .returning();
    return state;
  },

  async getDimensionStates(assessmentId: string) {
    return await db
      .select()
      .from(schema.dimensionStates)
      .where(eq(schema.dimensionStates.assessmentId, assessmentId));
  },

  async updateDimensionBounds(
    assessmentId: string,
    dimension: string,
    lowerBound: number,
    upperBound: number,
    tested: boolean,
    correctCount?: number,
  ) {
    const [existing] = await db
      .select()
      .from(schema.dimensionStates)
      .where(
        and(
          eq(schema.dimensionStates.assessmentId, assessmentId),
          eq(schema.dimensionStates.dimension, dimension as any),
        ),
      );

    if (existing) {
      const updates: any = {
        lowerBound,
        upperBound,
        tested,
        questionsAsked: existing.questionsAsked + 1,
        updatedAt: new Date(),
      };

      if (correctCount !== undefined) {
        updates.correctCount = correctCount;
      }

      await db
        .update(schema.dimensionStates)
        .set(updates)
        .where(
          and(
            eq(schema.dimensionStates.assessmentId, assessmentId),
            eq(schema.dimensionStates.dimension, dimension as any),
          ),
        );
    }
  },

  async updateAssessmentMetrics(
    assessmentId: string,
    totalTimeMs: number,
    hintsUsed: number,
    partialCredits: number,
  ) {
    await db
      .update(schema.assessmentSessions)
      .set({
        totalTimeMs,
        hintsUsed,
        partialCredits,
        updatedAt: new Date(),
      })
      .where(eq(schema.assessmentSessions.id, assessmentId));
  },

  async setCurrentQuestion(assessmentId: string, question: any) {
    await db
      .update(schema.assessmentSessions)
      .set({
        currentQuestionData: question,
        updatedAt: new Date(),
      })
      .where(eq(schema.assessmentSessions.id, assessmentId));
  },

  async getCurrentQuestion(assessmentId: string) {
    const [assessment] = await db
      .select()
      .from(schema.assessmentSessions)
      .where(eq(schema.assessmentSessions.id, assessmentId));

    return assessment?.currentQuestionData || null;
  },

  // Question response operations
  async saveQuestionResponse(response: {
    assessment_id: string;
    question_id: string | null;
    question_source: "bank" | "ai_generated";
    question_type: "one_liner" | "multiple_choice" | "code_ide" | "trace";
    dimension: string;
    difficulty: number;
    question_data: any;
    student_answer: any;
    is_correct: boolean;
    correctness_level: "wrong" | "partial" | "correct";
    time_spent_ms: number;
    hints_used: any[];
    keystroke_data?: any;
    answered_at: Date;
  }) {
    const [saved] = await db
      .insert(schema.questionResponses)
      .values({
        assessmentId: response.assessment_id,
        questionId: response.question_id,
        questionSource: response.question_source,
        questionType: response.question_type,
        dimension: response.dimension as any,
        difficulty: response.difficulty,
        questionData: response.question_data,
        studentAnswer: response.student_answer,
        isCorrect: response.is_correct,
        correctnessLevel: response.correctness_level,
        timeSpentMs: response.time_spent_ms,
        hintsUsed: response.hints_used,
        keystrokeData: response.keystroke_data,
        answeredAt: response.answered_at,
      })
      .returning();
    return saved;
  },

  async getQuestionResponses(assessmentId: string) {
    return await db
      .select()
      .from(schema.questionResponses)
      .where(eq(schema.questionResponses.assessmentId, assessmentId));
  },

  // Question bank operations
  async getQuestionByDimensionAndDifficulty(
    dimension: string,
    difficulty: number,
    excludeIds: string[] = [],
  ) {
    const allQuestions = await db
      .select()
      .from(schema.questionBank)
      .where(
        and(
          eq(schema.questionBank.dimension, dimension as any),
          eq(schema.questionBank.difficulty, difficulty),
        ),
      );

    // Filter out already asked questions
    const availableQuestions = allQuestions.filter(
      q => !excludeIds.includes(q.id)
    );

    console.log(`   Found ${allQuestions.length} questions, ${availableQuestions.length} not yet asked`);

    if (availableQuestions.length === 0) {
      return null;
    }

    // Return a random question from available ones
    const randomIndex = Math.floor(Math.random() * availableQuestions.length);
    return availableQuestions[randomIndex];
  },

  async getQuestionById(questionId: string) {
    const result = await db
      .select()
      .from(schema.questionBank)
      .where(eq(schema.questionBank.id, questionId))
      .limit(1);

    return result[0] || null;
  },

  async incrementQuestionUsage(id: string) {
    const [question] = await db
      .select()
      .from(schema.questionBank)
      .where(eq(schema.questionBank.id, id));
    if (question) {
      await db
        .update(schema.questionBank)
        .set({ usageCount: question.usageCount + 1, updatedAt: new Date() })
        .where(eq(schema.questionBank.id, id));
    }
  },

  // Token usage tracking
  async recordTokenUsage(usage: {
    assessment_id: string;
    call_type: string;
    model: string;
    input_tokens: number;
    output_tokens: number;
    latency_ms: number;
  }) {
    await db.insert(schema.aiTokenUsage).values({
      assessmentId: usage.assessment_id,
      callType: usage.call_type as any,
      model: usage.model,
      inputTokens: usage.input_tokens,
      outputTokens: usage.output_tokens,
      latencyMs: usage.latency_ms,
    });
  },

  async getTokenUsage(assessmentId: string) {
    return await db
      .select()
      .from(schema.aiTokenUsage)
      .where(eq(schema.aiTokenUsage.assessmentId, assessmentId));
  },

  // Assessment result operations
  async saveAssessmentResult(result: {
    assessment_id: string;
    final_levels: any;
    profile_summary: string;
    strengths: any[];
    growth_areas: any[];
    behavioral_insights: any;
    total_time_ms: number;
    total_tokens_used: number;
    estimated_cost_usd: number;
  }) {
    const [saved] = await db
      .insert(schema.assessmentResults)
      .values({
        assessmentId: result.assessment_id,
        finalLevels: result.final_levels,
        profileSummary: result.profile_summary,
        strengths: result.strengths,
        growthAreas: result.growth_areas,
        behavioralInsights: result.behavioral_insights,
        totalTimeMs: result.total_time_ms,
        totalTokensUsed: result.total_tokens_used,
        estimatedCostUsd: result.estimated_cost_usd.toString(),
      })
      .returning();
    return saved;
  },

  async getAssessmentResult(assessmentId: string) {
    const [result] = await db
      .select()
      .from(schema.assessmentResults)
      .where(eq(schema.assessmentResults.assessmentId, assessmentId));
    return result || null;
  },

  // Hint tracking operations
  async saveHintEvent(event: {
    assessment_id: string;
    question_id: string;
    hint_type: 'conceptual' | 'syntactical' | 'structural' | 'example' | 'elimination';
    hint_text: string;
    time_into_question_ms: number;
  }) {
    const [saved] = await db
      .insert(schema.hintEvents)
      .values({
        assessmentId: event.assessment_id,
        questionId: event.question_id,
        hintType: event.hint_type as any,
        hintText: event.hint_text,
        timeIntoQuestionMs: event.time_into_question_ms,
      })
      .returning();
    return saved;
  },

  async updateHintEventOutcome(
    hintEventId: string,
    subsequentAction: 'answered_correctly' | 'answered_wrong' | 'asked_another_hint' | 'still_working',
    timeAfterHintMs: number,
  ) {
    await db
      .update(schema.hintEvents)
      .set({
        subsequentAction: subsequentAction as any,
        timeAfterHintMs,
      })
      .where(eq(schema.hintEvents.id, hintEventId));
  },

  async getHintEvents(assessmentId: string) {
    return await db
      .select()
      .from(schema.hintEvents)
      .where(eq(schema.hintEvents.assessmentId, assessmentId));
  },

  async linkHintToResponse(hintEventId: string, questionResponseId: string) {
    await db
      .update(schema.hintEvents)
      .set({ questionResponseId })
      .where(eq(schema.hintEvents.id, hintEventId));
  },
};

export { schema };
