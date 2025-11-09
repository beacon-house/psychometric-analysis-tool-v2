import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.76.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface TestResult {
  test_name: string;
  result_data: any;
}

interface FormattedTestData {
  test16Personalities: any;
  testHigh5: any;
  testBigFive: any;
  testRiasec: any;
}

type SectionType =
  | 'student_type'
  | 'test_16p'
  | 'test_high5'
  | 'test_big5'
  | 'test_riasec'
  | 'domain_business'
  | 'domain_economics'
  | 'domain_interdisciplinary'
  | 'domain_stem'
  | 'domain_liberal_arts'
  | 'final_summary';

const GPT_MODEL = "gpt-4o-2024-08-06";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { studentId, counselorEmail, sectionsToRegenerate } = await req.json();

    if (!studentId || !sectionsToRegenerate || !Array.isArray(sectionsToRegenerate)) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Student ID and sections to regenerate are required"
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const openaiApiKey = Deno.env.get("VITE_OPENAI_API_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log(`Regenerating report sections for student: ${studentId}`);
    console.log(`Sections to regenerate: ${sectionsToRegenerate.join(', ')}`);

    const { data: testResults, error: testError } = await supabase
      .from("test_results")
      .select("*")
      .eq("student_id", studentId)
      .eq("test_status", "completed");

    if (testError) {
      throw new Error(`Failed to fetch test results: ${testError.message}`);
    }

    const requiredTests = ["16Personalities", "HIGH5", "Big Five", "RIASEC"];
    const completedTests = testResults.map((t: TestResult) => t.test_name);

    if (!requiredTests.every((test) => completedTests.includes(test))) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "All four tests must be completed",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const formattedData = formatTestResults(testResults);
    const testDataSummary = createTestDataSummary(formattedData);

    let totalTokens = 0;
    const regeneratedSections: any[] = [];

    // If final_summary is in the list, process it last
    const hasFinalSummary = sectionsToRegenerate.includes('final_summary');
    const sectionsWithoutFinal = sectionsToRegenerate.filter(
      (s: SectionType) => s !== 'final_summary'
    );

    // Regenerate regular sections
    for (const sectionType of sectionsWithoutFinal) {
      console.log(`Regenerating section: ${sectionType}`);

      const prompt = getSectionPrompt(sectionType, testDataSummary);
      const { content, tokensUsed } = await callOpenAI(prompt, openaiApiKey);

      totalTokens += tokensUsed;

      const { error: upsertError } = await supabase
        .from("report_sections")
        .upsert({
          student_id: studentId,
          section_type: sectionType,
          content: content,
          tokens_used: tokensUsed,
          generated_at: new Date().toISOString(),
        });

      if (upsertError) {
        console.error(`Error saving section ${sectionType}:`, upsertError);
        throw new Error(`Failed to save section ${sectionType}`);
      }

      regeneratedSections.push({ type: sectionType, content });
    }

    // Regenerate final summary if requested
    if (hasFinalSummary) {
      console.log("Regenerating final summary");

      // Fetch all current sections for context
      const { data: allSections, error: sectionsError } = await supabase
        .from("report_sections")
        .select("*")
        .eq("student_id", studentId)
        .order("created_at", { ascending: true });

      if (sectionsError) {
        throw new Error(`Failed to fetch sections: ${sectionsError.message}`);
      }

      const previousSectionsText = (allSections || [])
        .filter((s: any) => s.section_type !== 'final_summary')
        .map((s: any) => `\n## ${s.section_type}\n${JSON.stringify(s.content, null, 2)}`)
        .join("\n");

      const finalSummaryPrompt = getFinalSummaryPrompt(
        testDataSummary,
        previousSectionsText
      );

      const { content: finalContent, tokensUsed: finalTokens } = await callOpenAI(
        finalSummaryPrompt,
        openaiApiKey
      );

      totalTokens += finalTokens;

      await supabase.from("report_sections").upsert({
        student_id: studentId,
        section_type: "final_summary",
        content: finalContent,
        tokens_used: finalTokens,
        generated_at: new Date().toISOString(),
      });

      regeneratedSections.push({ type: 'final_summary', content: finalContent });
    }

    // Update student record
    await supabase
      .from("students")
      .update({
        report_status: "done",
        report_generated_at: new Date().toISOString(),
        report_generated_by: counselorEmail,
      })
      .eq("id", studentId);

    console.log(
      `Regeneration complete. Total tokens used: ${totalTokens}`
    );

    return new Response(
      JSON.stringify({
        success: true,
        message: "Sections regenerated successfully",
        sections_regenerated: regeneratedSections.length,
        total_tokens: totalTokens,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error regenerating sections:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Failed to regenerate sections",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

async function callOpenAI(
  prompt: string,
  apiKey: string
): Promise<{ content: any; tokensUsed: number }> {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: GPT_MODEL,
      messages: [
        {
          role: "system",
          content:
            "You are an expert career counselor and psychometric analyst. Provide responses in valid JSON format only.",
        },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 2000,
    }),
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`OpenAI API error: ${response.status} - ${errorData}`);
  }

  const data = await response.json();
  const content = JSON.parse(data.choices[0].message.content);
  const tokensUsed = data.usage.total_tokens;

  return { content, tokensUsed };
}

function formatTestResults(testResults: TestResult[]): FormattedTestData {
  const test16P = testResults.find((t) => t.test_name === "16Personalities");
  const testHigh5 = testResults.find((t) => t.test_name === "HIGH5");
  const testBigFive = testResults.find((t) => t.test_name === "Big Five");
  const testRiasec = testResults.find((t) => t.test_name === "RIASEC");

  return {
    test16Personalities: test16P?.result_data || null,
    testHigh5: testHigh5?.result_data || null,
    testBigFive: testBigFive?.result_data || null,
    testRiasec: testRiasec?.result_data || null,
  };
}

function createTestDataSummary(formattedData: FormattedTestData): string {
  const { test16Personalities, testHigh5, testBigFive, testRiasec } =
    formattedData;

  let summary = "## Student Test Results\n\n";

  if (test16Personalities) {
    summary += `### 16 Personalities Test\n`;
    summary += `- Personality Type: ${test16Personalities.personalityType?.fourLetterCode} (${test16Personalities.personalityType?.fullCode})\n`;
    summary += `- Dimensions:\n`;
    const dims = test16Personalities.dimensionScores;
    if (dims) {
      summary += `  - Extraversion: ${dims.Extraversion?.normalized}% ${dims.Extraversion?.preference}\n`;
      summary += `  - Sensing: ${dims.Sensing?.normalized}% ${dims.Sensing?.preference}\n`;
      summary += `  - Thinking: ${dims.Thinking?.normalized}% ${dims.Thinking?.preference}\n`;
      summary += `  - Judging: ${dims.Judging?.normalized}% ${dims.Judging?.preference}\n`;
      summary += `  - Assertive: ${dims.Assertive?.normalized}% ${dims.Assertive?.preference}\n\n`;
    }
  }

  if (testHigh5) {
    summary += `### HIGH5 Strengths Test\n`;
    summary += `- Top 5 Strengths:\n`;
    testHigh5.topFiveStrengths?.forEach((strength: any, index: number) => {
      summary += `  ${index + 1}. ${strength.strength} (${strength.domain}) - Score: ${strength.score}\n`;
    });
    summary += "\n";
  }

  if (testBigFive) {
    summary += `### Big Five Personality Test\n`;
    summary += `- Trait Scores:\n`;
    testBigFive.traitInterpretations?.forEach((trait: any) => {
      summary += `  - ${trait.trait}: ${trait.percentileScore}% (${trait.level})\n`;
    });
    summary += "\n";
  }

  if (testRiasec) {
    summary += `### RIASEC Career Interest Test\n`;
    summary += `- Holland Code: ${testRiasec.hollandCode}\n`;
    summary += `- All 6 Career Theme Scores:\n`;
    testRiasec.allScores?.forEach((scoreObj: any) => {
      summary += `  - ${scoreObj.theme}: Score ${scoreObj.normalizedScore}/32 - ${scoreObj.description}\n`;
    });
    summary += "\n";
  }

  return summary;
}

function getSectionPrompt(sectionType: SectionType, testData: string): string {
  switch (sectionType) {
    case 'student_type':
      return getStudentTypePrompt(testData);
    case 'test_16p':
      return getTest16PPrompt(testData);
    case 'test_high5':
      return getTestHigh5Prompt(testData);
    case 'test_big5':
      return getTestBig5Prompt(testData);
    case 'test_riasec':
      return getTestRiasecPrompt(testData);
    case 'domain_business':
      return getDomainPrompt('business', testData);
    case 'domain_economics':
      return getDomainPrompt('economics', testData);
    case 'domain_interdisciplinary':
      return getDomainPrompt('interdisciplinary', testData);
    case 'domain_stem':
      return getDomainPrompt('stem', testData);
    case 'domain_liberal_arts':
      return getDomainPrompt('liberal_arts', testData);
    default:
      throw new Error(`Unknown section type: ${sectionType}`);
  }
}

function getStudentTypePrompt(testData: string): string {
  return `You are an expert career counselor and psychometric analyst. Based on the following comprehensive test results, provide a concise student type classification.

${testData}

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
}

function getTest16PPrompt(testData: string): string {
  return `You are an expert career counselor explaining the 16 Personalities test results to a student.

${testData}

Please provide a comprehensive summary with the following sections:

1. **What This Test Measures**: Explain what the 16 Personalities test measures in 2-3 sentences (focus on the five dimensions: Mind, Energy, Nature, Tactics, Identity)

2. **Your Results**: Present the student's results in a clear, tabular format showing each dimension with their score and preference

3. **What This Means For You**: Provide actionable, user-friendly insights (3-4 paragraphs) explaining how this personality type typically approaches work and learning, key strengths and potential challenges, and practical applications for career and academic planning.

Format your response as structured JSON with this schema:
{
  "whatItMeasures": "Explanation text",
  "results": {
    "personalityType": "Type code",
    "dimensions": [{"name": "Dimension", "score": "X%", "preference": "Label"}]
  },
  "insights": "Actionable insights text"
}`;
}

function getTestHigh5Prompt(testData: string): string {
  return `You are an expert career counselor explaining the HIGH5 strengths test results to a student.

${testData}

Please provide a comprehensive summary with the following sections:

1. **What This Test Measures**: Explain what the HIGH5 test measures in 2-3 sentences
2. **Your Top 5 Strengths**: Present the student's top 5 strengths with strength name, domain, and brief description
3. **What This Means For You**: Provide actionable insights (3-4 paragraphs) explaining how to leverage these strengths

Format your response as structured JSON with this schema:
{
  "whatItMeasures": "Explanation text",
  "results": {
    "topFive": [{"rank": 1, "strength": "Name", "domain": "Domain", "description": "Description"}]
  },
  "insights": "Actionable insights text"
}`;
}

function getTestBig5Prompt(testData: string): string {
  return `You are an expert career counselor explaining the Big Five (OCEAN) personality test results to a student.

${testData}

Please provide a comprehensive summary with the following sections:

1. **What This Test Measures**: Explain what the Big Five test measures in 2-3 sentences
2. **Your Results**: Present the student's OCEAN scores showing each trait with percentile and level
3. **What This Means For You**: Provide actionable insights (3-4 paragraphs)

Format your response as structured JSON with this schema:
{
  "whatItMeasures": "Explanation text",
  "results": {
    "traits": [{"name": "Trait", "percentile": 75, "level": "High"}]
  },
  "insights": "Actionable insights text"
}`;
}

function getTestRiasecPrompt(testData: string): string {
  return `You are an expert career counselor explaining the RIASEC career interest test results to a student.

${testData}

Please provide a comprehensive summary with the following sections:

1. **What This Test Measures**: Explain what the RIASEC test measures in 2-3 sentences (focus on Holland's six career interest themes)

2. **Your Results**: Present the student's results showing:
   - Holland Code (three-letter code representing top 3 themes)
   - ALL SIX career themes with their scores and one-line interpretations:
     * Realistic (practical, hands-on work)
     * Investigative (analytical, research-oriented)
     * Artistic (creative expression)
     * Social (helping others)
     * Enterprising (leading and managing)
     * Conventional (organized, detail-oriented)

3. **What This Means For You**: Provide actionable insights (3-4 paragraphs) explaining:
   - Career fields and roles aligned with these interests
   - Types of tasks and environments that will be engaging
   - Practical next steps for career exploration

Format your response as structured JSON with this schema:
{
  "whatItMeasures": "Explanation text",
  "results": {
    "hollandCode": "Three letter code",
    "allThemes": [
      {"theme": "Realistic", "score": 28, "interpretation": "One-line interpretation of what this score means"},
      {"theme": "Investigative", "score": 25, "interpretation": "One-line interpretation"},
      {"theme": "Artistic", "score": 22, "interpretation": "One-line interpretation"},
      {"theme": "Social", "score": 20, "interpretation": "One-line interpretation"},
      {"theme": "Enterprising", "score": 18, "interpretation": "One-line interpretation"},
      {"theme": "Conventional", "score": 15, "interpretation": "One-line interpretation"}
    ]
  },
  "insights": "Actionable insights text"
}`;
}

function getDomainPrompt(domain: string, testData: string): string {
  const domainInfo: Record<string, { name: string; description: string }> = {
    business: {
      name: "Business Management and Leadership",
      description:
        "includes fields such as strategic management, operations, organizational behavior, human resources, project management, entrepreneurship, and executive leadership",
    },
    economics: {
      name: "Economics and Finance",
      description:
        "includes fields such as microeconomics, macroeconomics, financial analysis, investment banking, corporate finance, econometrics, quantitative analysis, and financial planning",
    },
    interdisciplinary: {
      name: "Interdisciplinary Systems Fields",
      description:
        "include areas that bridge multiple disciplines such as public policy, international relations, sustainability studies, social innovation, data science, behavioral economics, and complex systems analysis",
    },
    stem: {
      name: "STEM and Applied Sciences",
      description:
        "includes fields such as engineering, computer science, mathematics, physics, chemistry, biology, data science, technology development, and applied research",
    },
    liberal_arts: {
      name: "Liberal Arts and Communications",
      description:
        "includes fields such as literature, philosophy, history, media studies, communications, journalism, creative writing, visual arts, and cultural studies",
    },
  };

  const info = domainInfo[domain];

  return `You are an expert career counselor analyzing a student's fit for the ${info.name} domain.

Domain Description: This domain ${info.description}.

Student Test Results:
${testData}

Based on the student's comprehensive test results, provide:

1. **Overall Fit Assessment**: Brief assessment (2-3 sentences) of how well-suited this student is for the ${info.name} domain

2. **Relatively Stronger Areas**: Identify 3-4 specific sub-fields or specializations within this domain where the student's profile suggests strong potential

3. **Areas to Explore**: Identify 2-3 areas within this domain that might be more challenging but still worth exploring for growth

Format your response as structured JSON with this schema:
{
  "fitAssessment": "Overall fit assessment text",
  "strongerAreas": [
    {"area": "Sub-field name", "rationale": "Why this is a strong fit"}
  ],
  "areasToExplore": [
    {"area": "Sub-field name", "rationale": "Why this could be valuable"}
  ]
}`;
}

function getFinalSummaryPrompt(
  testData: string,
  previousSections: string
): string {
  return `You are an expert career counselor creating a comprehensive summary report for a student based on their psychometric assessment.

Student Test Results:
${testData}

Previous Report Sections Generated:
${previousSections}

Based on all the information above, create a comprehensive final summary with:

1. **Core Identity**: Synthesize the student's personality, strengths, and interests into a cohesive narrative (2-3 paragraphs)

2. **Career Pathway Recommendations**: Based on the domain analyses, provide clear recommendations (2-3 paragraphs) on which domains show the strongest alignment and specific career paths to prioritize

3. **Actionable Next Steps**: Provide 4-5 concrete, specific action items the student should take

Format your response as structured JSON with this schema:
{
  "coreIdentity": "Core identity narrative",
  "careerRecommendations": "Career pathway recommendations",
  "nextSteps": [
    {"step": "Specific action item", "rationale": "Why this step is important"}
  ]
}`;
}
