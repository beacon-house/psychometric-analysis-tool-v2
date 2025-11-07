/*
  # Create Report Sections Table for AI-Generated Reports

  ## Overview
  This migration creates the infrastructure for storing AI-generated psychometric reports.
  Each report is broken down into 11 sections that are generated sequentially using GPT-5.

  ## New Tables

  ### report_sections
  Stores individual sections of generated reports with the following structure:
  - `id` (uuid, primary key): Unique identifier for each section
  - `student_id` (uuid, foreign key): References students table
  - `section_type` (text): Type of section (student_type, test_16p, test_high5, etc.)
  - `content` (jsonb): Generated content stored as structured JSON
  - `generated_at` (timestamptz): When this section was generated
  - `tokens_used` (integer): Number of tokens consumed for this section
  - `error_message` (text): Error details if generation failed (nullable)
  - `created_at` (timestamptz): Record creation timestamp
  - `updated_at` (timestamptz): Record update timestamp

  ## Section Types
  The section_type field can have these values:
  - student_type: Overall personality classification
  - test_16p: 16 Personalities test summary
  - test_high5: HIGH5 strengths test summary
  - test_big5: Big Five personality test summary
  - test_riasec: RIASEC career interest test summary
  - domain_business: Business Management & Leadership domain analysis
  - domain_economics: Economics & Finance domain analysis
  - domain_interdisciplinary: Interdisciplinary Systems domain analysis
  - domain_stem: STEM & Applied Sciences domain analysis
  - domain_liberal_arts: Liberal Arts & Communications domain analysis
  - final_summary: Comprehensive synthesis and recommendations

  ## Indexes
  - Primary key on id
  - Index on student_id for efficient report retrieval
  - Index on section_type for filtering by section
  - Unique constraint on (student_id, section_type) to prevent duplicates

  ## Security
  - RLS enabled on report_sections table
  - Authenticated counselors can read all report sections
  - Only the service role can insert/update sections (via Edge Functions)
*/

-- Create report_sections table
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

-- Add index for efficient queries
CREATE INDEX IF NOT EXISTS idx_report_sections_student_id ON report_sections(student_id);
CREATE INDEX IF NOT EXISTS idx_report_sections_section_type ON report_sections(section_type);

-- Add comments for documentation
COMMENT ON TABLE report_sections IS 'Stores AI-generated psychometric report sections for students';
COMMENT ON COLUMN report_sections.section_type IS 'Type of report section: student_type, test_16p, test_high5, test_big5, test_riasec, domain_business, domain_economics, domain_interdisciplinary, domain_stem, domain_liberal_arts, final_summary';
COMMENT ON COLUMN report_sections.content IS 'Generated content stored as structured JSON';
COMMENT ON COLUMN report_sections.tokens_used IS 'Number of GPT tokens consumed for this section generation';

-- Enable Row Level Security
ALTER TABLE report_sections ENABLE ROW LEVEL SECURITY;

-- Policy: Authenticated counselors can read all report sections
CREATE POLICY "Counselors can view all report sections"
  ON report_sections
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Only service role can insert report sections (via Edge Functions)
CREATE POLICY "Service role can insert report sections"
  ON report_sections
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Policy: Only service role can update report sections (via Edge Functions)
CREATE POLICY "Service role can update report sections"
  ON report_sections
  FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);