// Universal Test Page component
// Manages test-taking flow with question progression and response storage

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TestQuestion } from '../components/TestQuestion';
import { storage } from '../lib/storage';
import { supabase } from '../lib/supabase';
import type { TestName } from '../types';
import '../styles/Test.css';

interface TestPageProps {
  testName: TestName;
  questions: Array<{ id: number; text: string }>;
  responseScale: Array<{ value: number; label: string; shortLabel: string }>;
  evaluateFunction: (responses: Record<string, number>) => any;
}

export const Test: React.FC<TestPageProps> = ({
  testName,
  questions,
  responseScale,
  evaluateFunction,
}) => {
  const navigate = useNavigate();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [lastAnswerTime, setLastAnswerTime] = useState<number>(0);
  const [completionInProgress, setCompletionInProgress] = useState(false);

  // Load existing progress on mount
  useEffect(() => {
    const initializeTestSession = async () => {
      let studentData = storage.getStudentData();
      if (!studentData) {
        const newData = storage.initializeStudent();
        storage.setStudentData(newData);
        studentData = newData;

        // Create student record in Supabase
        try {
          await supabase.from('students').insert({
            id: newData.uuid,
            overall_status: newData.overallStatus,
          });
        } catch (error) {
          console.error('Error creating student in Supabase:', error);
        }
      }

      const progress = studentData?.testProgress[testName];
      if (progress && !progress.completedAt) {
        setResponses(progress.responses || {});
        const lastAnswered = Object.keys(progress.responses || {}).length;
        setCurrentQuestionIndex(lastAnswered);
      } else if (!progress) {
        // Initialize test progress in localStorage
        storage.updateTestProgress(testName, {
          testName,
          currentQuestion: 0,
          totalQuestions: questions.length,
          responses: {},
          startedAt: new Date().toISOString(),
        });

        // Create test_results record with in_progress status (database write only on test start)
        try {
          await supabase.from('test_results').upsert({
            student_id: studentData.uuid,
            test_name: testName,
            test_status: 'in_progress',
            result_data: {},
            completed_at: null,
          });
        } catch (error) {
          console.error('Error creating test_results record:', error);
        }
      }
    };

    initializeTestSession();
  }, [testName, questions.length]);

  const currentQuestion = questions[currentQuestionIndex];
  const selectedValue = currentQuestion ? responses[`q${currentQuestion.id}`] : undefined;

  const handleAnswer = async (value: number) => {
    if (!currentQuestion) return;

    // Prevent rapid successive clicks (debounce)
    const now = Date.now();
    if (now - lastAnswerTime < 200) {
      return;
    }
    setLastAnswerTime(now);

    // Prevent submission if already in progress
    if (completionInProgress) {
      return;
    }

    const questionKey = `q${currentQuestion.id}`;
    const updatedResponses = {
      ...responses,
      [questionKey]: value,
    };

    setResponses(updatedResponses);

    // Save to localStorage only during test-taking
    storage.saveResponse(testName, questionKey, value);
    storage.updateTestProgress(testName, {
      currentQuestion: currentQuestionIndex + 1,
      totalQuestions: questions.length,
      responses: updatedResponses,
      testName,
      startedAt: storage.getStudentData()?.testProgress[testName]?.startedAt || new Date().toISOString(),
    });

    // Check if this is the last question
    if (currentQuestionIndex === questions.length - 1) {
      setCompletionInProgress(true);
      await handleTestCompletion(updatedResponses);
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleTestCompletion = async (finalResponses: Record<string, number>) => {
    // Double-check to prevent concurrent executions
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    try {
      const studentData = storage.getStudentData();
      if (!studentData) throw new Error('Student data not found');

      // Evaluate test results
      const evaluation = evaluateFunction(finalResponses);

      // Mark test as completed in localStorage
      storage.completeTest(testName);

      // Save final results to Supabase - single atomic operation with conflict resolution
      const { error: resultsError } = await supabase.from('test_results').upsert({
        student_id: studentData.uuid,
        test_name: testName,
        test_status: 'completed',
        result_data: evaluation,
        completed_at: new Date().toISOString(),
      });

      if (resultsError) {
        console.error(`[${testName}] Error saving results:`, resultsError);
        // Check if it's a constraint violation (might indicate concurrent request)
        if (resultsError.code === '23505') {
          console.warn(`[${testName}] Duplicate key constraint - test already submitted`);
          // Continue anyway as the data is already saved
        } else {
          throw new Error('Failed to save test results to database');
        }
      }

      // Navigate to results page for all tests (including RIASEC)
      const resultsRoute = `/test/${testName.toLowerCase().replace(/\s+/g, '-')}/results`;
      navigate(resultsRoute, {
        state: { evaluation },
      });
    } catch (error) {
      console.error('Error completing test:', error);
      setIsSubmitting(false);
      setCompletionInProgress(false);
      const retry = window.confirm(
        'There was an error saving your results to the database. Would you like to retry? (Click Cancel to continue anyway)'
      );
      if (retry) {
        // Retry the completion
        const studentData = storage.getStudentData();
        if (studentData) {
          const responses = studentData.testProgress[testName]?.responses;
          if (responses) {
            return handleTestCompletion(responses);
          }
        }
      } else {
        // User chose to continue without saving to database
        const evaluation = evaluateFunction(finalResponses);
        const resultsRoute = `/test/${testName.toLowerCase().replace(/\s+/g, '-')}/results`;
        navigate(resultsRoute, {
          state: { evaluation },
        });
      }
      return;
    } finally {
      setIsSubmitting(false);
      setCompletionInProgress(false);
    }
  };

  const handleSaveAndExit = () => {
    setShowExitModal(true);
  };

  const confirmExit = () => {
    navigate('/');
  };

  if (isSubmitting) {
    return (
      <div className="test-page">
        <div className="test-loading">
          <div className="loading-spinner"></div>
          <p>Processing your responses...</p>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="test-page">
        <div className="test-loading">
          <p>Loading test...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="test-page">
      <button className="save-exit-button" onClick={handleSaveAndExit}>
        Save & Exit
      </button>

      <TestQuestion
        questionNumber={currentQuestionIndex + 1}
        totalQuestions={questions.length}
        questionText={currentQuestion.text}
        responseOptions={responseScale}
        selectedValue={selectedValue}
        onAnswer={handleAnswer}
        onPrevious={handlePrevious}
        showPrevious={currentQuestionIndex > 0}
      />

      {showExitModal && (
        <div className="modal-overlay" onClick={() => setShowExitModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>Save and Exit?</h3>
            <p>Your progress has been saved. You can resume this test anytime.</p>
            <div className="modal-actions">
              <button className="modal-button secondary" onClick={() => setShowExitModal(false)}>
                Continue Test
              </button>
              <button className="modal-button primary" onClick={confirmExit}>
                Exit to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
