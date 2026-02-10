// Adaptive Question Selection Algorithm
// Based on the ArduinoAssess proposal's adaptive algorithm specification

import type {
  Dimension,
  DifficultyLevel,
  StudentProfile,
  Question,
  QuestionResponse,
  AssessmentPhase,
  DimensionState,
} from "../../frontend/src/types";

const DIMENSIONS: Dimension[] = [
  "lowLevelBinary",
  "controlFlow",
  "hardwareIO",
  "codeReading",
  "decomposition",
];

const CONVERGENCE_THRESHOLD = 0.5; // When upper - lower <= 0.5, consider converged (on 1-5 scale)
const MIN_QUESTIONS_PER_DIMENSION = 3; // Need at least 3 questions per dimension for confidence
const EXPLORATION_QUESTIONS_MIN = 5; // Ensure thorough initial exploration (5 + 5*3 = 20 total minimum)

/**
 * Select the next question based on current student state
 */
export function selectNextQuestion(
  profile: StudentProfile,
  questionBank: Question[],
  aiGenerationCallback?: (
    dimension: Dimension,
    difficulty: DifficultyLevel,
    type: string,
  ) => Promise<Question>,
): {
  dimension: Dimension;
  targetDifficulty: DifficultyLevel;
  source: "bank" | "ai";
  questionType: string;
} {
  // Phase 1: EXPLORATION - Test each dimension at least once
  const untestedDimensions = DIMENSIONS.filter(
    (dim) => !profile.dimensions[dim].tested,
  );

  if (untestedDimensions.length > 0) {
    const targetDim = untestedDimensions[0];
    const targetDifficulty: DifficultyLevel = 3; // Start at middle difficulty

    return {
      dimension: targetDim,
      targetDifficulty,
      source: "bank",
      questionType: getQuestionTypeForDimension(targetDim, "exploration"),
    };
  }

  // Phase 2: REFINEMENT - Focus on most uncertain dimension
  const mostUncertain = findMostUncertainDimension(profile);

  if (mostUncertain) {
    const dimState = profile.dimensions[mostUncertain];
    const targetDifficulty = Math.round(
      (dimState.lowerBound + dimState.upperBound) / 2,
    ) as DifficultyLevel;

    // Use AI generation if bounds are narrow (converging)
    const range = dimState.upperBound - dimState.lowerBound;
    const useAI = range <= 2 || dimState.questionCount >= 3;

    return {
      dimension: mostUncertain,
      targetDifficulty: clampDifficulty(targetDifficulty),
      source: useAI ? "ai" : "bank",
      questionType: getQuestionTypeForDimension(mostUncertain, "refinement"),
    };
  }

  // Fallback: All dimensions converged, do final verification
  const randomDim = DIMENSIONS[Math.floor(Math.random() * DIMENSIONS.length)];
  const dimState = profile.dimensions[randomDim];

  return {
    dimension: randomDim,
    targetDifficulty: clampDifficulty(dimState.lowerBound),
    source: "bank",
    questionType: getQuestionTypeForDimension(randomDim, "completion"),
  };
}

/**
 * Update dimension bounds based on answer correctness
 * Uses Bayesian-style updating that weights historical performance
 */
export function updateBounds(
  profile: StudentProfile,
  response: QuestionResponse,
): StudentProfile {
  const dimState = profile.dimensions[response.dimension];

  // Calculate CURRENT accuracy BEFORE updating counts
  const currentAccuracy =
    dimState.questionCount > 0
      ? dimState.correctCount / dimState.questionCount
      : 0.5;

  // Now mark as tested and increment counts
  dimState.tested = true;
  dimState.questionCount++;

  if (response.correct) {
    dimState.correctCount++;

    // For correct answers, push lower bound UP aggressively
    // The student has demonstrated competence at this level
    const newLowerBound = Math.max(
      dimState.lowerBound,
      response.difficulty - 0.3,  // Set just below what they answered correctly
    );
    dimState.lowerBound = Math.max(1, Math.min(5, newLowerBound)) as DifficultyLevel;

    // ALSO: Push upper bound higher to test at harder levels
    if (currentAccuracy > 0.6) {  // If they're doing well
      const newUpperBound = Math.min(5, response.difficulty + 1.5);
      dimState.upperBound = Math.max(dimState.upperBound, newUpperBound) as DifficultyLevel;
    }

    console.log(`   → Lower bound: ${dimState.lowerBound} (was below ${response.difficulty})`);
  } else if (response.partial) {
    // Partial: student is near this level
    // Slightly raise lower bound, slightly lower upper bound
    const partialLevel = response.difficulty - 0.5;
    dimState.lowerBound = Math.max(
      dimState.lowerBound,
      Math.max(1, partialLevel * 0.8),
    ) as DifficultyLevel;
    dimState.upperBound = Math.min(
      dimState.upperBound,
      Math.min(5, response.difficulty + 0.5),
    ) as DifficultyLevel;
  } else {
    // Wrong answer: this difficulty is above their level
    // Lower upper bound below the failed difficulty

    const oldUpper = dimState.upperBound;

    // If they have high accuracy (>70%), be lenient - might be a trick question
    if (currentAccuracy > 0.7 && dimState.questionCount >= 3) {
      // Only lower upper bound slightly
      const newUpper = Math.max(dimState.lowerBound + 0.3, response.difficulty - 0.5);
      dimState.upperBound = Math.min(dimState.upperBound, newUpper) as DifficultyLevel;
      console.log(`   → Upper bound: ${oldUpper} → ${dimState.upperBound} (lenient, high accuracy)`);
    } else {
      // Standard case: lower upper bound MORE aggressively
      const newUpper = Math.max(dimState.lowerBound, response.difficulty - 0.5);
      dimState.upperBound = Math.min(dimState.upperBound, newUpper) as DifficultyLevel;
      console.log(`   → Upper bound: ${oldUpper} → ${dimState.upperBound} (failed at ${response.difficulty})`);

      // ALSO: Pull lower bound down if they're struggling
      if (currentAccuracy < 0.4) {  // If they're struggling
        const newLowerBound = Math.max(1, response.difficulty - 1.5);
        dimState.lowerBound = Math.min(dimState.lowerBound, newLowerBound) as DifficultyLevel;
        console.log(`   → Lower bound pulled down: ${dimState.lowerBound} (struggling)`);
      }
    }
  }

  // Ensure bounds stay valid
  dimState.lowerBound = Math.max(1, Math.min(5, dimState.lowerBound)) as DifficultyLevel;
  dimState.upperBound = Math.max(1, Math.min(5, dimState.upperBound)) as DifficultyLevel;

  // Ensure lower <= upper (but allow narrow ranges)
  if (dimState.lowerBound > dimState.upperBound) {
    // Average them but prefer the bound that has more support
    const avg = (dimState.lowerBound + dimState.upperBound) / 2;
    if (response.correct) {
      // Trust the lower bound more
      dimState.upperBound = Math.max(dimState.lowerBound, avg) as DifficultyLevel;
    } else {
      // Trust the upper bound more
      dimState.lowerBound = Math.min(dimState.upperBound, avg) as DifficultyLevel;
    }
  }

  return { ...profile };
}

/**
 * Determine current assessment phase
 */
export function determinePhase(profile: StudentProfile): AssessmentPhase {
  const questionsAnswered = profile.questionsAnswered;

  // Must answer at least a few questions to leave exploration
  if (questionsAnswered < EXPLORATION_QUESTIONS_MIN) {
    return "exploration";
  }

  // Check if all dimensions have been tested
  const allDimensionsTested = DIMENSIONS.every(
    (dim) => profile.dimensions[dim].tested,
  );

  if (!allDimensionsTested) {
    return "exploration";
  }

  // Check if all dimensions have converged
  const allConverged = DIMENSIONS.every((dim) => {
    const state = profile.dimensions[dim];
    const range = state.upperBound - state.lowerBound;
    return (
      range <= CONVERGENCE_THRESHOLD &&
      state.questionCount >= MIN_QUESTIONS_PER_DIMENSION
    );
  });

  if (allConverged) {
    return "completion";
  }

  return "refinement";
}

/**
 * Find the dimension with the most uncertainty (widest bounds)
 */
function findMostUncertainDimension(profile: StudentProfile): Dimension | null {
  let maxUncertainty = 0;
  let mostUncertainDim: Dimension | null = null;

  for (const dim of DIMENSIONS) {
    const state = profile.dimensions[dim];
    const uncertainty = state.upperBound - state.lowerBound;

    // Prioritize dimensions with fewer questions if uncertainty is similar
    const adjustedUncertainty = uncertainty + 1 / (state.questionCount + 1);

    if (adjustedUncertainty > maxUncertainty) {
      maxUncertainty = adjustedUncertainty;
      mostUncertainDim = dim;
    }
  }

  return mostUncertainDim;
}

/**
 * Get appropriate question type for dimension and phase
 */
function getQuestionTypeForDimension(
  dimension: Dimension,
  phase: AssessmentPhase,
): string {
  // Map dimensions to their most suitable question types
  const typeMap: Record<Dimension, string[]> = {
    lowLevelBinary: ["oneLiner", "multipleChoice", "trace"],
    controlFlow: ["trace", "codeIDE", "multipleChoice"],
    hardwareIO: ["codeIDE", "multipleChoice", "trace"],
    codeReading: ["trace", "multipleChoice"],
    decomposition: ["codeIDE", "multipleChoice"],
  };

  const types = typeMap[dimension];

  if (phase === "exploration") {
    // Start with simpler formats during exploration
    return types.includes("multipleChoice") ? "multipleChoice" : types[0];
  }

  // Use more complex formats for refinement/completion
  return types[0];
}

/**
 * Clamp difficulty to valid range
 */
function clampDifficulty(value: number): DifficultyLevel {
  return Math.max(1, Math.min(5, Math.round(value))) as DifficultyLevel;
}

/**
 * Initialize a fresh student profile
 */
export function createStudentProfile(
  sessionId: string,
  studentName?: string,
): StudentProfile {
  const initialDimState: DimensionState = {
    lowerBound: 1,
    upperBound: 5,
    tested: false,
    questionCount: 0,
    correctCount: 0,
  };

  return {
    sessionId,
    studentName,
    currentPhase: "exploration",
    questionsAnswered: 0,
    startTime: Date.now(),
    totalTimeMs: 0,
    hintsUsed: 0,
    partialCredits: 0,
    dimensions: {
      lowLevelBinary: { ...initialDimState },
      controlFlow: { ...initialDimState },
      hardwareIO: { ...initialDimState },
      codeReading: { ...initialDimState },
      decomposition: { ...initialDimState },
    },
  };
}

/**
 * Check if assessment should be completed
 */
export function shouldCompleteAssessment(profile: StudentProfile): boolean {
  // Hard stop after 25 questions to prevent infinite loops
  if (profile.questionsAnswered >= 25) {
    console.log("⚠️ Hard stop at 25 questions");
    return true;
  }

  // Complete if we've reached completion phase
  if (profile.currentPhase === "completion") {
    return true;
  }

  // Complete if we've asked enough questions and all dimensions converged
  const allConverged = DIMENSIONS.every((dim) => {
    const state = profile.dimensions[dim];
    const range = state.upperBound - state.lowerBound;
    console.log(`   ${dim}: [${state.lowerBound}, ${state.upperBound}] range=${range.toFixed(1)}`);
    return range <= CONVERGENCE_THRESHOLD;
  });

  const minQuestionsReached =
    profile.questionsAnswered >=
    EXPLORATION_QUESTIONS_MIN + DIMENSIONS.length * MIN_QUESTIONS_PER_DIMENSION;

  console.log(`   All converged: ${allConverged}, Min questions: ${minQuestionsReached}`);

  return allConverged && minQuestionsReached;
}

/**
 * Calculate confidence score for a dimension (0-1)
 * For a 1-5 scale, max range is 4
 */
export function calculateConfidence(dimState: DimensionState): number {
  const range = dimState.upperBound - dimState.lowerBound;
  // Range confidence: 0 when range=4 (full uncertainty), 1 when range=0 (converged)
  const rangeConfidence = 1 - range / 4;

  // Question confidence: 0 when 0 questions, 1 when 6+ questions
  const questionConfidence = Math.min(dimState.questionCount / 6, 1);

  // Accuracy confidence: higher accuracy = more confidence in the bounds
  const accuracy =
    dimState.questionCount > 0
      ? dimState.correctCount / dimState.questionCount
      : 0.5;
  const accuracyConfidence = accuracy; // 0-1 directly

  // Weighted combination
  return (
    rangeConfidence * 0.5 +
    questionConfidence * 0.3 +
    accuracyConfidence * 0.2
  );
}

/**
 * Get estimated level for a dimension
 */
export function getEstimatedLevel(dimState: DimensionState): DifficultyLevel {
  // Weight toward lower bound if accuracy is low
  const accuracy =
    dimState.questionCount > 0
      ? dimState.correctCount / dimState.questionCount
      : 0.5;

  const weight = accuracy > 0.6 ? 0.6 : 0.4; // Trust lower bound more if doing well
  const estimated =
    dimState.lowerBound * weight + dimState.upperBound * (1 - weight);

  return clampDifficulty(estimated);
}
