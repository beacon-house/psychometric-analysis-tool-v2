// HIGH5 Strengths Test Results Page
// Displays top 5 strengths, domain breakdown, and full rankings

import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { storage } from '../lib/storage';
import type { EvaluationResultHigh5 } from '../lib/tests/high5-evaluator';
import '../styles/ResultsHigh5.css';

export const ResultsHigh5: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [evaluation, setEvaluation] = useState<EvaluationResultHigh5 | null>(
    location.state?.evaluation || null
  );
  const [isLoading, setIsLoading] = useState(!location.state?.evaluation);
  const [showAllStrengths, setShowAllStrengths] = useState(false);

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

      const { data, error } = await supabase
        .from('test_results')
        .select('result_data')
        .eq('student_id', studentData.uuid)
        .eq('test_name', 'HIGH5')
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setEvaluation(data.result_data as EvaluationResultHigh5);
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

  const getDomainColor = (domain: string): string => {
    const colors: Record<string, string> = {
      'Doing': '#f97316',
      'Feeling': '#ec4899',
      'Motivating': '#8b5cf6',
      'Thinking': '#3b82f6',
    };
    return colors[domain] || '#6b7280';
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

  const { topFiveStrengths, allStrengths, domainBreakdown } = evaluation;

  const focusStrengths = allStrengths.filter(s => s.category === 'FOCUS');
  const leverageStrengths = allStrengths.filter(s => s.category === 'LEVERAGE');
  const navigateStrengths = allStrengths.filter(s => s.category === 'NAVIGATE');
  const avoidStrengths = allStrengths.filter(s => s.category === 'AVOID');

  return (
    <div className="results-page high5-results">
      <div className="results-container">
        <div className="results-header">
          <h1 className="results-title">Your HIGH5 Strengths</h1>
          <p className="results-subtitle">
            These are your natural talents and recurring patterns that represent how you think, decide, and act
          </p>
        </div>

        <div className="top-five-section">
          <h2 className="section-title">Your Top 5 Strengths</h2>
          <div className="top-five-grid">
            {topFiveStrengths.map((strength) => (
              <div
                key={strength.rank}
                className="strength-card"
                style={{ borderLeftColor: getDomainColor(strength.domain) }}
              >
                <div className="strength-card-header">
                  <div className="strength-rank-badge" style={{ backgroundColor: getDomainColor(strength.domain) }}>
                    #{strength.rank}
                  </div>
                  <div className="strength-name-section">
                    <h3 className="strength-name">{strength.strength}</h3>
                    <span className="strength-domain" style={{ color: getDomainColor(strength.domain) }}>
                      {strength.domain}
                    </span>
                  </div>
                  <div className="strength-score">{strength.score}%</div>
                </div>

                <p className="strength-description">{strength.description}</p>

                <div className="strength-details">
                  <div className="strength-detail-item">
                    <strong>Core:</strong> {strength.coreCharacteristic}
                  </div>
                  <div className="strength-detail-item energized">
                    <strong>Energized by:</strong> {strength.energizedBy}
                  </div>
                  <div className="strength-detail-item drained">
                    <strong>Drained by:</strong> {strength.drainedBy}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="domain-breakdown-section">
          <h2 className="section-title">Domain Balance</h2>
          <p className="section-description">
            Your top 5 strengths are distributed across four domains
          </p>

          <div className="domain-grid">
            {Object.entries(domainBreakdown).map(([domain, data]) => (
              <div key={domain} className="domain-card">
                <div className="domain-header">
                  <div
                    className="domain-icon"
                    style={{ backgroundColor: getDomainColor(domain) }}
                  >
                    {data.count}
                  </div>
                  <h3 className="domain-name">{domain}</h3>
                </div>
                <div className="domain-percentage">{data.percentage}%</div>
                <div className="domain-strengths">
                  {data.strengths.map((strength, idx) => (
                    <span key={idx} className="domain-strength-tag">
                      {strength}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="all-strengths-section">
          <button
            className="toggle-all-button"
            onClick={() => setShowAllStrengths(!showAllStrengths)}
          >
            {showAllStrengths ? 'Hide' : 'Show'} All 20 Ranked Strengths
          </button>

          {showAllStrengths && (
            <div className="all-strengths-container">
              <div className="strength-category-section">
                <div className="category-header focus-header">
                  <h3>FOCUS (Ranks 1-5)</h3>
                  <p>Your most powerful strengths - use daily</p>
                </div>
                <div className="strength-list">
                  {focusStrengths.map((strength) => (
                    <div key={strength.rank} className="strength-list-item">
                      <span className="rank-number">#{strength.rank}</span>
                      <span className="strength-list-name">{strength.strength}</span>
                      <span className="strength-list-domain" style={{ color: getDomainColor(strength.domain) }}>
                        {strength.domain}
                      </span>
                      <span className="strength-list-score">{strength.normalizedScore}%</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="strength-category-section">
                <div className="category-header leverage-header">
                  <h3>LEVERAGE (Ranks 6-10)</h3>
                  <p>Supporting strengths - use when needed</p>
                </div>
                <div className="strength-list">
                  {leverageStrengths.map((strength) => (
                    <div key={strength.rank} className="strength-list-item">
                      <span className="rank-number">#{strength.rank}</span>
                      <span className="strength-list-name">{strength.strength}</span>
                      <span className="strength-list-domain" style={{ color: getDomainColor(strength.domain) }}>
                        {strength.domain}
                      </span>
                      <span className="strength-list-score">{strength.normalizedScore}%</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="strength-category-section">
                <div className="category-header navigate-header">
                  <h3>NAVIGATE (Ranks 11-15)</h3>
                  <p>Neutral strengths - use selectively</p>
                </div>
                <div className="strength-list">
                  {navigateStrengths.map((strength) => (
                    <div key={strength.rank} className="strength-list-item">
                      <span className="rank-number">#{strength.rank}</span>
                      <span className="strength-list-name">{strength.strength}</span>
                      <span className="strength-list-domain" style={{ color: getDomainColor(strength.domain) }}>
                        {strength.domain}
                      </span>
                      <span className="strength-list-score">{strength.normalizedScore}%</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="strength-category-section">
                <div className="category-header avoid-header">
                  <h3>AVOID (Ranks 16-20)</h3>
                  <p>Weakest areas - minimize or delegate</p>
                </div>
                <div className="strength-list">
                  {avoidStrengths.map((strength) => (
                    <div key={strength.rank} className="strength-list-item">
                      <span className="rank-number">#{strength.rank}</span>
                      <span className="strength-list-name">{strength.strength}</span>
                      <span className="strength-list-domain" style={{ color: getDomainColor(strength.domain) }}>
                        {strength.domain}
                      </span>
                      <span className="strength-list-score">{strength.normalizedScore}%</span>
                    </div>
                  ))}
                </div>
              </div>
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
