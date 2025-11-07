// Admin Dashboard Page
// Displays all student progress and test completion data for counselors

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, isAuthenticated, getCurrentUser, signOut } from '../lib/supabase';
import type { StudentWithTests, TestName } from '../types';
import '../styles/AdminDashboard.css';

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState<StudentWithTests[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userEmail, setUserEmail] = useState('');
  const [error, setError] = useState('');

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
      // Fetch all students
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

        return {
          id: student.id,
          student_name: student.student_name,
          parent_email: student.parent_email,
          parent_whatsapp: student.parent_whatsapp,
          overall_status: student.overall_status,
          report_generated: student.report_generated || false,
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

  const handleGenerateReport = (studentId: string) => {
    // Placeholder - no action wired yet
    console.log('Generate report for student:', studentId);
  };

  const renderTestStatus = (status: 'locked' | 'available' | 'in_progress' | 'completed') => {
    if (status === 'completed') {
      return <span className="status-icon status-completed">✓</span>;
    } else if (status === 'in_progress') {
      return <span className="status-icon status-in-progress">⋯</span>;
    }
    return <span className="status-icon status-not-started">−</span>;
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
            <h1 className="dashboard-title">Admin Dashboard</h1>
            <p className="dashboard-subtitle">Student Progress & Report Management</p>
          </div>
          <div className="header-right">
            <span className="user-email">{userEmail}</span>
            <button onClick={handleSignOut} className="sign-out-button">
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="dashboard-main">
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
                <th>Student Name</th>
                <th>Student UUID</th>
                <th>16P</th>
                <th>HIGH5</th>
                <th>Big Five</th>
                <th>RIASEC</th>
                <th>Email</th>
                <th>WhatsApp</th>
                <th>Generate Report</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.id}>
                  <td className="student-name">
                    {student.student_name || <span className="not-submitted">Not Submitted</span>}
                  </td>
                  <td className="student-uuid">{student.id.substring(0, 8)}...</td>
                  <td className="test-status">{renderTestStatus(student.test_16personalities)}</td>
                  <td className="test-status">{renderTestStatus(student.test_high5)}</td>
                  <td className="test-status">{renderTestStatus(student.test_big_five)}</td>
                  <td className="test-status">{renderTestStatus(student.test_riasec)}</td>
                  <td className="contact-info">
                    {student.parent_email || <span className="not-submitted">Not Submitted</span>}
                  </td>
                  <td className="contact-info">
                    {student.parent_whatsapp || <span className="not-submitted">Not Submitted</span>}
                  </td>
                  <td className="action-cell">
                    <button
                      className={`generate-button ${
                        student.all_tests_completed ? 'enabled' : 'disabled'
                      }`}
                      onClick={() => handleGenerateReport(student.id)}
                      disabled={!student.all_tests_completed}
                      title={
                        student.all_tests_completed
                          ? 'Generate report for this student'
                          : 'Student must complete all tests first'
                      }
                    >
                      Generate
                    </button>
                  </td>
                </tr>
              ))}
              {students.length === 0 && (
                <tr>
                  <td colSpan={9} className="no-data">
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
