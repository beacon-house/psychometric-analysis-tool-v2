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
