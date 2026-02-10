// Core Assessment Types

export type Dimension =
  | 'lowLevelBinary'
  | 'controlFlow'
  | 'hardwareIO'
  | 'codeReading'
  | 'decomposition';

export type QuestionType = 'oneLiner' | 'multipleChoice' | 'codeIDE' | 'trace' | 'chatbotStudent';

export type DifficultyLevel = 1 | 2 | 3 | 4 | 5;

export type AssessmentPhase = 'exploration' | 'refinement' | 'completion';

export interface DimensionState {
  lowerBound: DifficultyLevel;
  upperBound: DifficultyLevel;
  tested: boolean;
  questionCount: number;
  correctCount: number;
}

export interface StudentProfile {
  sessionId: string;
  studentName?: string;
  currentPhase: AssessmentPhase;
  questionsAnswered: number;
  startTime: number;

  dimensions: Record<Dimension, DimensionState>;

  // Tracking
  totalTimeMs: number;
  hintsUsed: number;
  partialCredits: number;
}

export interface Question {
  id: string;
  dimension: Dimension;
  difficulty: DifficultyLevel;
  type: QuestionType;
  prompt: string;

  // Type-specific fields
  expectedAnswer?: string; // for oneLiner
  choices?: string[]; // for multipleChoice
  correctChoiceIndex?: number; // for multipleChoice
  starterCode?: string; // for codeIDE
  testCases?: TestCase[]; // for codeIDE
  codeToTrace?: string; // for trace
  traceQuestion?: string; // for trace
  traceAnswer?: string; // for trace
  chatbotPersona?: string; // for chatbotStudent - describes the "student in distress"
  chatbotProblem?: string; // for chatbotStudent - the broken code/problem
  chatbotSolution?: string; // for chatbotStudent - the correct solution/guidance

  // Metadata
  source: 'bank' | 'ai';
  generatedAt?: number;
  tags?: string[];
}

export interface TestCase {
  id: string;
  description: string;
  hiddenFromStudent?: boolean;
  assertion: string; // e.g., "LED on pin 13 is HIGH"
  // For future code execution:
  setupCode?: string;
  expectedOutput?: string;
}

export interface QuestionResponse {
  questionId: string;
  dimension: Dimension;
  difficulty: DifficultyLevel;
  correct: boolean;
  partial: boolean;
  timeSpentMs: number;
  hintsUsed: number;
  answer: string | number; // string for text/code, number for MC index
  keystrokes?: KeystrokeEvent[];
  timestamp: number;
}

export interface KeystrokeEvent {
  t: number; // timestamp offset from question start
  k: string; // key
  a?: 'i' | 'd' | 'b'; // action: insert, delete, backspace
  p?: number; // cursor position
}

export interface HintEvent {
  questionId: string;
  hintType: 'conceptual' | 'syntax' | 'example' | 'ai-contextual';
  hintText: string;
  timeWhenRequested: number;
  ledToCorrectAnswer: boolean;
}

export interface TimeMetrics {
  questionId: string;
  dimension: Dimension;
  difficulty: DifficultyLevel;

  timeToFirstEdit: number; // ms
  timeToSubmit: number; // ms
  totalEditTime: number; // ms (excluding idle time)
  idleTime: number; // ms

  editBursts: number; // number of focused editing sessions
  averageBurstDuration: number; // ms
  pauses: number; // number of >5s pauses
}

export interface AssessmentResult {
  sessionId: string;
  studentName?: string;
  completedAt: number;
  totalTimeMs: number;

  dimensionScores: Record<Dimension, {
    estimatedLevel: DifficultyLevel;
    confidence: number; // 0-1
    questionsAnswered: number;
    accuracy: number; // 0-1
  }>;

  overallStrength: string; // AI-generated summary
  areasForImprovement: string[];
  learningStyleObservations: string;

  // Behavioral insights
  helpSeekingStyle: 'self-reliant' | 'balanced' | 'hint-dependent';
  problemSolvingApproach: string;
  codeQuality: string;

  // Raw data for instructor
  allResponses: QuestionResponse[];
  hintHistory: HintEvent[];
  timeMetrics: TimeMetrics[];
}

// API Types

export interface StartAssessmentRequest {
  studentName?: string;
}

export interface StartAssessmentResponse {
  sessionId: string;
  firstQuestion: Question;
  profile: StudentProfile;
}

export interface SubmitAnswerRequest {
  sessionId: string;
  questionId: string;
  answer: string | number;
  timeSpentMs: number;
  keystrokes?: KeystrokeEvent[];
  hintsUsed: number;
}

export interface SubmitAnswerResponse {
  correct: boolean;
  partial: boolean;
  feedback?: string;
  nextQuestion?: Question;
  assessmentComplete: boolean;
  finalResult?: AssessmentResult;
}

export interface GetHintRequest {
  sessionId: string;
  questionId: string;
  currentCode?: string;
  hintType?: 'conceptual' | 'syntax' | 'example';
}

export interface GetHintResponse {
  hintText: string;
  hintType: string;
}

// Token Tracking Types

export type AICallType =
  | 'question_generation'
  | 'answer_evaluation'
  | 'hint_generation'
  | 'profile_generation'
  | 'replay_analysis';

export interface TokenUsageRecord {
  id: string;
  assessmentId: string;
  callType: AICallType;
  model: string;
  inputTokens: number;
  outputTokens: number;
  latencyMs: number;
  timestamp: number;
}

export interface TokenUsageSummary {
  totalInputTokens: number;
  totalOutputTokens: number;
  totalCalls: number;
  estimatedCostUSD: number;
  byCallType: Record<AICallType, {
    calls: number;
    inputTokens: number;
    outputTokens: number;
  }>;
}
