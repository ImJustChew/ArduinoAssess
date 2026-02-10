// Zustand store for managing assessment state
// Handles student profile, current question, responses, and navigation

import { create } from 'zustand';
import type {
  StudentProfile,
  Question,
  QuestionResponse,
  AssessmentResult,
  Dimension,
  DifficultyLevel,
  HintEvent,
} from '../types';

interface AssessmentState {
  // Session state
  sessionId: string | null;
  profile: StudentProfile | null;
  currentQuestion: Question | null;
  currentQuestionStartTime: number | null;

  // Response tracking
  responses: QuestionResponse[];
  hintHistory: HintEvent[];

  // UI state
  isLoading: boolean;
  error: string | null;
  isSubmitting: boolean;
  showHint: boolean;
  currentHint: string | null;

  // Final result
  assessmentComplete: boolean;
  finalResult: AssessmentResult | null;

  // Actions
  startAssessment: (studentName?: string) => Promise<void>;
  submitAnswer: (answer: string | number, keystrokes?: any[]) => Promise<void>;
  requestHint: (currentCode?: string, hintType?: string) => Promise<void>;
  resetAssessment: () => void;

  // Helpers
  getCurrentTimeSpent: () => number;
  getResponsesForDimension: (dimension: Dimension) => QuestionResponse[];
  getTotalHintsUsed: () => number;
}

const API_BASE = import.meta.env.VITE_API_URL || '/api';

export const useAssessmentStore = create<AssessmentState>((set, get) => ({
  // Initial state
  sessionId: null,
  profile: null,
  currentQuestion: null,
  currentQuestionStartTime: null,
  responses: [],
  hintHistory: [],
  isLoading: false,
  error: null,
  isSubmitting: false,
  showHint: false,
  currentHint: null,
  assessmentComplete: false,
  finalResult: null,

  // Start a new assessment
  startAssessment: async (studentName?: string) => {
    set({ isLoading: true, error: null });

    try {
      const response = await fetch(`${API_BASE}/assessment/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentName }),
      });

      if (!response.ok) {
        throw new Error('Failed to start assessment');
      }

      const data = await response.json();

      set({
        sessionId: data.sessionId,
        profile: data.profile,
        currentQuestion: data.firstQuestion,
        currentQuestionStartTime: Date.now(),
        isLoading: false,
        responses: [],
        hintHistory: [],
        assessmentComplete: false,
        finalResult: null,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Unknown error',
        isLoading: false,
      });
    }
  },

  // Submit an answer and get next question
  submitAnswer: async (answer: string | number, keystrokes?: any[]) => {
    const { sessionId, currentQuestion, currentQuestionStartTime, responses } = get();

    if (!sessionId || !currentQuestion || !currentQuestionStartTime) {
      set({ error: 'No active assessment' });
      return;
    }

    set({ isSubmitting: true, error: null, showHint: false, currentHint: null });

    try {
      const timeSpentMs = Date.now() - currentQuestionStartTime;
      const hintsUsedThisQuestion = get().hintHistory.filter(
        h => h.questionId === currentQuestion.id
      ).length;

      const response = await fetch(`${API_BASE}/assessment/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          questionId: currentQuestion.id,
          answer,
          timeSpentMs,
          keystrokes,
          hintsUsed: hintsUsedThisQuestion,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit answer');
      }

      const data = await response.json();

      // Create response record
      const questionResponse: QuestionResponse = {
        questionId: currentQuestion.id,
        dimension: currentQuestion.dimension,
        difficulty: currentQuestion.difficulty,
        correct: data.correct,
        partial: data.partial,
        timeSpentMs,
        hintsUsed: hintsUsedThisQuestion,
        answer,
        keystrokes,
        timestamp: Date.now(),
      };

      // Update profile with incremented question count
      const updatedProfile = get().profile;
      if (updatedProfile) {
        updatedProfile.questionsAnswered += 1;
        updatedProfile.totalTimeMs += timeSpentMs;
        updatedProfile.hintsUsed += hintsUsedThisQuestion;

        // Update dimension state
        const dimState = updatedProfile.dimensions[currentQuestion.dimension];
        dimState.questionCount += 1;
        if (data.correct) {
          dimState.correctCount += 1;
        }
        if (data.partial) {
          updatedProfile.partialCredits += 1;
        }
      }

      if (data.assessmentComplete) {
        set({
          responses: [...responses, questionResponse],
          assessmentComplete: true,
          finalResult: data.finalResult,
          currentQuestion: null,
          currentQuestionStartTime: null,
          isSubmitting: false,
          profile: updatedProfile,
        });
      } else {
        set({
          responses: [...responses, questionResponse],
          currentQuestion: data.nextQuestion,
          currentQuestionStartTime: Date.now(),
          isSubmitting: false,
          profile: updatedProfile,
        });
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Unknown error',
        isSubmitting: false,
      });
    }
  },

  // Request a hint for the current question
  requestHint: async (currentCode?: string, hintType?: string) => {
    const { sessionId, currentQuestion } = get();

    if (!sessionId || !currentQuestion) {
      return;
    }

    set({ isLoading: true });

    try {
      const response = await fetch(`${API_BASE}/assessment/hint`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          questionId: currentQuestion.id,
          currentCode,
          hintType,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get hint');
      }

      const data = await response.json();

      // Record hint event
      const hintEvent: HintEvent = {
        questionId: currentQuestion.id,
        hintType: data.hintType as any,
        hintText: data.hintText,
        timeWhenRequested: Date.now(),
        ledToCorrectAnswer: false, // Will be updated when answer is submitted
      };

      set({
        showHint: true,
        currentHint: data.hintText,
        hintHistory: [...get().hintHistory, hintEvent],
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to get hint',
        isLoading: false,
      });
    }
  },

  // Reset the assessment state
  resetAssessment: () => {
    set({
      sessionId: null,
      profile: null,
      currentQuestion: null,
      currentQuestionStartTime: null,
      responses: [],
      hintHistory: [],
      isLoading: false,
      error: null,
      isSubmitting: false,
      showHint: false,
      currentHint: null,
      assessmentComplete: false,
      finalResult: null,
    });
  },

  // Get current time spent on question (in ms)
  getCurrentTimeSpent: () => {
    const startTime = get().currentQuestionStartTime;
    if (!startTime) return 0;
    return Date.now() - startTime;
  },

  // Get all responses for a specific dimension
  getResponsesForDimension: (dimension: Dimension) => {
    return get().responses.filter(r => r.dimension === dimension);
  },

  // Get total hints used across all questions
  getTotalHintsUsed: () => {
    return get().hintHistory.length;
  },
}));
