// Main application component
// Root component with routing configuration

import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import { Test16Personalities } from './pages/Test16Personalities';
import { Results16Personalities } from './pages/Results16Personalities';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/test/16personalities" element={<Test16Personalities />} />
        <Route path="/test/16personalities/results" element={<Results16Personalities />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
