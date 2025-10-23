// Home page component - Test selection dashboard
// Shows all available tests with progress tracking and contact modal

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { TestCard } from '../components/TestCard';
import { ProgressIndicator } from '../components/ProgressIndicator';
import { ContactModal } from '../components/ContactModal';
import { useStudentData } from '../hooks/useStudentData';
import { storage } from '../lib/storage';
import { supabase } from '../lib/supabase';
import { TEST_METADATA, TEST_ORDER } from '../lib/tests';
import type { TestInfo, TestName, ContactFormData, TestStatus } from '../types';
import '../styles/Home.css';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const {
    studentData,
    isLoading,
    updateContactInfo,
    getCompletedCount,
    areAllTestsCompleted,
  } = useStudentData();

  const [showContactModal, setShowContactModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && areAllTestsCompleted() && !studentData?.parentEmail) {
      setShowContactModal(true);
    }
  }, [isLoading, studentData, areAllTestsCompleted]);

  const getTestStatus = (testName: TestName): TestStatus => {
    if (!studentData) return 'available';

    const progress = studentData.testProgress[testName];

    if (testName === 'RIASEC') {
      const completedCount = getCompletedCount();
      if (completedCount < 3) return 'locked';
    }

    if (progress?.completedAt) return 'completed';
    if (progress && !progress.completedAt) return 'in_progress';
    return 'available';
  };

  const getTests = (): TestInfo[] => {
    return TEST_ORDER.map(testName => ({
      ...TEST_METADATA[testName],
      status: getTestStatus(testName),
    }));
  };

  const handleResetProgress = () => {
    if (window.confirm('Are you sure you want to reset all test progress? This action cannot be undone.')) {
      storage.clearData();
      window.location.reload();
    }
  };

  const handleStartTest = (testName: TestName) => {
    if (testName === '16Personalities') {
      navigate('/test/16personalities');
    } else if (testName === 'HIGH5') {
      navigate('/test/high5');
    } else if (testName === 'Big Five') {
      navigate('/test/big-five');
    } else {
      alert(`Test interface for ${testName} will be implemented soon.`);
    }
  };

  const handleContactSubmit = async (formData: ContactFormData) => {
    if (!studentData) return;

    setIsSubmitting(true);

    try {
      // Update local storage
      updateContactInfo(formData);

      // Save to Supabase
      const { error: studentError } = await supabase
        .from('students')
        .upsert({
          id: studentData.uuid,
          student_name: formData.studentName,
          parent_email: formData.parentEmail,
          parent_whatsapp: formData.parentWhatsapp,
          overall_status: 'reports_generated',
          submission_timestamp: new Date().toISOString(),
        });

      if (studentError) throw studentError;

      // Save test responses to database
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

      // Trigger webhook for Make.com
      const webhookUrl = import.meta.env.VITE_WEBHOOK_URL;
      if (webhookUrl) {
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

      setShowContactModal(false);
      alert(
        `Thank you! Your reports will be sent to ${formData.parentEmail} and ${formData.parentWhatsapp} shortly.`
      );
    } catch (error) {
      console.error('Error submitting contact information:', error);
      alert('There was an error submitting your information. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading your progress...</p>
      </div>
    );
  }

  const completedCount = getCompletedCount();
  const tests = getTests();

  return (
    <div className="home-page">
      <Header />

      <main className="main-content">
        <div className="hero-section">
          <h1 className="hero-title">Discover Your True Potential</h1>
          <p className="hero-description">
            Complete four comprehensive psychometric assessments and receive detailed analysis reports
            to guide your academic and career journey.
          </p>
        </div>

        <ProgressIndicator completed={completedCount} total={4} />

        <div style={{ textAlign: 'center', margin: '20px 0' }}>
          <button
            onClick={handleResetProgress}
            style={{
              padding: '8px 16px',
              fontSize: '14px',
              backgroundColor: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '500',
            }}
          >
            Reset All Progress (Temporary)
          </button>
        </div>

        <div className="tests-grid">
          {tests.map(test => (
            <TestCard
              key={test.id}
              test={test}
              onStart={() => handleStartTest(test.id)}
            />
          ))}
        </div>
      </main>

      <ContactModal
        isOpen={showContactModal && !isSubmitting}
        onSubmit={handleContactSubmit}
      />
    </div>
  );
};
