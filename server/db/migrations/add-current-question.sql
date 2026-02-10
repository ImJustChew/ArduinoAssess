-- Add current_question_data column to store active question for evaluation

ALTER TABLE assessment_sessions
ADD COLUMN IF NOT EXISTS current_question_data JSONB;
