// Report Regeneration Service
// Handles selective regeneration of report sections

import { supabase } from './supabase';
import type { ReportSectionType } from '../types';

export interface RegenerationRequest {
  studentId: string;
  sectionsToRegenerate: ReportSectionType[];
}

export interface RegenerationResponse {
  success: boolean;
  message?: string;
  sections_regenerated?: number;
  total_tokens?: number;
  error?: string;
}

export async function regenerateReportSections(
  studentId: string,
  sectionsToRegenerate: ReportSectionType[]
): Promise<RegenerationResponse> {
  try {
    const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/regenerate-report-sections`;

    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.access_token) {
      throw new Error('Authentication required. Please sign in again.');
    }

    const { data: { user } } = await supabase.auth.getUser();

    if (!user?.email) {
      throw new Error('Unable to identify current user');
    }

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        studentId,
        counselorEmail: user.email,
        sectionsToRegenerate,
      }),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.error || 'Failed to regenerate sections');
    }

    return result;
  } catch (error: any) {
    console.error('Error regenerating sections:', error);
    return {
      success: false,
      error: error.message || 'Failed to regenerate sections',
    };
  }
}

export const SECTION_LABELS: Record<ReportSectionType, string> = {
  student_type: 'Student Type Classification',
  test_16p: '16 Personalities Test Summary',
  test_high5: 'HIGH5 Strengths Test Summary',
  test_big5: 'Big Five Personality Test Summary',
  test_riasec: 'RIASEC Career Interest Test Summary',
  core_identity_summary: 'Core Identity Summary',
  domain_stem: 'STEM & Applied Sciences',
  domain_biology: 'Biology & Natural Sciences',
  domain_liberal_arts: 'Liberal Arts & Communications',
  domain_business: 'Business & Economics',
  domain_interdisciplinary: 'Interdisciplinary Systems Fields',
  final_summary: 'Overall Insight',
  overall_insight: 'Overall Insight',
};

export const SECTION_CATEGORIES = {
  'Student Profile': ['student_type'] as ReportSectionType[],
  'Individual Test Summaries': ['test_16p', 'test_high5', 'test_big5', 'test_riasec'] as ReportSectionType[],
  'Core Identity Summary': ['core_identity_summary'] as ReportSectionType[],
  'Career Pathway Alignment': [
    'domain_stem',
    'domain_biology',
    'domain_liberal_arts',
    'domain_business',
    'domain_interdisciplinary',
  ] as ReportSectionType[],
  'Overall Insight': ['overall_insight'] as ReportSectionType[],
};
