// 16 Personalities Test Evaluation Logic
// Implements scoring algorithm from test specification document

import { questions16Personalities, dimensionMetadata } from './16personalities-config';

export interface Responses {
  [questionId: string]: number;
}

export interface DimensionScore {
  raw: number;
  normalized: number;
  preference: string;
  preferenceCode: string;
  clarityPercentage: number;
  clarityLevel: string;
}

export interface PersonalityType {
  fourLetterCode: string;
  variant: string;
  fullCode: string;
  description: string;
}

export interface Preference {
  dimension: string;
  score: string;
  meaning: string;
}

export interface EvaluationResult {
  testType: string;
  studentResponses: Responses;
  dimensionScores: {
    Extraversion: DimensionScore;
    Sensing: DimensionScore;
    Thinking: DimensionScore;
    Judging: DimensionScore;
    Assertive: DimensionScore;
  };
  personalityType: PersonalityType;
  preferences: Preference[];
}

/**
 * Reverse score for reverse-keyed questions
 * Formula: 6 - originalScore
 */
function reverseScore(score: number): number {
  return 6 - score;
}

/**
 * Calculate raw dimension scores
 * Groups questions by dimension and sums scores (with reversal for reverse-keyed)
 */
function calculateRawDimensionScores(responses: Responses): Record<string, number> {
  const dimensionScores: Record<string, number> = {
    EI: 0,
    SN: 0,
    TF: 0,
    JP: 0,
    AT: 0,
  };

  questions16Personalities.forEach(question => {
    const response = responses[`q${question.id}`];
    if (response === undefined) return;

    const score = question.keying === 'reverse' ? reverseScore(response) : response;
    dimensionScores[question.dimension] += score;
  });

  return dimensionScores;
}

/**
 * Normalize dimension score to 0-100 scale
 * Formula: ((rawScore - 7) / 28) × 100
 * Range: 7-35 raw maps to 0-100 normalized
 */
function normalizeDimensionScore(rawScore: number): number {
  const normalized = ((rawScore - 7) / 28) * 100;
  return Math.round(normalized);
}

/**
 * Determine clarity level based on distance from 50%
 */
function getClarityLevel(clarityPercentage: number): string {
  if (clarityPercentage >= 0 && clarityPercentage <= 5) return 'Slight';
  if (clarityPercentage >= 6 && clarityPercentage <= 15) return 'Moderate';
  if (clarityPercentage >= 16 && clarityPercentage <= 25) return 'Clear';
  return 'Very Clear';
}

/**
 * Calculate dimension score details
 */
function calculateDimensionScore(
  dimension: 'EI' | 'SN' | 'TF' | 'JP' | 'AT',
  rawScore: number
): DimensionScore {
  const normalized = normalizeDimensionScore(rawScore);
  const metadata = dimensionMetadata[dimension];

  const isDominant = normalized >= 50;
  const preference = isDominant ? metadata.dominant.label : metadata.recessive.label;
  const preferenceCode = isDominant ? metadata.dominant.code : metadata.recessive.code;
  const clarityPercentage = Math.abs(normalized - 50);
  const clarityLevel = getClarityLevel(clarityPercentage);

  return {
    raw: rawScore,
    normalized,
    preference,
    preferenceCode,
    clarityPercentage,
    clarityLevel,
  };
}

/**
 * Generate four-letter personality type code
 */
function generateFourLetterCode(dimensionScores: Record<string, DimensionScore>): string {
  return (
    dimensionScores.EI.preferenceCode +
    dimensionScores.SN.preferenceCode +
    dimensionScores.TF.preferenceCode +
    dimensionScores.JP.preferenceCode
  );
}

/**
 * Generate personality type object with variant
 */
function generatePersonalityType(
  fourLetterCode: string,
  assertiveScore: DimensionScore
): PersonalityType {
  const variant = assertiveScore.preference;
  const variantCode = assertiveScore.preferenceCode;
  const fullCode = `${fourLetterCode}-${variantCode}`;

  const description = `${dimensionMetadata.EI[assertiveScore.normalized >= 50 ? 'dominant' : 'recessive'].label}, ${dimensionMetadata.SN[assertiveScore.normalized >= 50 ? 'dominant' : 'recessive'].label}, ${dimensionMetadata.TF[assertiveScore.normalized >= 50 ? 'dominant' : 'recessive'].label}, ${dimensionMetadata.JP[assertiveScore.normalized >= 50 ? 'dominant' : 'recessive'].label} with ${variant} identity`;

  return {
    fourLetterCode,
    variant,
    fullCode,
    description,
  };
}

/**
 * Generate preference descriptions array
 */
function generatePreferences(dimensionScores: Record<string, DimensionScore>): Preference[] {
  const preferences: Preference[] = [];

  Object.entries(dimensionScores).forEach(([key, score]) => {
    const dimension = key as 'EI' | 'SN' | 'TF' | 'JP' | 'AT';
    const metadata = dimensionMetadata[dimension];
    const isDominant = score.normalized >= 50;
    const meaningData = isDominant ? metadata.dominant : metadata.recessive;

    preferences.push({
      dimension: metadata.name,
      score: `${score.normalized}% ${score.preference}`,
      meaning: meaningData.description,
    });
  });

  return preferences;
}

/**
 * Main evaluation function for 16 Personalities test
 * Takes raw responses and returns structured evaluation results
 */
export function evaluate16Personalities(responses: Responses): EvaluationResult {
  // Calculate raw dimension scores
  const rawScores = calculateRawDimensionScores(responses);

  // Calculate dimension score details
  const dimensionScores = {
    Extraversion: calculateDimensionScore('EI', rawScores.EI),
    Sensing: calculateDimensionScore('SN', rawScores.SN),
    Thinking: calculateDimensionScore('TF', rawScores.TF),
    Judging: calculateDimensionScore('JP', rawScores.JP),
    Assertive: calculateDimensionScore('AT', rawScores.AT),
  };

  // Generate four-letter code
  const fourLetterCode = generateFourLetterCode({
    EI: dimensionScores.Extraversion,
    SN: dimensionScores.Sensing,
    TF: dimensionScores.Thinking,
    JP: dimensionScores.Judging,
    AT: dimensionScores.Assertive,
  });

  // Generate personality type with variant
  const personalityType = generatePersonalityType(
    fourLetterCode,
    dimensionScores.Assertive
  );

  // Generate preferences array
  const preferences = generatePreferences({
    EI: dimensionScores.Extraversion,
    SN: dimensionScores.Sensing,
    TF: dimensionScores.Thinking,
    JP: dimensionScores.Judging,
    AT: dimensionScores.Assertive,
  });

  return {
    testType: '16Personalities',
    studentResponses: responses,
    dimensionScores,
    personalityType,
    preferences,
  };
}
