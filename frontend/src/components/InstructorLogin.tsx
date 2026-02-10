// Instructor Login Component
// Simple password protection for instructor dashboard

import { useState } from "react";

interface InstructorLoginProps {
  onLogin: () => void;
}

export function InstructorLogin({ onLogin }: InstructorLoginProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/instructor/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });

      if (!response.ok) {
        setError("Invalid password");
        setLoading(false);
        return;
      }

      // Store auth token
      const data = await response.json();
      localStorage.setItem("instructor_token", data.token);
      onLogin();
    } catch (error) {
      console.error("Login error:", error);
      setError("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="question-card">
          <h1 className="text-3xl font-bold terminal-font mb-2 text-center">
            Instructor Access
          </h1>
          <p className="text-center text-muted-foreground mb-6">
            Enter your password to access the dashboard
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border-2 border-border bg-background terminal-font focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Enter instructor password"
                required
                autoFocus
              />
            </div>

            {error && (
              <div className="text-red-600 dark:text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !password}
              className="w-full px-6 py-3 bg-foreground text-background hover:bg-foreground/90 transition-colors disabled:opacity-50 font-medium"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-border text-center">
            <a
              href="/"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              ← Back to Student Assessment
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
