// Admin Dashboard Page
// Displays all student progress and test completion data for counselors

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, isAuthenticated, getCurrentUser, signOut } from '../lib/supabase';
import { Avatar } from '../components/Avatar';
import { ProfileDropdown } from '../components/ProfileDropdown';
import type { StudentWithTests, TestName, ReportStatus } from '../types';
import '../styles/AdminDashboard.css';

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState<StudentWithTests[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userEmail, setUserEmail] = useState('');
  const [error, setError] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    checkAuthAndLoadData();
  }, []);

  const checkAuthAndLoadData = async () => {
    try {
      const authenticated = await isAuthenticated();
      if (!authenticated) {
        navigate('/admin');
        return;
      }

      const user = await getCurrentUser();
      if (user?.email) {
        setUserEmail(user.email);
      }

      await loadStudents();
    } catch (err) {
      console.error('Error checking authentication:', err);
      navigate('/admin');
    }
  };

  const loadStudents = async () => {
    setIsLoading(true);
    setError('');

    try {
      // Fetch all students with report fields
      const { data: studentsData, error: studentsError } = await supabase
        .from('students')
        .select('*')
        .order('created_at', { ascending: false });

      if (studentsError) throw studentsError;

      // Fetch all test results
      const { data: testResultsData, error: testResultsError } = await supabase
        .from('test_results')
        .select('student_id, test_name, test_status');

      if (testResultsError) throw testResultsError;

      // Combine data and calculate test statuses
      const studentsWithTests: StudentWithTests[] = (studentsData || []).map((student) => {
        const studentTests = (testResultsData || []).filter(
          (result) => result.student_id === student.id
        );

        const getTestStatus = (testName: TestName): 'locked' | 'available' | 'in_progress' | 'completed' => {
          const test = studentTests.find((t) => t.test_name === testName);
          if (!test) return 'available';
          return test.test_status === 'completed' ? 'completed' : 'in_progress';
        };

        const test16p = getTestStatus('16Personalities');
        const testHigh5 = getTestStatus('HIGH5');
        const testBigFive = getTestStatus('Big Five');
        const testRiasec = getTestStatus('RIASEC');

        const allTestsCompleted =
          test16p === 'completed' &&
          testHigh5 === 'completed' &&
          testBigFive === 'completed' &&
          testRiasec === 'completed';

        // Compute report status based on test completion and current status
        let computedReportStatus: ReportStatus = student.report_status || 'tests_not_complete';
        if (!allTestsCompleted && computedReportStatus === 'tests_not_complete') {
          computedReportStatus = 'tests_not_complete';
        } else if (allTestsCompleted && computedReportStatus === 'tests_not_complete') {
          computedReportStatus = 'ready_to_generate';
        }

        return {
          id: student.id,
          student_name: student.student_name,
          parent_email: student.parent_email,
          parent_whatsapp: student.parent_whatsapp,
          overall_status: student.overall_status,
          report_generated: student.report_generated || false,
          report_status: computedReportStatus,
          report_generated_by: student.report_generated_by,
          report_generated_at: student.report_generated_at,
          report_error_message: student.report_error_message,
          created_at: student.created_at,
          updated_at: student.updated_at,
          submission_timestamp: student.submission_timestamp,
          test_16personalities: test16p,
          test_high5: testHigh5,
          test_big_five: testBigFive,
          test_riasec: testRiasec,
          all_tests_completed: allTestsCompleted,
        };
      });

      // Sort: completed tests first, then by most recent
      const sortedStudents = studentsWithTests.sort((a, b) => {
        if (a.all_tests_completed && !b.all_tests_completed) return -1;
        if (!a.all_tests_completed && b.all_tests_completed) return 1;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });

      setStudents(sortedStudents);
    } catch (err: any) {
      console.error('Error loading students:', err);
      setError('Failed to load student data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/admin');
    } catch (err) {
      console.error('Error signing out:', err);
      alert('Failed to sign out. Please try again.');
    }
  };

  const handleGenerateReport = async (studentId: string) => {
    try {
      const user = await getCurrentUser();
      if (!user?.email) {
        alert('Unable to identify current user');
        return;
      }

      const confirmation = confirm(
        'This will generate a comprehensive psychometric report. The process may take 2-3 minutes. Continue?'
      );

      if (!confirmation) return;

      // Update report status to generation_in_progress
      const { error: updateError } = await supabase
        .from('students')
        .update({
          report_status: 'generation_in_progress',
          report_generated_by: user.email,
        })
        .eq('id', studentId);

      if (updateError) throw updateError;

      // Reload students to reflect changes
      await loadStudents();

      // Call edge function to generate report
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-report`;
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.access_token) {
        alert('Authentication error. Please sign in again.');
        return;
      }

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          studentId,
          counselorEmail: user.email,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to generate report');
      }

      // Reload to show updated status
      await loadStudents();
      alert('Report generated successfully!');

    } catch (err: any) {
      console.error('Error generating report:', err);

      // Update status to error
      await supabase
        .from('students')
        .update({
          report_status: 'error',
          report_error_message: err.message || 'Unknown error occurred',
        })
        .eq('id', studentId);

      await loadStudents();
      alert(`Failed to generate report: ${err.message}`);
    }
  };

  const handleRegenerateReport = async (studentId: string) => {
    try {
      // Reset status from error to ready_to_generate
      const { error: updateError } = await supabase
        .from('students')
        .update({
          report_status: 'ready_to_generate',
          report_error_message: null,
        })
        .eq('id', studentId);

      if (updateError) throw updateError;

      // Reload students to reflect changes
      await loadStudents();

      console.log('Report reset for regeneration:', studentId);
    } catch (err: any) {
      console.error('Error resetting report status:', err);
      alert('Failed to reset report status. Please try again.');
    }
  };

  const renderTestStatus = (status: 'locked' | 'available' | 'in_progress' | 'completed') => {
    if (status === 'completed') {
      return <span className="status-icon status-completed">✓</span>;
    } else if (status === 'in_progress') {
      return <span className="status-icon status-in-progress">⋯</span>;
    }
    return <span className="status-icon status-not-started">−</span>;
  };

  const renderReportStatus = (status: ReportStatus) => {
    const statusConfig = {
      tests_not_complete: { label: 'Tests Not Complete', className: 'status-badge status-grey' },
      ready_to_generate: { label: 'Yet to Be Generated', className: 'status-badge status-blue' },
      generation_in_progress: { label: 'Generation in Progress', className: 'status-badge status-yellow' },
      done: { label: 'Done', className: 'status-badge status-green' },
      error: { label: 'Error', className: 'status-badge status-red' },
    };

    const config = statusConfig[status];
    return <span className={config.className}>{config.label}</span>;
  };

  const handleViewReport = (studentId: string) => {
    navigate(`/admin/reports/${studentId}`);
  };

  const renderActionButtons = (student: StudentWithTests) => {
    const canGenerate = student.report_status === 'ready_to_generate';
    const canRegenerate = student.report_status === 'error';
    const canView = student.report_status === 'done';
    const isInactive = student.report_status === 'done' || student.report_status === 'generation_in_progress';
    const isDisabled = student.report_status === 'tests_not_complete';

    return (
      <div className="action-buttons">
        <button
          className={`icon-button generate-btn ${
            canGenerate ? 'active' : isDisabled || isInactive ? 'inactive' : ''
          }`}
          onClick={() => handleGenerateReport(student.id)}
          disabled={!canGenerate}
          title={
            canGenerate
              ? 'Generate report for this student'
              : isDisabled
              ? 'Student must complete all tests first'
              : 'Report already generated or in progress'
          }
        >
          <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
            <path d="M8 5v14l11-7z" />
          </svg>
        </button>
        <button
          className={`icon-button regenerate-btn ${canRegenerate ? 'active' : 'inactive'}`}
          onClick={() => handleRegenerateReport(student.id)}
          disabled={!canRegenerate}
          title={
            canRegenerate
              ? 'Regenerate report after error'
              : 'Regenerate only available after error'
          }
        >
          <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
            <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" />
          </svg>
        </button>
        <button
          className={`icon-button view-btn ${canView ? 'active' : 'inactive'}`}
          onClick={() => handleViewReport(student.id)}
          disabled={!canView}
          title={
            canView
              ? 'View generated report'
              : 'Report must be generated first'
          }
        >
          <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
            <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
          </svg>
        </button>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="admin-dashboard">
        <div className="dashboard-loading">
          <div className="loading-spinner"></div>
          <p>Loading student data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <img src="/bh-ig-logo.png" alt="Beacon House" className="header-logo" />
            <h1 className="dashboard-title">Admin Dashboard</h1>
          </div>
          <div className="header-right">
            <Avatar email={userEmail} onClick={() => setShowDropdown(!showDropdown)} />
            {showDropdown && (
              <ProfileDropdown
                email={userEmail}
                onSignOut={handleSignOut}
                onClose={() => setShowDropdown(false)}
              />
            )}
          </div>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="dashboard-subtitle-section">
          <p className="dashboard-subtitle">Student Progress & Report Management</p>
        </div>
        {error && (
          <div className="error-banner">
            {error}
            <button onClick={loadStudents} className="retry-button">
              Retry
            </button>
          </div>
        )}

        <div className="students-count">
          <span className="count-label">Total Students:</span>
          <span className="count-value">{students.length}</span>
          <span className="count-separator">|</span>
          <span className="count-label">Completed All Tests:</span>
          <span className="count-value">
            {students.filter((s) => s.all_tests_completed).length}
          </span>
        </div>

        <div className="table-container">
          <table className="students-table">
            <thead>
              <tr>
                <th className="col-student-name">Student Name</th>
                <th className="col-uuid">Student UUID</th>
                <th className="col-test">16P</th>
                <th className="col-test">HIGH5</th>
                <th className="col-test">BIG FIVE</th>
                <th className="col-test">RIASEC</th>
                <th className="col-email">Email</th>
                <th className="col-whatsapp">WhatsApp</th>
                <th className="col-report-status">Report Status</th>
                <th className="col-generated-by">Report Generated By</th>
                <th className="col-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.id}>
                  <td className="col-student-name student-name">
                    {student.student_name || <span className="not-submitted">Not Submitted</span>}
                  </td>
                  <td className="col-uuid student-uuid">{student.id.substring(0, 8)}...</td>
                  <td className="col-test test-status">{renderTestStatus(student.test_16personalities)}</td>
                  <td className="col-test test-status">{renderTestStatus(student.test_high5)}</td>
                  <td className="col-test test-status">{renderTestStatus(student.test_big_five)}</td>
                  <td className="col-test test-status">{renderTestStatus(student.test_riasec)}</td>
                  <td className="col-email contact-info">
                    {student.parent_email || <span className="not-submitted">Not Submitted</span>}
                  </td>
                  <td className="col-whatsapp contact-info">
                    {student.parent_whatsapp || <span className="not-submitted">Not Submitted</span>}
                  </td>
                  <td className="col-report-status">
                    {renderReportStatus(student.report_status)}
                  </td>
                  <td className="col-generated-by generated-by-info">
                    {student.report_generated_by || <span className="not-submitted">—</span>}
                  </td>
                  <td className="col-actions action-cell">
                    {renderActionButtons(student)}
                  </td>
                </tr>
              ))}
              {students.length === 0 && (
                <tr>
                  <td colSpan={11} className="no-data">
                    No students found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};
