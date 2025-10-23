// LocalStorage management for test progress and student data
// Provides persistent storage across browser sessions

import type { StudentData, TestProgress, TestName } from '../types';

const STORAGE_KEY = 'psychometric_tool_data';

export const storage = {
  // Initialize or get student data from localStorage
  getStudentData(): StudentData | null {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return null;
    }
  },

  // Save student data to localStorage
  setStudentData(data: StudentData): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error writing to localStorage:', error);
    }
  },

  // Initialize new student session with UUID
  initializeStudent(): StudentData {
    const uuid = crypto.randomUUID();
    const data: StudentData = {
      uuid,
      overallStatus: 'test_in_progress',
      testProgress: {
        '16Personalities': undefined,
        'HIGH5': undefined,
        'Big Five': undefined,
        'RIASEC': undefined,
      },
    };
    this.setStudentData(data);
    return data;
  },

  // Update test progress
  updateTestProgress(testName: TestName, progress: Partial<TestProgress>): void {
    const data = this.getStudentData();
    if (!data) return;

    const existingProgress = data.testProgress[testName];
    data.testProgress[testName] = {
      ...existingProgress,
      ...progress,
      testName,
    } as TestProgress;

    this.setStudentData(data);
  },

  // Save individual question response
  saveResponse(testName: TestName, questionId: string, value: number): void {
    const data = this.getStudentData();
    if (!data) return;

    const progress = data.testProgress[testName];
    if (!progress) return;

    progress.responses[questionId] = value;
    this.setStudentData(data);
  },

  // Mark test as completed
  completeTest(testName: TestName): void {
    const data = this.getStudentData();
    if (!data) return;

    const progress = data.testProgress[testName];
    if (progress) {
      progress.completedAt = new Date().toISOString();
      this.setStudentData(data);
    }
  },

  // Update contact information
  updateContactInfo(contactData: { studentName: string; parentEmail: string; parentWhatsapp: string }): void {
    const data = this.getStudentData();
    if (!data) return;

    data.studentName = contactData.studentName;
    data.parentEmail = contactData.parentEmail;
    data.parentWhatsapp = contactData.parentWhatsapp;
    data.overallStatus = 'reports_generated';
    this.setStudentData(data);
  },

  // Check if all tests are completed
  areAllTestsCompleted(): boolean {
    const data = this.getStudentData();
    if (!data) return false;

    const tests: TestName[] = ['16Personalities', 'HIGH5', 'Big Five', 'RIASEC'];
    return tests.every(testName => {
      const progress = data.testProgress[testName];
      return progress && progress.completedAt;
    });
  },

  // Get completed test count
  getCompletedTestCount(): number {
    const data = this.getStudentData();
    if (!data) return 0;

    const tests: TestName[] = ['16Personalities', 'HIGH5', 'Big Five', 'RIASEC'];
    return tests.filter(testName => {
      const progress = data.testProgress[testName];
      return progress && progress.completedAt;
    }).length;
  },

  // Clear all data (for testing)
  clearData(): void {
    localStorage.removeItem(STORAGE_KEY);
  },

  // Reset individual test progress (for testing)
  resetTest(testName: TestName): void {
    const data = this.getStudentData();
    if (!data) return;

    data.testProgress[testName] = undefined;
    this.setStudentData(data);
  },
};
