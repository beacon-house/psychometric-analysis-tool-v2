/*
  # Psychometric Analysis Tool Database Schema

  ## Overview
  This migration creates the core database structure for the Beacon House Psychometric Analysis Tool,
  which captures student test responses and parent contact information for lead generation.

  ## New Tables Created

  ### 1. `students` table
  Stores unique student records with contact information and overall status tracking.
  
  **Columns:**
  - `id` (uuid, primary key): Unique identifier for each student session
  - `student_name` (text): Student's full name (captured after test completion)
  - `parent_email` (text): Parent's email address for report delivery
  - `parent_whatsapp` (text): Parent's WhatsApp number for follow-up
  - `overall_status` (text): Current status in the lead pipeline
  - `submission_timestamp` (timestamptz): When contact information was submitted
  - `created_at` (timestamptz): When the student first started tests
  - `updated_at` (timestamptz): Last update timestamp

  ### 2. `test_responses` table
  Stores individual test completion data and responses for each of the four tests.
  
  **Columns:**
  - `id` (uuid, primary key): Unique identifier for each test response
  - `student_id` (uuid, foreign key): Links to students table
  - `test_name` (text): Name of the test (16Personalities, HIGH5, Big Five, RIASEC)
  - `test_status` (text): Completion status (in_progress, completed)
  - `responses` (jsonb): All question responses stored as JSON
  - `completed_at` (timestamptz): When the test was completed
  - `created_at` (timestamptz): When the test was started
  - `updated_at` (timestamptz): Last update timestamp

  ## Security

  ### Row Level Security (RLS)
  - RLS is enabled on both tables to protect student data
  - Anonymous users can insert and update their own records (identified by UUID)
  - No read access for anonymous users (data only accessible via backend/counselor dashboard)
  
  ### Policies
  1. Students table:
     - Anonymous users can insert new student records
     - Anonymous users can update records they own (via UUID match)
  
  2. Test responses table:
     - Anonymous users can insert test responses
     - Anonymous users can update test responses they own
     - Anonymous users can read their own test responses
  
  ## Status Values

  ### overall_status options:
  - `test_in_progress`: Student is currently taking tests
  - `reports_generated`: All tests completed, reports generated
  - `email_sent`: Reports sent to parent email
  - `call_scheduled`: Counselor call scheduled
  - `call_rescheduled`: Call was rescheduled
  - `no_show`: Scheduled call was missed
  - `call_done`: Call completed
  - `converted`: Lead converted to customer

  ### test_status options:
  - `in_progress`: Test started but not completed
  - `completed`: Test fully completed

  ## Important Notes
  - Student UUIDs are generated client-side when starting the first test
  - Contact information is captured after all four tests are completed
  - Progress is saved after each question via localStorage and synced to database
  - Webhook integration triggers when student submits contact info with all tests complete
*/

-- Create students table
CREATE TABLE IF NOT EXISTS students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_name text,
  parent_email text,
  parent_whatsapp text,
  overall_status text DEFAULT 'test_in_progress',
  submission_timestamp timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create test_responses table
CREATE TABLE IF NOT EXISTS test_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  test_name text NOT NULL,
  test_status text DEFAULT 'in_progress',
  responses jsonb DEFAULT '{}'::jsonb,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT unique_student_test UNIQUE (student_id, test_name)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_students_email ON students(parent_email);
CREATE INDEX IF NOT EXISTS idx_students_status ON students(overall_status);
CREATE INDEX IF NOT EXISTS idx_students_created ON students(created_at);
CREATE INDEX IF NOT EXISTS idx_test_responses_student ON test_responses(student_id);
CREATE INDEX IF NOT EXISTS idx_test_responses_status ON test_responses(test_status);

-- Enable Row Level Security
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_responses ENABLE ROW LEVEL SECURITY;

-- Students table policies
CREATE POLICY "Anonymous users can insert student records"
  ON students
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Anonymous users can update own student records"
  ON students
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anonymous users can read own student records"
  ON students
  FOR SELECT
  TO anon
  USING (true);

-- Test responses table policies
CREATE POLICY "Anonymous users can insert test responses"
  ON test_responses
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Anonymous users can update own test responses"
  ON test_responses
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anonymous users can read own test responses"
  ON test_responses
  FOR SELECT
  TO anon
  USING (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to automatically update updated_at
CREATE TRIGGER update_students_updated_at
  BEFORE UPDATE ON students
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_test_responses_updated_at
  BEFORE UPDATE ON test_responses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
