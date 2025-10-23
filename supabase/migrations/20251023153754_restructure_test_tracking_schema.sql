/*
  # Restructure Test Tracking Schema for LLM Integration and Analytics

  ## Overview
  This migration optimizes the database schema to support LLM-powered career reports
  and enhanced drop-off analytics. It consolidates test status tracking in test_results
  while maintaining granular progress data in test_responses.

  ## Changes Made

  ### 1. test_results table enhancements
  - **Added `test_status` column (text)**: Tracks test completion state
    - Values: 'not_started', 'in_progress', 'completed', 'abandoned'
    - Provides single source of truth for test status
  - **Added `questions_answered` column (integer)**: Number of questions completed
    - Enables "abandoned at X of Y" analytics
    - Default: 0
  - **Added `last_activity_at` column (timestamptz)**: Last interaction timestamp
    - Used to identify abandoned tests (no activity for 7+ days)
    - Auto-updates on any test activity
  - **Modified `result_data` column**: Now nullable (empty until test completion)

  ### 2. test_responses table modifications
  - **Modified `responses` column**: Now nullable for lightweight progress tracking
  - **Added `questions_answered` column (integer)**: Count of completed questions
  - **Removed `test_status` column**: Status tracking consolidated in test_results
  - **Data migration**: Existing test_status values moved to test_results

  ### 3. Data migration
  - Migrates existing test_status from test_responses to test_results
  - Creates test_results records for tests that only have responses
  - Preserves all existing data and relationships

  ## Benefits
  - **LLM Integration**: Clean test_results data for career report generation
  - **Drop-off Analytics**: Question-level abandonment tracking via test_responses
  - **Performance**: Single status query from test_results (no joins needed)
  - **Team Dashboard**: Clear metrics for completion rates and drop-off patterns

  ## Important Notes
  - test_results becomes the primary table for status tracking and analytics
  - test_responses becomes the archive for progress tracking and raw data
  - Existing RLS policies remain unchanged
  - All timestamps and foreign keys preserved
*/

-- Step 1: Add new columns to test_results table
DO $$
BEGIN
  -- Add test_status column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'test_results' AND column_name = 'test_status'
  ) THEN
    ALTER TABLE test_results ADD COLUMN test_status text DEFAULT 'in_progress';
  END IF;

  -- Add questions_answered column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'test_results' AND column_name = 'questions_answered'
  ) THEN
    ALTER TABLE test_results ADD COLUMN questions_answered integer DEFAULT 0;
  END IF;

  -- Add last_activity_at column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'test_results' AND column_name = 'last_activity_at'
  ) THEN
    ALTER TABLE test_results ADD COLUMN last_activity_at timestamptz DEFAULT now();
  END IF;
END $$;

-- Step 2: Make result_data nullable in test_results (for in-progress tests)
ALTER TABLE test_results ALTER COLUMN result_data DROP NOT NULL;

-- Step 3: Add questions_answered to test_responses table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'test_responses' AND column_name = 'questions_answered'
  ) THEN
    ALTER TABLE test_responses ADD COLUMN questions_answered integer DEFAULT 0;
  END IF;
END $$;

-- Step 4: Make responses nullable in test_responses (for lightweight tracking)
ALTER TABLE test_responses ALTER COLUMN responses DROP NOT NULL;

-- Step 5: Create temporary table to calculate questions_answered
CREATE TEMP TABLE temp_response_counts AS
SELECT
  student_id,
  test_name,
  jsonb_object_keys(COALESCE(responses, '{}'::jsonb)) as response_key
FROM test_responses;

CREATE TEMP TABLE temp_question_counts AS
SELECT
  student_id,
  test_name,
  COUNT(*) as questions_answered
FROM temp_response_counts
GROUP BY student_id, test_name;

-- Step 6: Migrate existing data from test_responses to test_results
-- Create test_results records for any test_responses that don't have corresponding results
INSERT INTO test_results (student_id, test_name, test_status, questions_answered, result_data, completed_at, last_activity_at)
SELECT
  tr.student_id,
  tr.test_name,
  CASE
    WHEN tr.test_status = 'completed' THEN 'completed'
    ELSE 'in_progress'
  END as test_status,
  COALESCE(tqc.questions_answered, 0) as questions_answered,
  NULL as result_data,
  tr.completed_at,
  COALESCE(tr.updated_at, tr.created_at) as last_activity_at
FROM test_responses tr
LEFT JOIN temp_question_counts tqc ON tr.student_id = tqc.student_id AND tr.test_name = tqc.test_name
WHERE NOT EXISTS (
  SELECT 1 FROM test_results res
  WHERE res.student_id = tr.student_id
  AND res.test_name = tr.test_name
)
ON CONFLICT (student_id, test_name) DO NOTHING;

-- Step 7: Update existing test_results records with status from test_responses
UPDATE test_results
SET
  test_status = CASE
    WHEN tr.test_status = 'completed' THEN 'completed'
    ELSE 'in_progress'
  END,
  questions_answered = COALESCE(tqc.questions_answered, 0),
  last_activity_at = COALESCE(tr.updated_at, tr.created_at)
FROM test_responses tr
LEFT JOIN temp_question_counts tqc ON tr.student_id = tqc.student_id AND tr.test_name = tqc.test_name
WHERE test_results.student_id = tr.student_id
  AND test_results.test_name = tr.test_name;

-- Step 8: Update questions_answered in test_responses based on response count
UPDATE test_responses
SET questions_answered = COALESCE(tqc.questions_answered, 0)
FROM temp_question_counts tqc
WHERE test_responses.student_id = tqc.student_id
  AND test_responses.test_name = tqc.test_name
  AND (test_responses.questions_answered = 0 OR test_responses.questions_answered IS NULL);

-- Step 9: Drop test_status column from test_responses (status now in test_results)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'test_responses' AND column_name = 'test_status'
  ) THEN
    ALTER TABLE test_responses DROP COLUMN test_status;
  END IF;
END $$;

-- Step 10: Create index for status queries (performance optimization)
CREATE INDEX IF NOT EXISTS idx_test_results_status ON test_results(test_status);
CREATE INDEX IF NOT EXISTS idx_test_results_last_activity ON test_results(last_activity_at);

-- Step 11: Create database view for drop-off analytics
CREATE OR REPLACE VIEW test_dropoff_analytics AS
SELECT
  tr.test_name,
  tr.questions_answered,
  COUNT(*) as student_count,
  ROUND(AVG(EXTRACT(EPOCH FROM (tr.updated_at - tr.created_at)) / 60), 2) as avg_minutes_spent
FROM test_responses tr
JOIN test_results res ON tr.student_id = res.student_id AND tr.test_name = res.test_name
WHERE res.test_status = 'in_progress'
GROUP BY tr.test_name, tr.questions_answered
ORDER BY tr.test_name, tr.questions_answered;

-- Step 12: Create function to auto-update last_activity_at in test_results
CREATE OR REPLACE FUNCTION update_test_results_activity()
RETURNS TRIGGER AS $$
DECLARE
  response_count integer;
BEGIN
  -- Calculate questions answered from JSONB
  SELECT COUNT(*) INTO response_count
  FROM jsonb_object_keys(COALESCE(NEW.responses, '{}'::jsonb));

  -- Update last_activity_at in test_results when test_responses is updated
  UPDATE test_results
  SET
    last_activity_at = now(),
    questions_answered = response_count
  WHERE student_id = NEW.student_id
    AND test_name = NEW.test_name;

  -- Also update questions_answered in test_responses
  NEW.questions_answered := response_count;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 13: Create trigger to auto-update last_activity_at
DROP TRIGGER IF EXISTS update_test_results_activity_trigger ON test_responses;
CREATE TRIGGER update_test_results_activity_trigger
  BEFORE INSERT OR UPDATE ON test_responses
  FOR EACH ROW
  EXECUTE FUNCTION update_test_results_activity();

-- Step 14: Create function to mark abandoned tests
CREATE OR REPLACE FUNCTION mark_abandoned_tests()
RETURNS void AS $$
BEGIN
  UPDATE test_results
  SET test_status = 'abandoned'
  WHERE test_status = 'in_progress'
    AND last_activity_at < NOW() - INTERVAL '7 days';
END;
$$ LANGUAGE plpgsql;

-- Note: To run abandoned test detection, execute: SELECT mark_abandoned_tests();
-- This can be scheduled via a cron job or called periodically
