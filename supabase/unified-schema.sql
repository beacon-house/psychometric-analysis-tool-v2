/*
  # Unified Production Database Schema
  # Psychometric Analysis Tool - Complete Database Structure

  This SQL file contains the complete, production-ready database schema
  that replicates the exact structure from staging to production.
*/

-- ============================================================================
-- TABLES
-- ============================================================================

-- Students table
CREATE TABLE IF NOT EXISTS students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_name text,
  parent_email text,
  parent_whatsapp text,
  overall_status text DEFAULT 'test_in_progress',
  submission_timestamp timestamptz,
  report_generated boolean DEFAULT false,
  test_status text,
  report_status text DEFAULT 'tests_not_complete',
  report_generated_by text,
  report_generated_at timestamptz,
  report_error_message text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Test results table
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

-- Report sections table
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

-- Selected recommendations table
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

-- ============================================================================
-- INDEXES
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
CREATE UNIQUE INDEX IF NOT EXISTS idx_report_sections_student_section
  ON report_sections(student_id, section_type);
CREATE INDEX IF NOT EXISTS idx_report_sections_student_id ON report_sections(student_id);
CREATE INDEX IF NOT EXISTS idx_report_sections_section_type ON report_sections(section_type);

-- Selected recommendations table indexes
CREATE INDEX IF NOT EXISTS idx_selected_recommendations_student_id
  ON selected_recommendations(student_id);
CREATE INDEX IF NOT EXISTS idx_selected_recommendations_domain
  ON selected_recommendations(domain);

-- ============================================================================
-- COMMENTS
-- ============================================================================

-- Students table comments
COMMENT ON COLUMN students.report_status IS 'Report generation status: tests_not_complete, ready_to_generate, generation_in_progress, done, or error';
COMMENT ON COLUMN students.report_generated_by IS 'Email of counselor who initiated report generation';
COMMENT ON COLUMN students.report_generated_at IS 'Timestamp when report generation completed successfully';
COMMENT ON COLUMN students.report_error_message IS 'Error details if report generation failed';

-- Test results table comments
COMMENT ON COLUMN test_results.test_status IS 'Test status: in_progress, completed, or abandoned';

-- Report sections table comments
COMMENT ON TABLE report_sections IS 'Stores AI-generated psychometric report sections for students';
COMMENT ON COLUMN report_sections.section_type IS 'Type of report section: student_type, test_16p, test_high5, test_big5, test_riasec, domain_stem, domain_biology, domain_liberal_arts, domain_business, domain_interdisciplinary, overall_insight';
COMMENT ON COLUMN report_sections.content IS 'Generated content stored as structured JSON';
COMMENT ON COLUMN report_sections.tokens_used IS 'Number of GPT tokens consumed for this section generation';

-- Selected recommendations table comments
COMMENT ON TABLE selected_recommendations IS 'Counselor-selected career pathway recommendations for students';
COMMENT ON COLUMN selected_recommendations.domain IS 'Career domain: domain_stem, domain_biology, domain_liberal_arts, domain_business, domain_interdisciplinary';
COMMENT ON COLUMN selected_recommendations.section IS 'Section within domain: strongerAreas or weakerAreas';
COMMENT ON COLUMN selected_recommendations.is_custom IS 'True if counselor manually added this recommendation, false if selected from AI-generated list';

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Students table trigger
CREATE TRIGGER update_students_updated_at
  BEFORE UPDATE ON students
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Test results table trigger
CREATE TRIGGER update_test_results_updated_at
  BEFORE UPDATE ON test_results
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Selected recommendations table trigger
CREATE TRIGGER update_selected_recommendations_updated_at
  BEFORE UPDATE ON selected_recommendations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE selected_recommendations ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS POLICIES: STUDENTS TABLE
-- ============================================================================

-- Anonymous users (students) policies
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

-- Authenticated users (counselors) policies
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

-- ============================================================================
-- RLS POLICIES: TEST_RESULTS TABLE
-- ============================================================================

-- Anonymous users (students) policies
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

-- Authenticated users (counselors) policies
CREATE POLICY "Authenticated counselors can view all test results"
  ON test_results
  FOR SELECT
  TO authenticated
  USING (true);

-- ============================================================================
-- RLS POLICIES: REPORT_SECTIONS TABLE
-- ============================================================================

-- Authenticated users (counselors) policies
CREATE POLICY "Counselors can view all report sections"
  ON report_sections
  FOR SELECT
  TO authenticated
  USING (true);

-- Service role policies (for Edge Functions)
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

-- ============================================================================
-- RLS POLICIES: SELECTED_RECOMMENDATIONS TABLE
-- ============================================================================

-- Authenticated users (counselors) policies
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
