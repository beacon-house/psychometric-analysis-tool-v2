// Prompt Templates for AI Report Generation
// Configuration for GPT-5 prompts used to generate each section of the psychometric report

export const PROMPT_VERSION = '1.0.0';
export const GPT_MODEL = 'gpt-4o-2024-08-06';

/**
 * Student Type Classification Prompt
 * Input: All four test results
 * Output: High-level personality classification and student type summary
 */
export const STUDENT_TYPE_PROMPT = `You are an expert career counselor and psychometric analyst. Based on the following comprehensive test results, provide a concise student type classification.

{{TEST_DATA}}

Please provide:
1. A brief personality classification (2-3 sentences) that synthesizes insights from all four tests
2. Key characteristics that define this student's unique profile
3. Overall orientation (e.g., analytical thinker, creative collaborator, practical leader, etc.)

Format your response as structured JSON with the following schema:
{
  "classification": "Brief 2-3 sentence classification",
  "keyCharacteristics": ["characteristic 1", "characteristic 2", "characteristic 3"],
  "orientation": "Overall orientation label"
}`;

/**
 * 16 Personalities Test Summary Prompt
 */
export const TEST_16P_PROMPT = `You are an expert career counselor explaining the 16 Personalities test results to a student.

{{TEST_DATA}}

Please provide a comprehensive summary with the following sections:

1. **What This Test Measures**: Explain what the 16 Personalities test measures in 2-3 sentences (focus on the five dimensions: Mind, Energy, Nature, Tactics, Identity)

2. **Your Results**: Present the student's results in a clear, tabular format showing:
   - Each dimension (Mind, Energy, Nature, Tactics, Identity)
   - Their score and preference
   - Clarity level

3. **What This Means For You**: Provide actionable, user-friendly insights (3-4 paragraphs) explaining:
   - How this personality type typically approaches work and learning
   - Key strengths and potential challenges
   - Practical applications for career and academic planning

Format your response as structured JSON with this schema:
{
  "whatItMeasures": "Explanation text",
  "results": {
    "personalityType": "Four letter code",
    "variant": "Assertive/Turbulent",
    "dimensions": [
      {"name": "Mind", "score": "X%", "preference": "Extraverted/Introverted", "clarity": "Clear"},
      ...
    ]
  },
  "insights": "Actionable insights text (can include multiple paragraphs)"
}`;

/**
 * HIGH5 Strengths Test Summary Prompt
 */
export const TEST_HIGH5_PROMPT = `You are an expert career counselor explaining the HIGH5 strengths test results to a student.

{{TEST_DATA}}

Please provide a comprehensive summary with the following sections:

1. **What This Test Measures**: Explain what the HIGH5 test measures in 2-3 sentences (focus on identifying natural talents and strengths)

2. **Your Top 5 Strengths**: Present the student's top 5 strengths with:
   - Strength name and domain
   - Brief description
   - Domain breakdown showing distribution across Doing, Feeling, Motivating, Thinking

3. **What This Means For You**: Provide actionable insights (3-4 paragraphs) explaining:
   - How to leverage these strengths in academic and career contexts
   - Activities and environments where these strengths will shine
   - Potential energy drains to be aware of

Format your response as structured JSON with this schema:
{
  "whatItMeasures": "Explanation text",
  "results": {
    "topFive": [
      {"rank": 1, "strength": "Name", "domain": "Domain", "description": "Brief description"},
      ...
    ],
    "domainBreakdown": {
      "Doing": {"count": 2, "percentage": 40},
      ...
    }
  },
  "insights": "Actionable insights text"
}`;

/**
 * Big Five Personality Test Summary Prompt
 */
export const TEST_BIG5_PROMPT = `You are an expert career counselor explaining the Big Five (OCEAN) personality test results to a student.

{{TEST_DATA}}

Please provide a comprehensive summary with the following sections:

1. **What This Test Measures**: Explain what the Big Five test measures in 2-3 sentences (focus on the five core personality traits)

2. **Your Results**: Present the student's OCEAN scores in a clear format showing:
   - Each trait (Openness, Conscientiousness, Extraversion, Agreeableness, Emotional Stability)
   - Percentile score
   - Interpretation level (Very Low, Low, Moderate, High, Very High)

3. **What This Means For You**: Provide actionable insights (3-4 paragraphs) explaining:
   - How these trait levels influence behavior and preferences
   - Implications for learning style and work environment
   - Areas for personal development and growth

Format your response as structured JSON with this schema:
{
  "whatItMeasures": "Explanation text",
  "results": {
    "traits": [
      {"name": "Openness", "percentile": 75, "level": "High", "interpretation": "Brief interpretation"},
      ...
    ]
  },
  "insights": "Actionable insights text"
}`;

/**
 * RIASEC Career Interest Test Summary Prompt
 */
export const TEST_RIASEC_PROMPT = `You are an expert career counselor explaining the RIASEC career interest test results to a student.

{{TEST_DATA}}

Please provide a comprehensive summary with the following sections:

1. **What This Test Measures**: Explain what the RIASEC test measures in 2-3 sentences (focus on Holland's six career interest themes)

2. **Your Results**: Present the student's results showing:
   - Holland Code (three-letter code)
   - Top three career themes with scores
   - Brief description of each theme

3. **What This Means For You**: Provide actionable insights (3-4 paragraphs) explaining:
   - Career fields and roles aligned with these interests
   - Types of tasks and environments that will be engaging
   - Practical next steps for career exploration

Format your response as structured JSON with this schema:
{
  "whatItMeasures": "Explanation text",
  "results": {
    "hollandCode": "Three letter code",
    "topThemes": [
      {"rank": 1, "theme": "Realistic", "score": 28, "description": "Brief description"},
      ...
    ]
  },
  "insights": "Actionable insights text"
}`;

/**
 * Domain Analysis Prompt Template
 * Used for all 5 domain analysis sections with domain-specific context
 */
export const DOMAIN_ANALYSIS_PROMPT = `You are an expert career counselor analyzing a student's fit for the {{DOMAIN_NAME}} domain.

Domain Description: {{DOMAIN_DESCRIPTION}}

Student Test Results:
{{TEST_DATA}}

Based on the student's comprehensive test results, provide:

1. **Overall Fit Assessment**: Brief assessment (2-3 sentences) of how well-suited this student is for the {{DOMAIN_NAME}} domain

2. **Relatively Stronger Areas**: Identify 3-4 specific sub-fields or specializations within this domain where the student's profile suggests strong potential

3. **Areas to Explore**: Identify 2-3 areas within this domain that might be more challenging but still worth exploring for growth

Format your response as structured JSON with this schema:
{
  "fitAssessment": "Overall fit assessment text",
  "strongerAreas": [
    {"area": "Sub-field name", "rationale": "Why this is a strong fit based on test results"},
    ...
  ],
  "areasToExplore": [
    {"area": "Sub-field name", "rationale": "Why this could be valuable to explore"},
    ...
  ]
}`;

/**
 * Domain-specific descriptions for the 5 career pathway domains
 */
export const DOMAIN_DESCRIPTIONS = {
  business: `Business Management and Leadership includes fields such as strategic management, operations, organizational behavior, human resources, project management, entrepreneurship, and executive leadership.`,

  economics: `Economics and Finance includes fields such as microeconomics, macroeconomics, financial analysis, investment banking, corporate finance, econometrics, quantitative analysis, and financial planning.`,

  interdisciplinary: `Interdisciplinary Systems Fields include areas that bridge multiple disciplines such as public policy, international relations, sustainability studies, social innovation, data science, behavioral economics, and complex systems analysis.`,

  stem: `STEM and Applied Sciences includes fields such as engineering, computer science, mathematics, physics, chemistry, biology, data science, technology development, and applied research.`,

  liberal_arts: `Liberal Arts and Communications includes fields such as literature, philosophy, history, media studies, communications, journalism, creative writing, visual arts, and cultural studies.`,
};

/**
 * Final Summary Prompt
 * Synthesizes all previous sections into cohesive recommendations
 */
export const FINAL_SUMMARY_PROMPT = `You are an expert career counselor creating a comprehensive summary report for a student based on their psychometric assessment.

Student Test Results:
{{TEST_DATA}}

Previous Report Sections Generated:
{{PREVIOUS_SECTIONS}}

Based on all the information above, create a comprehensive final summary with:

1. **Core Identity**: Synthesize the student's personality, strengths, and interests into a cohesive narrative (2-3 paragraphs) that captures who they are

2. **Career Pathway Recommendations**: Based on the domain analyses, provide clear recommendations (2-3 paragraphs) on:
   - Which domains show the strongest alignment
   - Specific career paths or fields to prioritize
   - How their unique profile creates opportunities

3. **Actionable Next Steps**: Provide 4-5 concrete, specific action items the student should take:
   - Academic courses or programs to explore
   - Skills to develop
   - Experiences to seek out
   - Resources to investigate

Format your response as structured JSON with this schema:
{
  "coreIdentity": "Core identity narrative (2-3 paragraphs)",
  "careerRecommendations": "Career pathway recommendations (2-3 paragraphs)",
  "nextSteps": [
    {"step": "Specific action item", "rationale": "Why this step is important"},
    ...
  ]
}`;

/**
 * Helper function to inject test data into prompt template
 */
export function injectTestData(template: string, testDataSummary: string): string {
  return template.replace('{{TEST_DATA}}', testDataSummary);
}

/**
 * Helper function to inject domain-specific information
 */
export function injectDomainInfo(
  template: string,
  domainKey: keyof typeof DOMAIN_DESCRIPTIONS,
  testDataSummary: string
): string {
  const domainNames = {
    business: 'Business Management and Leadership',
    economics: 'Economics and Finance',
    interdisciplinary: 'Interdisciplinary Systems Fields',
    stem: 'STEM and Applied Sciences',
    liberal_arts: 'Liberal Arts and Communications',
  };

  return template
    .replace('{{DOMAIN_NAME}}', domainNames[domainKey])
    .replace('{{DOMAIN_DESCRIPTION}}', DOMAIN_DESCRIPTIONS[domainKey])
    .replace('{{TEST_DATA}}', testDataSummary);
}

/**
 * Helper function to inject previous sections into final summary prompt
 */
export function injectPreviousSections(
  template: string,
  testDataSummary: string,
  previousSections: string
): string {
  return template
    .replace('{{TEST_DATA}}', testDataSummary)
    .replace('{{PREVIOUS_SECTIONS}}', previousSections);
}
