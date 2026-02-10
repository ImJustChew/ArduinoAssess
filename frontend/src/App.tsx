import { useState, useEffect } from "react";
import { AssessmentView } from "@/components/AssessmentView";
import { ResultsView } from "@/components/ResultsView";
import { WelcomeScreen } from "@/components/WelcomeScreen";
import { InstructorLogin } from "@/components/InstructorLogin";
import { InstructorDashboard } from "@/components/InstructorDashboard";
import type { StudentProfile, AssessmentResult } from "@/types";

type AppState = "welcome" | "assessment" | "results" | "instructor-login" | "instructor-dashboard";

function App() {
  const [appState, setAppState] = useState<AppState>("welcome");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [firstQuestion, setFirstQuestion] = useState<any>(null);
  const [finalResult, setFinalResult] = useState<AssessmentResult | null>(null);

  // Check for instructor route on mount
  useEffect(() => {
    if (window.location.pathname === "/instructor") {
      // Check if already logged in
      const token = localStorage.getItem("instructor_token");
      if (token) {
        setAppState("instructor-dashboard");
      } else {
        setAppState("instructor-login");
      }
    }
  }, []);

  const handleStartAssessment = async (studentName?: string) => {
    try {
      const response = await fetch("/api/assessment/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ studentName }),
      });

      if (!response.ok) {
        throw new Error("Failed to start assessment");
      }

      const data = await response.json();
      setSessionId(data.sessionId);
      setProfile(data.profile);
      setFirstQuestion(data.firstQuestion);
      setAppState("assessment");
    } catch (error) {
      console.error("Error starting assessment:", error);
      alert("Failed to start assessment. Please try again.");
    }
  };

  const handleAssessmentComplete = (result: AssessmentResult) => {
    setFinalResult(result);
    setAppState("results");
  };

  const handleRestart = () => {
    setSessionId(null);
    setProfile(null);
    setFirstQuestion(null);
    setFinalResult(null);
    setAppState("welcome");
  };

  const handleInstructorLogin = () => {
    setAppState("instructor-dashboard");
  };

  const handleInstructorLogout = () => {
    localStorage.removeItem("instructor_token");
    setAppState("instructor-login");
    window.location.pathname = "/";
  };

  return (
    <div className="min-h-screen bg-background">
      {appState === "welcome" && (
        <WelcomeScreen onStart={handleStartAssessment} />
      )}

      {appState === "assessment" && sessionId && profile && firstQuestion && (
        <AssessmentView
          sessionId={sessionId}
          initialProfile={profile}
          initialQuestion={firstQuestion}
          onComplete={handleAssessmentComplete}
        />
      )}

      {appState === "results" && finalResult && (
        <ResultsView result={finalResult} onRestart={handleRestart} />
      )}

      {appState === "instructor-login" && (
        <InstructorLogin onLogin={handleInstructorLogin} />
      )}

      {appState === "instructor-dashboard" && (
        <InstructorDashboard onLogout={handleInstructorLogout} />
      )}
    </div>
  );
}

export default App;
