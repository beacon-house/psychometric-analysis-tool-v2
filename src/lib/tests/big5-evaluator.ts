// Big Five (OCEAN) Personality Test Evaluation Logic
// Implements scoring algorithm from IPIP Big-Five Factor Markers specification

import { questionsBigFive, traitDescriptions } from './big5-config';

export interface Responses {
  [questionId: string]: number;
}

export interface TraitScore {
  trait: string;
  percentileScore: number;
  rawScore: number;
  level: string;
  description: string;
}

export interface EvaluationResultBig5 {
  testType: string;
  studentResponses: Responses;
  rawScores: {
    Openness: number;
    Conscientiousness: number;
    Extraversion: number;
    Agreeableness: number;
    Emotional_Stability: number;
  };
  percentileScores: {
    Openness: number;
    Conscientiousness: number;
    Extraversion: number;
    Agreeableness: number;
    Emotional_Stability: number;
  };
  traitInterpretations: TraitScore[];
}

/**
 * Reverse score for negatively keyed questions
 * Formula: 6 - originalScore
 */
function reverseScore(score: number): number {
  return 6 - score;
}

/**
 * Calculate raw trait scores
 * Groups questions by trait and sums scores (with reversal for negative-keyed)
 */
function calculateRawTraitScores(responses: Responses): Record<string, number> {
  const traitScores: Record<string, number> = {
    O: 0,
    C: 0,
    E: 0,
    A: 0,
    ES: 0,
  };

  questionsBigFive.forEach(question => {
    const response = responses[`q${question.id}`];
    if (response === undefined) return;

    const score = question.keying === 'negative' ? reverseScore(response) : response;
    traitScores[question.trait] += score;
  });

  return traitScores;
}

/**
 * Convert raw score to percentile (0-100 scale)
 * Formula: ((rawScore - 10) / 40) × 100
 * Range: 10-50 raw maps to 0-100 percentile
 */
function calculatePercentileScore(rawScore: number): number {
  const percentile = ((rawScore - 10) / 40) * 100;
  return Math.round(percentile);
}

/**
 * Determine interpretation level based on percentile score
 */
function getInterpretationLevel(percentile: number): string {
  if (percentile >= 0 && percentile <= 20) return 'Very Low';
  if (percentile >= 21 && percentile <= 40) return 'Low';
  if (percentile >= 41 && percentile <= 60) return 'Moderate';
  if (percentile >= 61 && percentile <= 80) return 'High';
  return 'Very High';
}

/**
 * Get trait description based on interpretation level
 */
function getTraitDescription(trait: 'O' | 'C' | 'E' | 'A' | 'ES', level: string): string {
  const descriptions = traitDescriptions[trait];

  switch (level) {
    case 'Very High':
      return descriptions.veryHigh;
    case 'High':
      return descriptions.high;
    case 'Moderate':
      return descriptions.moderate;
    case 'Low':
      return descriptions.low;
    case 'Very Low':
      return descriptions.veryLow;
    default:
      return descriptions.moderate;
  }
}

/**
 * Create trait interpretation object
 */
function createTraitInterpretation(
  traitCode: 'O' | 'C' | 'E' | 'A' | 'ES',
  traitName: string,
  rawScore: number,
  percentileScore: number
): TraitScore {
  const level = getInterpretationLevel(percentileScore);
  const description = getTraitDescription(traitCode, level);

  return {
    trait: traitName,
    percentileScore,
    rawScore,
    level,
    description,
  };
}

/**
 * Main evaluation function for Big Five test
 * Takes raw responses and returns structured evaluation results
 */
export function evaluateBigFive(responses: Responses): EvaluationResultBig5 {
  // Calculate raw trait scores
  const rawScores = calculateRawTraitScores(responses);

  // Calculate percentile scores
  const percentileScores = {
    Openness: calculatePercentileScore(rawScores.O),
    Conscientiousness: calculatePercentileScore(rawScores.C),
    Extraversion: calculatePercentileScore(rawScores.E),
    Agreeableness: calculatePercentileScore(rawScores.A),
    Emotional_Stability: calculatePercentileScore(rawScores.ES),
  };

  // Create trait interpretations in OCEAN order
  const traitInterpretations: TraitScore[] = [
    createTraitInterpretation('O', 'Openness to Experience', rawScores.O, percentileScores.Openness),
    createTraitInterpretation('C', 'Conscientiousness', rawScores.C, percentileScores.Conscientiousness),
    createTraitInterpretation('E', 'Extraversion', rawScores.E, percentileScores.Extraversion),
    createTraitInterpretation('A', 'Agreeableness', rawScores.A, percentileScores.Agreeableness),
    createTraitInterpretation('ES', 'Emotional Stability', rawScores.ES, percentileScores.Emotional_Stability),
  ];

  return {
    testType: 'Big Five',
    studentResponses: responses,
    rawScores: {
      Openness: rawScores.O,
      Conscientiousness: rawScores.C,
      Extraversion: rawScores.E,
      Agreeableness: rawScores.A,
      Emotional_Stability: rawScores.ES,
    },
    percentileScores,
    traitInterpretations,
  };
}
