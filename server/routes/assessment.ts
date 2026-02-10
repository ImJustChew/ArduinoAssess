// Assessment API Routes
// Handles starting assessments, submitting answers, getting hints, and completing assessments

import { Hono } from "hono";
import { z } from "zod";
import { dbOps } from "../db/client";
import {
  createStudentProfile,
  selectNextQuestion,
  updateBounds,
  determinePhase,
  shouldCompleteAssessment,
  getEstimatedLevel,
  calculateConfidence,
} from "../lib/adaptive";
import {
  generateQuestion,
  evaluateAnswer,
  generateHint,
  generateAssessmentProfile,
} from "../lib/ai";
import {
  analyzeHintBehavior,
  generateHintNarrative,
} from "../lib/hint-analysis";
import type {
  StudentProfile,
  Question,
  QuestionResponse,
  AssessmentResult,
  Dimension,
} from "../../frontend/src/types";

const app = new Hono();

// NOTE: No in-memory sessions! Everything stored in DB for Cloud Run statelessness

// Helper: Load session from DB
async function loadSessionFromDB(sessionId: string): Promise<StudentProfile | null> {
  const assessment = await dbOps.getAssessment(sessionId);
  if (!assessment) return null;

  const responses = await dbOps.getQuestionResponses(sessionId);
  const dimStates = await dbOps.getDimensionStates(sessionId);

  const askedQuestionIds = responses.map(r => r.questionId).filter(Boolean);

  const profile: StudentProfile = {
    sessionId: assessment.id,
    currentPhase: assessment.currentPhase as any,
    questionsAnswered: assessment.questionsAnswered,
    startTime: assessment.startedAt.getTime(),
    totalTimeMs: assessment.totalTimeMs || 0,
    hintsUsed: assessment.hintsUsed || 0,
    partialCredits: assessment.partialCredits || 0,
    dimensions: {
      lowLevelBinary: { lowerBound: 1, upperBound: 5, tested: false, questionCount: 0, correctCount: 0 },
      controlFlow: { lowerBound: 1, upperBound: 5, tested: false, questionCount: 0, correctCount: 0 },
      hardwareIO: { lowerBound: 1, upperBound: 5, tested: false, questionCount: 0, correctCount: 0 },
      codeReading: { lowerBound: 1, upperBound: 5, tested: false, questionCount: 0, correctCount: 0 },
      decomposition: { lowerBound: 1, upperBound: 5, tested: false, questionCount: 0, correctCount: 0 },
    },
  };

  // Populate dimensions from DB
  for (const state of dimStates) {
    const dimKey = mapDbToDimension(state.dimension);
    profile.dimensions[dimKey] = {
      lowerBound: Math.max(1, Math.min(5, state.lowerBound)) as any,
      upperBound: Math.max(1, Math.min(5, state.upperBound)) as any,
      tested: state.tested,
      questionCount: state.questionsAsked,
      correctCount: state.correctCount || 0,
    };
  }

  return { ...profile, askedQuestions: askedQuestionIds } as any;
}

// Validation schemas
const StartAssessmentSchema = z.object({
  studentName: z.string().optional(),
});

const SubmitAnswerSchema = z.object({
  sessionId: z.string().uuid(),
  questionId: z.string(),
  answer: z.union([z.string(), z.number()]),
  timeSpentMs: z.number().min(0),
  keystrokes: z.array(z.any()).optional(),
  hintsUsed: z.number().min(0).default(0),
});

const GetHintSchema = z.object({
  sessionId: z.string().uuid(),
  questionId: z.string(),
  currentCode: z.string().optional(),
  hintType: z.enum(["conceptual", "syntactical", "structural", "example", "elimination"]).optional(),
  timeIntoQuestionMs: z.number().min(0).optional().default(0),
});

// POST /api/assessment/start
// Start a new assessment session
app.post("/start", async (c) => {
  try {
    const body = await c.req.json();
    const validated = StartAssessmentSchema.parse(body);

    // Create student in database
    const student = await dbOps.createStudent(
      validated.studentName || "Anonymous Student",
    );

    // Create assessment session
    const assessment = await dbOps.createAssessment(student.id);

    // Initialize dimension states
    const dimensions: Dimension[] = [
      "lowLevelBinary",
      "controlFlow",
      "hardwareIO",
      "codeReading",
      "decomposition",
    ];

    // Map frontend dimension names to database dimension names
    const dbDimensionMap: Record<Dimension, string> = {
      lowLevelBinary: "low_level",
      controlFlow: "control_flow",
      hardwareIO: "hardware_io",
      codeReading: "code_reading",
      decomposition: "decomposition",
    };

    for (const dim of dimensions) {
      await dbOps.createDimensionState(
        assessment.id,
        dbDimensionMap[dim] as any,
      );
    }

    // Create student profile
    const profile = createStudentProfile(assessment.id, validated.studentName);

    // Get first question
    const nextQuestionSpec = selectNextQuestion(profile, []);
    let firstQuestion;
    try {
      firstQuestion = await getOrGenerateQuestion(
        assessment.id,
        nextQuestionSpec.dimension,
        nextQuestionSpec.targetDifficulty,
        nextQuestionSpec.questionType,
        [],
      );
    } catch (error) {
      console.error("Error getting first question:", error);
      throw error;
    }

    // Store first question in database for evaluation
    await dbOps.setCurrentQuestion(assessment.id, firstQuestion);

    // No in-memory storage needed - everything is in DB
    // Just return the data
    return c.json({
      sessionId: assessment.id,
      firstQuestion,
      profile,
    });
  } catch (error) {
    console.error("Error starting assessment:", error);
    return c.json({ error: "Failed to start assessment" }, 500);
  }
});

// POST /api/assessment/submit
// Submit an answer and get next question
app.post("/submit", async (c) => {
  console.log("=== SUBMIT ENDPOINT HIT ===");
  console.log("Path:", c.req.path);
  console.log("Method:", c.req.method);

  try {
    const body = await c.req.json();
    console.log("Request body:", body);

    let validated;
    try {
      validated = SubmitAnswerSchema.parse(body);
    } catch (validationError) {
      console.error("Validation error:", validationError);
      return c.json({ error: "Invalid request data", details: validationError }, 400);
    }

    // Load session from DB (no in-memory cache)
    console.log("Loading session from DB:", validated.sessionId);
    const profile = await loadSessionFromDB(validated.sessionId);

    if (!profile) {
      console.error("Session not found in database:", validated.sessionId);
      return c.json({
        error: "Session not found. Please start a new assessment.",
        code: "SESSION_EXPIRED"
      }, 404);
    }

    console.log(`Session loaded: ${profile.questionsAnswered} questions answered`);

    // Get the current question from database
    let currentQuestion = await dbOps.getCurrentQuestion(validated.sessionId) as Question | null;

    console.log('Current question from DB:', currentQuestion ? currentQuestion.id : 'NULL');

    // If not in DB, try question bank (for questions from seed data - backward compat)
    if (!currentQuestion && validated.questionId) {
      try {
        console.log('Question not in DB, checking question bank...');
        const bankQuestion = await dbOps.getQuestionById(validated.questionId);
        if (bankQuestion) {
          currentQuestion = mapBankQuestionToQuestion(bankQuestion);
          console.log('Found question in bank:', currentQuestion.id);
        }
      } catch (err) {
        console.warn('Could not retrieve question from bank:', err);
      }
    }

    // Evaluate answer
    const evaluation = await evaluateAnswer(
      currentQuestion,
      validated.answer,
      validated.sessionId,
    );

    // Create response record
    const response: QuestionResponse = {
      questionId: validated.questionId,
      dimension: currentQuestion?.dimension || "lowLevelBinary",
      difficulty: currentQuestion?.difficulty || 3,
      correct: evaluation.correct,
      partial: evaluation.partial,
      timeSpentMs: validated.timeSpentMs,
      hintsUsed: validated.hintsUsed,
      answer: validated.answer,
      keystrokes: validated.keystrokes,
      timestamp: Date.now(),
    };

    // Save to database
    const savedResponse = await dbOps.saveQuestionResponse({
      assessment_id: validated.sessionId,
      question_id: validated.questionId,
      question_source: currentQuestion?.source || "bank",
      question_type: currentQuestion?.type || "multipleChoice",
      dimension: mapDimensionToDb(response.dimension),
      difficulty: response.difficulty,
      question_data: currentQuestion || {},
      student_answer: { answer: validated.answer },
      is_correct: evaluation.correct,
      correctness_level: evaluation.correct
        ? "correct"
        : evaluation.partial
          ? "partial"
          : "wrong",
      time_spent_ms: validated.timeSpentMs,
      hints_used: [],
      keystroke_data: validated.keystrokes,
      answered_at: new Date(),
    });

    // Update hint events for this question to link them to the response
    // and record the outcome
    const hintEvents = await dbOps.getHintEvents(validated.sessionId);
    const questionHints = hintEvents.filter(h => h.questionId === validated.questionId);

    for (const hintEvent of questionHints) {
      // Link hint to this response
      await dbOps.linkHintToResponse(hintEvent.id, savedResponse.id);

      // Update outcome based on correctness (if not already set)
      if (!hintEvent.subsequentAction) {
        const action = evaluation.correct
          ? 'answered_correctly'
          : 'answered_wrong';

        // Calculate time between hint and answer
        const timeAfterHint = new Date().getTime() - new Date(hintEvent.createdAt).getTime();

        await dbOps.updateHintEventOutcome(
          hintEvent.id,
          action as any,
          timeAfterHint,
        );
      }
    }

    // Update bounds based on answer
    console.log("\n=== BEFORE UPDATE ===");
    console.log("Dimension:", response.dimension);
    console.log("Difficulty:", response.difficulty);
    console.log("Correct:", evaluation.correct);
    console.log("Current bounds:", profile.dimensions[response.dimension]);

    const updatedProfile = updateBounds(profile, response);

    console.log("=== AFTER UPDATE ===");
    console.log("Updated bounds:", updatedProfile.dimensions[response.dimension]);

    updatedProfile.questionsAnswered++;
    updatedProfile.totalTimeMs += validated.timeSpentMs;
    updatedProfile.hintsUsed += validated.hintsUsed;
    if (evaluation.partial) updatedProfile.partialCredits++;

    // Update phase
    const newPhase = determinePhase(updatedProfile);
    console.log("Phase:", profile.currentPhase, "→", newPhase);
    updatedProfile.currentPhase = newPhase;

    // Save updated profile to DATABASE (no in-memory storage)
    await dbOps.incrementQuestionsAnswered(validated.sessionId);
    await dbOps.updateDimensionBounds(
      validated.sessionId,
      mapDimensionToDb(response.dimension),
      updatedProfile.dimensions[response.dimension].lowerBound, // Keep decimal values!
      updatedProfile.dimensions[response.dimension].upperBound, // Keep decimal values!
      updatedProfile.dimensions[response.dimension].tested,
      updatedProfile.dimensions[response.dimension].correctCount, // Save correctCount too!
    );
    await dbOps.updateAssessmentMetrics(
      validated.sessionId,
      updatedProfile.totalTimeMs,
      updatedProfile.hintsUsed,
      updatedProfile.partialCredits,
    );

    // Check if assessment should be completed
    const shouldComplete = shouldCompleteAssessment(updatedProfile);
    console.log("\n=== COMPLETION CHECK ===");
    console.log("Questions answered:", updatedProfile.questionsAnswered);
    console.log("Should complete:", shouldComplete);

    if (shouldComplete) {
      console.log("🎉 Assessment complete! Generating final results...");
      const finalResult = await completeAssessment(
        validated.sessionId,
        updatedProfile,
      );

      return c.json({
        correct: evaluation.correct,
        partial: evaluation.partial,
        feedback: evaluation.feedback,
        assessmentComplete: true,
        finalResult,
      });
    }

    // Get next question
    const askedQuestions = (profile as any).askedQuestions || [];
    // Add the question we just answered to the list
    const updatedAskedQuestions = [...askedQuestions, validated.questionId];
    console.log("\n=== SELECTING NEXT QUESTION ===");
    console.log("Already asked:", updatedAskedQuestions.length, "questions");
    console.log("Just answered:", validated.questionId);

    const nextQuestionSpec = selectNextQuestion(updatedProfile, []);
    console.log("Target dimension:", nextQuestionSpec.dimension);
    console.log("Target difficulty:", nextQuestionSpec.targetDifficulty);

    const nextQuestion = await getOrGenerateQuestion(
      validated.sessionId,
      nextQuestionSpec.dimension,
      nextQuestionSpec.targetDifficulty,
      nextQuestionSpec.questionType,
      updatedAskedQuestions,
    );

    console.log("Selected question ID:", nextQuestion.id);
    console.log("Question prompt:", nextQuestion.prompt.substring(0, 50) + "...");

    // Store current question in database for evaluation
    await dbOps.setCurrentQuestion(validated.sessionId, nextQuestion);

    return c.json({
      correct: evaluation.correct,
      partial: evaluation.partial,
      feedback: evaluation.feedback,
      nextQuestion,
      assessmentComplete: false,
    });
  } catch (error) {
    console.error("Error submitting answer:", error);
    return c.json({ error: "Failed to submit answer" }, 500);
  }
});

// POST /api/assessment/hint
// Get a hint for the current question
app.post("/hint", async (c) => {
  try {
    const body = await c.req.json();
    const validated = GetHintSchema.parse(body);

    // Load session to verify it exists
    const profile = await loadSessionFromDB(validated.sessionId);
    if (!profile) {
      return c.json({ error: "Session not found" }, 404);
    }

    // Get the actual question from the question bank
    const currentQuestion = await dbOps.getQuestionById(validated.questionId);

    if (!currentQuestion) {
      return c.json({ error: "Question not found" }, 404);
    }

    // Build full question context for the AI
    const questionContext = `${currentQuestion.questionData.prompt}${
      currentQuestion.questionData.codeToTrace ? '\n\nCode:\n' + currentQuestion.questionData.codeToTrace : ''
    }${
      currentQuestion.questionData.choices ? '\n\nChoices:\n' + currentQuestion.questionData.choices.map((c: string, i: number) => `${i}. ${c}`).join('\n') : ''
    }`;

    const hint = await generateHint(
      validated.sessionId,
      validated.questionId,
      validated.currentCode,
      validated.hintType,
      questionContext,
    );

    // Save hint event to database for diagnostic tracking
    const hintEvent = await dbOps.saveHintEvent({
      assessment_id: validated.sessionId,
      question_id: validated.questionId,
      hint_type: hint.type as any,
      hint_text: hint.text,
      time_into_question_ms: validated.timeIntoQuestionMs,
    });

    console.log(`Hint requested: ${hint.type} at ${validated.timeIntoQuestionMs}ms into question`);

    // Increment hints used counter
    await dbOps.updateAssessmentMetrics(
      validated.sessionId,
      profile.totalTimeMs,
      profile.hintsUsed + 1,
      profile.partialCredits,
    );

    return c.json({
      hintText: hint.text,
      hintType: hint.type,
      hintEventId: hintEvent.id,
    });
  } catch (error) {
    console.error("Error generating hint:", error);
    return c.json({ error: "Failed to generate hint" }, 500);
  }
});

// GET /api/assessment/:sessionId
// Get current assessment state
app.get("/:sessionId", async (c) => {
  try {
    const sessionId = c.req.param("sessionId");
    const profile = await loadSessionFromDB(sessionId);

    if (!profile) {
      return c.json({ error: "Session not found" }, 404);
    }

    return c.json({ profile });
  } catch (error) {
    console.error("Error fetching assessment:", error);
    return c.json({ error: "Failed to fetch assessment" }, 500);
  }
});

// Helper: Get or generate a question
async function getOrGenerateQuestion(
  assessmentId: string,
  dimension: Dimension,
  difficulty: number,
  questionType: string,
  askedQuestions: string[],
): Promise<Question> {
  console.log(`\n🔍 Getting question for ${dimension} at difficulty ${difficulty}`);
  console.log(`   Already asked: ${askedQuestions.length} question IDs`);

  // Get list of already-asked question IDs from the session
  const askedIds: string[] = askedQuestions.map((q: any) =>
    typeof q === 'string' ? q : q.id
  ).filter(Boolean);

  console.log(`   Excluding IDs:`, askedIds.slice(0, 5));

  // Try to get from question bank first - try exact difficulty
  let bankQuestion = await dbOps.getQuestionByDimensionAndDifficulty(
    mapDimensionToDb(dimension),
    Math.round(difficulty),
    askedIds,
  );

  // If no exact match, try nearby difficulties (±1)
  if (!bankQuestion && difficulty > 1) {
    console.log(`   Trying difficulty ${Math.round(difficulty) - 1}...`);
    bankQuestion = await dbOps.getQuestionByDimensionAndDifficulty(
      mapDimensionToDb(dimension),
      Math.round(difficulty) - 1,
      askedIds,
    );
  }

  if (!bankQuestion && difficulty < 5) {
    console.log(`   Trying difficulty ${Math.round(difficulty) + 1}...`);
    bankQuestion = await dbOps.getQuestionByDimensionAndDifficulty(
      mapDimensionToDb(dimension),
      Math.round(difficulty) + 1,
      askedIds,
    );
  }

  if (bankQuestion) {
    console.log(
      `✓ Using bank question for ${dimension} at difficulty ${difficulty}`,
    );
    await dbOps.incrementQuestionUsage(bankQuestion.id);
    return mapBankQuestionToQuestion(bankQuestion);
  }

  // Generate with AI if no bank question available
  console.log(
    `⚡ Generating AI question for ${dimension} at difficulty ${difficulty}`,
  );
  const aiQuestion = await generateQuestion(
    assessmentId,
    dimension,
    difficulty,
    questionType,
    askedQuestions,
  );
  return aiQuestion;
}

// Helper: Complete assessment and generate final result
async function completeAssessment(
  sessionId: string,
  profile: StudentProfile,
): Promise<AssessmentResult> {
  // Calculate final levels and confidence for each dimension
  const dimensionScores = Object.entries(profile.dimensions).reduce(
    (acc, [dim, state]) => {
      acc[dim as Dimension] = {
        estimatedLevel: getEstimatedLevel(state),
        confidence: calculateConfidence(state),
        questionsAnswered: state.questionCount,
        accuracy:
          state.questionCount > 0
            ? state.correctCount / state.questionCount
            : 0,
      };
      return acc;
    },
    {} as AssessmentResult["dimensionScores"],
  );

  // Get all responses for analysis
  const responses = await dbOps.getQuestionResponses(sessionId);

  // Get hint events for behavioral analysis
  const hintEvents = await dbOps.getHintEvents(sessionId);
  const hintProfile = analyzeHintBehavior(hintEvents as any);
  const hintNarrative = generateHintNarrative(hintProfile);

  console.log("\n=== HINT BEHAVIOR ANALYSIS ===");
  console.log(`Total hints used: ${hintProfile.totalHintsUsed}`);
  console.log(`Help-seeking style: ${hintProfile.helpSeekingStyle}`);
  console.log(`Preferred learning mode: ${hintProfile.preferredLearningMode}`);
  console.log(`Hint effectiveness: ${Math.round(hintProfile.hintEffectiveness * 100)}%`);
  console.log(`Most effective hint type: ${hintProfile.mostEffectiveHintType}`);

  // Generate AI profile summary with hint insights
  const aiProfile = await generateAssessmentProfile(
    sessionId,
    dimensionScores,
    responses,
    [],
    hintNarrative,
  );

  // Map hint profile to help-seeking style
  const helpSeekingStyleMap = {
    'quick_to_ask': 'hint-dependent',
    'reluctant': 'self-reliant',
    'balanced': 'balanced',
  };
  const helpSeekingStyle = hintProfile.totalHintsUsed > 0
    ? helpSeekingStyleMap[hintProfile.helpSeekingStyle]
    : 'self-reliant';

  const result: AssessmentResult = {
    sessionId,
    studentName: profile.studentName,
    completedAt: Date.now(),
    totalTimeMs: profile.totalTimeMs,
    dimensionScores,
    overallStrength: aiProfile.overallStrength,
    areasForImprovement: aiProfile.areasForImprovement,
    learningStyleObservations: [
      ...aiProfile.learningStyleObservations,
      hintNarrative,
    ],
    helpSeekingStyle: helpSeekingStyle as any,
    problemSolvingApproach: aiProfile.problemSolvingApproach,
    codeQuality: aiProfile.codeQuality,
    allResponses: responses.map(mapDbResponseToQuestionResponse),
    hintHistory: [],
    timeMetrics: [],
  };

  // Save result to database
  await dbOps.completeAssessment(sessionId, result);

  // No in-memory cleanup needed - everything in DB

  return result;
}

// Helper: Map dimension names between frontend and database
function mapDimensionToDb(dimension: Dimension): any {
  const map: Record<Dimension, string> = {
    lowLevelBinary: "low_level",
    controlFlow: "control_flow",
    hardwareIO: "hardware_io",
    codeReading: "code_reading",
    decomposition: "decomposition",
  };
  return map[dimension];
}

function mapDbToDimension(dbDimension: string): Dimension {
  const map: Record<string, Dimension> = {
    low_level: "lowLevelBinary",
    control_flow: "controlFlow",
    hardware_io: "hardwareIO",
    code_reading: "codeReading",
    decomposition: "decomposition",
  };
  return map[dbDimension] || "lowLevelBinary";
}

function mapBankQuestionToQuestion(bankQuestion: any): Question {
  // Drizzle returns questionData as a parsed object (JSONB field)
  const questionData = bankQuestion.questionData;

  if (!questionData) {
    console.error("ERROR: Question has no questionData:", bankQuestion.id);
    throw new Error(`Question ${bankQuestion.id} is missing questionData field`);
  }

  // Build the question object from the stored data
  return {
    id: bankQuestion.id,
    dimension: mapDbToDimension(bankQuestion.dimension),
    difficulty: bankQuestion.difficulty,
    type: questionData.type || bankQuestion.questionType,
    prompt: questionData.prompt,
    source: "bank",
    // Multiple choice fields
    choices: questionData.choices,
    correctChoiceIndex: questionData.correctChoiceIndex,
    // One-liner fields
    expectedAnswer: questionData.expectedAnswer,
    // Trace fields
    codeToTrace: questionData.codeToTrace,
    traceQuestion: questionData.traceQuestion,
    traceAnswer: questionData.traceAnswer,
    // Code IDE fields
    starterCode: questionData.starterCode,
    testCases: questionData.testCases,
    // Chatbot student fields
    chatbotPersona: questionData.chatbotPersona,
    chatbotProblem: questionData.chatbotProblem,
    chatbotSolution: questionData.chatbotSolution,
    // Common fields
    tags: questionData.tags,
  };
}

function mapDbResponseToQuestionResponse(dbResponse: any): QuestionResponse {
  return {
    questionId: dbResponse.question_id || dbResponse.questionId,
    dimension: mapDbToDimension(dbResponse.dimension),
    difficulty: dbResponse.difficulty,
    correct: dbResponse.is_correct || dbResponse.isCorrect,
    partial: (dbResponse.correctness_level || dbResponse.correctnessLevel) === "partial",
    timeSpentMs: dbResponse.time_spent_ms || dbResponse.timeSpentMs,
    hintsUsed: dbResponse.hints_used?.length || dbResponse.hintsUsed || 0,
    answer: dbResponse.student_answer?.answer || dbResponse.studentAnswer?.answer || dbResponse.studentAnswer,
    questionData: dbResponse.question_data || dbResponse.questionData, // Include full question data
    keystrokes: dbResponse.keystroke_data || dbResponse.keystrokeData,
    timestamp: new Date(dbResponse.answered_at || dbResponse.answeredAt).getTime(),
  };
}

export default app;
