// Report Viewer Page
// Displays generated psychometric report in a single scrollable page

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase, isAuthenticated } from '../lib/supabase';
import { regenerateReportSections, SECTION_LABELS, SECTION_CATEGORIES } from '../lib/reportRegeneration';
import { RegenerationLoadingModal } from '../components/RegenerationLoadingModal';
import type { ReportSection, ReportSectionType, SelectedRecommendation } from '../types';
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
  const [selectedRecommendations, setSelectedRecommendations] = useState<SelectedRecommendation[]>([])
  const [addingCustomTo, setAddingCustomTo] = useState<string | null>(null); // Format: "domain-section" e.g. "domain_stem-strongerAreas"
  const [customMajorText, setCustomMajorText] = useState<string>('');
  const [isSaving, setIsSaving] = useState<string | null>(null); // Track which item is currently saving
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
      const reportSections = document.querySelectorAll('.report-section');
      const scrollPosition = window.scrollY + 200;

      let currentSection = '';

      reportSections.forEach((section) => {
        const sectionTop = (section as HTMLElement).offsetTop;
        const sectionHeight = (section as HTMLElement).offsetHeight;

        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
          const sectionId = section.id || '';
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

      // Fetch selected recommendations for this student
      const { data: selectedData, error: selectedError } = await supabase
        .from('selected_recommendations')
        .select('*')
        .eq('student_id', studentId);

      if (selectedError) {
        console.error('Error loading selected recommendations:', selectedError);
      } else {
        setSelectedRecommendations(selectedData || []);
      }
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

  // Helper functions for recommendation selection
  const isRecommendationSelected = (domain: string, section: string, text: string): boolean => {
    return selectedRecommendations.some(
      (rec) => rec.domain === domain && rec.section === section && rec.recommendation_text === text
    );
  };

  const handleToggleRecommendation = async (domain: string, section: string, text: string, isChecked: boolean) => {
    const saveKey = `${domain}-${section}-${text}`;
    setIsSaving(saveKey);

    try {
      if (isChecked) {
        // Add selection
        const { data: userData } = await supabase.auth.getUser();
        const { data, error } = await supabase
          .from('selected_recommendations')
          .insert({
            student_id: studentId,
            domain,
            section,
            recommendation_text: text,
            is_custom: false,
            selected_by: userData?.user?.email || null,
          })
          .select()
          .single();

        if (error) throw error;

        // Update local state
        setSelectedRecommendations((prev) => [...prev, data]);
      } else {
        // Remove selection
        const itemToRemove = selectedRecommendations.find(
          (rec) => rec.domain === domain && rec.section === section && rec.recommendation_text === text
        );

        if (itemToRemove) {
          const { error } = await supabase
            .from('selected_recommendations')
            .delete()
            .eq('id', itemToRemove.id);

          if (error) throw error;

          // Update local state
          setSelectedRecommendations((prev) => prev.filter((rec) => rec.id !== itemToRemove.id));
        }
      }
    } catch (error: any) {
      console.error('Error toggling recommendation:', error);
      alert('Failed to save selection. Please try again.');
    } finally {
      setIsSaving(null);
    }
  };

  const handleAddCustomRecommendation = async (domain: string, section: string) => {
    if (!customMajorText.trim()) {
      alert('Please enter a major name');
      return;
    }

    const saveKey = `${domain}-${section}-custom`;
    setIsSaving(saveKey);

    try {
      const { data: userData } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from('selected_recommendations')
        .insert({
          student_id: studentId,
          domain,
          section,
          recommendation_text: customMajorText.trim(),
          is_custom: true,
          selected_by: userData?.user?.email || null,
        })
        .select()
        .single();

      if (error) throw error;

      // Update local state
      setSelectedRecommendations((prev) => [...prev, data]);

      // Reset input
      setCustomMajorText('');
      setAddingCustomTo(null);
    } catch (error: any) {
      console.error('Error adding custom recommendation:', error);
      alert('Failed to add custom major. Please try again.');
    } finally {
      setIsSaving(null);
    }
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

  const renderDomainAnalysis = (content: any, domain: string) => {
    // Get custom recommendations for this domain
    const customStronger = selectedRecommendations.filter(
      (rec) => rec.domain === domain && rec.section === 'strongerAreas' && rec.is_custom
    );
    const customWeaker = selectedRecommendations.filter(
      (rec) => rec.domain === domain && rec.section === 'weakerAreas' && rec.is_custom
    );

    const renderRecommendationItem = (area: any, section: string, idx: number) => {
      const fullText = `${area.field} – ${area.rationale}`;
      const isSelected = isRecommendationSelected(domain, section, fullText);
      const saveKey = `${domain}-${section}-${fullText}`;
      const isCurrentlySaving = isSaving === saveKey;

      return (
        <li key={idx} className="recommendation-item">
          <label className="recommendation-label">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(e) => handleToggleRecommendation(domain, section, fullText, e.target.checked)}
              disabled={isCurrentlySaving}
              className="recommendation-checkbox"
            />
            <span className="recommendation-text">
              <strong>{area.field}</strong> – {area.rationale}
              {isCurrentlySaving && <span className="saving-indicator"> (Saving...)</span>}
            </span>
          </label>
        </li>
      );
    };

    const renderCustomRecommendation = (rec: SelectedRecommendation, idx: number) => {
      const saveKey = `${domain}-${rec.section}-${rec.recommendation_text}`;
      const isCurrentlySaving = isSaving === saveKey;

      return (
        <li key={`custom-${idx}`} className="recommendation-item custom-recommendation">
          <label className="recommendation-label">
            <input
              type="checkbox"
              checked={true}
              onChange={(e) => handleToggleRecommendation(domain, rec.section, rec.recommendation_text, e.target.checked)}
              disabled={isCurrentlySaving}
              className="recommendation-checkbox"
            />
            <span className="recommendation-text">
              <strong>{rec.recommendation_text}</strong>
              <span className="custom-badge">*</span>
              {isCurrentlySaving && <span className="saving-indicator"> (Saving...)</span>}
            </span>
          </label>
        </li>
      );
    };

    const renderAddCustomButton = (section: string) => {
      const addKey = `${domain}-${section}`;
      const isAdding = addingCustomTo === addKey;
      const saveKey = `${domain}-${section}-custom`;
      const isCurrentlySaving = isSaving === saveKey;

      return (
        <div className="add-custom-major">
          {!isAdding ? (
            <button
              onClick={() => setAddingCustomTo(addKey)}
              className="add-custom-button"
              disabled={isCurrentlySaving}
            >
              + Add Custom Major
            </button>
          ) : (
            <div className="custom-major-input-container">
              <input
                type="text"
                value={customMajorText}
                onChange={(e) => setCustomMajorText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleAddCustomRecommendation(domain, section);
                  } else if (e.key === 'Escape') {
                    setAddingCustomTo(null);
                    setCustomMajorText('');
                  }
                }}
                placeholder="Enter major name"
                className="custom-major-input"
                autoFocus
                disabled={isCurrentlySaving}
              />
              <button
                onClick={() => handleAddCustomRecommendation(domain, section)}
                className="save-custom-button"
                disabled={isCurrentlySaving}
                title="Save"
              >
                ✓
              </button>
              <button
                onClick={() => {
                  setAddingCustomTo(null);
                  setCustomMajorText('');
                }}
                className="cancel-custom-button"
                disabled={isCurrentlySaving}
                title="Cancel"
              >
                ✕
              </button>
            </div>
          )}
        </div>
      );
    };

    return (
      <div className="section-content domain-content">
        <div className="domain-section relatively-stronger-areas">
          <h4>Relatively Stronger Areas</h4>
          <ul className="areas-list-bullets">
            {content.strongerAreas?.map((area: any, idx: number) =>
              renderRecommendationItem(area, 'strongerAreas', idx)
            )}
            {customStronger.map((rec, idx) => renderCustomRecommendation(rec, idx))}
          </ul>
          {renderAddCustomButton('strongerAreas')}
        </div>
        <div className="domain-section explore-with-caution-areas">
          <h4>Explore with Caution</h4>
          <ul className="areas-list-bullets">
            {content.weakerAreas?.map((area: any, idx: number) =>
              renderRecommendationItem(area, 'weakerAreas', idx)
            )}
            {customWeaker.map((rec, idx) => renderCustomRecommendation(rec, idx))}
          </ul>
          {renderAddCustomButton('weakerAreas')}
        </div>
      </div>
    );
  };

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

  const renderOverallInsight = (content: any) => {
    // Group selected recommendations by domain
    const domainNames: Record<string, string> = {
      domain_stem: 'STEM & Applied Sciences',
      domain_biology: 'Biology & Natural Sciences',
      domain_liberal_arts: 'Liberal Arts & Communications',
      domain_business: 'Business & Economics',
      domain_interdisciplinary: 'Interdisciplinary Systems Fields',
    };

    const handpickedByDomain: Record<string, SelectedRecommendation[]> = {};
    selectedRecommendations.forEach((rec) => {
      if (!handpickedByDomain[rec.domain]) {
        handpickedByDomain[rec.domain] = [];
      }
      handpickedByDomain[rec.domain].push(rec);
    });

    const hasHandpickedMajors = selectedRecommendations.length > 0;
    const hasCustomMajors = selectedRecommendations.some((rec) => rec.is_custom);

    return (
      <div className="section-content summary-content">
        {/* Handpicked Majors Section */}
        <div className="summary-section handpicked-majors-section">
          <h4>Handpicked Majors</h4>
          {hasHandpickedMajors ? (
            <>
              <p className="handpicked-intro">
                Based on your psychometric profile and counseling discussion, here are the curated majors recommended for you:
              </p>
              {Object.keys(handpickedByDomain).map((domain) => (
                <div key={domain} className="handpicked-domain">
                  <h5 className="handpicked-domain-title">{domainNames[domain]}</h5>
                  <ul className="handpicked-list">
                    {handpickedByDomain[domain].map((rec) => (
                      <li key={rec.id}>
                        {/* Extract just the field name from full text */}
                        {rec.recommendation_text.split(' – ')[0]}
                        {rec.is_custom && <span className="custom-indicator">*</span>}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              {hasCustomMajors && (
                <p className="handpicked-footnote">
                  * Custom recommendation added during counseling session
                </p>
              )}
            </>
          ) : (
            <p className="handpicked-placeholder">
              No majors selected yet. Your counselor will discuss and select relevant recommendations during your session.
            </p>
          )}
        </div>

        {/* Existing Overall Insight content */}
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
  };

  const renderSectionContent = (section: ReportSection) => {
    const content = section.content;

    if (section.section_type === 'student_type') {
      return renderStudentType(content);
    } else if (section.section_type.startsWith('test_')) {
      return renderTestSummary(content);
    } else if (section.section_type === 'core_identity_summary') {
      return renderCoreIdentitySummary(content);
    } else if (section.section_type.startsWith('domain_')) {
      return renderDomainAnalysis(content, section.section_type);
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
          </div>
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
              className={activeSection === 'section-test' || activeSection.startsWith('test_') ? 'active' : ''}
            >
              Section 1: Test Summaries
            </a>
            <div className="toc-subsections">
              <a
                href="#test_16p"
                className={`toc-subsection ${activeSection === 'test_16p' ? 'active' : ''}`}
              >
                16 Personalities Test
              </a>
              <a
                href="#test_high5"
                className={`toc-subsection ${activeSection === 'test_high5' ? 'active' : ''}`}
              >
                HIGH5 Strengths Test
              </a>
              <a
                href="#test_big5"
                className={`toc-subsection ${activeSection === 'test_big5' ? 'active' : ''}`}
              >
                Big Five Personality Test
              </a>
              <a
                href="#test_riasec"
                className={`toc-subsection ${activeSection === 'test_riasec' ? 'active' : ''}`}
              >
                RIASEC Career Interest Test
              </a>
            </div>
            <a
              href="#section-core"
              className={activeSection === 'section-core' || activeSection === 'core_identity_summary' ? 'active' : ''}
            >
              Section 2: Core Identity
            </a>
            <div className="toc-subsections">
              <a
                href="#core_identity_summary"
                className={`toc-subsection ${activeSection === 'core_identity_summary' ? 'active' : ''}`}
              >
                Core Identity Summary
              </a>
            </div>
            <a
              href="#section-domain"
              className={activeSection === 'section-domain' || activeSection.startsWith('domain_') ? 'active' : ''}
            >
              Section 3: Career Pathways
            </a>
            <div className="toc-subsections">
              <a
                href="#domain_stem"
                className={`toc-subsection ${activeSection === 'domain_stem' ? 'active' : ''}`}
              >
                STEM & Applied Sciences
              </a>
              <a
                href="#domain_biology"
                className={`toc-subsection ${activeSection === 'domain_biology' ? 'active' : ''}`}
              >
                Biology & Natural Sciences
              </a>
              <a
                href="#domain_liberal_arts"
                className={`toc-subsection ${activeSection === 'domain_liberal_arts' ? 'active' : ''}`}
              >
                Liberal Arts & Communications
              </a>
              <a
                href="#domain_business"
                className={`toc-subsection ${activeSection === 'domain_business' ? 'active' : ''}`}
              >
                Business & Economics
              </a>
              <a
                href="#domain_interdisciplinary"
                className={`toc-subsection ${activeSection === 'domain_interdisciplinary' ? 'active' : ''}`}
              >
                Interdisciplinary Systems Fields
              </a>
            </div>
            <a
              href="#section-overall"
              className={activeSection === 'section-overall' || activeSection === 'overall_insight' ? 'active' : ''}
            >
              Section 4: Overall Insight
            </a>
          </nav>
        </aside>

        <main className="report-content">
          <div className="report-hero">
            <div className="student-name-card">
              {student.student_name}
            </div>
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
                <section className="report-section" id={section.section_type}>
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
          onClick={() => navigate('/admin/dashboard')}
          className="floating-button back-floating"
          title="Back to Dashboard"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
          </svg>
        </button>
        <div>
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
