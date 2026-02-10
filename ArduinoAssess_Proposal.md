# ArduinoAssess: Adaptive Coding Ability Assessment Platform

## Project Proposal & Technical Specification

**Author:** Chew Tzi Hwee
**Date:** February 2026
**Purpose:** A Claude Code-ready specification for building an AI-powered adaptive assessment tool that diagnoses Arduino students' coding abilities across multiple dimensions.

---

## 1. Project Overview

### 1.1 Problem

Traditional coding assessments give a single score that tells you almost nothing about *how* a student thinks. When teaching Arduino to students with mixed backgrounds, an instructor needs to know: Does this student understand the hardware but struggle with control flow? Can they read code but not write it? Do they think in abstractions or in registers? A flat score doesn't answer these questions.

### 1.2 Solution

ArduinoAssess is an adaptive diagnostic tool that uses AI-generated questions to perform a multi-dimensional "binary search" of each student's abilities. Instead of a score, it produces a **learning profile** — a radar chart of strengths and weaknesses across distinct competency dimensions, with AI-generated teaching recommendations personalized to each student.

### 1.3 Key Differentiators

- **Adaptive questioning**: Questions get harder or easier based on responses, converging on ability boundaries efficiently (10-20 questions instead of 50+)
- **Runtime AI generation**: After initial calibration from a question bank, the AI generates targeted probe questions based on the student's specific error patterns and confusion signals
- **Multi-dimensional profiling**: Tracks 5 separate ability axes, not a single score
- **Behavioral diagnostics**: Hint usage patterns, time tracking, and keystroke replay feed back into the AI's analysis to understand *how* students think, not just *what* they know
- **Arduino-contextualized**: Every question maps to actual workshop content the students have been taught

---

## 2. What Students Have Been Taught

This assessment is designed for students who completed the **"Mastering the Art of Arduino Programming Workshop"** (101 slides). The following is an exhaustive inventory of concepts covered, which defines the assessment's content boundary.

### 2.1 Concepts Covered (Fair Game for Assessment)

#### Hardware & Board Knowledge
- Arduino UNO anatomy: USB serial interface, 14 digital pins, 6 analog pins
- ATMega328p: 8-bit processor, 16MHz clock, 2KB SRAM, 32KB program space
- Concept of a microcontroller as "a very advanced switch"
- TinkerCAD Circuits as a simulation environment

#### Programming Fundamentals
- `void setup()` and `void loop()` structure
- Function declarations: data type, function name, arguments
- Code comments (`//`)
- Curly brackets, semicolons, brackets syntax rules
- Variables: `int`, `float`, `bool`, `char`, `String`, `long`
- Variable assignment and reassignment (`counter = counter + 5`)
- Math operations: `+`, `-`, `*`, `/`, `++`
- Comparison operators: `==`, `>`, `>=`, `<=`, `<`
- Type casting: `(float)a/3`
- `#define` preprocessor directives (NOT a variable, replaced at compile time)
- ASCII table (referenced)

#### Control Flow
- `if` / `else` / `else if` conditional statements
- `for` loops with initialization, condition, increment
- `switch` / `case` / `break` statements
- State machines using `#define` states (IDLE, SELECT, MOVE, BOILING, COMPLETE pattern)
- Flowcharts as program design tool (multiple exercises)

#### Serial Communication
- `Serial.begin(9600)` — baud rate concept
- `Serial.println()` vs `Serial.print()` — the `\n` newline character
- `Serial.available()` and `Serial.parseFloat()` for input
- `Serial.println(78, BIN)` / `OCT` / `DEC` / `HEX` — number base representation
- TX/RX ports concept

#### Digital I/O
- `pinMode(pin, OUTPUT)` and `pinMode(pin, INPUT)`
- `digitalWrite(pin, HIGH)` / `digitalWrite(pin, LOW)`
- `digitalRead(pin)` — returns 0 or 1
- `INPUT_PULLUP` — built-in pull-up resistor concept
- Pull-up vs pull-down resistor wiring
- LED wiring and control

#### Analog I/O
- `analogRead(A0)` — returns 0-1023
- `analogWrite(pin, value)` — PWM concept, 0-255 range
- Threshold comparison with analog values

#### Timing
- `delay(milliseconds)` — blocking delay
- `millis()` — non-blocking timing (introduced in traffic light exercise)
- The concept of non-blocking vs blocking (briefly)

#### Button Handling
- State tracking pattern: `previousState` / `currentState`
- Edge detection: `if(currentState == 1 && previousState == 0)`
- Toggle pattern using state variables
- Debouncing concept (50ms delay, check stability)

#### Applied Projects Completed
- Hello World serial output
- Counter (1, 2, 3... incrementing)
- Counter with reset at 10
- Temperature checker (pandemic scenario)
- Height checker (if/else)
- LED blink program
- Table lamp with button toggle
- Traffic light with 3 LEDs and button cycling (Red → Yellow → Green)
- Traffic light with auto-transition using `millis()`
- Running lights with shift register
- Binary counter (0-255 on LEDs)
- Serial input exercises

### 2.2 Concepts NOT Covered (Should Not Be Assessed Directly)

The slides explicitly list these as "not covered yet":
- Arrays and data structures
- Custom functions (defining your own functions beyond setup/loop)
- Libraries and external components
- Communication protocols (I2C/SPI)
- Power management and hardware safety
- Version control
- Servos and motors (beyond PWM concept)

**Assessment rule**: Questions should not *require* knowledge of uncovered topics, but may use them as stretch challenges in the highest difficulty tiers to identify students who have self-taught beyond the workshop.

---

## 3. Assessment Dimensions

The assessment measures 5 orthogonal competency dimensions. Each dimension has levels 0-10.

### Dimension 1: Low-Level & Binary Understanding
**What it measures**: Can the student think in bits, bytes, binary, and hardware registers?

| Level | Example Knowledge |
|-------|------------------|
| 1-3 | Knows HIGH=1, LOW=0. Can convert small numbers to binary with effort. |
| 4-6 | Understands `Serial.println(78, BIN)`. Grasps that analog 0-1023 maps to voltage. PWM duty cycle concept. |
| 7-8 | Can mentally trace bit operations. Understands why 8-bit means 0-255. Can reason about ADC resolution. |
| 9-10 | Could reason about register-level manipulation (PORTB, DDR). Understands two's complement or overflow. |

**Workshop anchors**: Binary counter exercise, `BIN`/`OCT`/`HEX` serial printing, analog 0-1023 range, PWM 0-255.

### Dimension 2: Control Flow & Logic
**What it measures**: Can the student construct and trace program flow — conditionals, loops, state machines?

| Level | Example Knowledge |
|-------|------------------|
| 1-3 | Understands basic if/else. Can trace a simple sequential program. |
| 4-6 | Can write nested if/else if chains. Understands for loop mechanics. Can design a flowchart for a problem. |
| 7-8 | Can implement switch/case state machines. Understands edge detection logic (previousState pattern). Handles multiple states. |
| 9-10 | Can design complex state machines from scratch. Reasons about loop invariants. Could implement state transitions with multiple conditions. |

**Workshop anchors**: Counter with reset, traffic light state cycling, switch/case state machine pattern, flowchart exercises.

### Dimension 3: Hardware I/O Intuition
**What it measures**: Does the student understand the physical interface — pins, voltage, sensors, timing?

| Level | Example Knowledge |
|-------|------------------|
| 1-3 | Knows `pinMode`, `digitalWrite`, `digitalRead` syntax. Knows LEDs need OUTPUT. |
| 4-6 | Understands pull-up resistors, INPUT_PULLUP. Can wire a button circuit. Knows analogRead returns 0-1023 mapped to 0-5V. |
| 7-8 | Understands debouncing and why it's needed. Can reason about timing — delay vs millis. Knows when to use analog vs digital. |
| 9-10 | Can reason about shift register daisy-chaining. Understands PWM frequency implications. Could troubleshoot a circuit from symptoms. |

**Workshop anchors**: LED blink, button with pull-up, analog threshold, debouncing, table lamp toggle, shift register exercises.

### Dimension 4: Code Reading & Debugging
**What it measures**: Can the student read code they didn't write, predict its behavior, and spot errors?

| Level | Example Knowledge |
|-------|------------------|
| 1-3 | Can trace simple sequential code (Hello World). Identifies obvious syntax errors (missing semicolon). |
| 4-6 | Can mentally execute a for loop and predict output. Spots logic errors like `=` vs `==`. Can predict if/else branching. |
| 7-8 | Can trace state machine code and predict behavior across multiple button presses. Identifies subtle bugs like integer truncation (`int` for temperature). |
| 9-10 | Can reason about timing bugs, race conditions in button reading, debounce edge cases. Can spot off-by-one errors in counters. |

**Workshop anchors**: Multiple "what does this output" examples in slides, the int vs float temperature bug, the counter reset logic.

### Dimension 5: Problem Decomposition & Design
**What it measures**: Given a real-world problem, can the student break it down into a program structure?

| Level | Example Knowledge |
|-------|------------------|
| 1-3 | Can convert a simple description to a flowchart with help. Follows step-by-step instructions to write code. |
| 4-6 | Can independently construct flowcharts for 2-3 step problems. Maps flowchart to code. Can identify what variables are needed. |
| 7-8 | Can decompose the traffic light problem independently — identify states, transitions, required pins. Uses #define for readability. |
| 9-10 | Can architect a multi-component system (e.g., "build an alarm system with sensor + buzzer + display"). Thinks about edge cases proactively. |

**Workshop anchors**: Flowchart exercises (canteen, hand sanitizer, pedestrian crossing), traffic light challenge, table lamp design.

---

## 4. Assessment Flow & Adaptive Algorithm

### 4.1 Overall Flow

```
[Phase 1: Calibration]     3-4 questions from question bank
        │                  One per dimension at medium difficulty
        │                  Establishes rough baseline
        ▼
[Phase 2: Binary Search]   5-8 questions, mix of bank + AI-generated
        │                  Targets dimension with highest uncertainty
        │                  Narrows ability bounds via difficulty adjustment
        ▼
[Phase 3: Targeted Probe]  3-5 AI-generated questions
        │                  Cross-dimensional synthesis questions
        │                  Probes specific error patterns observed
        ▼
[Phase 4: Capstone]        1-2 AI-generated questions
        │                  Multi-dimensional challenge at estimated level
        │                  Confirms or adjusts the profile
        ▼
[Phase 5: Results]         AI-generated learning profile
                           Radar chart + teaching recommendations
```

Total: **12-20 questions**, taking approximately **15-25 minutes**.

### 4.2 Student State Model

```typescript
interface StudentProfile {
  dimensions: {
    [key in Dimension]: {
      lowerBound: number;      // Lowest confirmed ability (they got this right)
      upperBound: number;      // Highest tested (they got this wrong)
      estimatedLevel: number;  // Bayesian estimate
      confidence: number;      // 0-1, how sure we are
      patterns: string[];      // Observed behaviors, e.g. "confuses & with &&"
    };
  };

  answeredQuestions: {
    questionId: string;
    question: string;          // The actual question text
    studentAnswer: string;     // What they answered (text, code, or option)
    isCorrect: boolean;
    partialCredit: number;     // 0-100 for code questions
    timeMetrics: TimeMetrics;
    hintsUsed: HintEvent[];
    replayNarrative?: string;  // Compressed keystroke narrative for code questions
    dimension: Dimension[];
    difficulty: number;
    aiAnalysis?: string;       // What the AI inferred from this answer
  }[];

  suspectedWeaknesses: string[];
  // e.g. ["confuses = with ==", "understands loops but not state tracking",
  //        "knows syntax but can't decompose problems independently"]

  suspectedStrengths: string[];
  // e.g. ["strong binary intuition", "quick at tracing code mentally"]

  questionsAnswered: number;
  totalTimeElapsed: number;
}
```

### 4.3 Adaptive Selection Algorithm

```typescript
type Dimension = 'low_level' | 'control_flow' | 'hardware_io' | 'code_reading' | 'decomposition';

function selectNextQuestion(
  profile: StudentProfile,
  questionBank: Question[],
  phase: 'calibration' | 'binary_search' | 'targeted_probe' | 'capstone'
): { source: 'bank' | 'ai_generate'; question?: Question; generationPrompt?: string } {

  if (phase === 'calibration') {
    // Pick from bank: one per dimension at difficulty 5
    const untestedDimensions = getDimensionsWithNoData(profile);
    const targetDim = untestedDimensions[0];
    const question = questionBank.find(q =>
      q.dimensions.includes(targetDim) &&
      q.difficulty === 5 &&
      !profile.answeredQuestions.some(a => a.questionId === q.id)
    );
    return { source: 'bank', question };
  }

  if (phase === 'binary_search') {
    // Find dimension with highest uncertainty (widest bound gap)
    const mostUncertain = Object.entries(profile.dimensions)
      .sort(([, a], [, b]) =>
        (b.upperBound - b.lowerBound) - (a.upperBound - a.lowerBound)
      )[0];

    const [dimKey, dimState] = mostUncertain;
    const targetDifficulty = Math.round(
      (dimState.lowerBound + dimState.upperBound) / 2
    );

    // Try question bank first
    const bankQuestion = questionBank.find(q =>
      q.dimensions.includes(dimKey as Dimension) &&
      Math.abs(q.difficulty - targetDifficulty) <= 1 &&
      !profile.answeredQuestions.some(a => a.questionId === q.id)
    );

    if (bankQuestion) return { source: 'bank', question: bankQuestion };

    // Fall back to AI generation
    return {
      source: 'ai_generate',
      generationPrompt: buildGenerationPrompt(profile, dimKey as Dimension, targetDifficulty)
    };
  }

  if (phase === 'targeted_probe') {
    // AI generates cross-dimensional questions targeting observed weaknesses
    return {
      source: 'ai_generate',
      generationPrompt: buildProbePrompt(profile)
    };
  }

  if (phase === 'capstone') {
    return {
      source: 'ai_generate',
      generationPrompt: buildCapstonePrompt(profile)
    };
  }
}
```

### 4.4 Bound Update Logic

After each answer:

```typescript
function updateBounds(profile: StudentProfile, result: AnswerResult) {
  for (const dim of result.dimensions) {
    const dimState = profile.dimensions[dim];

    if (result.isCorrect) {
      // They can do at least this level
      dimState.lowerBound = Math.max(dimState.lowerBound, result.difficulty);
    } else {
      // This level is above them
      dimState.upperBound = Math.min(dimState.upperBound, result.difficulty);
    }

    // Partial credit adjusts more gently
    if (result.partialCredit > 0 && result.partialCredit < 100) {
      // They're near this level — narrow the band but don't hard-set
      const partialLevel = result.difficulty * (result.partialCredit / 100);
      dimState.lowerBound = Math.max(dimState.lowerBound, Math.floor(partialLevel));
    }

    dimState.estimatedLevel = (dimState.lowerBound + dimState.upperBound) / 2;
    dimState.confidence = 1 - (dimState.upperBound - dimState.lowerBound) / 10;
  }
}
```

### 4.5 Phase Transition Logic

```typescript
function determinePhase(profile: StudentProfile): Phase {
  const questionsAnswered = profile.questionsAnswered;

  // Phase 1: Calibration — until every dimension has at least 1 data point
  const allDimensionsTested = Object.values(profile.dimensions)
    .every(d => d.confidence > 0);
  if (!allDimensionsTested) return 'calibration';

  // Phase 2: Binary search — until all dimensions have confidence > 0.6
  const allConverged = Object.values(profile.dimensions)
    .every(d => d.confidence >= 0.6);
  if (!allConverged && questionsAnswered < 12) return 'binary_search';

  // Phase 3: Targeted probe — 3-5 cross-dimensional questions
  if (questionsAnswered < 17) return 'targeted_probe';

  // Phase 4: Capstone
  return 'capstone';
}
```

---

## 5. AI Question Generation

### 5.1 When to Use AI vs Question Bank

| Situation | Source |
|-----------|--------|
| Initial calibration (Phase 1) | Question bank — consistent baseline |
| Binary search with available bank question at right difficulty | Question bank |
| Binary search with no suitable bank question | AI-generated |
| Student shows an unusual error pattern | AI-generated targeted probe |
| Cross-dimensional synthesis questions | AI-generated (too many combinations to pre-write) |
| Capstone challenge | AI-generated |

### 5.2 AI Generation Prompt Template

The AI generation prompt must include the full student snapshot so the question targets their specific boundary. Here is the structure:

```
SYSTEM: You are generating a diagnostic question for an Arduino programming
assessment. The student has completed a workshop covering: [WORKSHOP_TOPICS].

Questions must ONLY test concepts from the covered material unless difficulty
is 9-10 (stretch). Arduino-relevant context required for all questions.

STUDENT PROFILE:
- Dimension levels: {lowLevel: 6±1, controlFlow: 4±2, hardwareIO: 7±1, ...}
- Observed patterns: ["confuses == with =", "strong at binary conversion",
  "struggles with state tracking across loop iterations"]
- Recent answer context: [last 2-3 answers with analysis]

GENERATION TARGET:
- Dimension(s): [target dimension(s)]
- Difficulty: [target level]
- Question type: [multiple_choice | one_liner | code_ide | trace_predict]
- Purpose: [what this question should reveal about the student]

RESPONSE FORMAT (strict JSON):
{
  "id": "ai_gen_<uuid>",
  "prompt": "The question text, Arduino-contextualized",
  "type": "multiple_choice",
  "dimensions": ["control_flow", "hardware_io"],
  "difficulty": 6,
  "options": ["option A", "option B", "option C", "option D"],
  "correctIndex": 1,
  "explanation": "Why the correct answer is correct",
  "whatEachAnswerReveals": {
    "0": "If they pick this, it suggests X about their understanding",
    "1": "Correct — confirms understanding of Y",
    "2": "Common mistake suggesting confusion between A and B",
    "3": "Suggests they don't understand Z at all"
  },
  "hints": {
    "conceptual": "Reminder about the underlying concept",
    "syntactical": "The syntax involved is...",
    "structural": "Think about this problem by first...",
    "example": "A similar problem would be..."
  },
  "forCodeIDE": {
    "starterCode": "// Optional starter code\nvoid setup() {\n  \n}\n\nvoid loop() {\n  \n}",
    "testCases": [
      {"input": "description", "expectedOutput": "expected", "hidden": false}
    ],
    "evaluationCriteria": "What to look for in their code beyond test passing"
  }
}
```

### 5.3 Prefetching Strategy

To hide AI latency from the student, prefetch 3 candidate next-questions while they work on the current one:

```typescript
async function prefetchNextQuestions(profile: StudentProfile) {
  // Generate 3 questions in parallel assuming different outcomes
  const [ifCorrect, ifPartial, ifWrong] = await Promise.all([
    generateQuestion({
      ...profile,
      assumption: "student_answers_correctly",
      targetDifficulty: currentDifficulty + 1.5
    }),
    generateQuestion({
      ...profile,
      assumption: "student_partially_correct",
      targetDifficulty: currentDifficulty
    }),
    generateQuestion({
      ...profile,
      assumption: "student_answers_incorrectly",
      targetDifficulty: currentDifficulty - 1.5
    })
  ]);

  return { ifCorrect, ifPartial, ifWrong };
}
```

Cost: ~3 Sonnet calls per question × $0.003 each = roughly $0.05-0.10 per full assessment.

### 5.4 AI Answer Evaluation

For code IDE questions, use a dual evaluation approach:

1. **Code execution** (via Judge0 or similar) — determines correctness
2. **AI analysis** — determines understanding

```
SYSTEM: You are evaluating a student's code submission for an Arduino assessment.

QUESTION: {question prompt}
EXPECTED APPROACH: {what a correct solution looks like}
STUDENT CODE: {their actual code}
EXECUTION RESULT: {pass/fail, output, errors}
REPLAY NARRATIVE: {compressed keystroke narrative}
HINTS USED: {which hints they opened, in what order}
TIME SPENT: {total time, time before first keystroke, pauses}

EVALUATE AND RETURN JSON:
{
  "correct": boolean,
  "partialCredit": 0-100,
  "conceptsCorrect": ["list of concepts they demonstrated"],
  "conceptsMissing": ["list of concepts they should have used but didn't"],
  "errorAnalysis": "If wrong, specifically what went wrong and what it reveals",
  "processInsight": "What their replay/timing/hints reveal about how they think",
  "suspectedWeakness": "Any new weakness signals to add to their profile",
  "suspectedStrength": "Any new strength signals",
  "confidenceInAssessment": 0.0-1.0
}
```

---

## 6. Question Types & UI Specifications

### 6.1 One-Liner Questions

**Purpose**: Quick conceptual checks. 30-60 seconds expected.

**UI**: Single text input field with the question. Monospace font for code-related answers. Auto-submit on Enter.

**Examples at different difficulties**:
- Difficulty 2: "What function do you call to set pin 7 as an output?" → `pinMode(7, OUTPUT)`
- Difficulty 5: "What value does `analogRead(A0)` return if the voltage is 2.5V?" → `512` (or ~512)
- Difficulty 8: "What does `Serial.println(0b11001010, DEC)` print?" → `202`

**Evaluation**: Exact match with fuzzy tolerance (whitespace, semicolons, case), plus AI fallback for semantically correct but differently formatted answers.

### 6.2 Multiple Choice Questions

**Purpose**: Test conceptual understanding and identify specific misconceptions based on which wrong answer they pick.

**UI**: Question text (may include code snippet in syntax-highlighted block) + 4 options as clickable cards. Options may contain code snippets.

**Key design principle**: Wrong answers are diagnostic — each wrong option corresponds to a specific misconception. The `whatEachAnswerReveals` field is critical.

**Example**:
```
Difficulty 6, Dimension: code_reading + control_flow

Q: What does this code print after 3 button presses?
   (starting with redLight=1, yellowLight=0, greenLight=0)

   [code snippet of traffic light state machine]

A) Red, Red, Red        → [reveals: doesn't understand state transitions]
B) Yellow, Green, Red   → [correct: traces state machine properly]
C) Red, Yellow, Green   → [reveals: off-by-one, counting initial state as first "press"]
D) Green, Yellow, Red   → [reveals: traces backwards / confused about order]
```

### 6.3 Code IDE Questions

**Purpose**: Test ability to write working code. Most diagnostic question type.

**UI**: Monaco editor (VS Code's editor component) with Arduino syntax highlighting. Split pane: instructions on left, editor on right. "Run" button that executes via sandbox. Output panel below editor. Hint drawer accessible from sidebar.

**Scaffolding by difficulty**:
- Difficulty 1-3: Provide starter code with blanks to fill (`// YOUR CODE HERE`)
- Difficulty 4-6: Provide function signature and setup, student writes the logic
- Difficulty 7-8: Provide only the problem description, blank canvas
- Difficulty 9-10: Provide a problem requiring novel combination of concepts

**Code execution approach**: Use Judge0 API (self-hosted or cloud) compiling as C/C++ with Arduino function stubs:

```c
// Arduino stub header injected before student code
#include <stdio.h>
int _pins[20] = {0};
int _analog_pins[6] = {0};
int _pin_modes[20] = {0};
unsigned long _millis_val = 0;

#define HIGH 1
#define LOW 0
#define OUTPUT 1
#define INPUT 0
#define INPUT_PULLUP 2
#define A0 14
#define A1 15

void pinMode(int pin, int mode) { _pin_modes[pin] = mode; }
void digitalWrite(int pin, int val) { _pins[pin] = val; }
int digitalRead(int pin) { return _pins[pin]; }
int analogRead(int pin) { return _analog_pins[pin - 14]; }
void analogWrite(int pin, int val) { _pins[pin] = val; }
unsigned long millis() { return _millis_val; }
void delay(int ms) { _millis_val += ms; }

// Serial stub
typedef struct {
    void (*begin)(int);
    void (*println_int)(int);
    void (*println_str)(const char*);
    void (*print_str)(const char*);
} SerialClass;
// ... (simplified for proposal, full implementation in code)
```

**Fallback for complex questions**: If code execution is impractical (e.g., testing debounce timing), use AI-only evaluation of the code as text.

### 6.4 Trace/Predict Questions

**Purpose**: Test code reading ability specifically. Given code, predict the output.

**UI**: Syntax-highlighted code block on top. Below, either a text input ("What does the Serial Monitor show?") or multiple choice with output options.

**Example**:
```
Difficulty 5:

int a = 1;
void setup() { Serial.begin(9600); }
void loop() {
  Serial.println(a);
  a = a + 1;
  if (a > 5) { a = 1; }
  delay(500);
}

Q: What are the first 8 numbers printed to the Serial Monitor?
```

---

## 7. Hint System (Diagnostic, Not Punitive)

### 7.1 Design Philosophy

Hints are a **diagnostic tool disguised as help**. Which hints students request, in what order, and how they respond afterwards reveals their learning style and knowledge gaps. Students are explicitly told: "Using hints adjusts your profile but does NOT penalize you."

### 7.2 Hint Categories

Each question offers up to 4 hint types, presented as labeled buttons:

| Hint Type | Button Label | What It Reveals When Requested |
|-----------|-------------|-------------------------------|
| `conceptual` | 💡 "Remind me of the concept" | Student lacks theoretical foundation for this topic |
| `syntactical` | 🔧 "Show me the syntax" | Student understands concept but not the C/Arduino language |
| `structural` | 🗺️ "Help me plan my approach" | Student can't decompose the problem independently |
| `example` | 📖 "Show a similar example" | Student learns by pattern matching and analogy |

For multiple choice questions, an additional option:
| `elimination` | ❌ "Which answers are definitely wrong?" | Student is guessing strategically, not reasoning from knowledge |

### 7.3 Hint Tracking Data Model

```typescript
interface HintEvent {
  questionId: string;
  hintType: 'conceptual' | 'syntactical' | 'structural' | 'example' | 'elimination';
  timestamp: number;
  timeIntoQuestion: number;    // Seconds since question was shown
  // Post-hint behavior
  subsequentAction: 'answered_correctly' | 'answered_wrong' | 'asked_another_hint' | 'still_working';
  timeAfterHintToAnswer: number | null;
}
```

### 7.4 Hint Behavior Analysis

```typescript
function analyzeHintBehavior(events: HintEvent[]): HintProfile {
  return {
    // Help-seeking style
    helpSeekingStyle:
      avg(events.map(e => e.timeIntoQuestion)) < 30 ? 'quick_to_ask' :
      avg(events.map(e => e.timeIntoQuestion)) > 120 ? 'reluctant' : 'balanced',

    // Which hint type is most effective for this student?
    mostEffectiveHintType: findTypeWithHighestPostHintSuccessRate(events),

    // Primary learning modality
    preferredLearningMode:
      mode(events.map(e => e.hintType)) === 'example' ? 'pattern_matching' :
      mode(events.map(e => e.hintType)) === 'conceptual' ? 'theory_first' :
      mode(events.map(e => e.hintType)) === 'structural' ? 'needs_scaffolding' :
      'syntax_focused',

    // Do hints actually help them?
    hintEffectiveness: events.filter(
      e => e.subsequentAction === 'answered_correctly'
    ).length / events.length,
  };
}
```

### 7.5 AI-Generated Contextual Hints (for Code IDE)

For code IDE questions, hints can be generated in real-time based on what the student has written so far:

```
Student's current code:
  void loop() {
    int val = analogRead(A0);
    // [cursor here, stuck for 45 seconds]
  }

Question asks them to: "Turn on an LED at pin 7 when the analog value exceeds 512"

Generate a STRUCTURAL hint that nudges them toward the next step
without giving away the answer. Reference their existing code.
```

→ AI might produce: "You've read the analog value — great start. Now think about what you learned with the temperature checker: you compared a value against a threshold using `if`. What threshold matters here?"

---

## 8. Time Tracking

### 8.1 Metrics Collected

```typescript
interface TimeMetrics {
  // Per question
  totalTime: number;                // Total seconds from question shown to answer submitted
  timeToFirstAction: number;        // Seconds before first click/keystroke (thinking time)
  timeToFirstHint: number | null;   // Seconds before first hint request (null if no hints)
  timeAfterLastEdit: number;        // Seconds between last edit and submission (review time)

  // For code IDE questions — keystroke-level
  keystrokes: {
    timestamp: number;
    type: 'insert' | 'delete' | 'paste' | 'undo' | 'redo';
    content: string;
    position: { line: number; col: number };
  }[];

  // Derived patterns (computed client-side)
  patterns: {
    thinkingTime: number;           // Time before first keystroke
    writingBursts: number;          // Count of periods with >2 keystrokes/sec
    deletionRatio: number;          // % of keystrokes that are deletes
    longestPause: number;           // Biggest gap between keystrokes (seconds)
    totalPauseTime: number;         // Sum of all pauses > 3 seconds
    codeRunAttempts: number;        // How many times they clicked "Run"
  };
}
```

### 8.2 What Timing Reveals

| Pattern | Interpretation |
|---------|---------------|
| Fast + correct | Below their level, solid understanding |
| Fast + wrong | Overconfident or has a misconception they're sure about |
| Slow + correct | At their frontier, working through it |
| Slow + wrong | Above their level |
| Long pause then burst | Had an "aha moment" |
| High deletion ratio | Experimenting, unsure of approach |
| Many run attempts | Trial-and-error debugging style |
| Immediate typing then long pause | Started confidently, hit a wall midway |
| Short thinking time, quick correct | Fluent — this concept is internalized |

---

## 9. Keystroke Replay → AI Feedback

### 9.1 Recording (Client-Side)

Record all editor events in memory using Monaco editor's `onDidChangeModelContent` API. Never send raw keystrokes to the server — compress into a human-readable narrative first.

### 9.2 Compression Algorithm

```typescript
function compressReplay(events: KeystrokeEvent[]): string {
  const phases = identifyPhases(events);
  // Phases are classified by keystroke density and type:
  // - "reading": no keystrokes, question just appeared
  // - "thinking": pause > 5 seconds
  // - "writing": sustained typing (>2 chars/sec)
  // - "deleting": net-negative characters
  // - "running": code execution event
  // - "hint": hint panel opened

  return phases.map(phase => {
    switch (phase.type) {
      case 'reading':
        return `[${formatTime(phase.start)}] Read question for ${phase.duration}s`;
      case 'thinking':
        return `[${formatTime(phase.start)}] Paused ${phase.duration}s`;
      case 'writing':
        return `[${formatTime(phase.start)}] Wrote: \`${phase.codeSnapshot}\``;
      case 'deleting':
        return `[${formatTime(phase.start)}] Deleted "${phase.deleted}", replaced with "${phase.replacement}"`;
      case 'running':
        return `[${formatTime(phase.start)}] Ran code → ${phase.passed ? 'PASS' : `FAIL: ${phase.errors}`}`;
      case 'hint':
        return `[${formatTime(phase.start)}] Opened ${phase.hintType} hint`;
    }
  }).join('\n');
}
```

### 9.3 AI Replay Analysis Prompt

```
STUDENT REPLAY for question: "{question_prompt}"

{compressed_replay_narrative}

Total time: {totalTime}s. Hints used: {hintsSummary}. Run attempts: {runCount}.

ANALYZE: What does this replay reveal about the student's problem-solving
process? Consider:
1. Their approach (top-down planning vs trial-and-error?)
2. What they wrote first (what concept came to mind first?)
3. What they deleted/changed (what misconceptions did they self-correct?)
4. How they used hints and run attempts (learning style?)

Return JSON:
{
  "processInsight": "Narrative description of how they approached the problem",
  "strengthSignals": ["list of positive indicators"],
  "concernSignals": ["list of areas for improvement"],
  "learningStyle": "pattern_matcher | theory_builder | experimenter | careful_planner",
  "recommendedFollowUp": "What kind of question would best probe further",
  "confidenceInAssessment": 0.0-1.0
}
```

The compressed narrative is typically 200-500 tokens — cheap to include in every evaluation call.

---

## 10. Results & Profile Generation

### 10.1 Final Profile Structure

```typescript
interface AssessmentResult {
  student: {
    id: string;
    studentId: string;       // 5-digit student ID
    assessmentDate: string;
    totalTime: number;
    questionsAnswered: number;
  };

  dimensions: {
    [key in Dimension]: {
      level: number;           // 0-10 final estimate
      confidence: number;      // 0-1
      evidence: string[];      // Key observations supporting this level
    };
  };

  overallProfile: {
    strengths: string[];       // Top 2-3 strength areas with specifics
    growthAreas: string[];     // Top 2-3 areas for improvement with specifics
    learningStyle: string;     // How they learn best
    problemSolvingApproach: string;  // How they tackle problems
  };

  teachingRecommendations: {
    startWith: string;         // What to teach them first and how
    leverageStrengths: string; // How to use their strengths to teach weak areas
    suggestedFirstProject: string;
    avoidPitfalls: string;     // Common teaching mistakes for this profile
  };

  radarChart: {
    labels: string[];
    values: number[];
  };
}
```

### 10.2 AI Profile Generation Prompt

After all questions are complete, send the full student profile to AI for final synthesis:

```
GENERATE LEARNING PROFILE:

Student completed {N} questions in {M} minutes.

DIMENSION SCORES:
- Low-level & Binary: {level} (confidence: {conf})
- Control Flow & Logic: {level} (confidence: {conf})
- Hardware I/O: {level} (confidence: {conf})
- Code Reading: {level} (confidence: {conf})
- Problem Decomposition: {level} (confidence: {conf})

FULL ANSWER HISTORY:
{For each question: the question, their answer, correctness, time, hints,
 replay narrative, and per-question AI analysis}

HINT BEHAVIOR SUMMARY:
- Help-seeking style: {quick_to_ask | balanced | reluctant}
- Most effective hint type: {type}
- Preferred learning mode: {mode}

GENERATE a comprehensive learning profile with:
1. Plain-language summary (2-3 sentences a non-technical instructor could understand)
2. Specific strengths with evidence (cite specific answers)
3. Specific growth areas with evidence
4. Learning style characterization
5. Teaching recommendations:
   - What to teach first
   - How to leverage their strengths
   - Suggested first project that plays to strengths while scaffolding weaknesses
   - What NOT to do with this student
```

### 10.3 Results UI

**Radar chart**: 5-axis chart showing dimension levels (0-10 scale).

**Profile card**: Clean card layout with:
- Student ID and date
- Radar chart (prominent, centered)
- Strengths section (green accented)
- Growth areas section (amber accented)
- "How you learn best" section
- Teaching recommendations (collapsible, for instructor view)

**Comparison view** (for instructor): Side-by-side radar charts for entire class. Identify clusters — "these 5 students are strong in hardware but weak in control flow, group them for state machine exercises."

---

## 11. Technical Architecture

### 11.1 Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Runtime | Bun | Fast all-in-one JS runtime — runs TS natively, built-in bundler, fast installs |
| Frontend | Vite + React + TypeScript | Fast dev, type safety, your preferred stack |
| UI Components | shadcn/ui + Tailwind CSS | Composable, unstyled primitives. Industrial, no-nonsense aesthetic |
| Code Editor | Monaco Editor (`@monaco-editor/react`) | VS Code quality, Arduino syntax support |
| Charts | Recharts | Radar chart for results (works well with shadcn theming) |
| State Management | Zustand | Assessment state is complex but single-page |
| Backend | Hono (on Bun) | Lightweight, fast, Cloud Run friendly, built-in middleware |
| Database | Neon (Postgres) | Structured data, complex queries for class analytics |
| AI | Anthropic Claude API (Sonnet) | Question generation + evaluation |
| Token Tracking | Built-in middleware | Tracks input/output tokens per API call, per assessment, per student |
| Code Execution | Judge0 API (cloud or self-hosted) | C/C++ compilation for Arduino code testing |
| Student Auth | 5-digit student ID | No accounts needed — students just enter their ID to start |
| Instructor Auth | Password from env var | Single `INSTRUCTOR_PASSWORD` env var protects the dashboard |
| Deployment | Google Cloud Run | Single container serves both frontend + API. One `gcloud run deploy` command |

### 11.2 Project Structure

```
arduino-assess/
├── package.json
├── bun.lock
├── tsconfig.json
├── tsconfig.server.json
├── vite.config.ts
├── tailwind.config.ts
├── components.json                   # shadcn/ui config
├── Dockerfile                        # Single container: builds frontend + runs Hono on Bun
├── .dockerignore
│
├── src/                              # Frontend (Vite + React)
│   ├── main.tsx
│   ├── App.tsx
│   ├── index.css                     # Tailwind base + shadcn CSS variables
│   │
│   ├── components/
│   │   ├── ui/                       # shadcn/ui primitives (auto-generated)
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── progress.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── drawer.tsx            # Hint drawer
│   │   │   ├── tabs.tsx
│   │   │   ├── table.tsx             # Instructor dashboard tables
│   │   │   ├── tooltip.tsx
│   │   │   ├── separator.tsx
│   │   │   └── skeleton.tsx          # Loading states
│   │   │
│   │   ├── questions/
│   │   │   ├── QuestionRenderer.tsx   # Routes to correct question type
│   │   │   ├── MultipleChoice.tsx     # shadcn Card + RadioGroup
│   │   │   ├── OneLiner.tsx           # shadcn Input with monospace
│   │   │   ├── CodeIDE.tsx            # Monaco editor + shadcn Button for run
│   │   │   └── TracePredict.tsx       # Code display + shadcn Input
│   │   │
│   │   ├── hints/
│   │   │   ├── HintDrawer.tsx         # shadcn Drawer component
│   │   │   └── HintButton.tsx         # shadcn Button variants per hint type
│   │   │
│   │   ├── assessment/
│   │   │   ├── ProgressBar.tsx        # shadcn Progress + phase label
│   │   │   ├── Timer.tsx              # Subtle monospace timer
│   │   │   └── TransitionScreen.tsx   # shadcn Skeleton loading between phases
│   │   │
│   │   └── results/
│   │       ├── RadarChart.tsx         # Recharts radar with shadcn theming
│   │       ├── ProfileCard.tsx        # shadcn Card — full profile display
│   │       ├── DimensionBar.tsx       # Horizontal bar per dimension
│   │       └── ClassOverview.tsx      # shadcn Table + radar thumbnails
│   │
│   ├── pages/
│   │   ├── Landing.tsx                # 5-digit student ID input
│   │   ├── Assessment.tsx             # Main assessment flow
│   │   ├── Results.tsx                # Student's own profile
│   │   └── Instructor.tsx             # Password-protected dashboard
│   │
│   ├── engine/
│   │   ├── adaptiveEngine.ts
│   │   ├── boundUpdater.ts
│   │   ├── questionBank.ts
│   │   └── phaseManager.ts
│   │
│   ├── tracking/
│   │   ├── timeTracker.ts
│   │   ├── replayRecorder.ts
│   │   └── hintTracker.ts
│   │
│   ├── services/
│   │   └── api.ts                     # Frontend API client
│   │
│   ├── lib/
│   │   └── utils.ts                   # shadcn cn() utility
│   │
│   ├── types/
│   │   ├── assessment.ts
│   │   ├── questions.ts
│   │   └── tracking.ts
│   │
│   └── utils/
│       ├── arduinoStubs.ts
│       └── formatting.ts
│
├── server/                            # Backend (Hono on Bun)
│   ├── index.ts                       # Hono app: serves API + static frontend
│   ├── routes/
│   │   ├── assessment.ts
│   │   ├── ai.ts
│   │   ├── code.ts
│   │   └── instructor.ts
│   │
│   ├── middleware/
│   │   ├── instructorAuth.ts          # Checks INSTRUCTOR_PASSWORD
│   │   └── tokenTracker.ts            # Wraps Claude API calls, logs token usage
│   │
│   ├── ai/
│   │   ├── questionGenerator.ts
│   │   ├── answerEvaluator.ts
│   │   ├── profileGenerator.ts
│   │   ├── prompts.ts
│   │   └── claudeClient.ts           # Shared Claude client with token tracking
│   │
│   └── db/
│       ├── schema.sql
│       └── queries.ts
│
└── question-bank/
    ├── calibration/
    │   ├── low_level.json
    │   ├── control_flow.json
    │   ├── hardware_io.json
    │   ├── code_reading.json
    │   └── decomposition.json
    │
    └── binary_search/
        ├── difficulty_1_3.json
        ├── difficulty_4_6.json
        └── difficulty_7_10.json
```

### 11.3 Database Schema

```sql
-- No classes table needed — single deployment per workshop/class.
-- If multi-class is needed later, add a class_code column to assessments.

CREATE TABLE assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id TEXT NOT NULL,           -- 5-digit student ID (e.g. "10423")
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  total_questions INT,
  total_time_seconds INT,

  -- Dimension results (0-10 scale)
  dim_low_level NUMERIC(3,1),
  dim_control_flow NUMERIC(3,1),
  dim_hardware_io NUMERIC(3,1),
  dim_code_reading NUMERIC(3,1),
  dim_decomposition NUMERIC(3,1),

  -- AI-generated profile (stored as JSON)
  profile_json JSONB,

  -- Full answer history for replay/re-analysis
  answers_json JSONB,

  -- Token usage totals (aggregated from token_usage table)
  total_input_tokens INT DEFAULT 0,
  total_output_tokens INT DEFAULT 0
);

-- Token usage tracking per AI call
CREATE TABLE token_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID REFERENCES assessments(id) ON DELETE CASCADE,
  call_type TEXT NOT NULL,            -- 'question_gen' | 'answer_eval' | 'profile_gen' | 'hint_gen'
  model TEXT NOT NULL,                -- e.g. 'claude-sonnet-4-20250514'
  input_tokens INT NOT NULL,
  output_tokens INT NOT NULL,
  latency_ms INT,                     -- Round-trip time in milliseconds
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_assessments_student_id ON assessments(student_id);
CREATE INDEX idx_assessments_completed ON assessments(completed_at DESC);
CREATE INDEX idx_token_usage_assessment ON token_usage(assessment_id);
CREATE INDEX idx_token_usage_created ON token_usage(created_at DESC);

CREATE TABLE question_bank (
  id TEXT PRIMARY KEY,
  dimensions TEXT[] NOT NULL,
  difficulty INT NOT NULL CHECK (difficulty BETWEEN 1 AND 10),
  type TEXT NOT NULL CHECK (type IN ('multiple_choice', 'one_liner', 'code_ide', 'trace_predict')),
  content JSONB NOT NULL,  -- Full question data
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Student ID rules**: Exactly 5 digits. The landing page validates format before allowing assessment start. A student can retake the assessment — each attempt creates a new row. The instructor dashboard shows the most recent attempt per student by default.

**Token tracking**: Every Claude API call logs input/output tokens and latency. The instructor dashboard shows per-assessment and aggregate token costs. This lets you monitor API spend and identify if any assessment is unusually expensive (e.g., a student triggering excessive AI evaluations).

### 11.4 API Endpoints

```
# ── Student Endpoints (no auth) ──────────────────────────────────────
POST   /api/assessment/start          # Body: { studentId: "10423" }
                                      # Creates new assessment, returns assessment UUID
                                      # Validates: studentId is exactly 5 digits
GET    /api/assessment/:id/next       # Returns next question (engine decides source + difficulty)
POST   /api/assessment/:id/answer     # Submit answer + all tracking data (time, hints, replay)
POST   /api/assessment/:id/complete   # Triggers final AI profile generation
GET    /api/assessment/:id/results    # Returns completed profile (student can see their own)

# ── AI Endpoints (internal, called by assessment flow) ───────────────
POST   /api/ai/generate-question      # Generate AI question from student snapshot
POST   /api/ai/evaluate-answer        # Evaluate answer with AI (code + behavioral analysis)
POST   /api/ai/generate-profile       # Generate final learning profile

# ── Code Execution (optional) ────────────────────────────────────────
POST   /api/code/execute              # Execute Arduino code via Judge0 with stubs

# ── Instructor Endpoints (password protected) ────────────────────────
# All require header: X-Instructor-Password: <password>
# Or cookie: instructor_session (set after first successful auth)
POST   /api/instructor/login          # Body: { password: "..." }
                                      # Validates against INSTRUCTOR_PASSWORD env var
                                      # Sets httpOnly cookie for session
GET    /api/instructor/assessments    # List all assessments (paginated, most recent first)
GET    /api/instructor/assessments/:studentId  # All attempts for a specific student
GET    /api/instructor/overview       # Class-wide stats: dimension averages, distributions
GET    /api/instructor/token-usage    # Token usage summary: total, per-assessment avg, cost estimate
GET    /api/instructor/export/csv     # Export all results as CSV
```

---

## 12. Implementation Priority / MVP Roadmap

### Phase 1: Core Assessment Loop (MVP)
1. Landing page: 5-digit student ID input with validation
2. Question renderer for all 4 types (MC, one-liner, trace/predict, code IDE)
3. Static question bank (30-40 hand-written questions, ~6-8 per dimension)
4. Basic adaptive engine (single-dimension binary search)
5. Simple results page with bar chart (not radar yet)
6. Hono backend serving API + built frontend static files
7. Neon Postgres for persistence from day one (it's free tier, no reason to skip)
8. Dockerfile + Cloud Run deployment working

### Phase 2: AI Integration
9. Claude API integration for question generation
10. Claude API integration for answer evaluation
11. Prefetching pipeline (generate next questions while student works)
12. AI-generated final profile with teaching recommendations
13. Radar chart results visualization

### Phase 3: Behavioral Diagnostics
14. Hint system with all 4 hint types
15. Time tracking with derived patterns
16. Keystroke replay recorder + compression
17. Replay narrative fed into AI evaluation
18. Hint behavior analysis in final profile

### Phase 4: Instructor Dashboard
19. Password-protected instructor login (INSTRUCTOR_PASSWORD env var)
20. Class overview: all students' radar charts side by side
21. Per-student drill-down: full answer history, replay narratives
22. Export results as CSV

### Phase 5: Code Execution
23. Judge0 integration for running Arduino code
24. Arduino function stubs (C/C++ header)
25. Test case runner with output comparison
26. Fallback to AI-only evaluation when Judge0 unavailable

---

## 13. Question Bank Seeding

To bootstrap the system, generate an initial question bank of ~40 questions. Here are representative examples for each dimension and difficulty tier:

### Low-Level & Binary (Examples)

**Difficulty 2 (MC)**: "In Arduino, `HIGH` is equivalent to what number?" → 1
**Difficulty 5 (One-liner)**: "What does `Serial.println(13, BIN)` output?" → 1101
**Difficulty 7 (MC)**: "An 8-bit ADC reads 0-255. If a 10-bit ADC reads the same 5V signal that gave 128 on the 8-bit ADC, approximately what value would the 10-bit ADC return?" → 512

### Control Flow (Examples)

**Difficulty 3 (Trace)**: Simple counter code → predict first 5 outputs
**Difficulty 6 (Code IDE)**: "Write code that prints even numbers from 2 to 20 using a for loop"
**Difficulty 8 (Code IDE)**: "Implement a state machine with 4 states that cycles on button press, but state 2 auto-advances to state 3 after 3 seconds"

### Hardware I/O (Examples)

**Difficulty 2 (MC)**: "Which function sets a pin as an output?" → `pinMode(pin, OUTPUT)`
**Difficulty 5 (MC)**: "You wire a button with INPUT_PULLUP. When the button is pressed, what does digitalRead return?" → 0
**Difficulty 8 (MC)**: "A student's button sometimes registers twice per press. What's the most likely cause and solution?" → Debouncing

### Code Reading (Examples)

**Difficulty 3 (Trace)**: Given a blink program with delay(500), "How many times does the LED toggle per second?" → 2
**Difficulty 6 (Trace)**: Given the traffic light code from the workshop, "After pressing the button twice starting from red, what color is lit?" → Green
**Difficulty 8 (MC)**: Code using `int temperature = 36.5;` — "Why does this code always print 'Not Sick'?" → Integer truncation

### Decomposition (Examples)

**Difficulty 3 (MC)**: "You want to build a nightlight that turns on when it's dark. Which sensor would you use with analogRead?" → Light sensor / LDR
**Difficulty 6 (Written)**: "Describe the steps (as a flowchart or list) to build a program that reads a potentiometer and maps its value to LED brightness"
**Difficulty 9 (Code IDE)**: "Design and implement a reaction time game: LED turns on after random delay, player presses button, time is measured and displayed"

---

## 14. Environment & Configuration

### 14.1 Environment Variables

```env
# AI
ANTHROPIC_API_KEY=sk-ant-...
ANTHROPIC_MODEL=claude-sonnet-4-20250514

# Database
DATABASE_URL=postgres://...@neon.tech/arduino_assess

# Instructor Auth
INSTRUCTOR_PASSWORD=your-secure-password-here

# Code Execution (optional, Phase 5)
JUDGE0_API_URL=https://judge0-ce.p.rapidapi.com
JUDGE0_API_KEY=...

# Server
PORT=8080                            # Cloud Run expects 8080
NODE_ENV=production
```

### 14.2 Key Dependencies

```json
{
  "dependencies": {
    "react": "^18",
    "react-dom": "^18",
    "@monaco-editor/react": "^4",
    "recharts": "^2",
    "zustand": "^4",
    "@anthropic-ai/sdk": "^0.30",
    "hono": "^4",
    "@neondatabase/serverless": "^0.9",
    "zod": "^3",
    "class-variance-authority": "^0.7",
    "clsx": "^2",
    "tailwind-merge": "^2",
    "lucide-react": "^0.400",
    "@radix-ui/react-dialog": "^1",
    "@radix-ui/react-slot": "^1",
    "@radix-ui/react-tabs": "^1",
    "@radix-ui/react-tooltip": "^1",
    "@radix-ui/react-progress": "^1",
    "@radix-ui/react-separator": "^1",
    "@radix-ui/react-radio-group": "^1"
  },
  "devDependencies": {
    "vite": "^5",
    "typescript": "^5",
    "tailwindcss": "^3",
    "@types/react": "^18",
    "@types/bun": "latest"
  }
}
```

**Note**: shadcn/ui components are added via `bunx shadcn-ui@latest add <component>` — they get copied into `src/components/ui/` as source files you own. The Radix dependencies above are what shadcn uses under the hood.

---

## 15. Deployment (Google Cloud Run — Singapore)

### 15.1 Architecture: Single Container

The entire app runs as **one container** on Cloud Run. Hono on Bun serves both the API routes and the Vite-built static frontend. One deploy command, one URL, no CORS, no separate hosting.

```
┌─────────────────────────────────────────┐
│  Google Cloud Run (asia-southeast1)     │
│  Singapore region                       │
│                                         │
│  Bun + Hono Server (port 8080)          │
│  ├── /api/*  → API routes               │
│  └── /*      → Static files (Vite build)│
│                                         │
│  Connects to:                           │
│  ├── Neon Postgres (Singapore region)   │
│  ├── Anthropic API (external)           │
│  └── Judge0 API (external, optional)    │
└─────────────────────────────────────────┘
```

### 15.2 Hono Server Entry Point

```typescript
// server/index.ts
import { Hono } from 'hono';
import { serveStatic } from 'hono/bun';
import { assessmentRoutes } from './routes/assessment';
import { aiRoutes } from './routes/ai';
import { instructorRoutes } from './routes/instructor';

const app = new Hono();

// API routes
app.route('/api/assessment', assessmentRoutes);
app.route('/api/ai', aiRoutes);
app.route('/api/instructor', instructorRoutes);

// Serve Vite build output (static files)
app.use('/*', serveStatic({ root: './dist' }));

// SPA fallback: serve index.html for all non-API, non-static routes
app.get('/*', async (c) => {
  const html = await Bun.file('./dist/index.html').text();
  return c.html(html);
});

const port = parseInt(process.env.PORT || '8080');
console.log(`Server running on port ${port}`);

export default {
  port,
  fetch: app.fetch,
};
```

### 15.3 Dockerfile

```dockerfile
# --- Build stage ---
FROM oven/bun:1 AS builder

WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile
COPY . .

# Build frontend (Vite via Bun)
RUN bun run build:frontend
# No separate server build needed — Bun runs TS natively

# --- Production stage ---
FROM oven/bun:1-slim AS runner

WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --production

# Copy built frontend + server source + question bank
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server ./server
COPY --from=builder /app/question-bank ./question-bank

ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080

CMD ["bun", "run", "server/index.ts"]
```

**Why Bun simplifies this**: No TypeScript compilation step for the server. Bun runs `.ts` files natively, so the production image just copies the server source directly. The only build step is Vite for the frontend.

### 15.4 Build Scripts (package.json)

```json
{
  "scripts": {
    "dev:frontend": "vite",
    "dev:server": "bun --watch server/index.ts",
    "dev": "bun run dev:frontend & bun run dev:server",
    "build:frontend": "vite build",
    "build": "bun run build:frontend",
    "start": "bun server/index.ts",
    "deploy": "gcloud run deploy arduino-assess --source . --region asia-southeast1 --allow-unauthenticated",
    "ui:add": "bunx shadcn-ui@latest add"
  }
}
```

### 15.5 Deploy Commands

```bash
# First time setup
gcloud auth login
gcloud config set project YOUR_PROJECT_ID

# Deploy with environment variables
gcloud run deploy arduino-assess \
  --source . \
  --region asia-southeast1 \
  --allow-unauthenticated \
  --set-env-vars "DATABASE_URL=postgres://...,ANTHROPIC_API_KEY=sk-ant-...,INSTRUCTOR_PASSWORD=your-password,ANTHROPIC_MODEL=claude-sonnet-4-20250514"

# Subsequent deploys (env vars persist)
gcloud run deploy arduino-assess --source . --region asia-southeast1 --allow-unauthenticated
```

`--source .` tells Cloud Run to build the Dockerfile in-cloud using Cloud Build — no need to push to a container registry manually. One command deploys everything.

### 15.6 Local Development

```bash
# Start both frontend dev server and backend in parallel
bun run dev:frontend &
bun run dev:server

# Frontend: http://localhost:5173 (Vite dev server, proxies /api to backend)
# Backend:  http://localhost:8080
```

Vite config proxies API calls to the backend in dev:

```typescript
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:8080'
    }
  }
});
```

### 15.7 Why This Architecture

- **One deploy command**: `gcloud run deploy` builds and deploys everything
- **Bun all the way**: Same runtime dev and prod, no Node/npm needed, TS runs natively — no server compile step
- **No CORS**: Frontend and API are same origin
- **Free tier friendly**: Cloud Run free tier gives 2M requests/month, Neon free tier gives 0.5GB storage
- **Auto-scaling**: Cloud Run scales to zero when no one's taking the assessment, scales up during class time
- **Region**: `asia-southeast1` (Singapore) — lowest latency to Malaysian students
- **Neon region**: Create the Neon database in `aws-ap-southeast-1` (Singapore) to co-locate with Cloud Run
- **No infra management**: No VMs, no Kubernetes, no nginx configs

---

## 16. Token Usage Tracking

### 16.1 Architecture

Every Claude API call goes through a shared `claudeClient.ts` wrapper that automatically logs token usage before returning the response.

```typescript
// server/ai/claudeClient.ts
import Anthropic from '@anthropic-ai/sdk';
import { db } from '../db/queries';

const client = new Anthropic();

type CallType = 'question_gen' | 'answer_eval' | 'profile_gen' | 'hint_gen';

export async function callClaude(opts: {
  assessmentId: string;
  callType: CallType;
  system: string;
  messages: Anthropic.MessageParam[];
  maxTokens?: number;
}) {
  const start = Date.now();
  const model = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-20250514';

  const response = await client.messages.create({
    model,
    max_tokens: opts.maxTokens ?? 2048,
    system: opts.system,
    messages: opts.messages,
  });

  const latencyMs = Date.now() - start;

  // Log token usage (fire-and-forget, don't block the response)
  db.logTokenUsage({
    assessmentId: opts.assessmentId,
    callType: opts.callType,
    model,
    inputTokens: response.usage.input_tokens,
    outputTokens: response.usage.output_tokens,
    latencyMs,
  }).catch(console.error);

  return response;
}
```

### 16.2 What Gets Tracked

| Field | Description |
|-------|-------------|
| `assessment_id` | Which student assessment this call belongs to |
| `call_type` | `question_gen`, `answer_eval`, `profile_gen`, or `hint_gen` |
| `model` | Exact model string used |
| `input_tokens` | Tokens sent to Claude |
| `output_tokens` | Tokens received from Claude |
| `latency_ms` | Round-trip time |
| `created_at` | Timestamp |

### 16.3 Instructor Dashboard Token View

The instructor dashboard shows:

- **Total tokens used** across all assessments (input + output breakdown)
- **Estimated cost** (calculated from current Sonnet pricing)
- **Per-assessment average** — how many tokens a typical assessment consumes
- **Cost per student** — helps budget for class sizes
- **Breakdown by call type** — see if question generation, answer evaluation, or profile generation dominates spend
- **Outlier detection** — flag assessments that used >2x average tokens (student may have triggered excessive AI calls)

### 16.4 Cost Estimation Formula

```typescript
// Sonnet pricing (update if model changes)
const PRICING = {
  'claude-sonnet-4-20250514': { input: 3.0 / 1_000_000, output: 15.0 / 1_000_000 },
};

function estimateCost(inputTokens: number, outputTokens: number, model: string): number {
  const rates = PRICING[model] ?? PRICING['claude-sonnet-4-20250514'];
  return inputTokens * rates.input + outputTokens * rates.output;
}
```

Expected cost per assessment: **$0.05–0.15** depending on how many AI-generated questions are triggered.

---

## 17. Design Language

### 17.1 Philosophy: Industrial Rigidity

The UI should feel like a **precision instrument** — clean, structured, no decorative flourishes. Think oscilloscope UI, terminal aesthetics, engineering dashboards. Every element earns its place.

### 17.2 Visual Principles

- **Monochromatic foundation**: Zinc/slate grays as the base palette. No colorful gradients, no playful illustrations.
- **Accent colors are functional, not decorative**: Green = correct/strength, amber = partial/growth area, red = wrong/critical, blue = interactive/primary action. That's it.
- **Typography**: Monospace (`JetBrains Mono` or `Fira Code`) for all code, numbers, and data. Clean sans-serif (`Inter`) for prose. **No rounded, playful fonts.**
- **Dense information display**: Prefer data tables and tight layouts over spacious, airy designs. Every pixel should convey information.
- **Hard edges**: No large border-radius. Use `rounded-sm` (2px) or `rounded` (4px) max. Cards and containers should feel like panels on a control board.
- **Subtle borders, not shadows**: Prefer `border border-zinc-800` over `shadow-lg`. Depth comes from border hierarchy, not drop shadows.
- **Dark mode first**: The primary theme is dark (zinc-950 background). Light mode is secondary.

### 17.3 shadcn/ui Configuration

```typescript
// components.json
{
  "style": "default",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "src/index.css",
    "baseColor": "zinc",        // Industrial gray palette
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils"
  }
}
```

### 17.4 Color Tokens (CSS Variables)

```css
/* Dark theme (default) */
:root {
  --background: 240 10% 3.9%;       /* Near-black */
  --foreground: 0 0% 98%;           /* Near-white */
  --card: 240 10% 5.9%;             /* Slightly lighter panel */
  --card-foreground: 0 0% 98%;
  --primary: 0 0% 98%;              /* White primary actions */
  --primary-foreground: 240 5.9% 10%;
  --muted: 240 3.7% 15.9%;
  --muted-foreground: 240 5% 64.9%;
  --accent: 240 3.7% 15.9%;
  --border: 240 3.7% 15.9%;

  /* Functional colors */
  --success: 142 76% 36%;           /* Green — correct/strength */
  --warning: 38 92% 50%;            /* Amber — partial/growth */
  --destructive: 0 84% 60%;         /* Red — wrong/critical */
  --info: 217 91% 60%;              /* Blue — interactive */
}
```

### 17.5 Component Styling Guidelines

**Landing page**: Centered card, monospace heading "ARDUINO ASSESS", 5-digit input with fixed-width character slots (like a PIN entry), single "BEGIN" button. Minimal. No illustrations.

**Assessment page**: Two-column on desktop (question left, answer/editor right). Top bar shows: phase indicator (thin progress segments), question count ("Q7/~15"), subtle elapsed timer in monospace. No decorative elements.

**Question cards**: `bg-card border border-border rounded-sm p-6`. Code snippets in dark code blocks with syntax highlighting. Multiple choice options as `border border-border hover:border-primary` cards — no colorful backgrounds until selected.

**Code IDE**: Monaco editor fills the right panel. Dark theme (`vs-dark`). Output panel below with monospace text on dark background. Run button is a small, sharp `variant="outline"` button.

**Hint drawer**: shadcn `Drawer` sliding from right. Each hint type is a flat button with an icon (lucide). When opened, hint text appears in a bordered panel. No animations beyond the drawer slide.

**Results page**: Radar chart centered, rendered in the accent colors against a dark background. Dimension bars below it — horizontal bars with sharp edges, labeled with monospace numbers. Strengths and growth areas in bordered card sections.

**Instructor dashboard**: Dense data table (shadcn `Table`) as the primary view. Sortable columns. Each row expandable to show radar chart thumbnail. Token usage shown as a stats bar at the top: `Total: 847,231 in / 203,847 out — Est. $5.59`.

### 17.6 What to Avoid

- No rounded-full buttons or pill shapes
- No colorful gradients or glassmorphism
- No emoji in the UI (use lucide icons only)
- No "fun" loading animations — use shadcn `Skeleton` rectangles
- No large padding or excessive whitespace
- No stock images or illustrations
- No celebratory confetti or success animations — just a clean state transition to results

---

## 18. Design Notes for Claude Code

### Important Implementation Notes

1. **Single-container architecture is non-negotiable.** Hono on Bun serves both `/api/*` routes and the Vite-built static files from `./dist`. No separate frontend hosting. The Dockerfile uses `oven/bun:1` base image. Bun runs TS natively — no server compile step needed.

2. **shadcn/ui is the component foundation.** Initialize with `bunx shadcn-ui@latest init`, then add components as needed (`bunx shadcn-ui@latest add button card input ...`). Use the zinc base color. All custom components should compose shadcn primitives. Follow the design language in Section 17 strictly — industrial, dark, sharp edges.

3. **Start with the adaptive engine logic** (`engine/` directory) — this is the brain. Get it working with mock questions before building UI.

4. **The AI integration is the most critical differentiator.** The prompts in `server/ai/prompts.ts` should be carefully crafted. Include the full workshop content inventory (Section 2) in the system prompt so the AI never generates questions about uncovered topics.

5. **All Claude API calls go through `claudeClient.ts`** for automatic token tracking. Never call the Anthropic SDK directly from route handlers.

6. **Student ID flow**: Landing page has a single input field for the 5-digit student ID. Validate format client-side (exactly 5 digits). On submit, `POST /api/assessment/start` creates the assessment row and returns the UUID. All subsequent API calls use this UUID. Students can bookmark their results page at `/results/:assessmentId`.

7. **Instructor auth is dead simple**: The `POST /api/instructor/login` endpoint checks the password against `process.env.INSTRUCTOR_PASSWORD`. On success, set an httpOnly cookie. All `/api/instructor/*` routes check for this cookie. The frontend instructor page at `/instructor` shows a password prompt if not authenticated. No user accounts, no OAuth, no JWT — just one password from an env var.

8. **Monaco editor setup**: Use `@monaco-editor/react` with language set to `cpp` (closest to Arduino). Use `vs-dark` theme to match the industrial dark aesthetic.

9. **Hint system UI**: Use shadcn `Drawer` component (not a modal) so students can reference hints while typing code. Track the exact moment hints are opened/closed.

10. **Replay recorder**: Attach to Monaco's `onDidChangeModelContent` event. Store events in a `useRef` array (not state — avoid re-renders). Only compress on question submission.

11. **Prefetching**: Use `Promise.all` to generate 3 next-question candidates while the student works. Store in a ref. On submission, pick the matching variant and discard the others.

12. **The question bank JSON files should be human-editable.** Keep them as separate JSON files in `question-bank/`, loaded by the server at startup. Not in the database initially — this makes iteration faster.

13. **For MVP, skip Judge0 entirely.** Use AI-only code evaluation — it's sufficient for assessment purposes and removes a dependency. Add Judge0 in Phase 5.

14. **Mobile responsive**: Students may take this on phones/tablets. The code IDE should be optional on mobile — offer a simplified `textarea` instead of Monaco.

15. **Deploy to `asia-southeast1`** (Singapore). Cloud Run's `--source .` flag handles Docker builds in the cloud — no local Docker needed. Create the Neon database in the Singapore region too.
