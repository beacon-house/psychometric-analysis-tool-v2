// Type definitions for the psychometric analysis tool

export type TestName = '16Personalities' | 'HIGH5' | 'Big Five' | 'RIASEC';

export type TestStatus = 'locked' | 'available' | 'in_progress' | 'completed';

export type OverallStatus =
  | 'test_in_progress'
  | 'reports_generated'
  | 'email_sent'
  | 'call_scheduled'
  | 'call_rescheduled'
  | 'no_show'
  | 'call_done'
  | 'converted';

export type ReportStatus =
  | 'tests_not_complete'
  | 'ready_to_generate'
  | 'generation_in_progress'
  | 'done'
  | 'error';

export interface TestInfo {
  id: TestName;
  title: string;
  description: string;
  questionCount: number;
  estimatedTime: string;
  icon: string;
  status: TestStatus;
}

export interface TestProgress {
  testName: TestName;
  currentQuestion: number;
  totalQuestions: number;
  responses: Record<string, number>;
  startedAt: string;
  completedAt?: string;
}

export interface StudentData {
  uuid: string;
  verified: boolean;
  studentName?: string;
  parentEmail?: string;
  parentWhatsapp?: string;
  overallStatus: OverallStatus;
  testProgress: Record<TestName, TestProgress | undefined>;
}

export interface ContactFormData {
  studentName: string;
  parentEmail: string;
  parentWhatsapp: string;
}

export interface Question {
  id: string;
  text: string;
  testName: TestName;
}

export interface TestResult {
  id: string;
  student_id: string;
  test_name: TestName;
  test_status: 'in_progress' | 'completed' | 'abandoned';
  result_data: any;
  questions_answered: number;
  last_activity_at: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface TestResponse {
  id: string;
  student_id: string;
  test_name: TestName;
  responses: Record<string, number> | null;
  questions_answered: number;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

// Admin Dashboard Types
export interface StudentWithTests {
  id: string;
  student_name: string | null;
  parent_email: string | null;
  parent_whatsapp: string | null;
  overall_status: OverallStatus;
  report_generated: boolean;
  report_status: ReportStatus;
  report_generated_by: string | null;
  report_generated_at: string | null;
  report_error_message: string | null;
  created_at: string;
  updated_at: string;
  submission_timestamp: string | null;
  test_16personalities: TestStatus;
  test_high5: TestStatus;
  test_big_five: TestStatus;
  test_riasec: TestStatus;
  all_tests_completed: boolean;
}

export interface AdminUser {
  id: string;
  email: string;
}

// Report Generation Types
export type ReportSectionType =
  | 'student_type'
  | 'test_16p'
  | 'test_high5'
  | 'test_big5'
  | 'test_riasec'
  | 'core_identity_summary'
  | 'domain_stem'
  | 'domain_biology'
  | 'domain_liberal_arts'
  | 'domain_business'
  | 'domain_interdisciplinary'
  | 'final_summary'
  | 'overall_insight';

export interface ReportSection {
  id: string;
  student_id: string;
  section_type: ReportSectionType;
  content: any;
  generated_at: string;
  tokens_used: number;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

export interface FormattedTestData {
  test16Personalities?: any;
  testHigh5?: any;
  testBigFive?: any;
  testRiasec?: any;
}

export interface ReportGenerationResponse {
  success: boolean;
  message: string;
  sections_generated?: number;
  total_tokens?: number;
  error?: string;
}

// Selected Recommendations Types
export interface SelectedRecommendation {
  id: string;
  student_id: string;
  domain: string;
  section: 'strongerAreas' | 'weakerAreas';
  recommendation_text: string;
  is_custom: boolean;
  selected_by: string | null;
  created_at: string;
  updated_at: string;
}
