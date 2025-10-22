// Test card component for displaying individual test information
// Shows test details with status indicators and lock state

import React from 'react';
import type { TestInfo } from '../types';
import '../styles/TestCard.css';

interface TestCardProps {
  test: TestInfo;
  onStart: () => void;
}

export const TestCard: React.FC<TestCardProps> = ({ test, onStart }) => {
  const isLocked = test.status === 'locked';
  const isCompleted = test.status === 'completed';
  const isInProgress = test.status === 'in_progress';

  const getStatusBadge = () => {
    if (isCompleted) {
      return <span className="status-badge completed">Completed ✓</span>;
    }
    if (isInProgress) {
      return <span className="status-badge in-progress">In Progress</span>;
    }
    if (isLocked) {
      return <span className="status-badge locked">🔒 Locked</span>;
    }
    return null;
  };

  return (
    <div className={`test-card ${isLocked ? 'locked' : ''}`}>
      <div className="test-card-header">
        <div className="test-icon">{test.icon}</div>
        {getStatusBadge()}
      </div>

      <h3 className="test-title">{test.title}</h3>
      <p className="test-description">{test.description}</p>

      <div className="test-meta">
        <span className="test-meta-item">
          <span className="meta-icon">📝</span>
          {test.questionCount} questions
        </span>
        <span className="test-meta-item">
          <span className="meta-icon">⏱️</span>
          {test.estimatedTime}
        </span>
      </div>

      <button
        className={`test-button ${isCompleted ? 'completed-button' : ''}`}
        onClick={onStart}
        disabled={isLocked}
      >
        {isCompleted ? 'Review' : isInProgress ? 'Continue' : 'Start Test'}
      </button>

      {isLocked && (
        <p className="locked-message">
          Complete the first 3 tests to unlock this assessment
        </p>
      )}
    </div>
  );
};
