/*
  # Add Report Status and Tracking Fields

  ## Overview
  This migration adds comprehensive report generation tracking to the students table,
  enabling counselors to manage the report generation workflow through the admin dashboard.
  This prepares the database infrastructure for future report generation implementation.

  ## Changes Made

  ### 1. New Columns Added to students table
  
  **report_status** (text):
  - Tracks the current state of report generation for each student
  - Possible values:
    - 'tests_not_complete': Not all 4 tests are completed yet
    - 'ready_to_generate': All tests complete, ready for report generation
    - 'generation_in_progress': Counselor has initiated report generation
    - 'done': Report successfully generated
    - 'error': Report generation failed
  - Default: 'tests_not_complete'
  
  **report_generated_by** (text):
  - Stores the email of the counselor who initiated report generation
  - Used for accountability and audit trail
  - Nullable (null until report generation is initiated)
  
  **report_generated_at** (timestamptz):
  - Timestamp when report generation was completed successfully
  - Nullable (null until report is successfully generated)
  
  **report_error_message** (text):
  - Stores error details if report generation fails
  - Nullable (null unless generation fails)
  - Used for debugging and displaying error info to counselors

  ### 2. Indexes Added
  - idx_students_report_status: For filtering students by report status
  - idx_students_report_generated_by: For tracking counselor activity

  ### 3. Security
  - Existing RLS policies allow authenticated counselors to update these fields
  - No additional policy changes needed

  ## Important Notes
  - This migration only adds infrastructure for report tracking
  - Actual report generation logic will be implemented separately
  - Report status can be updated manually or via application logic
  - The report_generated column (boolean) remains for backward compatibility
*/

-- Add report_status column to students table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'students' AND column_name = 'report_status'
  ) THEN
    ALTER TABLE students ADD COLUMN report_status text DEFAULT 'tests_not_complete';
  END IF;
END $$;

-- Add report_generated_by column to students table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'students' AND column_name = 'report_generated_by'
  ) THEN
    ALTER TABLE students ADD COLUMN report_generated_by text;
  END IF;
END $$;

-- Add report_generated_at column to students table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'students' AND column_name = 'report_generated_at'
  ) THEN
    ALTER TABLE students ADD COLUMN report_generated_at timestamptz;
  END IF;
END $$;

-- Add report_error_message column to students table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'students' AND column_name = 'report_error_message'
  ) THEN
    ALTER TABLE students ADD COLUMN report_error_message text;
  END IF;
END $$;

-- Add indexes for filtering and performance
CREATE INDEX IF NOT EXISTS idx_students_report_status ON students(report_status);
CREATE INDEX IF NOT EXISTS idx_students_report_generated_by ON students(report_generated_by);

-- Add comments for clarity
COMMENT ON COLUMN students.report_status IS 'Report generation status: tests_not_complete, ready_to_generate, generation_in_progress, done, or error';
COMMENT ON COLUMN students.report_generated_by IS 'Email of counselor who initiated report generation';
COMMENT ON COLUMN students.report_generated_at IS 'Timestamp when report generation completed successfully';
COMMENT ON COLUMN students.report_error_message IS 'Error details if report generation failed';
