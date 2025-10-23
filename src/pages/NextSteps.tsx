// Post-contact submission placeholder screen
// Displayed after user submits contact information following RIASEC test completion

import React from 'react';
import { Header } from '../components/Header';
import { storage } from '../lib/storage';

export const NextSteps: React.FC = () => {
  const studentData = storage.getStudentData();

  return (
    <div className="next-steps-page">
      <Header />
      <main className="next-steps-content">
        <div className="next-steps-container">
          <div className="success-icon">✓</div>
          <h1 className="next-steps-title">Thank You!</h1>
          <p className="next-steps-message">
            Your contact information has been successfully submitted.
          </p>
          {studentData?.parentEmail && (
            <p className="next-steps-detail">
              Your comprehensive psychometric analysis reports will be sent to{' '}
              <strong>{studentData.parentEmail}</strong> and WhatsApp number{' '}
              <strong>{studentData.parentWhatsapp}</strong> shortly.
            </p>
          )}
          <p className="next-steps-info">
            Our team will process your results and prepare your personalized career guidance reports.
            You will receive them within the next 24-48 hours.
          </p>
        </div>
      </main>
    </div>
  );
};
