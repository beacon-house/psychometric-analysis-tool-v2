// RIASEC Career Interest Test Results Page
// Displays Holland Code, hexagonal diagram, and theme scores with career guidance

import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { storage } from '../lib/storage';
import type { RIASECEvaluationResult } from '../lib/tests/riasec-evaluator';
import '../styles/ResultsRIASEC.css';

export const ResultsRIASEC: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [evaluation, setEvaluation] = useState<RIASECEvaluationResult | null>(
    location.state?.evaluation || null
  );
  const [isLoading, setIsLoading] = useState(!location.state?.evaluation);

  useEffect(() => {
    if (!evaluation) {
      loadResults();
    }
  }, [evaluation]);

  const loadResults = async () => {
    try {
      const studentData = storage.getStudentData();
      if (!studentData) {
        navigate('/');
        return;
      }

      const { data, error } = await supabase
        .from('test_results')
        .select('result_data')
        .eq('student_id', studentData.uuid)
        .eq('test_name', 'RIASEC')
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setEvaluation(data.result_data as RIASECEvaluationResult);
      } else {
        navigate('/');
      }
    } catch (error) {
      console.error('Error loading results:', error);
      alert('Error loading results. Please try again.');
      navigate('/');
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinue = () => {
    navigate('/');
  };

  if (isLoading) {
    return (
      <div className="results-page-riasec">
        <div className="results-loading">
          <div className="loading-spinner"></div>
          <p>Loading your results...</p>
        </div>
      </div>
    );
  }

  if (!evaluation) {
    return null;
  }

  const { hollandCode, topThreeThemes, allScores } = evaluation;

  // Theme positions on hexagon (clockwise from top)
  const hexagonPositions: Record<string, { x: number; y: number; angle: number }> = {
    Realistic: { x: 50, y: 5, angle: 0 },
    Investigative: { x: 86.6, y: 30, angle: 60 },
    Artistic: { x: 86.6, y: 70, angle: 120 },
    Social: { x: 50, y: 95, angle: 180 },
    Enterprising: { x: 13.4, y: 70, angle: 240 },
    Conventional: { x: 13.4, y: 30, angle: 300 },
  };

  return (
    <div className="results-page-riasec">
      <div className="results-container-riasec">
        <div className="results-header-riasec">
          <h1 className="results-title-riasec">Your Career Interest Profile</h1>
          <div className="holland-code-display">
            <span className="holland-code-label">Holland Code:</span>
            <span className="holland-code-value">{hollandCode}</span>
          </div>
          <p className="results-subtitle-riasec">
            Based on the RIASEC model, here are your career interests across six work personality themes
          </p>
        </div>

        <div className="hexagon-section">
          <h2 className="section-title-riasec">Interest Profile Visualization</h2>
          <div className="hexagon-container">
            <svg viewBox="0 0 100 100" className="hexagon-svg">
              {/* Hexagon outline */}
              <polygon
                points="50,10 85,27.5 85,72.5 50,90 15,72.5 15,27.5"
                className="hexagon-outline"
              />

              {/* Grid lines from center */}
              <line x1="50" y1="50" x2="50" y2="10" className="hexagon-grid-line" />
              <line x1="50" y1="50" x2="85" y2="27.5" className="hexagon-grid-line" />
              <line x1="50" y1="50" x2="85" y2="72.5" className="hexagon-grid-line" />
              <line x1="50" y1="50" x2="50" y2="90" className="hexagon-grid-line" />
              <line x1="50" y1="50" x2="15" y2="72.5" className="hexagon-grid-line" />
              <line x1="50" y1="50" x2="15" y2="27.5" className="hexagon-grid-line" />

              {/* Score polygon */}
              <polygon
                points={allScores
                  .map((score) => {
                    const pos = hexagonPositions[score.theme];
                    if (!pos) return '50,50';
                    const radius = (score.normalizedScore / 32) * 40;
                    const x = 50 + radius * Math.sin((pos.angle * Math.PI) / 180);
                    const y = 50 - radius * Math.cos((pos.angle * Math.PI) / 180);
                    return `${x},${y}`;
                  })
                  .join(' ')}
                className="hexagon-score-fill"
              />

              {/* Theme labels and scores */}
              {allScores.map((score) => {
                const pos = hexagonPositions[score.theme];
                if (!pos) return null;
                return (
                  <g key={score.theme}>
                    <text
                      x={pos.x}
                      y={pos.y}
                      className="hexagon-label"
                      textAnchor="middle"
                    >
                      {score.theme[0]}
                    </text>
                    <text
                      x={pos.x}
                      y={pos.y + 5}
                      className="hexagon-score"
                      textAnchor="middle"
                    >
                      {score.normalizedScore}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
          <div className="hexagon-legend">
            {allScores.map((score) => (
              <div key={score.theme} className="legend-item">
                <span className="legend-letter">{score.theme[0]}</span>
                <span className="legend-name">{score.theme}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="top-themes-section">
          <h2 className="section-title-riasec">Your Top Three Career Interest Areas</h2>
          <div className="top-themes-grid">
            {topThreeThemes.map((theme) => (
              <div key={theme.rank} className="top-theme-card">
                <div className="theme-rank-badge">#{theme.rank}</div>
                <h3 className="theme-name">{theme.theme}</h3>
                <div className="theme-score-display">{theme.score}/32</div>
                <p className="theme-description">{theme.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="all-scores-section">
          <h2 className="section-title-riasec">Complete Interest Profile</h2>
          <div className="scores-list">
            {allScores.map((score, index) => (
              <div key={score.theme} className="score-item">
                <div className="score-header">
                  <div className="score-rank">#{index + 1}</div>
                  <h3 className="score-theme-name">{score.theme}</h3>
                  <div className="score-value">{score.normalizedScore}/32</div>
                </div>
                <div className="score-bar-container">
                  <div
                    className="score-bar-fill"
                    style={{ width: `${(score.normalizedScore / 32) * 100}%` }}
                  />
                </div>
                <p className="score-interpretation">{score.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="results-actions-riasec">
          <button className="continue-button-riasec" onClick={handleContinue}>
            Continue to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};
