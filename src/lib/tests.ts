// Test definitions and metadata
// Contains basic information about each psychometric test (questions will be added later)

import type { TestInfo, TestName } from '../types';

export const TEST_METADATA: Record<TestName, Omit<TestInfo, 'status'>> = {
  '16Personalities': {
    id: '16Personalities',
    title: '16 Personalities Test',
    description: 'Discover your personality type based on Myers-Briggs theory across five key dimensions.',
    questionCount: 32,
    estimatedTime: '8-10 minutes',
    icon: '🧠',
  },
  'HIGH5': {
    id: 'HIGH5',
    title: 'HIGH5 Strengths Test',
    description: 'Identify your top 5 natural strengths from 20 possible strengths across 4 domains.',
    questionCount: 120,
    estimatedTime: '15-20 minutes',
    icon: '⭐',
  },
  'Big Five': {
    id: 'Big Five',
    title: 'Big Five Personality Test',
    description: 'Assess your personality across five broad trait dimensions using the OCEAN model.',
    questionCount: 50,
    estimatedTime: '8-10 minutes',
    icon: '🌊',
  },
  'RIASEC': {
    id: 'RIASEC',
    title: 'RIASEC Career Test',
    description: 'Explore your career interests across six work personality themes using Holland codes.',
    questionCount: 47,
    estimatedTime: '10-12 minutes',
    icon: '🎯',
  },
};

// Test order for display (RIASEC is last and locked initially)
export const TEST_ORDER: TestName[] = ['16Personalities', 'HIGH5', 'Big Five', 'RIASEC'];
