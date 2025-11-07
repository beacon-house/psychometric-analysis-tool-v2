// Main application component
// Root component with routing configuration including student and admin routes

import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import { Test16Personalities } from './pages/Test16Personalities';
import { Results16Personalities } from './pages/Results16Personalities';
import { TestHigh5 } from './pages/TestHigh5';
import { ResultsHigh5 } from './pages/ResultsHigh5';
import { TestBigFive } from './pages/TestBigFive';
import { ResultsBigFive } from './pages/ResultsBigFive';
import { TestRIASEC } from './pages/TestRIASEC';
import { ResultsRIASEC } from './pages/ResultsRIASEC';
import { NextSteps } from './pages/NextSteps';
import { AdminLogin } from './pages/AdminLogin';
import { AdminDashboard } from './pages/AdminDashboard';
import { ReportViewer } from './pages/ReportViewer';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Student-facing routes */}
        <Route path="/" element={<Home />} />
        <Route path="/test/16personalities" element={<Test16Personalities />} />
        <Route path="/test/16personalities/results" element={<Results16Personalities />} />
        <Route path="/test/high5" element={<TestHigh5 />} />
        <Route path="/test/high5/results" element={<ResultsHigh5 />} />
        <Route path="/test/big-five" element={<TestBigFive />} />
        <Route path="/test/big-five/results" element={<ResultsBigFive />} />
        <Route path="/test/riasec" element={<TestRIASEC />} />
        <Route path="/test/riasec/results" element={<ResultsRIASEC />} />
        <Route path="/next-steps" element={<NextSteps />} />

        {/* Admin routes */}
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/reports/:studentId" element={<ReportViewer />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
