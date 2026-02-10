// AssessmentView.tsx
// Main component for conducting the adaptive assessment

import { useState, useEffect, useRef } from "react";
import Editor from "@monaco-editor/react";
import type { StudentProfile, Question, AssessmentResult } from "@/types";

// Syntax highlighting for code blocks
const formatPrompt = (text: string) => {
  // Replace triple backtick code blocks with highlighted pre tags
  let formatted = text.replace(/```(\w+)?\n([\s\S]*?)```/g, (_, lang, code) => {
    return `<pre class="code-block overflow-x-auto"><code class="text-sm">${escapeHtml(code.trim())}</code></pre>`;
  });

  // Replace inline code with monospace styling
  formatted = formatted.replace(
    /`([^`]+)`/g,
    '<code class="px-1.5 py-0.5 bg-muted border border-border font-mono text-sm">$1</code>',
  );

  return formatted;
};

const escapeHtml = (text: string) => {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

interface AssessmentViewProps {
  sessionId: string;
  initialProfile: StudentProfile;
  initialQuestion: Question;
  onComplete: (result: AssessmentResult) => void;
}

export function AssessmentView({
  sessionId,
  initialProfile,
  initialQuestion,
  onComplete,
}: AssessmentViewProps) {
  const [profile, setProfile] = useState<StudentProfile>(initialProfile);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(
    initialQuestion,
  );
  const [answer, setAnswer] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const questionStartTime = useRef<number>(Date.now());
  const [hintsRequested, setHintsRequested] = useState<number>(0);
  const [responses, setResponses] = useState<any[]>([]);
  const [currentHint, setCurrentHint] = useState<string | null>(null);

  // Add keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Shift+Enter to submit (but NOT for codeIDE questions)
      if (e.shiftKey && e.key === 'Enter' && answer && !isSubmitting && currentQuestion?.type !== 'codeIDE') {
        e.preventDefault();
        handleSubmitAnswer();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [answer, isSubmitting, currentQuestion]); // Re-bind when answer, isSubmitting, or currentQuestion changes

  const handleSubmitAnswer = async () => {
    if (!currentQuestion) return;

    setIsSubmitting(true);

    const timeSpentMs = Date.now() - questionStartTime.current;

    try {
      const response = await fetch("/api/assessment/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId,
          questionId: currentQuestion.id,
          answer,
          timeSpentMs,
          hintsUsed: hintsRequested,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit answer");
      }

      const data = await response.json();

      // Add to responses
      setResponses([
        ...responses,
        { correct: data.correct, partial: data.partial },
      ]);

      if (data.assessmentComplete) {
        onComplete(data.finalResult);
      } else {
        setCurrentQuestion(data.nextQuestion);
        setAnswer("");
        questionStartTime.current = Date.now();
        setHintsRequested(0);
      }
    } catch (error) {
      console.error("Error submitting answer:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8 border-b-2 border-border pb-4">
        <h1 className="text-2xl font-bold terminal-font">Assessment</h1>
        <p className="text-muted-foreground mt-1">
          Adaptive Arduino Programming Assessment
        </p>
      </div>

      {/* Progress */}
      <div className="mb-6 question-card">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium terminal-font">
            QUESTIONS ANSWERED: {responses.length}
          </span>
          <span className="text-xs text-muted-foreground">
            ~{Math.max(0, 15 - responses.length)} remaining
          </span>
        </div>

        <div className="h-2 bg-muted border border-border">
          <div
            className="h-full bg-foreground transition-all duration-300"
            style={{
              width: `${Math.min((responses.length / 15) * 100, 100)}%`,
            }}
          />
        </div>
      </div>

      {/* Current Question */}
      {currentQuestion ? (
        <div className="question-card mb-6">
          <div className="mb-6">
            <div
              className="text-lg whitespace-pre-wrap"
              dangerouslySetInnerHTML={{
                __html: formatPrompt(currentQuestion.prompt),
              }}
            />
            {currentQuestion.codeToTrace && (
              <div className="mt-4 code-block">
                <pre className="text-sm overflow-x-auto">
                  {currentQuestion.codeToTrace}
                </pre>
              </div>
            )}
          </div>

          {/* Answer Input */}
          {currentQuestion.type === "multipleChoice" &&
          currentQuestion.choices ? (
            <div className="space-y-2">
              {currentQuestion.choices.map((choice, index) => (
                <label
                  key={index}
                  className="flex items-start gap-3 p-3 border border-border hover:bg-muted cursor-pointer transition-colors"
                >
                  <input
                    type="radio"
                    name="answer"
                    value={index}
                    checked={answer === String(index)}
                    onChange={(e) => setAnswer(e.target.value)}
                    className="w-4 h-4 mt-0.5"
                  />
                  <span className="whitespace-pre-wrap font-mono text-sm">
                    {choice}
                  </span>
                </label>
              ))}
            </div>
          ) : currentQuestion.type === "codeIDE" ? (
            <div>
              <div className="border-2 border-border">
                <Editor
                  height="400px"
                  defaultLanguage="cpp"
                  value={
                    answer ||
                    currentQuestion.starterCode ||
                    "void setup() {\n  \n}\n\nvoid loop() {\n  \n}"
                  }
                  onChange={(value) => setAnswer(value || "")}
                  theme="vs-dark"
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    lineNumbers: "on",
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    tabSize: 2,
                  }}
                />
              </div>
              <button
                data-testid="code-editor-submit"
                className="mt-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                onClick={handleSubmitAnswer}
                disabled={!answer || isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Submit Code"}
              </button>
            </div>
          ) : currentQuestion.type === "trace" ? (
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Enter your answer..."
              rows={4}
              className="w-full px-4 py-2 border-2 border-border bg-background terminal-font focus:outline-none focus:ring-2 focus:ring-ring resize-y"
            />
          ) : currentQuestion.type === "chatbotStudent" ? (
            <div className="space-y-4">
              {/* Scenario description */}
              <div className="p-4 bg-yellow-50 dark:bg-yellow-950 border-2 border-yellow-500">
                <div className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
                  📚 Teaching Scenario
                </div>
                <div className="text-sm text-yellow-800 dark:text-yellow-200">
                  A student needs your help understanding what's wrong with their code.
                  Provide clear, complete guidance in your response below. You'll only have one chance to help them!
                </div>
              </div>

              {/* Student in distress */}
              <div className="p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded">
                <div className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  🤖 The Student Says:
                </div>
                <div className="text-sm text-blue-800 dark:text-blue-200 italic">
                  "{currentQuestion.chatbotPersona}"
                </div>
              </div>

              {currentQuestion.chatbotProblem && (
                <div className="p-3 bg-muted border border-border">
                  <div className="text-xs font-semibold mb-2">Their Code:</div>
                  <pre className="text-sm overflow-x-auto font-mono">{currentQuestion.chatbotProblem}</pre>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold mb-2">
                  Your Guidance (Be specific and complete):
                </label>
                <textarea
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Explain what's wrong, why it's wrong, and how to fix it. Be clear and thorough - this is your only chance to help them!"
                  rows={8}
                  className="w-full px-4 py-2 border-2 border-border bg-background terminal-font focus:outline-none focus:ring-2 focus:ring-ring resize-y text-sm"
                />
                <div className="text-xs text-muted-foreground mt-2">
                  💡 Good guidance includes: (1) What the error is, (2) Why it causes the problem, (3) How to fix it
                </div>
              </div>
            </div>
          ) : (
            <input
              type="text"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Enter your answer..."
              className="w-full px-4 py-2 border-2 border-border bg-background terminal-font focus:outline-none focus:ring-2 focus:ring-ring"
            />
          )}

          <div className="mt-6">
            {/* Hint buttons */}
            <div className="mb-4 flex flex-wrap gap-2">
              <span className="text-sm text-muted-foreground self-center">Need help?</span>
              {[
                { type: "conceptual", label: "💡 Concept", desc: "Remind me of the concept" },
                { type: "syntactical", label: "🔧 Syntax", desc: "Show me the syntax" },
                { type: "structural", label: "🗺️ Approach", desc: "Help me plan my approach" },
                { type: "example", label: "📖 Example", desc: "Show a similar example" },
                ...(currentQuestion.type === "multipleChoice"
                  ? [{ type: "elimination", label: "❌ Eliminate", desc: "Which answers are wrong?" }]
                  : []
                ),
              ].map((hint) => (
                <button
                  key={hint.type}
                  className="px-3 py-1.5 text-sm border border-border hover:bg-muted transition-colors disabled:opacity-50"
                  disabled={isSubmitting}
                  title={hint.desc}
                  onClick={async () => {
                    setHintsRequested(hintsRequested + 1);
                    const timeIntoQuestionMs = Date.now() - questionStartTime.current;
                    try {
                      const response = await fetch("/api/assessment/hint", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          sessionId,
                          questionId: currentQuestion.id,
                          currentCode: answer || undefined,
                          hintType: hint.type,
                          timeIntoQuestionMs,
                        }),
                      });
                      if (response.ok) {
                        const data = await response.json();
                        setCurrentHint(data.hintText);
                      }
                    } catch (err) {
                      console.error("Failed to get hint:", err);
                    }
                  }}
                >
                  {hint.label}
                </button>
              ))}
              {hintsRequested > 0 && (
                <span className="text-xs text-muted-foreground self-center ml-2">
                  ({hintsRequested} used)
                </span>
              )}
            </div>

            {/* Submit button */}
            <div className="flex justify-end items-center gap-2">
              <button
                className="px-6 py-2 bg-foreground text-background hover:bg-foreground/90 transition-colors disabled:opacity-50"
                onClick={handleSubmitAnswer}
                disabled={!answer || isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Submit Answer"}
              </button>
              {currentQuestion?.type !== 'codeIDE' && (
                <span className="text-xs text-muted-foreground">(Shift+Enter)</span>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {/* Hint Modal */}
      {currentHint && (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center pt-20 z-50">
          <div className="bg-card border-2 border-foreground shadow-lg max-w-md w-full mx-4 terminal-font">
            <div className="flex items-center justify-between p-4 border-b-2 border-border">
              <div className="text-sm font-bold">💡 HINT</div>
              <button
                onClick={() => setCurrentHint(null)}
                className="text-lg hover:bg-muted px-2 py-1 border border-border"
              >
                ✕
              </button>
            </div>
            <div className="p-4 text-sm">{currentHint}</div>
          </div>
        </div>
      )}
    </div>
  );
}
