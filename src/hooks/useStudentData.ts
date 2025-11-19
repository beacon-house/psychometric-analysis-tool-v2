// Custom hook for managing student data and test progress
// Handles localStorage synchronization and state management

import { useState, useEffect } from 'react';
import { storage } from '../lib/storage';
import type { StudentData, TestName } from '../types';

export const useStudentData = () => {
  const [studentData, setStudentData] = useState<StudentData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStudentData = () => {
      const data = storage.getStudentData();
      setStudentData(data);
      setIsLoading(false);
    };

    loadStudentData();
  }, []);

  const updateProgress = (testName: TestName, currentQuestion: number, totalQuestions: number) => {
    if (!studentData) return;

    const existingProgress = studentData.testProgress[testName];

    storage.updateTestProgress(testName, {
      testName,
      currentQuestion,
      totalQuestions,
      responses: existingProgress?.responses || {},
      startedAt: existingProgress?.startedAt || new Date().toISOString(),
    });

    const updatedData = storage.getStudentData();
    if (updatedData) {
      setStudentData(updatedData);
    }
  };

  const saveResponse = (testName: TestName, questionId: string, value: number) => {
    storage.saveResponse(testName, questionId, value);

    const updatedData = storage.getStudentData();
    if (updatedData) {
      setStudentData(updatedData);
    }
  };

  const completeTest = (testName: TestName) => {
    storage.completeTest(testName);

    const updatedData = storage.getStudentData();
    if (updatedData) {
      setStudentData(updatedData);
    }
  };


  const getCompletedCount = (): number => {
    return storage.getCompletedTestCount();
  };

  const areAllTestsCompleted = (): boolean => {
    return storage.areAllTestsCompleted();
  };

  return {
    studentData,
    isLoading,
    updateProgress,
    saveResponse,
    completeTest,
    getCompletedCount,
    areAllTestsCompleted,
  };
};
