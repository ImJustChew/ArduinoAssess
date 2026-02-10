// Instructor Dashboard
// Password-protected panel for viewing detailed assessment results

import { useState, useEffect } from "react";
import type { AssessmentResult } from "@/types";

interface InstructorDashboardProps {
  onLogout: () => void;
}

export function InstructorDashboard({ onLogout }: InstructorDashboardProps) {
  const [assessments, setAssessments] = useState<AssessmentResult[]>([]);
  const [selectedAssessment, setSelectedAssessment] = useState<AssessmentResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssessments();
  }, []);

  const fetchAssessments = async () => {
    try {
      const token = localStorage.getItem("instructor_token");
      const response = await fetch("/api/instructor/assessments", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch assessments");
      const data = await response.json();
      setAssessments(data.assessments);
    } catch (error) {
      console.error("Error fetching assessments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClearAll = async () => {
    if (!confirm("⚠️ This will delete ALL assessment data. Are you sure?")) {
      return;
    }

    try {
      const token = localStorage.getItem("instructor_token");
      const response = await fetch("/api/instructor/clear-all", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error("Failed to clear data");
      setAssessments([]);
      setSelectedAssessment(null);
      alert("✅ All assessment data cleared successfully");
    } catch (error) {
      console.error("Error clearing data:", error);
      alert("❌ Failed to clear data");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-xl terminal-font">Loading assessments...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-8 border-b-2 border-border pb-4 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold terminal-font">Instructor Dashboard</h1>
            <p className="text-muted-foreground mt-1">View and manage assessment results</p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={handleClearAll}
              className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 transition-colors"
            >
              Clear All Data
            </button>
            <button
              onClick={onLogout}
              className="px-4 py-2 border-2 border-border hover:bg-muted transition-colors"
            >
              Logout
            </button>
          </div>
        </header>

        {assessments.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl text-muted-foreground">
              No assessments completed yet.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Results will appear here after students complete the assessment.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-6">
            {/* Assessment List */}
            <div className="col-span-1 space-y-3">
              <h2 className="text-xl font-semibold mb-4">
                Completed Assessments ({assessments.length})
              </h2>
              {assessments.map((assessment) => (
                <button
                  key={assessment.sessionId}
                  onClick={() => setSelectedAssessment(assessment)}
                  className={`w-full text-left p-4 border-2 transition-colors ${
                    selectedAssessment?.sessionId === assessment.sessionId
                      ? "border-foreground bg-muted"
                      : "border-border hover:bg-muted"
                  }`}
                >
                  <div className="font-semibold">
                    {assessment.studentName || "Anonymous"}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(assessment.completedAt).toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {assessment.allResponses.length} questions •{" "}
                    {Math.round(assessment.totalTimeMs / 1000 / 60)} min
                  </div>
                </button>
              ))}
            </div>

            {/* Detailed Report */}
            <div className="col-span-2">
              {selectedAssessment ? (
                <InstructorReport assessment={selectedAssessment} />
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  Select an assessment to view details
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Detailed Instructor Report Component
function InstructorReport({ assessment }: { assessment: AssessmentResult }) {
  const overallAccuracy =
    assessment.allResponses.filter((r) => r.correct).length /
    assessment.allResponses.length;

  return (
    <div className="space-y-6">
      <div className="question-card">
        <h2 className="text-2xl font-bold mb-2">
          {assessment.studentName || "Anonymous Student"}
        </h2>
        <p className="text-sm text-muted-foreground">
          Session ID: {assessment.sessionId}
        </p>
        <p className="text-sm text-muted-foreground">
          Completed: {new Date(assessment.completedAt).toLocaleString()}
        </p>
      </div>

      {/* Performance Overview */}
      <div className="question-card">
        <h3 className="text-xl font-semibold mb-4">📊 Performance Overview</h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <div className="text-sm text-muted-foreground">Overall Accuracy</div>
            <div className="text-2xl font-bold">
              {Math.round(overallAccuracy * 100)}%
            </div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Questions Answered</div>
            <div className="text-2xl font-bold">{assessment.allResponses.length}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Time Spent</div>
            <div className="text-2xl font-bold">
              {Math.round(assessment.totalTimeMs / 1000 / 60)} min
            </div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Hints Used</div>
            <div className="text-2xl font-bold">{assessment.hintHistory.length}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Help-Seeking Style</div>
            <div className="text-lg font-semibold capitalize">
              {assessment.helpSeekingStyle}
            </div>
          </div>
        </div>
      </div>

      {/* Dimension Breakdown */}
      <div className="question-card">
        <h3 className="text-xl font-semibold mb-4">📈 Dimension Analysis</h3>
        <div className="space-y-3">
          {Object.entries(assessment.dimensionScores).map(([dimension, score]) => (
            <div key={dimension} className="border border-border p-3">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium capitalize">
                  {dimension.replace(/([A-Z])/g, " $1").trim()}
                </span>
                <span className="terminal-font font-bold">
                  Level {score.estimatedLevel}/5
                </span>
              </div>
              <div className="flex gap-1 mb-2">
                {[1, 2, 3, 4, 5].map((level) => (
                  <div
                    key={level}
                    className={`h-2 flex-1 ${
                      level <= score.estimatedLevel ? "bg-foreground" : "bg-muted"
                    }`}
                  />
                ))}
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                <div>Accuracy: {Math.round(score.accuracy * 100)}%</div>
                <div>Confidence: {Math.round(score.confidence * 100)}%</div>
                <div>Questions: {score.questionsAnswered}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Question-by-Question Breakdown */}
      <div className="question-card">
        <h3 className="text-xl font-semibold mb-4">📝 Question-by-Question Analysis</h3>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {assessment.allResponses.map((response, idx) => (
            <div
              key={idx}
              className={`border-l-4 p-4 ${
                response.correct
                  ? "border-green-500 bg-green-50 dark:bg-green-950"
                  : response.partial
                  ? "border-yellow-500 bg-yellow-50 dark:bg-yellow-950"
                  : "border-red-500 bg-red-50 dark:bg-red-950"
              }`}
            >
              {/* Header: Question number, dimension, time */}
              <div className="flex justify-between items-start mb-2">
                <span className="font-semibold text-sm">
                  Q{idx + 1}: {response.dimension} (Difficulty {response.difficulty})
                </span>
                <span className="text-xs text-muted-foreground">
                  {Math.round(response.timeSpentMs / 1000)}s
                </span>
              </div>

              {/* Question Text */}
              <div className="mb-2 p-2 bg-background border border-border">
                <div className="text-xs font-semibold text-muted-foreground mb-1">QUESTION:</div>
                <div className="text-sm whitespace-pre-wrap">
                  {response.questionData?.prompt || "Question text not available"}
                </div>
              </div>

              {/* Student Answer */}
              <div className="mb-2 p-2 bg-background border border-border">
                <div className="text-xs font-semibold text-muted-foreground mb-1">STUDENT ANSWER:</div>
                <div className="text-sm">
                  {response.questionData?.type === "multipleChoice"
                    ? `Choice ${response.answer}: ${response.questionData?.choices?.[Number(response.answer)] || "Unknown"}`
                    : typeof response.answer === "string"
                      ? response.answer
                      : `Choice ${response.answer}`}
                </div>
              </div>

              {/* Result */}
              <div className="text-xs">
                <span
                  className={`font-bold ${
                    response.correct
                      ? "text-green-700 dark:text-green-300"
                      : response.partial
                      ? "text-yellow-700 dark:text-yellow-300"
                      : "text-red-700 dark:text-red-300"
                  }`}
                >
                  {response.correct ? "✓ Correct" : response.partial ? "~ Partial" : "✗ Incorrect"}
                </span>
                {response.hintsUsed > 0 && (
                  <span className="ml-2 text-muted-foreground">
                    ({response.hintsUsed} hint{response.hintsUsed > 1 ? "s" : ""})
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Behavioral Insights */}
      <div className="question-card">
        <h3 className="text-xl font-semibold mb-4">🧠 Behavioral Insights</h3>
        <div className="space-y-3">
          <div>
            <h4 className="font-semibold text-sm mb-1">Learning Style</h4>
            <p className="text-sm">{assessment.learningStyleObservations}</p>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-1">Problem-Solving Approach</h4>
            <p className="text-sm">{assessment.problemSolvingApproach}</p>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-1">Code Quality Assessment</h4>
            <p className="text-sm">{assessment.codeQuality}</p>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="question-card bg-blue-50 dark:bg-blue-950">
        <h3 className="text-xl font-semibold mb-3">💡 Instructor Recommendations</h3>
        <p className="text-sm mb-3 font-semibold">{assessment.overallStrength}</p>
        <div>
          <h4 className="font-semibold text-sm mb-2">Areas for Focused Instruction:</h4>
          <ul className="list-disc list-inside space-y-1 text-sm">
            {assessment.areasForImprovement.map((area, idx) => (
              <li key={idx}>{area}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
