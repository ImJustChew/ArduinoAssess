// WelcomeScreen component - Entry point for assessment
import { useState } from "react";

interface WelcomeScreenProps {
  onStart: (studentName?: string) => Promise<void>;
}

export function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  const [studentName, setStudentName] = useState("");
  const [isStarting, setIsStarting] = useState(false);

  const handleStart = async () => {
    setIsStarting(true);
    try {
      await onStart(studentName.trim() || undefined);
    } catch (error) {
      console.error("Error starting assessment:", error);
    } finally {
      setIsStarting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 grid-bg">
      <div className="w-full max-w-2xl">
        <div className="question-card space-y-8">
          {/* Header */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 border-2 border-foreground bg-primary flex items-center justify-center">
                <span className="text-2xl text-primary-foreground font-bold terminal-font">
                  A
                </span>
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight terminal-font">
                  Assessment
                </h1>
                <p className="text-muted-foreground text-sm terminal-font">
                  Adaptive Coding Ability Assessment
                </p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-4 border-l-2 border-border pl-4">
            <h2 className="text-xl font-semibold">About This Assessment</h2>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>
                This assessment evaluates your Arduino programming skills
                through a series of questions.
              </p>
              <p>
                Answer each question to the best of your ability. Take your time
                and think through each problem carefully.
              </p>
            </div>
          </div>

          {/* Instructions */}
          <div className="space-y-3 bg-muted p-4 border border-border">
            <h3 className="text-sm font-semibold terminal-font">
              INSTRUCTIONS
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <span className="text-foreground font-mono">•</span>
                <span>Answer questions honestly to get accurate results</span>
              </li>
              <li className="flex gap-2">
                <span className="text-foreground font-mono">•</span>
                <span>You can request hints if you get stuck</span>
              </li>
              <li className="flex gap-2">
                <span className="text-foreground font-mono">•</span>
                <span>There is no time limit - work at your own pace</span>
              </li>
            </ul>
          </div>

          {/* Input and start */}
          <div className="space-y-4 pt-4 border-t-2 border-border">
            <div className="space-y-2">
              <label
                htmlFor="student-name"
                className="block text-sm font-medium terminal-font"
              >
                YOUR NAME (OPTIONAL)
              </label>
              <input
                id="student-name"
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="Enter your name"
                className="w-full px-4 py-3 border-2 border-border bg-background terminal-font focus:outline-none focus:ring-2 focus:ring-ring sharp-corners"
                disabled={isStarting}
              />
            </div>

            <button
              onClick={handleStart}
              disabled={isStarting}
              className="w-full py-4 bg-primary text-primary-foreground font-semibold terminal-font border-2 border-foreground hover:bg-secondary hover:text-secondary-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed sharp-corners uppercase tracking-wider"
            >
              {isStarting ? "Starting Assessment..." : "Begin Assessment →"}
            </button>
          </div>

          {/* Footer info */}
          <div className="text-xs text-muted-foreground text-center pt-4 border-t border-border">
            <p>Expected time: 15-25 minutes</p>
          </div>
        </div>
      </div>
    </div>
  );
}
