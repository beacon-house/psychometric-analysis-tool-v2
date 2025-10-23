// RIASEC Career Interest Test Evaluation Logic
// Implements scoring algorithm based on Holland Occupational Themes model

import { questionsRIASEC, themeMetadata, type RIASECTheme } from './riasec-config';

export interface Responses {
  [questionId: string]: number;
}

export interface ThemeScore {
  theme: RIASECTheme;
  rawScore: number;
  normalizedScore: number;
  description: string;
}

export interface TopTheme {
  rank: number;
  theme: RIASECTheme;
  score: number;
  description: string;
}

export interface RIASECEvaluationResult {
  testType: string;
  studentResponses: Responses;
  rawScores: Record<RIASECTheme, number>;
  normalizedScores: Record<RIASECTheme, number>;
  hollandCode: string;
  topThreeThemes: TopTheme[];
  allScores: ThemeScore[];
}

/**
 * Calculate raw scores by summing responses for each theme
 * Each theme has 8 questions (except Enterprising which has 7)
 * Raw score range: 8-40 per theme (or 7-35 for Enterprising)
 */
function calculateRawScores(responses: Responses): Record<RIASECTheme, number> {
  const rawScores: Record<RIASECTheme, number> = {
    Realistic: 0,
    Investigative: 0,
    Artistic: 0,
    Social: 0,
    Enterprising: 0,
    Conventional: 0,
  };

  questionsRIASEC.forEach(question => {
    const response = responses[`q${question.id}`];
    if (response !== undefined) {
      rawScores[question.theme] += response;
    }
  });

  return rawScores;
}

/**
 * Normalize raw scores to 0-32 scale
 * Formula: (Raw Score - 8)
 * This converts the 8-40 range to 0-32 range
 */
function normalizeScore(rawScore: number, questionCount: number): number {
  const minPossible = questionCount * 1;
  const normalized = rawScore - minPossible;
  return Math.round(normalized);
}

/**
 * Calculate normalized scores for all themes
 */
function calculateNormalizedScores(rawScores: Record<RIASECTheme, number>): Record<RIASECTheme, number> {
  const normalizedScores: Record<RIASECTheme, number> = {
    Realistic: 0,
    Investigative: 0,
    Artistic: 0,
    Social: 0,
    Enterprising: 0,
    Conventional: 0,
  };

  // Count questions per theme
  const questionCounts: Record<RIASECTheme, number> = {
    Realistic: 0,
    Investigative: 0,
    Artistic: 0,
    Social: 0,
    Enterprising: 0,
    Conventional: 0,
  };

  questionsRIASEC.forEach(q => {
    questionCounts[q.theme]++;
  });

  // Normalize each theme score
  Object.keys(rawScores).forEach(themeKey => {
    const theme = themeKey as RIASECTheme;
    normalizedScores[theme] = normalizeScore(rawScores[theme], questionCounts[theme]);
  });

  return normalizedScores;
}

/**
 * Generate Holland Code from top 3 themes
 * Returns three-letter code (e.g., "RIA", "SEC", "EIC")
 */
function generateHollandCode(normalizedScores: Record<RIASECTheme, number>): string {
  const themes = Object.keys(normalizedScores) as RIASECTheme[];

  // Sort themes by score (descending)
  const sortedThemes = themes.sort((a, b) => normalizedScores[b] - normalizedScores[a]);

  // Take top 3 and get first letter of each
  const hollandCode = sortedThemes
    .slice(0, 3)
    .map(theme => theme[0])
    .join('');

  return hollandCode;
}

/**
 * Get interpretation description based on normalized score
 */
function getScoreInterpretation(normalizedScore: number, theme: RIASECTheme): string {
  const metadata = themeMetadata[theme];

  if (normalizedScore >= 25) {
    return `High to very high interest in ${metadata.description}`;
  } else if (normalizedScore >= 17) {
    return `Moderate to high interest in ${metadata.description}`;
  } else if (normalizedScore >= 9) {
    return `Low to moderate interest in ${metadata.description}`;
  } else {
    return `Very low interest in ${metadata.description}`;
  }
}

/**
 * Generate top three themes with details
 */
function getTopThreeThemes(normalizedScores: Record<RIASECTheme, number>): TopTheme[] {
  const themes = Object.keys(normalizedScores) as RIASECTheme[];

  // Sort themes by score (descending)
  const sortedThemes = themes.sort((a, b) => normalizedScores[b] - normalizedScores[a]);

  return sortedThemes.slice(0, 3).map((theme, index) => ({
    rank: index + 1,
    theme,
    score: normalizedScores[theme],
    description: themeMetadata[theme].fullDescription,
  }));
}

/**
 * Generate all theme scores array sorted by score
 */
function getAllScores(normalizedScores: Record<RIASECTheme, number>): ThemeScore[] {
  const themes = Object.keys(normalizedScores) as RIASECTheme[];

  // Sort themes by score (descending)
  const sortedThemes = themes.sort((a, b) => normalizedScores[b] - normalizedScores[a]);

  return sortedThemes.map(theme => ({
    theme,
    rawScore: 0, // Will be filled in main function
    normalizedScore: normalizedScores[theme],
    description: getScoreInterpretation(normalizedScores[theme], theme),
  }));
}

/**
 * Main evaluation function for RIASEC test
 * Takes raw responses and returns structured evaluation results
 */
export function evaluateRIASEC(responses: Responses): RIASECEvaluationResult {
  // Calculate raw scores
  const rawScores = calculateRawScores(responses);

  // Calculate normalized scores
  const normalizedScores = calculateNormalizedScores(rawScores);

  // Generate Holland Code
  const hollandCode = generateHollandCode(normalizedScores);

  // Get top three themes
  const topThreeThemes = getTopThreeThemes(normalizedScores);

  // Get all scores
  const allScores = getAllScores(normalizedScores);

  // Add raw scores to allScores
  allScores.forEach(scoreObj => {
    scoreObj.rawScore = rawScores[scoreObj.theme];
  });

  return {
    testType: 'RIASEC',
    studentResponses: responses,
    rawScores,
    normalizedScores,
    hollandCode,
    topThreeThemes,
    allScores,
  };
}
