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
  domain_business: 'Business Management & Leadership Analysis',
  domain_economics: 'Economics & Finance Analysis',
  domain_interdisciplinary: 'Interdisciplinary Systems Analysis',
  domain_stem: 'STEM & Applied Sciences Analysis',
  domain_liberal_arts: 'Liberal Arts & Communications Analysis',
  final_summary: 'Comprehensive Summary',
};

export const SECTION_CATEGORIES = {
  'Student Profile': ['student_type'] as ReportSectionType[],
  'Test Summaries': ['test_16p', 'test_high5', 'test_big5', 'test_riasec'] as ReportSectionType[],
  'Domain Analyses': [
    'domain_business',
    'domain_economics',
    'domain_interdisciplinary',
    'domain_stem',
    'domain_liberal_arts',
  ] as ReportSectionType[],
  'Final Summary': ['final_summary'] as ReportSectionType[],
};
