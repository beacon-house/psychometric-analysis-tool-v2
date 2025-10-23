// 16 Personalities Test Results Page
// Displays personality type code, dimension scores, and interpretations

import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { storage } from '../lib/storage';
import { evaluate16Personalities } from '../lib/tests/16personalities-evaluator';
import type { EvaluationResult } from '../lib/tests/16personalities-evaluator';
import '../styles/Results16Personalities.css';

export const Results16Personalities: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(
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
      const testProgress = studentData.testProgress['16Personalities'];
      if (testProgress && testProgress.completedAt && testProgress.responses) {
        const evaluation = evaluate16Personalities(testProgress.responses);
        setEvaluation(evaluation);
        setIsLoading(false);
        return;
      }

      // If not in localStorage, fall back to database
      const { data, error } = await supabase
        .from('test_results')
        .select('result_data')
        .eq('student_id', studentData.uuid)
        .eq('test_name', '16Personalities')
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setEvaluation(data.result_data as EvaluationResult);
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
      <div className="results-page">
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

  const { personalityType, dimensionScores, preferences } = evaluation;

  return (
    <div className="results-page">
      <div className="results-container">
        <div className="results-header">
          <h1 className="results-title">Your Personality Type</h1>
          <div className="personality-type-badge">
            <span className="personality-code">{personalityType.fullCode}</span>
          </div>
          <p className="personality-description">{personalityType.description}</p>
        </div>

        <div className="dimension-scores-section">
          <h2 className="section-title">Dimension Scores</h2>

          <div className="dimension-list">
            {Object.entries(dimensionScores).map(([dimension, score]) => (
              <div key={dimension} className="dimension-item">
                <div className="dimension-header">
                  <span className="dimension-name">{dimension}</span>
                  <span className="dimension-value">
                    {score.normalized}% {score.preference}
                  </span>
                </div>

                <div className="dimension-bar-container">
                  <div className="dimension-bar-track">
                    <div
                      className={`dimension-bar-fill ${score.normalized >= 50 ? 'dominant' : 'recessive'}`}
                      style={{ width: `${score.normalized}%` }}
                    />
                    <div className="dimension-bar-midpoint" />
                  </div>
                </div>

                <div className="dimension-clarity">
                  <span className={`clarity-badge ${score.clarityLevel.toLowerCase()}`}>
                    {score.clarityLevel} preference ({score.clarityPercentage}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="detailed-results-section">
          <button
            className="toggle-details-button"
            onClick={() => setShowDetailedResults(!showDetailedResults)}
          >
            {showDetailedResults ? 'Hide' : 'Show'} Detailed Interpretations
          </button>

          {showDetailedResults && (
            <div className="preferences-list">
              {preferences.map((pref, index) => (
                <div key={index} className="preference-item">
                  <h3 className="preference-dimension">{pref.dimension}</h3>
                  <p className="preference-score">{pref.score}</p>
                  <p className="preference-meaning">{pref.meaning}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="results-actions">
          <button className="continue-button" onClick={handleContinue}>
            Continue to Next Test
          </button>
        </div>
      </div>
    </div>
  );
};
