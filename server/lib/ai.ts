// AI Integration Module for ArduinoAssess
// Handles question generation, answer evaluation, and hint generation using Claude

import { randomUUID } from "crypto";
import Anthropic from "@anthropic-ai/sdk";
import type {
  Question,
  Dimension,
  DifficultyLevel,
  QuestionType,
  AICallType,
} from "../../frontend/src/types";
import { dbOps } from "../db/client";

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const MODEL_HAIKU = "claude-haiku-4-5";
const MODEL_SONNET = "claude-sonnet-4-5";

// Token tracking helper
async function callClaude(
  assessmentId: string,
  callType: AICallType,
  systemPrompt: string,
  userPrompt: string,
  maxTokens: number = 2000,
  useHaiku: boolean = true,
): Promise<string> {
  const startTime = Date.now();

  try {
    const model = useHaiku ? MODEL_HAIKU : MODEL_SONNET;
    const response = await anthropic.messages.create({
      model,
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: userPrompt,
        },
      ],
    });

    const latencyMs = Date.now() - startTime;
    const content = response.content[0];
    const outputText = content.type === "text" ? content.text : "";

    // Track token usage
    await dbOps.recordTokenUsage({
      assessment_id: assessmentId,
      call_type: callType,
      model,
      input_tokens: response.usage.input_tokens,
      output_tokens: response.usage.output_tokens,
      latency_ms: latencyMs,
    });

    return outputText;
  } catch (error) {
    console.error("Claude API error:", error);
    throw new Error("Failed to generate AI response");
  }
}

/**
 * Generate a question using AI
 */
export async function generateQuestion(
  assessmentId: string,
  dimension: Dimension,
  difficulty: DifficultyLevel,
  questionType: string,
  askedQuestions: string[] = [],
): Promise<Question> {
  const systemPrompt = `You are an expert Arduino programming educator creating assessment questions.
Your questions must be appropriate for students who have completed an introductory Arduino course.

CONSTRAINTS - Students have learned:
- Basic C++ syntax (variables, operators, functions)
- digitalWrite, digitalRead, pinMode, analogRead, analogWrite
- Serial.begin, Serial.println
- if/else, for loops, while loops
- millis() for timing
- Button debouncing basics
- LED control, basic sensors

CONSTRAINTS - Students have NOT learned:
- Object-oriented programming (classes, inheritance)
- Pointers or references
- Advanced data structures
- External libraries beyond core Arduino
- Interrupts
- I2C, SPI protocols

Generate a valid, well-formed question as JSON.`;

  const dimensionContext = getDimensionContext(dimension);
  const difficultyContext = getDifficultyContext(difficulty);
  const typeContext = getQuestionTypeContext(questionType);

  const userPrompt = `Create a ${questionType} question for the "${dimension}" dimension at difficulty level ${difficulty}/5.

DIMENSION FOCUS: ${dimensionContext}

DIFFICULTY: ${difficultyContext}

QUESTION TYPE: ${typeContext}

${
  askedQuestions.length > 0
    ? `IMPORTANT: Avoid creating questions similar to these already asked questions:
${askedQuestions
  .slice(-5)
  .map((q, i) => `${i + 1}. ${q.substring(0, 100)}...`)
  .join("\n")}

Create a DIFFERENT question that tests the same dimension but with different scenarios, examples, or contexts.
`
    : ""
}

IMPORTANT: When including code in the prompt, wrap it in triple backticks for proper formatting:
\`\`\`cpp
// code here
\`\`\`

Return ONLY a JSON object with this structure:
{
  "prompt": "Clear question text${questionType === "multipleChoice" ? " (DO NOT include answer choices here - they go in the choices array)" : ""}. Use \`\`\`cpp code blocks for any Arduino code.",
  "type": "${questionType}",
  ${questionType === "multipleChoice" ? '"choices": ["Option A text", "Option B text", "Option C text", "Option D text"],\n  "correctChoiceIndex": 0,' : ""}
  ${questionType === "oneLiner" ? '"expectedAnswer": "correct answer",' : ""}
  ${questionType === "codeIDE" ? '"starterCode": "// starter code\\nvoid setup() {\\n}\\nvoid loop() {\\n}",\n  "testCases": [{"id": "1", "description": "Test description", "assertion": "Expected behavior"}],' : ""}
  ${questionType === "trace" ? '"codeToTrace": "code to trace",\n  "traceQuestion": "What does this output?",\n  "traceAnswer": "expected output",' : ""}
  "tags": ["relevant", "tags"]
}

${questionType === "multipleChoice" ? '\nIMPORTANT for Multiple Choice:\n- The "prompt" field contains ONLY the question text\n- The "choices" array contains the 4 answer options\n- Do NOT include "A)", "B)", "C)", "D)" labels in the prompt\n- Do NOT list the choices in the prompt\n- The choices will be displayed separately with radio buttons' : ""}`;

  const response = await callClaude(
    assessmentId,
    "question_generation",
    systemPrompt,
    userPrompt,
    3000,
    true, // Use Haiku for speed
  );

  // Parse JSON response (strip markdown code blocks if present)
  try {
    let cleanResponse = response.trim();

    // Remove markdown code blocks (```json ... ``` or ``` ... ```)
    if (cleanResponse.startsWith("```")) {
      cleanResponse = cleanResponse
        .replace(/^```(?:json)?\s*\n/, "")
        .replace(/\n```\s*$/, "");
    }

    const parsed = JSON.parse(cleanResponse);

    return {
      id: randomUUID(),
      dimension,
      difficulty,
      type: questionType as QuestionType,
      source: "ai",
      generatedAt: Date.now(),
      ...parsed,
    };
  } catch (error) {
    console.error("Failed to parse AI question response:", response);
    throw new Error("Invalid AI question format");
  }
}

/**
 * Evaluate a student's answer using AI
 */
export async function evaluateAnswer(
  question: Question | null,
  studentAnswer: string | number,
  assessmentId: string,
): Promise<{ correct: boolean; partial: boolean; feedback?: string }> {
  console.log('\n=== EVALUATE ANSWER ===');
  console.log('Question type:', question?.type);
  console.log('Student answer:', studentAnswer, `(type: ${typeof studentAnswer})`);
  console.log('Question ID:', question?.id);

  if (!question) {
    console.log('❌ EVALUATION: Question not found');
    return { correct: false, partial: false, feedback: "Question not found" };
  }

  // For multiple choice, evaluate directly with type coercion
  if (question.type === "multipleChoice") {
    console.log('Multiple choice evaluation:');
    console.log('  - Correct index:', question.correctChoiceIndex, `(type: ${typeof question.correctChoiceIndex})`);
    console.log('  - Choices:', question.choices);

    // Coerce both to numbers to handle string/number mismatch
    const studentIndex = Number(studentAnswer);
    const correctIndex = Number(question.correctChoiceIndex);
    const correct = studentIndex === correctIndex;

    console.log('  - Student index (converted):', studentIndex);
    console.log('  - Correct index (converted):', correctIndex);
    console.log('  - Match:', correct ? '✅ CORRECT' : '❌ WRONG');

    const result = {
      correct,
      partial: false,
      feedback: correct
        ? "Correct!"
        : `Incorrect. The correct answer was: ${question.choices?.[correctIndex] || "option " + correctIndex}`,
    };

    console.log('EVALUATION RESULT:', result);
    return result;
  }

  // For one-liner, check with fuzzy matching
  if (question.type === "oneLiner" && question.expectedAnswer) {
    console.log('One-liner evaluation:');
    console.log('  - Expected answer:', question.expectedAnswer);

    const studentStr = String(studentAnswer)
      .trim()
      .toLowerCase()
      .replace(/\s+/g, " "); // Normalize whitespace
    const expectedStr = question.expectedAnswer
      .trim()
      .toLowerCase()
      .replace(/\s+/g, " ");

    console.log('  - Student (normalized):', studentStr);
    console.log('  - Expected (normalized):', expectedStr);

    // Exact match after normalization
    const exactMatch = studentStr === expectedStr;
    console.log('  - Exact match:', exactMatch ? '✅' : '❌');

    if (exactMatch) {
      console.log('EVALUATION RESULT: ✅ CORRECT (exact match)');
      return {
        correct: true,
        partial: false,
        feedback: "Correct!",
      };
    }

    // Try semantic equivalence for common variations
    const semanticMatch = checkSemanticEquivalence(studentStr, expectedStr);
    console.log('  - Semantic match:', semanticMatch ? '✅' : '❌');

    if (semanticMatch) {
      console.log('EVALUATION RESULT: ✅ CORRECT (semantic match)');
      return {
        correct: true,
        partial: false,
        feedback: "Correct! (Alternative format accepted)",
      };
    }

    // Close but not exact - use AI to judge
    if (Math.abs(studentStr.length - expectedStr.length) < 10) {
      console.log('  - Similar length, using AI evaluation...');
      // Similar length, might be a minor variation - ask AI
      const aiResult = await evaluateWithAI(question, studentAnswer, assessmentId);
      console.log('EVALUATION RESULT (AI):', aiResult);
      return aiResult;
    }

    console.log('EVALUATION RESULT: ❌ WRONG (no match)');
    return {
      correct: false,
      partial: false,
      feedback: `Expected: ${question.expectedAnswer}`,
    };
  }

  // For code and trace questions, use AI evaluation
  console.log('Using AI evaluation for code/trace question...');
  const systemPrompt = `You are an expert Arduino programming educator evaluating student code.
Be LENIENT and FAIR. Focus on conceptual understanding, not perfect syntax.

Award full credit if:
- The core logic is correct
- The approach demonstrates understanding
- Minor syntax errors don't affect the solution

Award partial credit if:
- The approach is on the right track but incomplete
- Some concepts are correct but others are missing
- The code has bugs but shows understanding

Only mark as wrong if:
- Fundamental misunderstanding of the concept
- Completely wrong approach
- No evidence of relevant knowledge

Respond with JSON only:
{
  "correct": boolean,
  "partial": boolean,
  "feedback": "Brief, constructive feedback (2-3 sentences max)"
}`;

  const userPrompt = `QUESTION:
${question.prompt}

STUDENT ANSWER:
${studentAnswer}

${
  question.type === "codeIDE" && question.testCases
    ? `
REQUIREMENTS:
${question.testCases.map((tc) => `- ${tc.description}`).join("\n")}
`
    : ""
}

${
  question.type === "trace" && question.traceAnswer
    ? `
EXPECTED OUTPUT:
${question.traceAnswer}
`
    : ""
}

Evaluate this answer. Consider:
1. Correctness of logic
2. Proper Arduino API usage
3. Code structure (for code questions)
4. Understanding of concepts

Return evaluation as JSON.`;

  const response = await callClaude(
    assessmentId,
    "answer_evaluation",
    systemPrompt,
    userPrompt,
    1000,
    true, // Use Haiku for speed
  );

  try {
    let cleanResponse = response.trim();

    // Remove markdown code blocks if present
    if (cleanResponse.startsWith("```")) {
      cleanResponse = cleanResponse
        .replace(/^```(?:json)?\s*\n/, "")
        .replace(/\n```\s*$/, "");
    }

    const result = JSON.parse(cleanResponse);
    console.log('EVALUATION RESULT (AI):', result);
    return result;
  } catch (error) {
    console.error("Failed to parse AI evaluation:", response);
    const fallbackResult = {
      correct: false,
      partial: false,
      feedback: "Unable to evaluate answer. Please try again.",
    };
    console.log('EVALUATION RESULT (FALLBACK):', fallbackResult);
    return fallbackResult;
  }
}

/**
 * Generate a contextual hint for the student
 */
export async function generateHint(
  assessmentId: string,
  questionId: string,
  currentCode?: string,
  hintType?: "conceptual" | "syntax" | "example",
  questionContext?: string,
): Promise<{ text: string; type: string }> {
  const type = hintType || "conceptual";

  const systemPrompt = `You are a helpful Arduino programming tutor providing hints to students.
Give hints that guide students toward the answer without solving the problem directly.
Be encouraging and educational. Focus on Arduino fundamentals they should have learned.

Return ONLY a JSON object with this structure:
{
  "hintText": "Your helpful hint here",
  "hintType": "${type}"
}`;

  const userPrompt = `The student is stuck on an Arduino programming question and has requested a ${type} hint.

Question context: ${questionContext || "Arduino programming question"}

${currentCode ? `Their current answer/code:\n${currentCode}\n\n` : ""}

Provide a ${type} hint that:
${type === "conceptual" ? "- Explains the underlying Arduino concept without solving it\n- Points them toward relevant functions like digitalWrite, pinMode, delay, etc." : ""}
${type === "syntax" ? "- Helps them think about Arduino syntax\n- Reminds them of correct function usage" : ""}
${type === "example" ? "- Provides a simplified Arduino example\n- Shows a similar pattern they can apply" : ""}

Keep the hint brief (1-2 sentences), specific to Arduino, and encouraging.`;

  try {
    const response = await callClaude(
      assessmentId,
      "hint_generation",
      systemPrompt,
      userPrompt,
      500,
      true, // Use Haiku for speed
    );

    let cleanResponse = response.trim();
    if (cleanResponse.startsWith("```")) {
      cleanResponse = cleanResponse
        .replace(/^```(?:json)?\s*\n/, "")
        .replace(/\n```\s*$/, "");
    }

    const parsed = JSON.parse(cleanResponse);
    return {
      text: parsed.hintText,
      type: parsed.hintType || type,
    };
  } catch (error) {
    console.error("Failed to generate hint:", error);

    const fallbackHints = {
      conceptual:
        "Think about the fundamental concept being tested. What Arduino function or principle applies here?",
      syntax:
        "Check your syntax carefully. Are you using the correct function signature?",
      example:
        "Try starting with a simple example and building up to the full solution.",
    };

    return {
      text: fallbackHints[type],
      type,
    };
  }
}

/**
 * Generate final assessment profile using AI
 */
export async function generateAssessmentProfile(
  assessmentId: string,
  dimensionScores: Record<
    Dimension,
    { estimatedLevel: number; confidence: number; accuracy?: number }
  >,
  responses: any[],
  timeMetrics: any[],
  hintNarrative?: string,
): Promise<{
  overallStrength: string;
  areasForImprovement: string[];
  learningStyleObservations: string;
  problemSolvingApproach: string;
  codeQuality: string;
}> {
  const systemPrompt = `You are an expert assessment analyst providing behavioral insights for instructors.

Your job is to ANALYZE what the student DID, not prescribe what to teach.
Focus on observable behaviors, patterns, and characteristics that help instructors understand each student's unique profile.

Your response must be valid JSON with these fields:
{
  "overallStrength": "What this student is BEST at based on actual performance",
  "areasForImprovement": ["Specific weak dimensions with evidence", "Observable gaps", "Patterns in errors"],
  "learningStyleObservations": "HOW they approached the assessment (pacing, hint usage, time patterns, engagement style)",
  "problemSolvingApproach": "Observable problem-solving behaviors (rushes/deliberates, guesses/reasons, gives up/persists)",
  "codeQuality": "If applicable: actual code patterns observed. Otherwise: answer quality and coherence"
}`;

  // Calculate accuracy from responses (handle both camelCase and snake_case)
  const correctCount = responses.filter((r) => r.isCorrect || r.is_correct).length;
  const partialCount = responses.filter((r) =>
    (r.correctnessLevel === "partial" || r.correctness_level === "partial")
  ).length;
  const wrongCount = responses.length - correctCount - partialCount;
  const accuracy = responses.length > 0 ? (correctCount / responses.length) * 100 : 0;

  // Calculate time metrics
  const totalTime = responses.reduce((sum, r) => sum + (r.timeSpentMs || r.time_spent_ms || 0), 0);
  const avgTimePerQuestion = responses.length > 0 ? totalTime / responses.length : 0;
  const minTime = Math.min(...responses.map(r => r.timeSpentMs || r.time_spent_ms || 0));
  const maxTime = Math.max(...responses.map(r => r.timeSpentMs || r.time_spent_ms || 0));

  // Detect suspicious patterns
  const veryFastQuestions = responses.filter(r => (r.timeSpentMs || r.time_spent_ms || 0) < 5000).length;
  const suspiciouslyFast = veryFastQuestions > responses.length * 0.5 && accuracy < 30;

  // Build Q&A sample (first 5, last 5, and any interesting ones in between)
  const sampleQAs = [];
  const maxSamples = 10;
  if (responses.length <= maxSamples) {
    sampleQAs.push(...responses);
  } else {
    // First 3
    sampleQAs.push(...responses.slice(0, 3));
    // Last 3
    sampleQAs.push(...responses.slice(-3));
    // 4 random from middle
    const middle = responses.slice(3, -3);
    for (let i = 0; i < 4 && i < middle.length; i++) {
      const idx = Math.floor(i * middle.length / 4);
      sampleQAs.push(middle[idx]);
    }
  }

  const qaSection = sampleQAs.map((r, idx) => {
    const qData = r.questionData || r.question_data;
    const answer = r.studentAnswer || r.student_answer;
    const timeMs = r.timeSpentMs || r.time_spent_ms || 0;

    let questionText = qData?.prompt || "Question not available";
    if (questionText.length > 200) questionText = questionText.substring(0, 200) + "...";

    let answerText = "";
    if (qData?.type === "multipleChoice") {
      const ansIdx = answer?.answer ?? answer;
      answerText = qData?.choices?.[ansIdx] || `Choice ${ansIdx}`;
    } else {
      answerText = answer?.answer || answer || "No answer";
      if (typeof answerText === "string" && answerText.length > 150) {
        answerText = answerText.substring(0, 150) + "...";
      }
    }

    const correct = r.isCorrect || r.is_correct ? "✓" : "✗";

    return `Q${idx + 1} [${r.dimension}, diff ${r.difficulty}, ${(timeMs/1000).toFixed(1)}s]: ${correct}
  Q: ${questionText}
  A: ${answerText}`;
  }).join("\n\n");

  const userPrompt = `ANALYZE this student's assessment behavior to help the instructor understand their unique profile.

DIMENSION SCORES:
${Object.entries(dimensionScores)
  .map(
    ([dim, score]) =>
      `- ${dim}: Level ${score.estimatedLevel}/5 (confidence: ${(score.confidence * 100).toFixed(0)}%, accuracy: ${((score.accuracy || 0) * 100).toFixed(0)}%)`,
  )
  .join("\n")}

PERFORMANCE SUMMARY:
- Total Questions: ${responses.length}
- Correct: ${correctCount} (${accuracy.toFixed(0)}%)
- Partial: ${partialCount}
- Wrong: ${wrongCount}

TIME BEHAVIOR:
- Total time: ${(totalTime / 1000 / 60).toFixed(1)} minutes
- Avg per question: ${(avgTimePerQuestion / 1000).toFixed(1)}s
- Range: ${(minTime / 1000).toFixed(1)}s - ${(maxTime / 1000).toFixed(1)}s
- Questions <5s: ${veryFastQuestions}/${responses.length}

${hintNarrative ? `HINT USAGE:\n${hintNarrative}\n` : 'No hints requested\n'}

SAMPLE QUESTIONS & ANSWERS (${sampleQAs.length} of ${responses.length} total):
${qaSection}

BEHAVIORAL RED FLAGS TO CHECK:
${suspiciouslyFast ? '⚠️ POSSIBLE SPAM: Very fast answers (<5s) with low accuracy suggests rushing/guessing without reading' : ''}
${accuracy < 20 && veryFastQuestions === responses.length ? '⚠️ LIKELY SPAM: All questions answered very quickly with near-zero accuracy - not a genuine attempt' : ''}
${accuracy === 0 && avgTimePerQuestion < 5000 ? '⚠️ DEFINITE SPAM: 0% accuracy with <5s average = did not attempt assessment seriously' : ''}

ANALYSIS INSTRUCTIONS:
- If behavior suggests SPAM (fast + low accuracy), say so directly: "This appears to be a rushed/spam submission rather than a genuine assessment attempt"
- If genuine but struggling (slow + low accuracy), describe their actual difficulties
- If strong (high accuracy), identify specific strengths by dimension
- Focus on OBSERVABLE PATTERNS: pacing, which dimensions stronger/weaker, answer consistency
- DO NOT give teaching recommendations - just describe what you observe about THIS student's behavior and knowledge state

Describe this student's behavioral profile based on the data above.`;

  const response = await callClaude(
    assessmentId,
    "profile_generation",
    systemPrompt,
    userPrompt,
    2000,
    false, // Use Sonnet for comprehensive analysis
  );

  try {
    let cleanResponse = response.trim();

    // Remove markdown code blocks if present
    if (cleanResponse.startsWith("```")) {
      cleanResponse = cleanResponse
        .replace(/^```(?:json)?\s*\n/, "")
        .replace(/\n```\s*$/, "");
    }

    return JSON.parse(cleanResponse);
  } catch (error) {
    console.error("Failed to parse AI profile:", response);
    return {
      overallStrength: "Assessment completed successfully",
      areasForImprovement: ["Review core concepts", "Practice more problems"],
      learningStyleObservations: "Continue practicing to build proficiency",
      problemSolvingApproach: "Shows systematic approach to problems",
      codeQuality: "Code demonstrates understanding of basic principles",
    };
  }
}

// Helper functions for context

function getDimensionContext(dimension: Dimension): string {
  const contexts: Record<Dimension, string> = {
    lowLevelBinary:
      "Binary representation, hexadecimal, bitwise operations, how digital signals work at LOW/HIGH level",
    controlFlow:
      "Conditionals (if/else), loops (for/while), logical operators, state machines, flow control",
    hardwareIO:
      "Using pinMode, digitalWrite, digitalRead, analogRead, analogWrite correctly with LEDs, buttons, sensors",
    codeReading:
      "Reading existing code, predicting output, understanding what code does, debugging",
    decomposition:
      "Breaking problems into functions, planning code structure, designing solutions",
  };
  return contexts[dimension];
}

function getDifficultyContext(difficulty: DifficultyLevel): string {
  const contexts: Record<DifficultyLevel, string> = {
    1: "Very basic - single concept, direct application, minimal complexity",
    2: "Basic - straightforward problem, 1-2 concepts combined",
    3: "Intermediate - multiple concepts, requires some analysis",
    4: "Advanced - complex logic, multiple integrated concepts, non-obvious solution",
    5: "Expert - highly complex, requires deep understanding and creative problem-solving",
  };
  return contexts[difficulty];
}

function getQuestionTypeContext(questionType: string): string {
  const contexts: Record<string, string> = {
    oneLiner:
      "Single numerical or short text answer. Ask for a specific value, calculation, or brief response.",
    multipleChoice:
      "4 choices (A-D). Include plausible distractors that reveal common misconceptions.",
    codeIDE:
      "Write Arduino code to solve a problem. Provide starter code with setup() and loop(). Include test cases that check the solution.",
    trace:
      "Predict what code will output. Provide runnable Arduino code and ask what it prints to Serial or what happens with hardware.",
  };
  return contexts[questionType] || questionType;
}

/**
 * Check if two answers are semantically equivalent
 * Handles common Arduino code variations
 */
function checkSemanticEquivalence(student: string, expected: string): boolean {
  // Remove all whitespace for comparison
  const studentNoSpace = student.replace(/\s/g, "");
  const expectedNoSpace = expected.replace(/\s/g, "");

  // Exact match without spaces
  if (studentNoSpace === expectedNoSpace) return true;

  // Check for common Arduino function variations
  const equivalentPatterns = [
    // pinMode variations
    [/pinmode\((\d+),\s*output\)/i, /pinmode\((\d+),output\)/i],
    [/pinmode\((\d+),\s*input\)/i, /pinmode\((\d+),input\)/i],
    // digitalWrite variations
    [/digitalwrite\((\d+),\s*high\)/i, /digitalwrite\((\d+),high\)/i],
    [/digitalwrite\((\d+),\s*low\)/i, /digitalwrite\((\d+),low\)/i],
    // Number equivalents
    [/\bhigh\b/i, /\b1\b/],
    [/\blow\b/i, /\b0\b/],
  ];

  for (const [pattern1, pattern2] of equivalentPatterns) {
    if (
      (pattern1.test(studentNoSpace) && pattern2.test(expectedNoSpace)) ||
      (pattern2.test(studentNoSpace) && pattern1.test(expectedNoSpace))
    ) {
      return true;
    }
  }

  return false;
}

/**
 * Use AI to evaluate answer when fuzzy matching is insufficient
 */
async function evaluateWithAI(
  question: Question,
  studentAnswer: string | number,
  assessmentId: string,
): Promise<{ correct: boolean; partial: boolean; feedback?: string }> {
  const systemPrompt = `You are an expert Arduino programming educator evaluating student answers.
Be fair and lenient with minor formatting differences.
Accept answers that are semantically correct even if format differs slightly.

Respond with JSON only:
{
  "correct": boolean,
  "partial": boolean,
  "feedback": "Brief feedback"
}`;

  const userPrompt = `QUESTION: ${question.prompt}

EXPECTED ANSWER: ${question.expectedAnswer || "See question context"}

STUDENT ANSWER: ${studentAnswer}

Is the student's answer correct? Accept minor variations in spacing, capitalization, or formatting.`;

  try {
    const response = await callClaude(
      assessmentId,
      "answer_evaluation",
      systemPrompt,
      userPrompt,
      500,
      true, // Use Haiku for speed
    );

    let cleanResponse = response.trim();
    if (cleanResponse.startsWith("```")) {
      cleanResponse = cleanResponse
        .replace(/^```(?:json)?\s*\n/, "")
        .replace(/\n```\s*$/, "");
    }

    return JSON.parse(cleanResponse);
  } catch (error) {
    console.error("AI evaluation failed:", error);
    // On error, be lenient - mark as partial credit
    return {
      correct: false,
      partial: true,
      feedback: "Answer format unclear - partial credit given",
    };
  }
}
