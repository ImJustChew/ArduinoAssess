-- Migration: Change dimension_states bounds from INTEGER to REAL in PostgreSQL
-- The adaptive algorithm requires decimal bounds like 2.5, 3.7

BEGIN;

-- Change lower_bound and upper_bound to REAL (float8)
ALTER TABLE dimension_states
  ALTER COLUMN lower_bound TYPE REAL,
  ALTER COLUMN upper_bound TYPE REAL;

COMMIT;
