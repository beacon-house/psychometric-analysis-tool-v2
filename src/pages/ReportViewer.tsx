// Report Viewer Page
// Displays generated psychometric report in a single scrollable page

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase, isAuthenticated } from '../lib/supabase';
import { regenerateReportSections, SECTION_LABELS, SECTION_CATEGORIES } from '../lib/reportRegeneration';
import { RegenerationLoadingModal } from '../components/RegenerationLoadingModal';
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
  const [showRegenerateModal, setShowRegenerateModal] = useState(false);
  const [selectedSections, setSelectedSections] = useState<ReportSectionType[]>([]);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('');

  useEffect(() => {
    checkAuthAndLoadReport();
  }, [studentId]);

  useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll('.report-section, .category-header');
      const scrollPosition = window.scrollY + 150;

      let currentSection = '';

      sections.forEach((section) => {
        const sectionTop = (section as HTMLElement).offsetTop;
        const sectionHeight = (section as HTMLElement).offsetHeight;

        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
          const sectionId = section.id || section.getAttribute('data-section-id') || '';
          if (sectionId) {
            currentSection = sectionId;
          }
        }
      });

      if (currentSection && currentSection !== activeSection) {
        setActiveSection(currentSection);
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeSection, sections]);

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
      'core_identity_summary',
      'domain_stem',
      'domain_biology',
      'domain_liberal_arts',
      'domain_business',
      'domain_interdisciplinary',
      'overall_insight',
    ];

    return order
      .map((type) => sectionsData.find((s) => s.section_type === type))
      .filter((s): s is ReportSection => s !== undefined);
  };

  const getSectionTitle = (type: ReportSectionType): string => {
    const titles: Record<ReportSectionType, string> = {
      student_type: 'Student Type Classification',
      test_16p: '16 Personalities Test',
      test_high5: 'HIGH5 Strengths Test',
      test_big5: 'Big Five Personality Test',
      test_riasec: 'RIASEC Career Interest Test',
      core_identity_summary: 'Core Identity Summary',
      domain_stem: 'STEM & Applied Sciences',
      domain_biology: 'Biology & Natural Sciences',
      domain_liberal_arts: 'Liberal Arts & Communications',
      domain_business: 'Business & Economics',
      domain_interdisciplinary: 'Interdisciplinary Systems Fields',
      final_summary: 'Overall Insight',
      overall_insight: 'Overall Insight',
    };
    return titles[type];
  };

  const renderStudentType = (content: any) => (
    <div className="section-content student-type-content">
      <div className="classification-box">
        <p className="classification-text">{content.classification}</p>
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
                    <td>{dim.preference || dim.interpretation}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {content.results?.topFive && (
            <table className="results-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Strength</th>
                  <th>Domain</th>
                  <th>Interpretation</th>
                </tr>
              </thead>
              <tbody>
                {content.results.topFive.map((strength: any, idx: number) => (
                  <tr key={idx}>
                    <td>{strength.rank}</td>
                    <td><strong>{strength.strength}</strong></td>
                    <td>{strength.domain}</td>
                    <td>{strength.interpretation}</td>
                  </tr>
                ))}
              </tbody>
            </table>
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
                    <td>{trait.percentile || trait.score}</td>
                    <td>{trait.level || trait.interpretation}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {content.results?.allThemes && (
            <div className="all-themes-section">
              {content.results.hollandCode && (
                <p className="holland-code-display">
                  <strong>Holland Code:</strong> {content.results.hollandCode}
                </p>
              )}
              <table className="results-table">
                <thead>
                  <tr>
                    <th>Theme</th>
                    <th>Score</th>
                    <th>Interpretation</th>
                  </tr>
                </thead>
                <tbody>
                  {content.results.allThemes.map((theme: any, idx: number) => (
                    <tr key={idx}>
                      <td><strong>{theme.theme}</strong></td>
                      <td>{theme.score}</td>
                      <td>{theme.interpretation}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
      <div className="domain-section relatively-stronger-areas">
        <h4>Relatively Stronger Areas</h4>
        <ul className="areas-list-bullets">
          {content.strongerAreas?.map((area: any, idx: number) => (
            <li key={idx}>
              <strong>{area.field}</strong> – {area.rationale}
            </li>
          ))}
        </ul>
      </div>
      <div className="domain-section explore-with-caution-areas">
        <h4>Explore with Caution</h4>
        <ul className="areas-list-bullets">
          {content.weakerAreas?.map((area: any, idx: number) => (
            <li key={idx}>
              <strong>{area.field}</strong> – {area.rationale}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );

  // Helper function to parse markdown bold into HTML
  const parseMarkdownBold = (text: string): string => {
    return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  };

  const renderCoreIdentitySummary = (content: any) => (
    <div className="section-content core-identity-content">
      {content.coreIdentity && (
        <div className="core-identity-section">
          <table className="core-identity-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Key Characteristics</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Core Drive</strong></td>
                <td>{content.coreIdentity.coreDrive}</td>
              </tr>
              <tr>
                <td><strong>Personality</strong></td>
                <td>{content.coreIdentity.personality}</td>
              </tr>
              <tr>
                <td><strong>Work Style</strong></td>
                <td>{content.coreIdentity.workStyle}</td>
              </tr>
              <tr>
                <td><strong>Learning Style</strong></td>
                <td>{content.coreIdentity.learningStyle}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
      {content.strengthsPathways && content.strengthsPathways.length > 0 && (
        <div className="strengths-pathways-section">
          <h4>Strengths & Pathways</h4>
          <ul className="pathways-list">
            {content.strengthsPathways.map((pathway: string, idx: number) => (
              <li key={idx} dangerouslySetInnerHTML={{ __html: parseMarkdownBold(pathway) }} />
            ))}
          </ul>
        </div>
      )}
    </div>
  );

  const renderOverallInsight = (content: any) => (
    <div className="section-content summary-content">
      {content.overallInsight && (
        <div className="summary-section">
          <p className="narrative-text">{content.overallInsight}</p>
        </div>
      )}
      {content.potentialMajors && content.potentialMajors.length > 0 && (
        <div className="summary-section">
          <h4>Potential Majors</h4>
          <ul className="majors-list">
            {content.potentialMajors.map((major: string, idx: number) => (
              <li key={idx}>{major}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );

  const renderSectionContent = (section: ReportSection) => {
    const content = section.content;

    if (section.section_type === 'student_type') {
      return renderStudentType(content);
    } else if (section.section_type.startsWith('test_')) {
      return renderTestSummary(content);
    } else if (section.section_type === 'core_identity_summary') {
      return renderCoreIdentitySummary(content);
    } else if (section.section_type.startsWith('domain_')) {
      return renderDomainAnalysis(content);
    } else if (section.section_type === 'final_summary' || section.section_type === 'overall_insight') {
      return renderOverallInsight(content);
    }

    return <div className="section-content">No content available</div>;
  };

  const getSectionCategory = (type: ReportSectionType): string => {
    if (type === 'student_type') return 'Student Type';
    if (type.startsWith('test_')) return 'Section 1: Individual Test Summaries';
    if (type === 'core_identity_summary') return 'Section 2: Core Identity Summary';
    if (type.startsWith('domain_')) return 'Section 3: Career Pathway Alignment';
    if (type === 'final_summary' || type === 'overall_insight') return 'Section 4: Overall Insight';
    return '';
  };

  const handleRegenerateClick = () => {
    setShowRegenerateModal(true);
    setSelectedSections([]);
  };

  const handleToggleSection = (sectionType: ReportSectionType) => {
    setSelectedSections(prev => {
      if (prev.includes(sectionType)) {
        return prev.filter(s => s !== sectionType);
      } else {
        return [...prev, sectionType];
      }
    });
  };

  const handleToggleCategory = (category: string) => {
    const categorySections = SECTION_CATEGORIES[category as keyof typeof SECTION_CATEGORIES];
    const allSelected = categorySections.every(s => selectedSections.includes(s));

    if (allSelected) {
      setSelectedSections(prev => prev.filter(s => !categorySections.includes(s)));
    } else {
      setSelectedSections(prev => {
        const newSections = [...prev];
        categorySections.forEach(s => {
          if (!newSections.includes(s)) {
            newSections.push(s);
          }
        });
        return newSections;
      });
    }
  };

  const handleSelectAll = () => {
    const allSections = Object.values(SECTION_CATEGORIES).flat();
    if (selectedSections.length === allSections.length) {
      setSelectedSections([]);
    } else {
      setSelectedSections(allSections);
    }
  };

  const handleRegenerateConfirm = async () => {
    if (selectedSections.length === 0) {
      alert('Please select at least one section to regenerate');
      return;
    }

    const confirmation = confirm(
      `This will regenerate ${selectedSections.length} section(s). The process may take 1-3 minutes. Continue?`
    );

    if (!confirmation) return;

    setIsRegenerating(true);

    try {
      const result = await regenerateReportSections(studentId!, selectedSections);

      if (result.success) {
        await loadReport();
        setShowRegenerateModal(false);
        setSelectedSections([]);
        alert(`Successfully regenerated ${result.sections_regenerated} section(s)`);
      } else {
        throw new Error(result.error || 'Unknown error occurred');
      }
    } catch (err: any) {
      console.error('Regeneration error:', err);
      alert(`Failed to regenerate sections: ${err.message}`);
    } finally {
      setIsRegenerating(false);
    }
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
          <div className="header-center">
            <h1 className="header-student-name">{student.student_name}</h1>
          </div>
          <div className="header-spacer"></div>
        </div>
      </header>

      <div className="report-container">
        <aside className="report-toc">
          <h3>Contents</h3>
          <nav>
            <a
              href="#section-student"
              className={activeSection === 'section-student' ? 'active' : ''}
            >
              Student Type
            </a>
            <a
              href="#section-test"
              className={activeSection === 'section-test' ? 'active' : ''}
            >
              Section 1: Test Summaries
            </a>
            <a
              href="#section-core"
              className={activeSection === 'section-core' ? 'active' : ''}
            >
              Section 2: Core Identity
            </a>
            <a
              href="#section-domain"
              className={activeSection === 'section-domain' ? 'active' : ''}
            >
              Section 3: Career Pathways
            </a>
            <a
              href="#section-overall"
              className={activeSection === 'section-overall' ? 'active' : ''}
            >
              Section 4: Overall Insight
            </a>
          </nav>
        </aside>

        <main className="report-content">
          <div className="report-hero">
            <h1 className="report-student-name print-only">{student.student_name}</h1>
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
                    data-section-id={`section-${section.section_type.split('_')[0]}`}
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

      <div className="floating-actions">
        <button
          onClick={handleRegenerateClick}
          className="floating-button regenerate-floating"
          title="Regenerate Sections"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" />
          </svg>
        </button>
        <button
          onClick={() => window.print()}
          className="floating-button print-floating"
          title="Print Report"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zm-3 11H8v-5h8v5zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-9H6v4h12V3z" />
          </svg>
        </button>
      </div>

      {isRegenerating && (
        <RegenerationLoadingModal
          sectionsCount={selectedSections.length}
        />
      )}

      {showRegenerateModal && !isRegenerating && (
        <div className="modal-overlay" onClick={() => setShowRegenerateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Regenerate Report Sections</h2>
              <button
                className="modal-close"
                onClick={() => setShowRegenerateModal(false)}
              >
                ×
              </button>
            </div>

            <div className="modal-body">
              <p className="modal-description">
                Select the sections you want to regenerate. The AI will create new content based on the student's test results.
              </p>

              <div className="select-all-row">
                <label>
                  <input
                    type="checkbox"
                    checked={selectedSections.length === Object.values(SECTION_CATEGORIES).flat().length}
                    onChange={handleSelectAll}
                  />
                  <strong>Select All Sections</strong>
                </label>
              </div>

              {Object.entries(SECTION_CATEGORIES).map(([category, categorySections]) => (
                <div key={category} className="section-category">
                  <div className="category-header-modal">
                    <label>
                      <input
                        type="checkbox"
                        checked={categorySections.every(s => selectedSections.includes(s))}
                        onChange={() => handleToggleCategory(category)}
                      />
                      <strong>{category}</strong>
                    </label>
                  </div>
                  <div className="category-sections">
                    {categorySections.map(sectionType => (
                      <label key={sectionType} className="section-checkbox">
                        <input
                          type="checkbox"
                          checked={selectedSections.includes(sectionType)}
                          onChange={() => handleToggleSection(sectionType)}
                        />
                        {SECTION_LABELS[sectionType]}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="modal-footer">
              <button
                className="modal-button cancel-button"
                onClick={() => setShowRegenerateModal(false)}
              >
                Cancel
              </button>
              <button
                className="modal-button confirm-button"
                onClick={handleRegenerateConfirm}
                disabled={selectedSections.length === 0}
              >
                Regenerate Selected ({selectedSections.length})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
