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
  | 'core_identity_summary'
  | 'domain_business'
  | 'domain_economics'
  | 'domain_interdisciplinary'
  | 'domain_stem'
  | 'domain_liberal_arts'
  | 'overall_insight';

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

    // If overall_insight is in the list, process it last
    const hasOverallInsight = sectionsToRegenerate.includes('overall_insight');
    const sectionsWithoutInsight = sectionsToRegenerate.filter(
      (s: SectionType) => s !== 'overall_insight'
    );

    // Regenerate regular sections
    for (const sectionType of sectionsWithoutInsight) {
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
        }, {
          onConflict: 'student_id,section_type'
        });

      if (upsertError) {
        console.error(`Error saving section ${sectionType}:`, upsertError);
        throw new Error(`Failed to save section ${sectionType}`);
      }

      regeneratedSections.push({ type: sectionType, content });
    }

    // Regenerate overall insight if requested
    if (hasOverallInsight) {
      console.log("Regenerating overall insight");

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
        .filter((s: any) => s.section_type !== 'overall_insight')
        .map((s: any) => `\n## ${s.section_type}\n${JSON.stringify(s.content, null, 2)}`)
        .join("\n");

      const overallInsightPrompt = getOverallInsightPrompt(
        testDataSummary,
        previousSectionsText
      );

      const { content: insightContent, tokensUsed: insightTokens } = await callOpenAI(
        overallInsightPrompt,
        openaiApiKey
      );

      totalTokens += insightTokens;

      const { error: insightUpsertError } = await supabase.from("report_sections").upsert({
        student_id: studentId,
        section_type: "overall_insight",
        content: insightContent,
        tokens_used: insightTokens,
        generated_at: new Date().toISOString(),
      }, {
        onConflict: 'student_id,section_type'
      });

      if (insightUpsertError) {
        console.error('Error saving overall insight:', insightUpsertError);
        throw new Error('Failed to save section overall_insight');
      }

      regeneratedSections.push({ type: 'overall_insight', content: insightContent });
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
            "You are an expert career counselor and psychometric analyst. Provide responses in valid JSON format only. CRITICAL: Always use third person (the student, they, them). NEVER use second person (you, your). Be concise and direct.",
        },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.5,
      max_tokens: 2500,
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
    case 'core_identity_summary':
      return getCoreIdentityPrompt(testData);
    case 'domain_business':
      return getDomainPrompt('business', testData);
    case 'domain_biology':
      return getDomainPrompt('biology', testData);
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

IMPORTANT: Use third person only (the student, they, them). NEVER use second person (you, your).

Provide a single paragraph (4-5 sentences, 60-80 words) that captures the student's core identity.

Structure:
Sentence 1: "{Archetype} with {2-3 defining qualities}."
Sentence 2: "The student is {3-4 core traits}, and thrives when {context/situation}."
Sentence 3: "They combine {trait 1} with {trait 2}, preferring to {approach/style}."
Sentence 4: "Their natural ability to {strength} makes them effective in {contexts}."

Format your response as structured JSON with the following schema:
{
  "classification": "Single paragraph in third person describing the student type (4-5 sentences)"
}`;
}

function getTest16PPrompt(testData: string): string {
  return `You are an expert career counselor explaining the 16 Personalities test results.

${testData}

IMPORTANT: Use third person only (the student, they, them). NEVER use second person (you, your).

Provide a CONCISE summary with exactly these sections:

1. **What This Test Measures**: 2-3 sentences maximum explaining the five dimensions.

2. **Results Table**: Present results in this exact 3-column format:
   | Dimension | Score | Preference |

3. **What This Means For You**: ONE paragraph only (4-5 sentences maximum) explaining how this personality type shows up.
   - NO cross-referencing to other tests
   - NO career suggestions
   - Focus only on personality traits and behaviors

IMPORTANT: Keep total response under 150 words. Be concise and direct.

Format your response as structured JSON with this schema:
{
  "whatItMeasures": "2-3 sentence explanation",
  "results": {
    "personalityType": "Type code (e.g., INFJ-T)",
    "dimensions": [
      {"name": "Extraversion", "score": "46%", "preference": "Introverted"}
    ]
  },
  "insights": "Single paragraph in third person (4-5 sentences max) about what this means for the student"
}`;
}

function getTestHigh5Prompt(testData: string): string {
  return `You are an expert career counselor explaining the HIGH5 strengths test results.

${testData}

IMPORTANT: Use third person only (the student, they, them). NEVER use second person (you, your).

Provide a CONCISE summary with exactly these sections:

1. **What This Test Measures**: 2-3 sentences maximum.

2. **Results Table**: Present top 5 strengths in this exact 3-column format:
   | Strength | Domain | Interpretation |

3. **What This Means For You**: ONE paragraph only (4-5 sentences maximum).
   - NO cross-referencing to other tests
   - NO career suggestions
   - Focus on how these strengths manifest in behavior

IMPORTANT: Keep total response under 150 words.

Format your response as structured JSON with this schema:
{
  "whatItMeasures": "2-3 sentence explanation",
  "results": {
    "topFive": [
      {"rank": 1, "strength": "Coach", "domain": "Feeling", "interpretation": "Brief description of what this strength means"}
    ]
  },
  "insights": "Single paragraph in third person (4-5 sentences max)"
}`;
}

function getTestBig5Prompt(testData: string): string {
  return `You are an expert career counselor explaining the Big Five personality test results.

${testData}

IMPORTANT: Use third person only (the student, they, them). NEVER use second person (you, your).

Provide a CONCISE summary with exactly these sections:

1. **What This Test Measures**: 2-3 sentences maximum.

2. **Results Table**: Present all 5 traits in this exact 3-column format:
   | Trait | Percentile | Level |
   CRITICAL: Include actual percentile scores and level descriptions (e.g., "High", "Moderate", "Low")

3. **What This Means For You**: ONE paragraph only (4-5 sentences maximum).
   - NO cross-referencing to other tests
   - NO career suggestions
   - Focus on behavioral tendencies

IMPORTANT: Keep total response under 150 words.

Format your response as structured JSON with this schema:
{
  "whatItMeasures": "2-3 sentence explanation",
  "results": {
    "traits": [
      {"name": "Openness to Experience", "percentile": "63%", "level": "Moderately High"}
    ]
  },
  "insights": "Single paragraph in third person (4-5 sentences max)"
}`;
}

function getTestRiasecPrompt(testData: string): string {
  return `You are an expert career counselor explaining the RIASEC career interest test results.

${testData}

IMPORTANT: Use third person only (the student, they, them). NEVER use second person (you, your).

Provide a CONCISE summary with exactly these sections:

1. **What This Test Measures**: 2-3 sentences maximum about Holland's six themes.

2. **Results Table**: Present ALL SIX themes in this exact 3-column format:
   | Theme | Score | Interpretation |
   Order by score (highest to lowest).

3. **Holland Code**: The 3-letter code must be returned as a separate field.

4. **What This Means For You**: ONE paragraph only (4-5 sentences maximum).
   - NO cross-referencing to other tests
   - NO detailed career lists
   - Focus on work environment preferences

IMPORTANT: Keep total response under 150 words.

Format your response as structured JSON with this schema:
{
  "whatItMeasures": "2-3 sentence explanation",
  "results": {
    "hollandCode": "CSE",
    "allThemes": [
      {"theme": "Conventional", "score": "30/32", "interpretation": "High to very high interest in organized, detail-oriented work"}
    ]
  },
  "insights": "Single paragraph in third person (4-5 sentences max)"
}`;
}

function getDomainPrompt(domain: string, testData: string): string {
  const domainInfo: Record<string, { name: string; description: string }> = {
    stem: {
      name: "STEM & Applied Sciences",
      description:
        "includes fields such as engineering, computer science, mathematics, physics, chemistry, biology, data science, technology development, and applied research",
    },
    biology: {
      name: "Biology & Natural Sciences",
      description:
        "includes fields such as biology, environmental science, ecology, biotechnology, neuroscience, genetics, marine biology, and conservation science",
    },
    liberal_arts: {
      name: "Liberal Arts & Communications",
      description:
        "includes fields such as literature, philosophy, history, media studies, communications, journalism, creative writing, visual arts, and cultural studies",
    },
    business: {
      name: "Business & Economics",
      description:
        "includes fields such as business administration, management, finance, marketing, accounting, economics, entrepreneurship, and organizational behavior",
    },
    interdisciplinary: {
      name: "Interdisciplinary Systems Fields",
      description:
        "include areas that bridge multiple disciplines such as public policy, international relations, sustainability studies, social innovation, data science, behavioral economics, and complex systems analysis",
    },
  };

  const info = domainInfo[domain];

  return `You are an expert career counselor analyzing the student's fit for the ${info.name} domain.

IMPORTANT: Use third person only (the student, they, them). NEVER use second person (you, your).

Domain Description: This domain ${info.description}.

Student Test Results:
${testData}

Based on the student's test results, provide:

1. **Relatively Stronger Areas**: List 3-7 specific majors/fields with brief evidence-based rationale (10-15 words each)
   Format: "**Field Name** – brief rationale citing specific test evidence"

2. **Areas to Explore**: List 3-6 specific majors/fields with brief explanation of gaps (10-15 words each)
   Format: "**Field Name** – brief rationale explaining why it's a weaker fit"

CRITICAL REQUIREMENTS:
- Use BULLET FORMAT ONLY, not prose paragraphs
- Cite specific test scores and strength names in rationales
- Be honest about poor fits
- NO "Overall Fit Assessment" paragraph or section
- Each rationale must be 10-15 words maximum

Format your response as structured JSON with this schema:
{
  "strongerAreas": [
    {"field": "Human Resources Management", "rationale": "high Agreeableness (80%) + Social (26) + Coach for people-focused roles"}
  ],
  "weakerAreas": [
    {"field": "Theoretical Physics", "rationale": "low Investigative (14) makes abstract mathematical modeling less aligned"}
  ]
}`;
}

function getCoreIdentityPrompt(testData: string): string {
  return `You are an expert career counselor synthesizing psychometric test results into a Core Identity Summary.

${testData}

IMPORTANT: Use third person only (the student, they, them). NEVER use second person (you, your).

Create TWO distinct outputs:

1. **Core Identity Table** with EXACTLY 4 rows:
   | Category | Key Characteristics |
   | Core Drive | {3-5 keywords with + separators} |
   | Personality | {4-5 comma-separated keywords} |
   | Work Style | {4-5 comma-separated keywords} |
   | Learning Style | {4-5 comma-separated keywords} |

2. **Strengths & Pathways**: Exactly 3-4 bullet points combining HIGH5 strengths with personality traits:
   Format: "**The {Archetype Name}** – {Strength 1} + {Strength 2}: {10-15 word description}"
   Use third person language in descriptions

Format your response as structured JSON with this schema:
{
  "coreIdentity": {
    "coreDrive": "Leadership + Achievement + Service",
    "personality": "Organized, Empathetic, Collaborative, Responsible",
    "workStyle": "Systematic, People-Focused, Reliable, Consensus-Building",
    "learningStyle": "Practical Application, Collaborative Learning, Structured Environments"
  },
  "strengthsPathways": [
    "**The Organized Leader** – Coach + Deliverer: orchestrates teams efficiently while ensuring follow-through and support."
  ]
}`;
}

function getOverallInsightPrompt(
  testData: string,
  previousSections: string
): string {
  return `You are an expert career counselor creating an overall insight and potential majors list.

IMPORTANT: Use third person only (the student, they, them). NEVER use second person (you, your).

Student Test Results:
${testData}

All Previous Report Sections:
${previousSections}

Based on all the information above, provide:

1. **Overall Insight**: ONE paragraph (4-5 sentences) synthesizing:
   - Best-fit domains from the career pathway analyses
   - Strongest alignment areas across all sections
   - Why these paths suit the student based on their psychometric profile
   - Use third person language throughout

2. **Potential Majors**: A list of 6-8 specific majors extracted from "Relatively Stronger Areas" across all domain sections
   - Just major names, NO explanations or descriptions
   - Deduplicate if needed
   - Order by strength of fit (strongest first)

Format your response as structured JSON with this schema:
{
  "overallInsight": "Single paragraph in third person (4-5 sentences) synthesizing best-fit domains and why they suit the student",
  "potentialMajors": [
    "Human Resources Management",
    "Business Administration",
    "Operations Management",
    "Organizational Behavior",
    "Public Administration",
    "Education Leadership"
  ]
}`;
}
