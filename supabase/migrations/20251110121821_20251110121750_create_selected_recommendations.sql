/*
  # Create Selected Recommendations Table

  ## Overview
  This migration creates infrastructure for counselors to select and customize career pathway
  recommendations during live counseling sessions. Selections are saved per student and displayed
  in the "Handpicked Majors" section of the Overall Insight.

  ## New Tables

  ### selected_recommendations
  Stores counselor-selected and custom-added major recommendations:
  - `id` (uuid, primary key): Unique identifier for each selection
  - `student_id` (uuid, foreign key): References students table
  - `domain` (text): Domain this recommendation belongs to (domain_stem, domain_biology, etc.)
  - `section` (text): Which subsection (strongerAreas or weakerAreas)
  - `recommendation_text` (text): The major/field name or full recommendation text
  - `is_custom` (boolean): True if counselor-added, false if AI-generated
  - `selected_by` (text): Email of counselor who made this selection
  - `created_at` (timestamptz): When selection was made
  - `updated_at` (timestamptz): Last update timestamp

  ## Domain Values
  - domain_stem: STEM & Applied Sciences
  - domain_biology: Biology & Natural Sciences
  - domain_liberal_arts: Liberal Arts & Communications
  - domain_business: Business & Economics
  - domain_interdisciplinary: Interdisciplinary Systems Fields

  ## Section Values
  - strongerAreas: Relatively Stronger Areas (recommended)
  - weakerAreas: Explore with Caution (less recommended)

  ## Indexes
  - Primary key on id
  - Index on student_id for efficient student-specific queries
  - Index on domain for filtering by career domain

  ## Security
  - RLS enabled
  - Authenticated counselors can select, insert, update, delete recommendations
  - Students cannot access this table (counselor-only feature)
*/

-- Create selected_recommendations table
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

-- Add indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_selected_recommendations_student_id
  ON selected_recommendations(student_id);
CREATE INDEX IF NOT EXISTS idx_selected_recommendations_domain
  ON selected_recommendations(domain);

-- Add comments for documentation
COMMENT ON TABLE selected_recommendations IS 'Counselor-selected career pathway recommendations for students';
COMMENT ON COLUMN selected_recommendations.domain IS 'Career domain: domain_stem, domain_biology, domain_liberal_arts, domain_business, domain_interdisciplinary';
COMMENT ON COLUMN selected_recommendations.section IS 'Section within domain: strongerAreas or weakerAreas';
COMMENT ON COLUMN selected_recommendations.is_custom IS 'True if counselor manually added this recommendation, false if selected from AI-generated list';

-- Enable Row Level Security
ALTER TABLE selected_recommendations ENABLE ROW LEVEL SECURITY;

-- Policy: Authenticated counselors can view all selections
CREATE POLICY "Counselors can view all selected recommendations"
  ON selected_recommendations
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Authenticated counselors can insert selections
CREATE POLICY "Counselors can insert selected recommendations"
  ON selected_recommendations
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy: Authenticated counselors can delete selections
CREATE POLICY "Counselors can delete selected recommendations"
  ON selected_recommendations
  FOR DELETE
  TO authenticated
  USING (true);

-- Trigger to update updated_at timestamp
CREATE TRIGGER update_selected_recommendations_updated_at
  BEFORE UPDATE ON selected_recommendations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
