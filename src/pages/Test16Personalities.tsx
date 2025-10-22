// 16 Personalities Test Page
// Configures universal test component with 16P questions and evaluation

import React from 'react';
import { Test } from './Test';
import { questions16Personalities, responseScale } from '../lib/tests/16personalities-config';
import { evaluate16Personalities } from '../lib/tests/16personalities-evaluator';

export const Test16Personalities: React.FC = () => {
  return (
    <Test
      testName="16Personalities"
      questions={questions16Personalities}
      responseScale={responseScale}
      evaluateFunction={evaluate16Personalities}
    />
  );
};
