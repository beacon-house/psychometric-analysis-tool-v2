// Report Viewer Page
// Displays generated psychometric report in a single scrollable page

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase, isAuthenticated } from '../lib/supabase';
import type { ReportSection, ReportSectionType } from '../types';
import '../styles/ReportViewer.css';

interface Student {
  student_name: string;
  report_generated_at: string;
}

export const ReportViewer: React.FC = () => {
  const { studentId } = useParams<{ studentId: string }>();
  const navigate = useNavigate();
  const [student, setStudent] = useState<Student | null>(null);
  const [sections, setSections] = useState<ReportSection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    checkAuthAndLoadReport();
  }, [studentId]);

  const checkAuthAndLoadReport = async () => {
    try {
      const authenticated = await isAuthenticated();
      if (!authenticated) {
        navigate('/admin');
        return;
      }

      await loadReport();
    } catch (err) {
      console.error('Error loading report:', err);
      setError('Failed to load report');
      setIsLoading(false);
    }
  };

  const loadReport = async () => {
    setIsLoading(true);
    setError('');

    try {
      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .select('student_name, report_generated_at')
        .eq('id', studentId)
        .single();

      if (studentError) throw studentError;
      setStudent(studentData);

      const { data: sectionsData, error: sectionsError } = await supabase
        .from('report_sections')
        .select('*')
        .eq('student_id', studentId)
        .order('created_at', { ascending: true });

      if (sectionsError) throw sectionsError;

      const orderedSections = orderSections(sectionsData || []);
      setSections(orderedSections);
    } catch (err: any) {
      console.error('Error loading report:', err);
      setError('Failed to load report data');
    } finally {
      setIsLoading(false);
    }
  };

  const orderSections = (sectionsData: ReportSection[]): ReportSection[] => {
    const order: ReportSectionType[] = [
      'student_type',
      'test_16p',
      'test_high5',
      'test_big5',
      'test_riasec',
      'domain_business',
      'domain_economics',
      'domain_interdisciplinary',
      'domain_stem',
      'domain_liberal_arts',
      'final_summary',
    ];

    return order
      .map((type) => sectionsData.find((s) => s.section_type === type))
      .filter((s): s is ReportSection => s !== undefined);
  };

  const getSectionTitle = (type: ReportSectionType): string => {
    const titles: Record<ReportSectionType, string> = {
      student_type: 'Student Type Classification',
      test_16p: '16 Personalities Test Summary',
      test_high5: 'HIGH5 Strengths Test Summary',
      test_big5: 'Big Five Personality Test Summary',
      test_riasec: 'RIASEC Career Interest Test Summary',
      domain_business: 'Business Management & Leadership',
      domain_economics: 'Economics & Finance',
      domain_interdisciplinary: 'Interdisciplinary Systems Fields',
      domain_stem: 'STEM & Applied Sciences',
      domain_liberal_arts: 'Liberal Arts & Communications',
      final_summary: 'Comprehensive Summary',
    };
    return titles[type];
  };

  const renderStudentType = (content: any) => (
    <div className="section-content student-type-content">
      <div className="classification-box">
        <p className="classification-text">{content.classification}</p>
      </div>
      <div className="characteristics-box">
        <h4>Key Characteristics</h4>
        <ul className="characteristics-list">
          {content.keyCharacteristics?.map((char: string, idx: number) => (
            <li key={idx}>{char}</li>
          ))}
        </ul>
      </div>
      <div className="orientation-box">
        <h4>Overall Orientation</h4>
        <p className="orientation-text">{content.orientation}</p>
      </div>
    </div>
  );

  const renderTestSummary = (content: any) => (
    <div className="section-content test-summary-content">
      <div className="test-section">
        <h4>What This Test Measures</h4>
        <p>{content.whatItMeasures}</p>
      </div>
      <div className="test-section">
        <h4>Your Results</h4>
        <div className="results-display">
          {content.results?.personalityType && (
            <p className="personality-type">
              <strong>Personality Type:</strong> {content.results.personalityType}
            </p>
          )}
          {content.results?.hollandCode && (
            <p className="holland-code">
              <strong>Holland Code:</strong> {content.results.hollandCode}
            </p>
          )}
          {content.results?.dimensions && (
            <table className="results-table">
              <thead>
                <tr>
                  <th>Dimension</th>
                  <th>Score</th>
                  <th>Preference</th>
                </tr>
              </thead>
              <tbody>
                {content.results.dimensions.map((dim: any, idx: number) => (
                  <tr key={idx}>
                    <td>{dim.name}</td>
                    <td>{dim.score}</td>
                    <td>{dim.preference}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {content.results?.topFive && (
            <div className="top-five-list">
              {content.results.topFive.map((strength: any, idx: number) => (
                <div key={idx} className="strength-item">
                  <span className="strength-rank">{strength.rank}.</span>
                  <span className="strength-name">{strength.strength}</span>
                  <span className="strength-domain">({strength.domain})</span>
                  {strength.description && (
                    <p className="strength-description">{strength.description}</p>
                  )}
                </div>
              ))}
            </div>
          )}
          {content.results?.traits && (
            <table className="results-table">
              <thead>
                <tr>
                  <th>Trait</th>
                  <th>Percentile</th>
                  <th>Level</th>
                </tr>
              </thead>
              <tbody>
                {content.results.traits.map((trait: any, idx: number) => (
                  <tr key={idx}>
                    <td>{trait.name}</td>
                    <td>{trait.percentile}%</td>
                    <td>{trait.level}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {content.results?.topThemes && (
            <div className="themes-list">
              {content.results.topThemes.map((theme: any, idx: number) => (
                <div key={idx} className="theme-item">
                  <span className="theme-rank">{theme.rank}.</span>
                  <span className="theme-name">{theme.theme}</span>
                  <span className="theme-score">Score: {theme.score}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="test-section">
        <h4>What This Means For You</h4>
        <div className="insights-text">{content.insights}</div>
      </div>
    </div>
  );

  const renderDomainAnalysis = (content: any) => (
    <div className="section-content domain-content">
      <div className="domain-section">
        <h4>Overall Fit Assessment</h4>
        <p>{content.fitAssessment}</p>
      </div>
      <div className="domain-section">
        <h4>Relatively Stronger Areas</h4>
        <div className="areas-list">
          {content.strongerAreas?.map((area: any, idx: number) => (
            <div key={idx} className="area-item">
              <h5>{area.area}</h5>
              <p>{area.rationale}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="domain-section">
        <h4>Areas to Explore</h4>
        <div className="areas-list">
          {content.areasToExplore?.map((area: any, idx: number) => (
            <div key={idx} className="area-item">
              <h5>{area.area}</h5>
              <p>{area.rationale}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderFinalSummary = (content: any) => (
    <div className="section-content summary-content">
      <div className="summary-section">
        <h4>Core Identity</h4>
        <p className="narrative-text">{content.coreIdentity}</p>
      </div>
      <div className="summary-section">
        <h4>Career Pathway Recommendations</h4>
        <p className="narrative-text">{content.careerRecommendations}</p>
      </div>
      <div className="summary-section">
        <h4>Actionable Next Steps</h4>
        <div className="next-steps-list">
          {content.nextSteps?.map((step: any, idx: number) => (
            <div key={idx} className="next-step-item">
              <div className="step-number">{idx + 1}</div>
              <div className="step-content">
                <h5>{step.step}</h5>
                <p>{step.rationale}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderSectionContent = (section: ReportSection) => {
    const content = section.content;

    if (section.section_type === 'student_type') {
      return renderStudentType(content);
    } else if (
      section.section_type.startsWith('test_') &&
      section.section_type !== 'test_riasec'
    ) {
      return renderTestSummary(content);
    } else if (section.section_type === 'test_riasec') {
      return renderTestSummary(content);
    } else if (section.section_type.startsWith('domain_')) {
      return renderDomainAnalysis(content);
    } else if (section.section_type === 'final_summary') {
      return renderFinalSummary(content);
    }

    return <div className="section-content">No content available</div>;
  };

  const getSectionCategory = (type: ReportSectionType): string => {
    if (type === 'student_type') return 'Section 1: Student Profile';
    if (type.startsWith('test_')) return 'Section 1: Test Summaries';
    if (type.startsWith('domain_')) return 'Section 2: Career Pathway Alignment';
    if (type === 'final_summary') return 'Section 3: Comprehensive Summary';
    return '';
  };

  if (isLoading) {
    return (
      <div className="report-viewer">
        <div className="report-loading">
          <div className="loading-spinner"></div>
          <p>Loading report...</p>
        </div>
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="report-viewer">
        <div className="report-error">
          <h2>Error</h2>
          <p>{error || 'Report not found'}</p>
          <button onClick={() => navigate('/admin/dashboard')} className="back-button">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="report-viewer">
      <header className="report-header">
        <div className="header-content">
          <div className="header-left">
            <img src="/bh-ig-logo.png" alt="Logo" className="header-logo" />
            <button onClick={() => navigate('/admin/dashboard')} className="back-button-icon">
              ← Back
            </button>
          </div>
          <button onClick={() => window.print()} className="print-button">
            Print Report
          </button>
        </div>
      </header>

      <div className="report-container">
        <aside className="report-toc">
          <h3>Contents</h3>
          <nav>
            <a href="#section-student-type">Student Type</a>
            <a href="#section-test-summaries">Test Summaries</a>
            <a href="#section-career-domains">Career Domains</a>
            <a href="#section-summary">Final Summary</a>
          </nav>
        </aside>

        <main className="report-content">
          <div className="report-hero">
            <h1 className="report-student-name">{student.student_name}</h1>
            <p className="report-subtitle">Psychometric Assessment Report</p>
            {student.report_generated_at && (
              <p className="report-date">
                Generated on {new Date(student.report_generated_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            )}
          </div>

          {sections.map((section) => {
            const category = getSectionCategory(section.section_type);
            const isFirstInCategory =
              sections.findIndex((s) => getSectionCategory(s.section_type) === category) ===
              sections.indexOf(section);

            return (
              <div key={section.id}>
                {isFirstInCategory && category && (
                  <div
                    className="category-header"
                    id={`section-${section.section_type.split('_')[0]}`}
                  >
                    <h2>{category}</h2>
                  </div>
                )}
                <section className="report-section">
                  <h3 className="section-title">{getSectionTitle(section.section_type)}</h3>
                  {renderSectionContent(section)}
                </section>
              </div>
            );
          })}
        </main>
      </div>
    </div>
  );
};
