-- Migration: Change dimension_states bounds from INTEGER to REAL
-- This allows fractional difficulty bounds like 2.5, 3.7 which are critical
-- for the adaptive algorithm to work correctly

-- SQLite doesn't support ALTER COLUMN directly, so we need to:
-- 1. Create new table with REAL columns
-- 2. Copy data
-- 3. Drop old table
-- 4. Rename new table

BEGIN TRANSACTION;

-- Create new table with REAL bounds
CREATE TABLE dimension_states_new (
  id TEXT PRIMARY KEY,
  assessment_id TEXT NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  dimension TEXT NOT NULL CHECK(dimension IN ('low_level', 'control_flow', 'hardware_io', 'code_reading', 'decomposition')),
  lower_bound REAL NOT NULL,  -- Changed from INTEGER to REAL
  upper_bound REAL NOT NULL,  -- Changed from INTEGER to REAL
  tested BOOLEAN NOT NULL DEFAULT FALSE,
  question_count INTEGER NOT NULL DEFAULT 0,
  correct_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Copy data from old table
INSERT INTO dimension_states_new
SELECT * FROM dimension_states;

-- Drop old table
DROP TABLE dimension_states;

-- Rename new table
ALTER TABLE dimension_states_new RENAME TO dimension_states;

-- Recreate index
CREATE UNIQUE INDEX dimension_states_assessment_dimension ON dimension_states(assessment_id, dimension);

COMMIT;
