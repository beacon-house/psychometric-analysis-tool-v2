// Big Five (OCEAN) Personality Test Results Page
// Displays trait scores, interpretations, and percentile rankings

import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Header } from '../components/Header';
import { supabase } from '../lib/supabase';
import { storage } from '../lib/storage';
import { evaluateBigFive } from '../lib/tests/big5-evaluator';
import type { EvaluationResultBig5 } from '../lib/tests/big5-evaluator';
import '../styles/ResultsBigFive.css';

export const ResultsBigFive: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [evaluation, setEvaluation] = useState<EvaluationResultBig5 | null>(
    location.state?.evaluation || null
  );
  const [isLoading, setIsLoading] = useState(!location.state?.evaluation);
  const [showDetailedResults, setShowDetailedResults] = useState(false);

  useEffect(() => {
    if (!evaluation) {
      loadResults();
    }
  }, []);

  const loadResults = async () => {
    try {
      const studentData = storage.getStudentData();
      if (!studentData) {
        navigate('/');
        return;
      }

      // First, try to get results from localStorage
      const testProgress = studentData.testProgress['Big Five'];
      if (testProgress && testProgress.completedAt && testProgress.responses) {
        const evaluation = evaluateBigFive(testProgress.responses);
        setEvaluation(evaluation);
        setIsLoading(false);
        return;
      }

      // If not in localStorage, fall back to database
      const { data, error } = await supabase
        .from('test_results')
        .select('result_data')
        .eq('student_id', studentData.uuid)
        .eq('test_name', 'Big Five')
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setEvaluation(data.result_data as EvaluationResultBig5);
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
      <div className="results-page-big5">
        <Header />
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

  const { traitInterpretations } = evaluation;

  // Trait color mapping for visual consistency
  const traitColors: Record<string, string> = {
    'Openness to Experience': '#3498db',
    'Conscientiousness': '#2ecc71',
    'Extraversion': '#f39c12',
    'Agreeableness': '#e74c3c',
    'Emotional Stability': '#9b59b6',
  };

  return (
    <div className="results-page-big5">
      <Header />
      <div className="results-container-big5">
        <div className="results-header-big5">
          <h1 className="results-title-big5">Your Big Five Personality Profile</h1>
          <p className="results-subtitle-big5">
            Based on the OCEAN model, here's your personality across five core dimensions
          </p>
        </div>

        <div className="trait-scores-section">
          <h2 className="section-title-big5">Trait Scores</h2>

          <div className="trait-grid">
            {traitInterpretations.map((trait) => (
              <div key={trait.trait} className="trait-card">
                <div className="trait-card-header">
                  <h3 className="trait-name">{trait.trait}</h3>
                  <span
                    className={`trait-level-badge ${trait.level.toLowerCase().replace(' ', '-')}`}
                  >
                    {trait.level}
                  </span>
                </div>

                <div className="trait-score-display">
                  <div className="percentile-score">{trait.percentileScore}</div>
                  <div className="percentile-label">Percentile</div>
                </div>

                <div className="trait-bar-container">
                  <div className="trait-bar-track">
                    <div
                      className="trait-bar-fill"
                      style={{
                        width: `${trait.percentileScore}%`,
                        backgroundColor: traitColors[trait.trait] || '#95a5a6',
                      }}
                    />
                  </div>
                  <div className="trait-bar-labels">
                    <span>0</span>
                    <span>50</span>
                    <span>100</span>
                  </div>
                </div>

                <p className="trait-description-preview">
                  {trait.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="comparison-section">
          <h2 className="section-title-big5">Score Comparison</h2>
          <div className="comparison-chart">
            {traitInterpretations.map((trait) => (
              <div key={trait.trait} className="comparison-row">
                <div className="comparison-label">{trait.trait.split(' ')[0]}</div>
                <div className="comparison-bar-container">
                  <div
                    className="comparison-bar"
                    style={{
                      width: `${trait.percentileScore}%`,
                      backgroundColor: traitColors[trait.trait] || '#95a5a6',
                    }}
                  >
                    <span className="comparison-value">{trait.percentileScore}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="detailed-results-section">
          <button
            className="toggle-details-button-big5"
            onClick={() => setShowDetailedResults(!showDetailedResults)}
          >
            {showDetailedResults ? 'Hide' : 'Show'} Detailed Trait Descriptions
          </button>

          {showDetailedResults && (
            <div className="detailed-traits-list">
              {traitInterpretations.map((trait) => (
                <div key={trait.trait} className="detailed-trait-item">
                  <div className="detailed-trait-header">
                    <h3 className="detailed-trait-name">{trait.trait}</h3>
                    <div className="detailed-trait-scores">
                      <span className="detailed-score">
                        Percentile: <strong>{trait.percentileScore}</strong>
                      </span>
                      <span className="detailed-score">
                        Raw Score: <strong>{trait.rawScore}/50</strong>
                      </span>
                      <span
                        className={`detailed-level ${trait.level.toLowerCase().replace(' ', '-')}`}
                      >
                        {trait.level}
                      </span>
                    </div>
                  </div>
                  <p className="detailed-trait-description">{trait.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="results-actions-big5">
          <button className="continue-button-big5" onClick={handleContinue}>
            Continue to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};
