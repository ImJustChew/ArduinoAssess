// Results View Component
// Displays final assessment results and student profile

import type { AssessmentResult } from "@/types";

interface ResultsViewProps {
  result: AssessmentResult;
  onRestart: () => void;
}

export function ResultsView({ result, onRestart }: ResultsViewProps) {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-3xl mx-auto">
        <header className="mb-8 text-center border-b-2 border-border pb-6">
          <h1 className="text-4xl font-bold terminal-font mb-3">
            🎉 ASSESSMENT COMPLETE!
          </h1>
          {result.studentName && (
            <p className="text-lg text-muted-foreground">
              Great work, {result.studentName}!
            </p>
          )}
        </header>

        <div className="space-y-6">
          {/* Personalized Encouragement Message */}
          <section className="question-card bg-green-50 dark:bg-green-950 border-2 border-green-500">
            <div className="text-lg leading-relaxed text-foreground">
              <p className="mb-4">
                Thank you for completing the evaluation! You worked through {result.allResponses.length} questions
                and spent about {Math.round(result.totalTimeMs / 1000 / 60)} minutes demonstrating your Arduino programming knowledge.
              </p>

              <p className="mb-4">
                Your responses have been recorded.
              </p>

              <p className="mb-4 font-semibold">
                {result.helpSeekingStyle === 'self-reliant'
                  ? "We noticed you worked independently through the assessment without requesting hints - great confidence!"
                  : result.helpSeekingStyle === 'hint-dependent'
                  ? "We noticed you used hints to work through challenging questions - that's a smart learning strategy!"
                  : "We noticed you used hints thoughtfully when needed - excellent balance of independence and resourcefulness!"}
              </p>

              <p className="text-foreground">
                Keep practicing, stay curious, and remember: every expert was once a beginner. Keep up the great work! 💪
              </p>
            </div>
          </section>

          {/* Encouragement Section */}
          <section className="question-card bg-blue-50 dark:bg-blue-950">
            <h2 className="text-xl font-semibold mb-3">💡 Remember</h2>
            <div className="text-foreground space-y-2">
              <p>• This assessment helps identify where you are now - not where you'll always be</p>
              <p>• Growth comes from practice, mistakes, and persistence</p>
              <p>• Every programmer was once exactly where you are today</p>
              <p>• Your instructor is here to support your learning journey</p>
            </div>
          </section>

          {/* Action Button */}
          <div className="flex justify-center pt-4">
            <button
              onClick={onRestart}
              className="px-6 py-3 bg-foreground text-background font-medium border-2 border-foreground hover:bg-background hover:text-foreground transition-colors"
            >
              CLOSE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
