// HIGH5 Strengths Test Page
// Configures universal test component with HIGH5 questions and evaluation

import React from 'react';
import { Test } from './Test';
import { questionsHigh5, responseScale } from '../lib/tests/high5-config';
import { evaluateHigh5 } from '../lib/tests/high5-evaluator';

export const TestHigh5: React.FC = () => {
  return (
    <Test
      testName="HIGH5"
      questions={questionsHigh5}
      responseScale={responseScale}
      evaluateFunction={evaluateHigh5}
    />
  );
};
