/*
  # Add Counsellor Role and RLS Policies

  ## Overview
  This migration adds Row Level Security (RLS) policies to allow counsellors
  (authenticated users with role='counsellor' in app_metadata) to access
  all student data for monitoring and management purposes.

  ## Changes Made

  ### 1. Students Table
  - Add policy: Counsellors can read all student records
  - Maintain existing anonymous access for students creating their own records

  ### 2. Test Results Table  
  - Add policy: Counsellors can read all test results
  - Maintain existing anonymous access for students saving their own results

  ### 3. Generated Reports Table
  - Add policy: Counsellors can read all generated reports
  - Maintain existing anonymous access for report generation

  ## Security Considerations
  - Only users with 'counsellor' role in app_metadata can access these policies
  - Counsellors have READ-ONLY access (SELECT only, no INSERT/UPDATE/DELETE)
  - Anonymous users retain their existing access for student-facing functionality
  - All tables have RLS enabled and enforced
*/

-- ============================================================================
-- STUDENTS TABLE POLICIES
-- ============================================================================

-- Allow counsellors to read all student records
CREATE POLICY "Counsellors can read all students"
  ON students
  FOR SELECT
  TO authenticated
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'counsellor'
  );

-- ============================================================================
-- TEST_RESULTS TABLE POLICIES
-- ============================================================================

-- Allow counsellors to read all test results
CREATE POLICY "Counsellors can read all test results"
  ON test_results
  FOR SELECT
  TO authenticated
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'counsellor'
  );

-- ============================================================================
-- GENERATED_REPORTS TABLE POLICIES
-- ============================================================================

-- Allow counsellors to read all generated reports
CREATE POLICY "Counsellors can read all generated reports"
  ON generated_reports
  FOR SELECT
  TO authenticated
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'counsellor'
  );
