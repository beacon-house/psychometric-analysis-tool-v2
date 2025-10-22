// Big Five (OCEAN) Personality Test Page
// Configures universal test component with Big Five questions and evaluation

import React from 'react';
import { Test } from './Test';
import { questionsBigFive, responseScaleBig5 } from '../lib/tests/big5-config';
import { evaluateBigFive } from '../lib/tests/big5-evaluator';

export const TestBigFive: React.FC = () => {
  return (
    <Test
      testName="Big Five"
      questions={questionsBigFive}
      responseScale={responseScaleBig5}
      evaluateFunction={evaluateBigFive}
    />
  );
};
