// Report Data Formatter
// Utilities to fetch and format test results for AI prompt generation

import { supabase } from './supabase';
import { TestName } from '../types';

export interface FormattedTestResults {
  test16Personalities: {
    personalityType: string;
    fullCode: string;
    dimensions: any;
    preferences: any;
  } | null;
  testHigh5: {
    topFiveStrengths: any[];
    domainBreakdown: any;
    allStrengths: any[];
  } | null;
  testBigFive: {
    rawScores: any;
    percentileScores: any;
    interpretations: any[];
  } | null;
  testRiasec: {
    hollandCode: string;
    topThreeThemes: any[];
    allScores: any[];
    allThemes: any[];
  } | null;
}

/**
 * Fetch all test results for a student
 */
export async function fetchStudentTestResults(studentId: string) {
  const { data: testResults, error } = await supabase
    .from('test_results')
    .select('*')
    .eq('student_id', studentId)
    .eq('test_status', 'completed');

  if (error) {
    throw new Error(`Failed to fetch test results: ${error.message}`);
  }

  return testResults;
}

/**
 * Validate that all four tests are completed
 */
export function validateAllTestsCompleted(testResults: any[]): boolean {
  const requiredTests: TestName[] = ['16Personalities', 'HIGH5', 'Big Five', 'RIASEC'];
  const completedTests = testResults.map((test) => test.test_name);

  return requiredTests.every((testName) => completedTests.includes(testName));
}

/**
 * Format 16 Personalities test data
 */
function format16PersonalitiesData(testResult: any) {
  if (!testResult || !testResult.result_data) return null;

  const resultData = testResult.result_data;

  return {
    personalityType: resultData.personalityType?.fourLetterCode || 'Unknown',
    fullCode: resultData.personalityType?.fullCode || 'Unknown',
    dimensions: {
      extraversion: resultData.dimensionScores?.Extraversion || {},
      sensing: resultData.dimensionScores?.Sensing || {},
      thinking: resultData.dimensionScores?.Thinking || {},
      judging: resultData.dimensionScores?.Judging || {},
      assertive: resultData.dimensionScores?.Assertive || {},
    },
    preferences: resultData.preferences || [],
  };
}

/**
 * Format HIGH5 test data
 */
function formatHigh5Data(testResult: any) {
  if (!testResult || !testResult.result_data) return null;

  const resultData = testResult.result_data;

  return {
    topFiveStrengths: resultData.topFiveStrengths || [],
    domainBreakdown: resultData.domainBreakdown || {},
    allStrengths: resultData.allStrengths || [],
  };
}

/**
 * Format Big Five test data
 */
function formatBigFiveData(testResult: any) {
  if (!testResult || !testResult.result_data) return null;

  const resultData = testResult.result_data;

  return {
    rawScores: resultData.rawScores || {},
    percentileScores: resultData.percentileScores || {},
    interpretations: resultData.traitInterpretations || [],
  };
}

/**
 * Format RIASEC test data
 */
function formatRiasecData(testResult: any) {
  if (!testResult || !testResult.result_data) return null;

  const resultData = testResult.result_data;

  // Format all 6 themes with scores and interpretations
  const allThemes = resultData.allScores?.map((scoreObj: any) => ({
    theme: scoreObj.theme,
    score: scoreObj.normalizedScore,
    interpretation: scoreObj.description
  })) || [];

  return {
    hollandCode: resultData.hollandCode || 'Unknown',
    topThreeThemes: resultData.topThreeThemes || [],
    allScores: resultData.allScores || [],
    allThemes: allThemes,
    rawScores: resultData.rawScores || {},
    normalizedScores: resultData.normalizedScores || {},
  };
}

/**
 * Format all test results for prompt generation
 */
export async function formatAllTestResults(
  studentId: string
): Promise<FormattedTestResults> {
  const testResults = await fetchStudentTestResults(studentId);

  if (!validateAllTestsCompleted(testResults)) {
    throw new Error('All four tests must be completed before generating report');
  }

  const test16P = testResults.find((t) => t.test_name === '16Personalities');
  const testHigh5 = testResults.find((t) => t.test_name === 'HIGH5');
  const testBigFive = testResults.find((t) => t.test_name === 'Big Five');
  const testRiasec = testResults.find((t) => t.test_name === 'RIASEC');

  return {
    test16Personalities: format16PersonalitiesData(test16P),
    testHigh5: formatHigh5Data(testHigh5),
    testBigFive: formatBigFiveData(testBigFive),
    testRiasec: formatRiasecData(testRiasec),
  };
}

/**
 * Create a concise summary of test results for prompt injection
 */
export function createTestDataSummary(formattedData: FormattedTestResults): string {
  const { test16Personalities, testHigh5, testBigFive, testRiasec } = formattedData;

  let summary = '## Student Test Results\n\n';

  if (test16Personalities) {
    summary += `### 16 Personalities Test\n`;
    summary += `- Personality Type: ${test16Personalities.personalityType} (${test16Personalities.fullCode})\n`;
    summary += `- Dimensions:\n`;
    summary += `  - Extraversion: ${test16Personalities.dimensions.extraversion.normalized}% ${test16Personalities.dimensions.extraversion.preference}\n`;
    summary += `  - Sensing: ${test16Personalities.dimensions.sensing.normalized}% ${test16Personalities.dimensions.sensing.preference}\n`;
    summary += `  - Thinking: ${test16Personalities.dimensions.thinking.normalized}% ${test16Personalities.dimensions.thinking.preference}\n`;
    summary += `  - Judging: ${test16Personalities.dimensions.judging.normalized}% ${test16Personalities.dimensions.judging.preference}\n`;
    summary += `  - Assertive: ${test16Personalities.dimensions.assertive.normalized}% ${test16Personalities.dimensions.assertive.preference}\n\n`;
  }

  if (testHigh5) {
    summary += `### HIGH5 Strengths Test\n`;
    summary += `- Top 5 Strengths:\n`;
    testHigh5.topFiveStrengths.forEach((strength: any, index: number) => {
      summary += `  ${index + 1}. ${strength.strength} (${strength.domain}) - Score: ${strength.score}\n`;
    });
    summary += `- Domain Breakdown:\n`;
    Object.entries(testHigh5.domainBreakdown).forEach(([domain, data]: [string, any]) => {
      summary += `  - ${domain}: ${data.count} strengths (${data.percentage}%)\n`;
    });
    summary += '\n';
  }

  if (testBigFive) {
    summary += `### Big Five Personality Test\n`;
    summary += `- Trait Scores:\n`;
    testBigFive.interpretations.forEach((trait: any) => {
      summary += `  - ${trait.trait}: ${trait.percentileScore}% (${trait.level})\n`;
    });
    summary += '\n';
  }

  if (testRiasec) {
    summary += `### RIASEC Career Interest Test\n`;
    summary += `- Holland Code: ${testRiasec.hollandCode}\n`;
    summary += `- All 6 Career Theme Scores:\n`;
    testRiasec.allThemes?.forEach((theme: any) => {
      summary += `  - ${theme.theme}: Score ${theme.score}/32 - ${theme.interpretation}\n`;
    });
    summary += `\n- Top 3 Themes (Holland Code): ${testRiasec.topThreeThemes.map((t: any) => t.theme).join(', ')}\n`;
    summary += '\n';
  }

  return summary;
}
