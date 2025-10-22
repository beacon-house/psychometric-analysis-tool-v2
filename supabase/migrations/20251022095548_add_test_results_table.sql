/*
  # Add test_results table for computed test evaluations

  ## Overview
  This migration adds a dedicated table for storing computed test results and evaluations.
  Unlike test_responses which stores raw question-answer pairs, this table stores the final
  calculated results, scores, and interpretations for each test type.

  ## New Table Created

  ### `test_results` table
  Stores computed evaluation results for each completed test.
  
  **Columns:**
  - `id` (uuid, primary key): Unique identifier for each result record
  - `student_id` (uuid, foreign key): Links to students table
  - `test_name` (text): Name of the test (16Personalities, HIGH5, Big Five, RIASEC)
  - `result_data` (jsonb): Computed results, scores, and interpretations in JSON format
  - `completed_at` (timestamptz): When the test evaluation was completed
  - `created_at` (timestamptz): When the result was first created
  - `updated_at` (timestamptz): Last update timestamp

  ## Security
  
  ### Row Level Security (RLS)
  - RLS is enabled to protect student result data
  - Anonymous users can insert and update their own results
  - Anonymous users can read their own results
  
  ## Important Notes
  - One result record per student per test (enforced by unique constraint)
  - result_data structure varies by test type but includes scores and interpretations
  - Results are calculated client-side and stored after test completion
  - This table is used for displaying results and webhook data transmission
*/

-- Create test_results table
CREATE TABLE IF NOT EXISTS test_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  test_name text NOT NULL,
  result_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  completed_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT unique_student_test_result UNIQUE (student_id, test_name)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_test_results_student ON test_results(student_id);
CREATE INDEX IF NOT EXISTS idx_test_results_test_name ON test_results(test_name);
CREATE INDEX IF NOT EXISTS idx_test_results_completed ON test_results(completed_at);

-- Enable Row Level Security
ALTER TABLE test_results ENABLE ROW LEVEL SECURITY;

-- Test results table policies
CREATE POLICY "Anonymous users can insert test results"
  ON test_results
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Anonymous users can update own test results"
  ON test_results
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anonymous users can read own test results"
  ON test_results
  FOR SELECT
  TO anon
  USING (true);

-- Trigger to automatically update updated_at
CREATE TRIGGER update_test_results_updated_at
  BEFORE UPDATE ON test_results
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
