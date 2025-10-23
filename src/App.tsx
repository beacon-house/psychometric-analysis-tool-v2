// Main application component
// Root component with routing configuration

import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import { Test16Personalities } from './pages/Test16Personalities';
import { Results16Personalities } from './pages/Results16Personalities';
import { TestHigh5 } from './pages/TestHigh5';
import { ResultsHigh5 } from './pages/ResultsHigh5';
import { TestBigFive } from './pages/TestBigFive';
import { ResultsBigFive } from './pages/ResultsBigFive';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/test/16personalities" element={<Test16Personalities />} />
        <Route path="/test/16personalities/results" element={<Results16Personalities />} />
        <Route path="/test/high5" element={<TestHigh5 />} />
        <Route path="/test/high5/results" element={<ResultsHigh5 />} />
        <Route path="/test/big-five" element={<TestBigFive />} />
        <Route path="/test/big-five/results" element={<ResultsBigFive />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
