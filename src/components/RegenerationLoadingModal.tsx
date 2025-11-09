// Dynamic Loading Modal for Report Regeneration
// Provides engaging feedback during the report regeneration process

import React, { useState, useEffect } from 'react';
import '../styles/RegenerationLoadingModal.css';

interface RegenerationLoadingModalProps {
  sectionsCount: number;
}

interface LoadingStage {
  id: number;
  title: string;
  description: string;
  icon: string;
  duration: number;
}

const LOADING_STAGES: LoadingStage[] = [
  {
    id: 1,
    title: 'Analyzing Test Results',
    description: 'Processing personality assessments and career interest data...',
    icon: '🔍',
    duration: 8000,
  },
  {
    id: 2,
    title: 'Generating Personality Insights',
    description: 'Creating comprehensive personality profiles and behavioral patterns...',
    icon: '🧠',
    duration: 10000,
  },
  {
    id: 3,
    title: 'Evaluating Career Domains',
    description: 'Analyzing fit across business, STEM, liberal arts, and interdisciplinary fields...',
    icon: '💼',
    duration: 12000,
  },
  {
    id: 4,
    title: 'Identifying Strengths',
    description: 'Mapping HIGH5 strengths to career pathways and opportunities...',
    icon: '⭐',
    duration: 10000,
  },
  {
    id: 5,
    title: 'Synthesizing Recommendations',
    description: 'Combining insights from all assessments for comprehensive guidance...',
    icon: '🎯',
    duration: 8000,
  },
  {
    id: 6,
    title: 'Finalizing Report',
    description: 'Creating actionable next steps and career pathway recommendations...',
    icon: '✨',
    duration: 7000,
  },
];

export const RegenerationLoadingModal: React.FC<RegenerationLoadingModalProps> = ({
  sectionsCount,
}) => {
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    const stageTimer = setInterval(() => {
      setCurrentStageIndex((prev) => {
        if (prev < LOADING_STAGES.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, LOADING_STAGES[currentStageIndex]?.duration || 10000);

    return () => clearInterval(stageTimer);
  }, [currentStageIndex]);

  useEffect(() => {
    const timeCounter = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timeCounter);
  }, []);

  const currentStage = LOADING_STAGES[currentStageIndex];
  const progress = ((currentStageIndex + 1) / LOADING_STAGES.length) * 100;

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const estimatedTimeRemaining = Math.max(0, 120 - elapsedTime);

  return (
    <div className="regeneration-loading-overlay">
      <div className="regeneration-loading-content">
        <div className="loading-header">
          <h2>Regenerating Report Sections</h2>
          <p className="sections-count">Processing {sectionsCount} section{sectionsCount !== 1 ? 's' : ''}</p>
        </div>

        <div className="loading-body">
          <div className="stage-indicator">
            <div className="stage-icon">{currentStage.icon}</div>
            <h3 className="stage-title">{currentStage.title}</h3>
            <p className="stage-description">{currentStage.description}</p>
          </div>

          <div className="progress-container">
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="progress-info">
              <span className="stage-counter">
                Stage {currentStageIndex + 1} of {LOADING_STAGES.length}
              </span>
              <span className="progress-percentage">{Math.round(progress)}%</span>
            </div>
          </div>

          <div className="stage-timeline">
            {LOADING_STAGES.map((stage, index) => (
              <div
                key={stage.id}
                className={`timeline-dot ${
                  index < currentStageIndex
                    ? 'completed'
                    : index === currentStageIndex
                    ? 'active'
                    : 'pending'
                }`}
                title={stage.title}
              >
                {index < currentStageIndex ? '✓' : stage.icon}
              </div>
            ))}
          </div>

          <div className="time-info">
            <div className="time-stat">
              <span className="time-label">Elapsed</span>
              <span className="time-value">{formatTime(elapsedTime)}</span>
            </div>
            <div className="time-stat">
              <span className="time-label">Est. Remaining</span>
              <span className="time-value">{formatTime(estimatedTimeRemaining)}</span>
            </div>
          </div>

          <div className="info-tips">
            <div className="tip-card">
              <div className="tip-icon">💡</div>
              <div className="tip-content">
                <p className="tip-title">AI-Powered Analysis</p>
                <p className="tip-text">
                  Our advanced AI reviews comprehensive test data to generate personalized career insights.
                </p>
              </div>
            </div>
          </div>

          <div className="loading-spinner">
            <div className="spinner-circle"></div>
          </div>
        </div>

        <div className="loading-footer">
          <p className="footer-note">
            This process typically takes 1-3 minutes. Please don't close this window.
          </p>
        </div>
      </div>
    </div>
  );
};
