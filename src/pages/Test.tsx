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

  // Load existing progress on mount
  useEffect(() => {
    const studentData = storage.getStudentData();
    if (!studentData) {
      const newData = storage.initializeStudent();
      storage.setStudentData(newData);
    }

    const progress = studentData?.testProgress[testName];
    if (progress && !progress.completedAt) {
      setResponses(progress.responses || {});
      const lastAnswered = Object.keys(progress.responses || {}).length;
      setCurrentQuestionIndex(lastAnswered);
    } else if (!progress) {
      // Initialize test progress
      storage.updateTestProgress(testName, {
        testName,
        currentQuestion: 0,
        totalQuestions: questions.length,
        responses: {},
        startedAt: new Date().toISOString(),
      });
    }
  }, [testName, questions.length]);

  const currentQuestion = questions[currentQuestionIndex];
  const selectedValue = currentQuestion ? responses[`q${currentQuestion.id}`] : undefined;

  const handleAnswer = async (value: number) => {
    if (!currentQuestion) return;

    const questionKey = `q${currentQuestion.id}`;
    const updatedResponses = {
      ...responses,
      [questionKey]: value,
    };

    setResponses(updatedResponses);

    // Save to localStorage
    storage.saveResponse(testName, questionKey, value);
    storage.updateTestProgress(testName, {
      currentQuestion: currentQuestionIndex + 1,
      totalQuestions: questions.length,
      responses: updatedResponses,
      testName,
      startedAt: storage.getStudentData()?.testProgress[testName]?.startedAt || new Date().toISOString(),
    });

    // Save to Supabase (background, don't block)
    const studentData = storage.getStudentData();
    if (studentData) {
      supabase
        .from('test_responses')
        .upsert({
          student_id: studentData.uuid,
          test_name: testName,
          test_status: 'in_progress',
          responses: updatedResponses,
        })
        .then(({ error }) => {
          if (error) console.error('Error saving to Supabase:', error);
        });
    }

    // Check if this is the last question
    if (currentQuestionIndex === questions.length - 1) {
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
    setIsSubmitting(true);

    try {
      const studentData = storage.getStudentData();
      if (!studentData) throw new Error('Student data not found');

      // Evaluate test results
      const evaluation = evaluateFunction(finalResponses);

      // Mark test as completed in localStorage
      storage.completeTest(testName);

      // Save results to Supabase
      await supabase.from('test_results').upsert({
        student_id: studentData.uuid,
        test_name: testName,
        result_data: evaluation,
        completed_at: new Date().toISOString(),
      });

      // Update test_responses to completed
      await supabase
        .from('test_responses')
        .upsert({
          student_id: studentData.uuid,
          test_name: testName,
          test_status: 'completed',
          responses: finalResponses,
          completed_at: new Date().toISOString(),
        });

      // Navigate to results page
      navigate(`/test/${testName.toLowerCase().replace(/\s+/g, '-')}/results`, {
        state: { evaluation },
      });
    } catch (error) {
      console.error('Error completing test:', error);
      alert('There was an error saving your results. Please try again.');
    } finally {
      setIsSubmitting(false);
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
