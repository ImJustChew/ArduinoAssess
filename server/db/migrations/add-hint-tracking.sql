-- Add hint_events table for diagnostic hint tracking
-- Tracks which hints students request, when, and what happens after

CREATE TABLE IF NOT EXISTS hint_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID NOT NULL REFERENCES assessment_sessions(id),
  question_response_id UUID REFERENCES question_responses(id),
  question_id TEXT NOT NULL,
  hint_type TEXT NOT NULL CHECK (hint_type IN ('conceptual', 'syntactical', 'structural', 'example', 'elimination')),
  hint_text TEXT NOT NULL,
  time_into_question_ms INTEGER NOT NULL,
  subsequent_action TEXT CHECK (subsequent_action IN ('answered_correctly', 'answered_wrong', 'asked_another_hint', 'still_working')),
  time_after_hint_ms INTEGER,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_hint_events_assessment ON hint_events(assessment_id);
CREATE INDEX IF NOT EXISTS idx_hint_events_question_response ON hint_events(question_response_id);
