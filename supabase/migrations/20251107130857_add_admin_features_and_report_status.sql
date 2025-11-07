/*
  # Add Admin Features and Report Status

  ## Overview
  This migration adds support for counselor authentication and report generation tracking
  for the admin dashboard. It extends the existing schema with fields needed for the
  counselor workflow and updates RLS policies to allow authenticated counselors to view
  all student data.

  ## Changes Made

  ### 1. Students Table Updates
  - Add `report_generated` (boolean): Tracks whether counselor has generated report for this student
  - Add `test_status` (text): Stores computed test completion status for admin dashboard

  ### 2. Row Level Security Updates
  - Add policies for authenticated counselors to SELECT all students data
  - Add policies for authenticated counselors to SELECT all test_results data
  - Add policies for authenticated counselors to UPDATE students (for report generation)
  - Keep existing anon policies intact for student test-taking flow

  ## Security Notes
  - Authenticated role represents counselors who log in via Supabase Auth
  - Counselors can view all student records and test results
  - Counselors can update student records (for marking reports as generated)
  - Anonymous users (students) retain their existing permissions
  - Students cannot see other students' data
*/

-- Add report_generated column to students table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'students' AND column_name = 'report_generated'
  ) THEN
    ALTER TABLE students ADD COLUMN report_generated boolean DEFAULT false;
  END IF;
END $$;

-- Add test_status column for caching test completion status
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'students' AND column_name = 'test_status'
  ) THEN
    ALTER TABLE students ADD COLUMN test_status text;
  END IF;
END $$;

-- Add index on report_generated for filtering
CREATE INDEX IF NOT EXISTS idx_students_report_generated ON students(report_generated);

-- Drop existing policies if they exist and recreate them
DROP POLICY IF EXISTS "Authenticated counselors can view all students" ON students;
DROP POLICY IF EXISTS "Authenticated counselors can update students" ON students;
DROP POLICY IF EXISTS "Authenticated counselors can view all test results" ON test_results;

-- RLS Policies for authenticated counselors on students table
CREATE POLICY "Authenticated counselors can view all students"
  ON students
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated counselors can update students"
  ON students
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- RLS Policies for authenticated counselors on test_results table
CREATE POLICY "Authenticated counselors can view all test results"
  ON test_results
  FOR SELECT
  TO authenticated
  USING (true);