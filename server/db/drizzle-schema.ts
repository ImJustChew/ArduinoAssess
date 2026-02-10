// Drizzle ORM Schema for ArduinoAssess
import { pgTable, uuid, text, timestamp, integer, boolean, jsonb, decimal, real } from 'drizzle-orm/pg-core';

export const students = pgTable('students', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  email: text('email'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const assessmentSessions = pgTable('assessment_sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  studentId: uuid('student_id').references(() => students.id),
  studentName: text('student_name'),
  startedAt: timestamp('started_at').defaultNow().notNull(),
  completedAt: timestamp('completed_at'),
  currentPhase: text('current_phase', { enum: ['exploration', 'convergence', 'complete'] }).notNull(),
  questionsAnswered: integer('questions_answered').default(0).notNull(),
  totalTimeMs: integer('total_time_ms').default(0).notNull(),
  hintsUsed: integer('hints_used').default(0).notNull(),
  partialCredits: integer('partial_credits').default(0).notNull(),
  currentQuestionData: jsonb('current_question_data'), // Stores the full question object for evaluation
  result: jsonb('result'), // Stores the final AssessmentResult when completed
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const dimensionStates = pgTable('dimension_states', {
  id: uuid('id').primaryKey().defaultRandom(),
  assessmentId: uuid('assessment_id').references(() => assessmentSessions.id).notNull(),
  dimension: text('dimension', { enum: ['low_level', 'control_flow', 'hardware_io', 'code_reading', 'decomposition'] }).notNull(),
  lowerBound: real('lower_bound').notNull(),
  upperBound: real('upper_bound').notNull(),
  tested: boolean('tested').default(false).notNull(),
  questionsAsked: integer('questions_asked').default(0).notNull(),
  correctCount: integer('correct_count').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const questionResponses = pgTable('question_responses', {
  id: uuid('id').primaryKey().defaultRandom(),
  assessmentId: uuid('assessment_id').references(() => assessmentSessions.id).notNull(),
  questionId: uuid('question_id'),
  questionSource: text('question_source', { enum: ['bank', 'ai_generated'] }).notNull(),
  questionType: text('question_type', { enum: ['one_liner', 'multiple_choice', 'code_ide', 'trace'] }).notNull(),
  dimension: text('dimension', { enum: ['low_level', 'control_flow', 'hardware_io', 'code_reading', 'decomposition'] }).notNull(),
  difficulty: integer('difficulty').notNull(),
  questionData: jsonb('question_data').notNull(),
  studentAnswer: jsonb('student_answer').notNull(),
  isCorrect: boolean('is_correct').notNull(),
  correctnessLevel: text('correctness_level', { enum: ['wrong', 'partial', 'correct'] }).notNull(),
  timeSpentMs: integer('time_spent_ms').notNull(),
  hintsUsed: jsonb('hints_used').default([]).notNull(),
  keystrokeData: jsonb('keystroke_data'),
  answeredAt: timestamp('answered_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const questionBank = pgTable('question_bank', {
  id: uuid('id').primaryKey().defaultRandom(),
  dimension: text('dimension', { enum: ['low_level', 'control_flow', 'hardware_io', 'code_reading', 'decomposition'] }).notNull(),
  difficulty: integer('difficulty').notNull(),
  questionType: text('question_type', { enum: ['one_liner', 'multiple_choice', 'code_ide', 'trace'] }).notNull(),
  questionData: jsonb('question_data').notNull(),
  answerData: jsonb('answer_data').notNull(),
  usageCount: integer('usage_count').default(0).notNull(),
  avgTimeMs: integer('avg_time_ms').default(0).notNull(),
  avgCorrectness: decimal('avg_correctness', { precision: 3, scale: 2 }).default('0').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const aiTokenUsage = pgTable('ai_token_usage', {
  id: uuid('id').primaryKey().defaultRandom(),
  assessmentId: uuid('assessment_id').references(() => assessmentSessions.id).notNull(),
  callType: text('call_type', { enum: ['question_generation', 'answer_evaluation', 'hint_generation', 'replay_analysis', 'profile_generation'] }).notNull(),
  model: text('model').notNull(),
  inputTokens: integer('input_tokens').notNull(),
  outputTokens: integer('output_tokens').notNull(),
  latencyMs: integer('latency_ms').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const assessmentResults = pgTable('assessment_results', {
  id: uuid('id').primaryKey().defaultRandom(),
  assessmentId: uuid('assessment_id').references(() => assessmentSessions.id).unique().notNull(),
  finalLevels: jsonb('final_levels').notNull(),
  profileSummary: text('profile_summary').notNull(),
  strengths: jsonb('strengths').notNull(),
  growthAreas: jsonb('growth_areas').notNull(),
  behavioralInsights: jsonb('behavioral_insights').notNull(),
  totalTimeMs: integer('total_time_ms').notNull(),
  totalTokensUsed: integer('total_tokens_used').notNull(),
  estimatedCostUsd: decimal('estimated_cost_usd', { precision: 10, scale: 4 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const hintEvents = pgTable('hint_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  assessmentId: uuid('assessment_id').references(() => assessmentSessions.id).notNull(),
  questionResponseId: uuid('question_response_id').references(() => questionResponses.id),
  questionId: text('question_id').notNull(),
  hintType: text('hint_type', { enum: ['conceptual', 'syntactical', 'structural', 'example', 'elimination'] }).notNull(),
  hintText: text('hint_text').notNull(),
  timeIntoQuestionMs: integer('time_into_question_ms').notNull(),
  subsequentAction: text('subsequent_action', { enum: ['answered_correctly', 'answered_wrong', 'asked_another_hint', 'still_working'] }),
  timeAfterHintMs: integer('time_after_hint_ms'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
