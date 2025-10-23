// Universal Test Page component
// Manages test-taking flow with question progression and response storage

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TestQuestion } from '../components/TestQuestion';
import { ContactModal } from '../components/ContactModal';
import { storage } from '../lib/storage';
import { supabase } from '../lib/supabase';
import { TEST_ORDER } from '../lib/tests';
import type { TestName, ContactFormData } from '../types';
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
  const [showContactModal, setShowContactModal] = useState(false);

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
        // Initialize test progress
        storage.updateTestProgress(testName, {
          testName,
          currentQuestion: 0,
          totalQuestions: questions.length,
          responses: {},
          startedAt: new Date().toISOString(),
        });
      }
    };

    initializeTestSession();
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
      console.log(`[${testName}] Saving response to Supabase:`, {
        student_id: studentData.uuid,
        test_name: testName,
        question: questionKey,
        total_responses: Object.keys(updatedResponses).length,
      });
      supabase
        .from('test_responses')
        .upsert({
          student_id: studentData.uuid,
          test_name: testName,
          test_status: 'in_progress',
          responses: updatedResponses,
        })
        .then(({ error }) => {
          if (error) {
            console.error(`[${testName}] Error saving to Supabase:`, error);
          } else {
            console.log(`[${testName}] Successfully saved response to Supabase`);
          }
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
      console.log(`[${testName}] Evaluating test with ${Object.keys(finalResponses).length} responses`);
      const evaluation = evaluateFunction(finalResponses);
      console.log(`[${testName}] Evaluation complete:`, evaluation);

      // Mark test as completed in localStorage
      storage.completeTest(testName);
      console.log(`[${testName}] Marked as completed in localStorage`);

      // Save results to Supabase
      console.log(`[${testName}] Saving results to Supabase test_results table`);
      const { error: resultsError } = await supabase.from('test_results').upsert({
        student_id: studentData.uuid,
        test_name: testName,
        result_data: evaluation,
        completed_at: new Date().toISOString(),
      });
      if (resultsError) {
        console.error(`[${testName}] Error saving results:`, resultsError);
      } else {
        console.log(`[${testName}] Successfully saved results to test_results`);
      }

      // Update test_responses to completed
      console.log(`[${testName}] Updating test_responses to completed status`);
      const { error: responsesError } = await supabase
        .from('test_responses')
        .upsert({
          student_id: studentData.uuid,
          test_name: testName,
          test_status: 'completed',
          responses: finalResponses,
          completed_at: new Date().toISOString(),
        });
      if (responsesError) {
        console.error(`[${testName}] Error updating test_responses:`, responsesError);
      } else {
        console.log(`[${testName}] Successfully updated test_responses`);
      }

      // Check if this is RIASEC - if so, always show contact modal
      const isRIASEC = testName === 'RIASEC';

      if (isRIASEC) {
        // For RIASEC, always show the contact modal after completion
        // Do not show results until after contact details are submitted and LLM report is generated
        console.log(`[${testName}] Test completed, showing contact modal for career report`);
        setShowContactModal(true);
      } else {
        // For other tests, navigate directly to results page
        const resultsRoute = `/test/${testName.toLowerCase().replace(/\s+/g, '-')}/results`;
        console.log(`[${testName}] Navigating to results page:`, resultsRoute);
        navigate(resultsRoute, {
          state: { evaluation },
        });
      }
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

  const handleContactSubmit = async (formData: ContactFormData) => {
    const studentData = storage.getStudentData();
    if (!studentData) return;

    setIsSubmitting(true);

    try {
      // Update local storage
      storage.updateContactInfo(formData);

      // Save to Supabase
      const { error: studentError } = await supabase
        .from('students')
        .upsert({
          id: studentData.uuid,
          student_name: formData.studentName,
          parent_email: formData.parentEmail,
          parent_whatsapp: formData.parentWhatsapp,
          overall_status: 'contact_submitted',
          submission_timestamp: new Date().toISOString(),
        });

      if (studentError) throw studentError;

      // Save all test responses to database
      for (const testName of TEST_ORDER) {
        const progress = studentData.testProgress[testName];
        if (progress && progress.completedAt) {
          await supabase.from('test_responses').upsert({
            student_id: studentData.uuid,
            test_name: testName,
            test_status: 'completed',
            responses: progress.responses,
            completed_at: progress.completedAt,
          });
        }
      }

      // Trigger webhook for Make.com to generate LLM career report
      const webhookUrl = import.meta.env.VITE_WEBHOOK_URL;
      if (webhookUrl) {
        console.log('[ContactModal] Triggering webhook for LLM report generation');
        await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            studentId: studentData.uuid,
            studentName: formData.studentName,
            parentEmail: formData.parentEmail,
            parentWhatsapp: formData.parentWhatsapp,
            completedTests: TEST_ORDER,
            timestamp: new Date().toISOString(),
          }),
        });
      }

      // Navigate to next steps page where LLM report will be generated/displayed
      console.log('[ContactModal] Contact info submitted, navigating to next steps');
      navigate('/next-steps');
    } catch (error) {
      console.error('Error submitting contact information:', error);
      alert('There was an error submitting your information. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
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

      <ContactModal
        isOpen={showContactModal && !isSubmitting}
        onSubmit={handleContactSubmit}
        isDismissable={false}
        isCareerReport={true}
      />
    </div>
  );
};
