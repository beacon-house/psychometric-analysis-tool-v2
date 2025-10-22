// Progress indicator component for overall test completion
// Shows visual progress bar and completion count

import React from 'react';
import '../styles/ProgressIndicator.css';

interface ProgressIndicatorProps {
  completed: number;
  total: number;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({ completed, total }) => {
  const percentage = Math.round((completed / total) * 100);

  return (
    <div className="progress-indicator">
      <div className="progress-header">
        <h3 className="progress-title">Your Progress</h3>
        <span className="progress-count">
          {completed} of {total} tests completed
        </span>
      </div>

      <div className="progress-bar-container">
        <div
          className="progress-bar-fill"
          style={{ width: `${percentage}%` }}
        />
      </div>

      <p className="progress-description">
        {completed === total
          ? "Congratulations! You've completed all tests. Please provide your contact information to receive your comprehensive reports."
          : `Keep going! Complete all ${total} tests to unlock your personalized psychometric analysis.`
        }
      </p>
    </div>
  );
};
