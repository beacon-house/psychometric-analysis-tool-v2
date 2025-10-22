// Universal Test Question component
// Displays question text with Likert scale for answering

import React from 'react';
import { LikertScale } from './LikertScale';
import '../styles/TestQuestion.css';

interface TestQuestionProps {
  questionNumber: number;
  totalQuestions: number;
  questionText: string;
  responseOptions: Array<{ value: number; label: string; shortLabel: string }>;
  selectedValue?: number;
  onAnswer: (value: number) => void;
  onPrevious?: () => void;
  showPrevious?: boolean;
}

export const TestQuestion: React.FC<TestQuestionProps> = ({
  questionNumber,
  totalQuestions,
  questionText,
  responseOptions,
  selectedValue,
  onAnswer,
  onPrevious,
  showPrevious = true,
}) => {
  return (
    <div className="test-question-container">
      <div className="question-header">
        <div className="question-progress">
          <span className="question-number">Question {questionNumber}</span>
          <span className="question-divider">/</span>
          <span className="question-total">{totalQuestions}</span>
        </div>
        <div className="progress-bar-container">
          <div
            className="progress-bar-fill"
            style={{ width: `${(questionNumber / totalQuestions) * 100}%` }}
          />
        </div>
      </div>

      <div className="question-content">
        <h2 className="question-text">{questionText}</h2>

        <div className="question-response-section">
          <LikertScale
            options={responseOptions}
            selectedValue={selectedValue}
            onSelect={onAnswer}
          />
        </div>

        {showPrevious && questionNumber > 1 && (
          <button
            className="previous-button"
            onClick={onPrevious}
            type="button"
          >
            ← Previous Question
          </button>
        )}
      </div>
    </div>
  );
};
