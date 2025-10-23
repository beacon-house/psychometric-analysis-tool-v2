/*
  # Drop test_responses table and simplify schema

  ## Overview
  This migration removes the test_responses table and all related database objects
  to simplify the database structure. We only need to track test status and final
  results, not question-by-question responses.

  ## Changes Made

  ### 1. Drop database objects
  - Drop test_dropoff_analytics view
  - Drop triggers related to test_responses
  - Drop functions related to test_responses (except shared update_updated_at_column)
  - Drop test_responses table completely

  ### 2. Clean up test_results table
  - Remove questions_answered column (not needed)
  - Remove last_activity_at column (not needed)
  - Keep: id, student_id, test_name, test_status, result_data, completed_at, created_at, updated_at

  ## Rationale
  - localStorage handles all test progress during test-taking
  - Database only stores final results and status (in_progress, completed, abandoned)
  - Eliminates unnecessary database writes during test-taking
  - Simplifies data model and reduces complexity
*/

-- Drop view
DROP VIEW IF EXISTS test_dropoff_analytics;

-- Drop triggers
DROP TRIGGER IF EXISTS update_test_results_activity_trigger ON test_responses;
DROP TRIGGER IF EXISTS update_test_responses_updated_at ON test_responses;

-- Drop functions (excluding update_updated_at_column which is used by other tables)
DROP FUNCTION IF EXISTS update_test_results_activity();
DROP FUNCTION IF EXISTS mark_abandoned_tests();

-- Drop test_responses table
DROP TABLE IF EXISTS test_responses;

-- Remove unnecessary columns from test_results
DO $$
BEGIN
  -- Drop questions_answered column if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'test_results' AND column_name = 'questions_answered'
  ) THEN
    ALTER TABLE test_results DROP COLUMN questions_answered;
  END IF;

  -- Drop last_activity_at column if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'test_results' AND column_name = 'last_activity_at'
  ) THEN
    ALTER TABLE test_results DROP COLUMN last_activity_at;
  END IF;
END $$;

-- Drop indexes that are no longer needed
DROP INDEX IF EXISTS idx_test_results_status;
DROP INDEX IF EXISTS idx_test_results_last_activity;
DROP INDEX IF EXISTS idx_test_responses_student;
DROP INDEX IF EXISTS idx_test_responses_status;

-- Ensure test_status column exists in test_results
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'test_results' AND column_name = 'test_status'
  ) THEN
    ALTER TABLE test_results ADD COLUMN test_status text DEFAULT 'in_progress';
  END IF;
END $$;

-- Add comment to test_status column for clarity
COMMENT ON COLUMN test_results.test_status IS 'Test status: in_progress, completed, or abandoned';
