// HIGH5 Strengths Test Evaluation Logic
// Implements scoring algorithm based on test specification document

import { questionsHigh5, strengthMetadata, type StrengthName, type DomainName } from './high5-config';

export interface Responses {
  [questionId: string]: number;
}

export interface StrengthScore {
  strength: StrengthName;
  domain: DomainName;
  rawScore: number;
  normalizedScore: number;
  rank: number;
  category: 'FOCUS' | 'LEVERAGE' | 'NAVIGATE' | 'AVOID';
  description: string;
}

export interface TopStrength {
  rank: number;
  strength: StrengthName;
  domain: DomainName;
  score: number;
  description: string;
  coreCharacteristic: string;
  energizedBy: string;
  drainedBy: string;
}

export interface DomainBreakdown {
  count: number;
  percentage: number;
  strengths: StrengthName[];
}

export interface EvaluationResultHigh5 {
  testType: string;
  studentResponses: Responses;
  rawScores: Record<StrengthName, number>;
  normalizedScores: Record<StrengthName, number>;
  topFiveStrengths: TopStrength[];
  allStrengths: StrengthScore[];
  domainBreakdown: Record<DomainName, DomainBreakdown>;
}

/**
 * Calculate raw score for each strength by averaging the responses
 * for all questions mapped to that strength
 */
function calculateRawScores(responses: Responses): Record<StrengthName, number> {
  const strengthScores: Record<string, number[]> = {};

  questionsHigh5.forEach(question => {
    const response = responses[`q${question.id}`];
    if (response === undefined) return;

    if (!strengthScores[question.strength]) {
      strengthScores[question.strength] = [];
    }
    strengthScores[question.strength].push(response);
  });

  const rawScores: Record<string, number> = {};
  Object.entries(strengthScores).forEach(([strength, scores]) => {
    const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    rawScores[strength] = average;
  });

  return rawScores as Record<StrengthName, number>;
}

/**
 * Normalize raw score from 1-5 scale to 0-100 scale
 * Formula: ((rawScore - 1) / 4) × 100
 */
function normalizeScore(rawScore: number): number {
  const normalized = ((rawScore - 1) / 4) * 100;
  return Math.round(normalized);
}

/**
 * Determine category based on rank
 * FOCUS: 1-5, LEVERAGE: 6-10, NAVIGATE: 11-15, AVOID: 16-20
 */
function getCategory(rank: number): 'FOCUS' | 'LEVERAGE' | 'NAVIGATE' | 'AVOID' {
  if (rank <= 5) return 'FOCUS';
  if (rank <= 10) return 'LEVERAGE';
  if (rank <= 15) return 'NAVIGATE';
  return 'AVOID';
}

/**
 * Rank all 20 strengths by normalized score in descending order
 */
function rankStrengths(normalizedScores: Record<StrengthName, number>): StrengthScore[] {
  const strengthsArray = Object.entries(normalizedScores).map(([strength, score]) => {
    const metadata = strengthMetadata[strength as StrengthName];
    return {
      strength: strength as StrengthName,
      domain: metadata.domain,
      rawScore: 0,
      normalizedScore: score,
      rank: 0,
      category: 'FOCUS' as 'FOCUS' | 'LEVERAGE' | 'NAVIGATE' | 'AVOID',
      description: metadata.shortDescription,
    };
  });

  strengthsArray.sort((a, b) => b.normalizedScore - a.normalizedScore);

  strengthsArray.forEach((strength, index) => {
    strength.rank = index + 1;
    strength.category = getCategory(index + 1);
  });

  return strengthsArray;
}

/**
 * Generate top 5 strengths with detailed metadata
 */
function generateTopFiveStrengths(
  rankedStrengths: StrengthScore[]
): TopStrength[] {
  return rankedStrengths.slice(0, 5).map(strength => {
    const metadata = strengthMetadata[strength.strength];
    return {
      rank: strength.rank,
      strength: strength.strength,
      domain: strength.domain,
      score: strength.normalizedScore,
      description: metadata.shortDescription,
      coreCharacteristic: metadata.coreCharacteristic,
      energizedBy: metadata.energizedBy,
      drainedBy: metadata.drainedBy,
    };
  });
}

/**
 * Calculate domain breakdown for top 5 strengths
 */
function calculateDomainBreakdown(topFive: TopStrength[]): Record<DomainName, DomainBreakdown> {
  const breakdown: Record<string, DomainBreakdown> = {
    'Doing': { count: 0, percentage: 0, strengths: [] },
    'Feeling': { count: 0, percentage: 0, strengths: [] },
    'Motivating': { count: 0, percentage: 0, strengths: [] },
    'Thinking': { count: 0, percentage: 0, strengths: [] },
  };

  topFive.forEach(strength => {
    breakdown[strength.domain].count += 1;
    breakdown[strength.domain].strengths.push(strength.strength);
  });

  Object.values(breakdown).forEach(domain => {
    domain.percentage = (domain.count / 5) * 100;
  });

  return breakdown as Record<DomainName, DomainBreakdown>;
}

/**
 * Main evaluation function for HIGH5 test
 * Takes raw responses and returns structured evaluation results
 */
export function evaluateHigh5(responses: Responses): EvaluationResultHigh5 {
  const rawScores = calculateRawScores(responses);

  const normalizedScores: Record<StrengthName, number> = {} as Record<StrengthName, number>;
  Object.entries(rawScores).forEach(([strength, rawScore]) => {
    normalizedScores[strength as StrengthName] = normalizeScore(rawScore);
  });

  const rankedStrengths = rankStrengths(normalizedScores);

  rankedStrengths.forEach(strength => {
    strength.rawScore = rawScores[strength.strength];
  });

  const topFiveStrengths = generateTopFiveStrengths(rankedStrengths);

  const domainBreakdown = calculateDomainBreakdown(topFiveStrengths);

  return {
    testType: 'HIGH5',
    studentResponses: responses,
    rawScores,
    normalizedScores,
    topFiveStrengths,
    allStrengths: rankedStrengths,
    domainBreakdown,
  };
}
