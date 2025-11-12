/*
  ============================================================================
  PSYCHOMETRIC ANALYSIS TOOL - PRODUCTION DATABASE SCHEMA
  ============================================================================

  This script creates the complete database schema for the Beacon House
  Psychometric Analysis Tool. It consolidates all migrations into a single
  deployable SQL script for production database initialization.

  USAGE:
  1. Create a new Supabase project for production
  2. Run this script in the Supabase SQL Editor
  3. Deploy edge functions separately (see deployment notes below)
  4. Update environment variables in your application

  IMPORTANT NOTES:
  - This script is idempotent (can be run multiple times safely)
  - All tables use UUID primary keys with CASCADE delete on foreign keys
  - RLS is enabled on all tables with appropriate policies
  - Timestamps are automatically managed via triggers

  SCHEMA VERSION: November 2024
  BRANCH: staging-v2
  ============================================================================
*/

-- ============================================================================
-- SECTION 1: HELPER FUNCTIONS
-- ============================================================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- SECTION 2: TABLES
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Table: students
-- ----------------------------------------------------------------------------
-- Stores student records with contact information, test progress, and report status
CREATE TABLE IF NOT EXISTS students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_name text,
  parent_email text,
  parent_whatsapp text,
  overall_status text DEFAULT 'test_in_progress',
  submission_timestamp timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  report_generated boolean DEFAULT false,
  test_status text,
  report_status text DEFAULT 'tests_not_complete',
  report_generated_by text,
  report_generated_at timestamptz,
  report_error_message text
);

-- Add comments for documentation
COMMENT ON TABLE students IS 'Student records with contact information and report generation status';
COMMENT ON COLUMN students.overall_status IS 'Pipeline status: test_in_progress, reports_generated, email_sent, call_scheduled, call_rescheduled, no_show, call_done, converted';
COMMENT ON COLUMN students.report_status IS 'Report generation status: tests_not_complete, ready_to_generate, generation_in_progress, done, or error';
COMMENT ON COLUMN students.report_generated_by IS 'Email of counselor who initiated report generation';
COMMENT ON COLUMN students.report_generated_at IS 'Timestamp when report generation completed successfully';
COMMENT ON COLUMN students.report_error_message IS 'Error details if report generation failed';

-- ----------------------------------------------------------------------------
-- Table: test_results
-- ----------------------------------------------------------------------------
-- Stores computed test results and evaluation data for each of the 4 tests
CREATE TABLE IF NOT EXISTS test_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  test_name text NOT NULL,
  test_status text DEFAULT 'in_progress',
  result_data jsonb DEFAULT '{}'::jsonb,
  completed_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT unique_student_test_result UNIQUE (student_id, test_name)
);

-- Add comments for documentation
COMMENT ON TABLE test_results IS 'Computed test results and scores for 16Personalities, HIGH5, Big Five, and RIASEC';
COMMENT ON COLUMN test_results.test_name IS 'Test name: 16Personalities, HIGH5, Big Five, or RIASEC';
COMMENT ON COLUMN test_results.test_status IS 'Test status: in_progress, completed, or abandoned';
COMMENT ON COLUMN test_results.result_data IS 'Computed scores and interpretations in JSON format';

-- ----------------------------------------------------------------------------
-- Table: report_sections
-- ----------------------------------------------------------------------------
-- Stores AI-generated report sections (12 sections per student)
CREATE TABLE IF NOT EXISTS report_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  section_type text NOT NULL,
  content jsonb NOT NULL DEFAULT '{}'::jsonb,
  generated_at timestamptz DEFAULT now(),
  tokens_used integer DEFAULT 0,
  error_message text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add unique constraint to prevent duplicate sections per student
CREATE UNIQUE INDEX IF NOT EXISTS idx_report_sections_student_section
  ON report_sections(student_id, section_type);

-- Add comments for documentation
COMMENT ON TABLE report_sections IS 'AI-generated psychometric report sections for students';
COMMENT ON COLUMN report_sections.section_type IS 'Type of report section: student_type, test_16p, test_high5, test_big5, test_riasec, core_identity_summary, domain_stem, domain_biology, domain_liberal_arts, domain_business, domain_interdisciplinary, overall_insight';
COMMENT ON COLUMN report_sections.content IS 'Generated content stored as structured JSON (markdown format)';
COMMENT ON COLUMN report_sections.tokens_used IS 'Number of AI tokens consumed for this section generation';

-- ----------------------------------------------------------------------------
-- Table: selected_recommendations
-- ----------------------------------------------------------------------------
-- Stores counselor-selected career pathway recommendations for students
CREATE TABLE IF NOT EXISTS selected_recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  domain text NOT NULL,
  section text NOT NULL,
  recommendation_text text NOT NULL,
  is_custom boolean DEFAULT false,
  selected_by text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_section CHECK (section IN ('strongerAreas', 'weakerAreas'))
);

-- Add comments for documentation
COMMENT ON TABLE selected_recommendations IS 'Counselor-selected career pathway recommendations for students';
COMMENT ON COLUMN selected_recommendations.domain IS 'Career domain: domain_stem, domain_biology, domain_liberal_arts, domain_business, domain_interdisciplinary';
COMMENT ON COLUMN selected_recommendations.section IS 'Section within domain: strongerAreas or weakerAreas';
COMMENT ON COLUMN selected_recommendations.is_custom IS 'True if counselor manually added this recommendation, false if selected from AI-generated list';

-- ============================================================================
-- SECTION 3: INDEXES
-- ============================================================================

-- Students table indexes
CREATE INDEX IF NOT EXISTS idx_students_email ON students(parent_email);
CREATE INDEX IF NOT EXISTS idx_students_status ON students(overall_status);
CREATE INDEX IF NOT EXISTS idx_students_created ON students(created_at);
CREATE INDEX IF NOT EXISTS idx_students_report_generated ON students(report_generated);
CREATE INDEX IF NOT EXISTS idx_students_report_status ON students(report_status);
CREATE INDEX IF NOT EXISTS idx_students_report_generated_by ON students(report_generated_by);

-- Test results table indexes
CREATE INDEX IF NOT EXISTS idx_test_results_student ON test_results(student_id);
CREATE INDEX IF NOT EXISTS idx_test_results_test_name ON test_results(test_name);
CREATE INDEX IF NOT EXISTS idx_test_results_completed ON test_results(completed_at);

-- Report sections table indexes
CREATE INDEX IF NOT EXISTS idx_report_sections_student_id ON report_sections(student_id);
CREATE INDEX IF NOT EXISTS idx_report_sections_section_type ON report_sections(section_type);

-- Selected recommendations table indexes
CREATE INDEX IF NOT EXISTS idx_selected_recommendations_student_id ON selected_recommendations(student_id);
CREATE INDEX IF NOT EXISTS idx_selected_recommendations_domain ON selected_recommendations(domain);

-- ============================================================================
-- SECTION 4: ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE selected_recommendations ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- Students Table Policies
-- ----------------------------------------------------------------------------

-- Drop existing policies if they exist (for idempotency)
DROP POLICY IF EXISTS "Anonymous users can insert student records" ON students;
DROP POLICY IF EXISTS "Anonymous users can update own student records" ON students;
DROP POLICY IF EXISTS "Anonymous users can read own student records" ON students;
DROP POLICY IF EXISTS "Authenticated counselors can view all students" ON students;
DROP POLICY IF EXISTS "Authenticated counselors can update students" ON students;
DROP POLICY IF EXISTS "Counsellors can read all students" ON students;

-- Anonymous users (students taking tests)
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

-- Authenticated counselors (admin dashboard)
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

-- ----------------------------------------------------------------------------
-- Test Results Table Policies
-- ----------------------------------------------------------------------------

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anonymous users can insert test results" ON test_results;
DROP POLICY IF EXISTS "Anonymous users can update own test results" ON test_results;
DROP POLICY IF EXISTS "Anonymous users can read own test results" ON test_results;
DROP POLICY IF EXISTS "Authenticated counselors can view all test results" ON test_results;
DROP POLICY IF EXISTS "Counsellors can read all test results" ON test_results;

-- Anonymous users (students taking tests)
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

-- Authenticated counselors (admin dashboard)
CREATE POLICY "Authenticated counselors can view all test results"
  ON test_results
  FOR SELECT
  TO authenticated
  USING (true);

-- ----------------------------------------------------------------------------
-- Report Sections Table Policies
-- ----------------------------------------------------------------------------

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Counselors can view all report sections" ON report_sections;
DROP POLICY IF EXISTS "Service role can insert report sections" ON report_sections;
DROP POLICY IF EXISTS "Service role can update report sections" ON report_sections;
DROP POLICY IF EXISTS "Counsellors can read all generated reports" ON report_sections;

-- Authenticated counselors can view reports
CREATE POLICY "Counselors can view all report sections"
  ON report_sections
  FOR SELECT
  TO authenticated
  USING (true);

-- Service role (edge functions) can insert/update report sections
CREATE POLICY "Service role can insert report sections"
  ON report_sections
  FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Service role can update report sections"
  ON report_sections
  FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ----------------------------------------------------------------------------
-- Selected Recommendations Table Policies
-- ----------------------------------------------------------------------------

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Counselors can view all selected recommendations" ON selected_recommendations;
DROP POLICY IF EXISTS "Counselors can insert selected recommendations" ON selected_recommendations;
DROP POLICY IF EXISTS "Counselors can delete selected recommendations" ON selected_recommendations;

-- Authenticated counselors can manage recommendations
CREATE POLICY "Counselors can view all selected recommendations"
  ON selected_recommendations
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Counselors can insert selected recommendations"
  ON selected_recommendations
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Counselors can delete selected recommendations"
  ON selected_recommendations
  FOR DELETE
  TO authenticated
  USING (true);

-- ============================================================================
-- SECTION 5: TRIGGERS
-- ============================================================================

-- Drop existing triggers if they exist (for idempotency)
DROP TRIGGER IF EXISTS update_students_updated_at ON students;
DROP TRIGGER IF EXISTS update_test_results_updated_at ON test_results;
DROP TRIGGER IF EXISTS update_selected_recommendations_updated_at ON selected_recommendations;

-- Create triggers to automatically update updated_at timestamps
CREATE TRIGGER update_students_updated_at
  BEFORE UPDATE ON students
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_test_results_updated_at
  BEFORE UPDATE ON test_results
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_selected_recommendations_updated_at
  BEFORE UPDATE ON selected_recommendations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- DEPLOYMENT COMPLETE
-- ============================================================================

/*
  NEXT STEPS AFTER RUNNING THIS SCRIPT:

  1. EDGE FUNCTIONS:
     Deploy the following edge functions to your production Supabase project:
     - supabase/functions/generate-report
     - supabase/functions/regenerate-report-sections

     Use: supabase functions deploy generate-report
          supabase functions deploy regenerate-report-sections

  2. SECRETS CONFIGURATION:
     Set the following secrets in your Supabase dashboard:
     - OPENAI_API_KEY (or ANTHROPIC_API_KEY)
     - Any other API keys required by edge functions

     Use: supabase secrets set OPENAI_API_KEY=your_key_here

  3. ENVIRONMENT VARIABLES:
     Update your Netlify production environment variables:
     - VITE_SUPABASE_URL=<your-prod-supabase-url>
     - VITE_SUPABASE_ANON_KEY=<your-prod-anon-key>
     - VITE_WEBHOOK_URL=<your-make-webhook-url>

  4. AUTHENTICATION:
     Set up Supabase Auth email authentication for counselor login
     Create counselor accounts via Supabase dashboard

  5. VERIFICATION:
     - Test student flow: Take a test and verify data saves correctly
     - Test admin flow: Login and generate a test report
     - Verify RLS policies: Ensure students can't see other students' data
     - Check edge functions: Verify report generation works

  For more information, see: CLAUDE.md in the project root
*/
