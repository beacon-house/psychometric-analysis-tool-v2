// RIASEC Career Interest Test Page
// Configures universal test component with RIASEC questions and evaluation

import React from 'react';
import { Test } from './Test';
import { questionsRIASEC, responseScale } from '../lib/tests/riasec-config';
import { evaluateRIASEC } from '../lib/tests/riasec-evaluator';

export const TestRIASEC: React.FC = () => {
  return (
    <Test
      testName="RIASEC"
      questions={questionsRIASEC}
      responseScale={responseScale}
      evaluateFunction={evaluateRIASEC}
    />
  );
};
