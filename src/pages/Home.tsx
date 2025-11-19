// Home page component - Test selection dashboard
// Shows all available tests with progress tracking and contact modal

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { TestCard } from '../components/TestCard';
import { ProgressIndicator } from '../components/ProgressIndicator';
import { RegistrationModal } from '../components/RegistrationModal';
import { useStudentData } from '../hooks/useStudentData';
import { supabase } from '../lib/supabase';
import { storage } from '../lib/storage';
import { TEST_METADATA, TEST_ORDER } from '../lib/tests';
import type { TestInfo, TestName, ContactFormData, TestStatus } from '../types';
import '../styles/Home.css';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const {
    studentData,
    isLoading,
    getCompletedCount,
  } = useStudentData();
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if student is registered on mount
  useEffect(() => {
    if (!isLoading) {
      if (studentData?.verified) {
        setShowRegistrationModal(false);
      } else {
        setShowRegistrationModal(true);
      }
    }
  }, [isLoading, studentData]);

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

  const handleStartTest = (testName: TestName) => {
    const testStatus = getTestStatus(testName);

    // If test is completed, route to results page instead of test page
    if (testStatus === 'completed') {
      if (testName === '16Personalities') {
        navigate('/test/16personalities/results');
      } else if (testName === 'HIGH5') {
        navigate('/test/high5/results');
      } else if (testName === 'Big Five') {
        navigate('/test/big-five/results');
      } else if (testName === 'RIASEC') {
        navigate('/test/riasec/results');
      }
      return;
    }

    // Otherwise, navigate to test page (start or continue)
    if (testName === '16Personalities') {
      navigate('/test/16personalities');
    } else if (testName === 'HIGH5') {
      navigate('/test/high5');
    } else if (testName === 'Big Five') {
      navigate('/test/big-five');
    } else if (testName === 'RIASEC') {
      navigate('/test/riasec');
    } else {
      alert(`Test interface for ${testName} will be implemented soon.`);
    }
  };

  const handleRegistration = async (formData: ContactFormData) => {
    setIsSubmitting(true);
    try {
      const uuid = crypto.randomUUID();

      console.log('[Home] Attempting registration with UUID:', uuid);
      console.log('[Home] Form data:', formData);

      // Create in database FIRST
      const { data, error } = await supabase.from('students').insert({
        id: uuid,
        student_name: formData.studentName,
        parent_email: formData.parentEmail,
        parent_whatsapp: formData.parentWhatsapp,
        overall_status: 'test_in_progress',
      }).select();

      if (error) {
        console.error('[Home] Supabase error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        });
        throw error;
      }

      console.log('[Home] Registration successful:', data);

      // Only after DB success, save to localStorage
      storage.initializeRegisteredStudent(
        formData.studentName,
        formData.parentEmail,
        formData.parentWhatsapp,
        uuid
      );

      setShowRegistrationModal(false);

      // Force re-render by reloading the page
      window.location.reload();
    } catch (error: any) {
      console.error('[Home] Registration failed:', error);
      const errorMessage = error?.message || 'Unknown error';
      alert(`Registration failed: ${errorMessage}\n\nPlease check the console for details.`);
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

        <div className="tests-grid">
          {tests.map(test => {
            const progress = studentData?.testProgress[test.id];
            const completedAt = progress?.completedAt;

            return (
              <TestCard
                key={test.id}
                test={test}
                onStart={() => handleStartTest(test.id)}
                completedAt={completedAt}
              />
            );
          })}
        </div>
      </main>

      <RegistrationModal
        isOpen={showRegistrationModal}
        onSubmit={handleRegistration}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};
