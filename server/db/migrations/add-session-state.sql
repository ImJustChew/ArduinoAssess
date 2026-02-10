-- Add fields to store session state that was previously in memory
-- This makes the system stateless and Cloud Run compatible

-- Add total time and hints to assessment_sessions
ALTER TABLE assessment_sessions
ADD COLUMN IF NOT EXISTS total_time_ms INTEGER DEFAULT 0 NOT NULL;

ALTER TABLE assessment_sessions
ADD COLUMN IF NOT EXISTS hints_used INTEGER DEFAULT 0 NOT NULL;

ALTER TABLE assessment_sessions
ADD COLUMN IF NOT EXISTS partial_credits INTEGER DEFAULT 0 NOT NULL;

-- Add correct_count to dimension_states (was only in memory)
ALTER TABLE dimension_states
ADD COLUMN IF NOT EXISTS correct_count INTEGER DEFAULT 0 NOT NULL;

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_dimension_states_assessment ON dimension_states(assessment_id);

CREATE INDEX IF NOT EXISTS idx_question_responses_assessment ON question_responses(assessment_id);
