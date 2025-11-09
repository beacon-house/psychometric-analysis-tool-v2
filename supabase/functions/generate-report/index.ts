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

const GPT_MODEL = "gpt-4o-2024-08-06";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { studentId, counselorEmail } = await req.json();

    if (!studentId) {
      return new Response(
        JSON.stringify({ success: false, error: "Student ID is required" }),
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

    console.log(`Starting report generation for student: ${studentId}`);

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
          error: "All four tests must be completed before generating report",
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
    const generatedSections: any[] = [];

    const sections = [
      { type: "student_type", prompt: getStudentTypePrompt(testDataSummary) },
      { type: "test_16p", prompt: getTest16PPrompt(testDataSummary) },
      { type: "test_high5", prompt: getTestHigh5Prompt(testDataSummary) },
      { type: "test_big5", prompt: getTestBig5Prompt(testDataSummary) },
      { type: "test_riasec", prompt: getTestRiasecPrompt(testDataSummary) },
      { type: "core_identity_summary", prompt: getCoreIdentityPrompt(testDataSummary) },
      {
        type: "domain_business",
        prompt: getDomainPrompt("business", testDataSummary),
      },
      {
        type: "domain_economics",
        prompt: getDomainPrompt("economics", testDataSummary),
      },
      {
        type: "domain_interdisciplinary",
        prompt: getDomainPrompt("interdisciplinary", testDataSummary),
      },
      { type: "domain_stem", prompt: getDomainPrompt("stem", testDataSummary) },
      {
        type: "domain_liberal_arts",
        prompt: getDomainPrompt("liberal_arts", testDataSummary),
      },
    ];

    for (const section of sections) {
      console.log(`Generating section: ${section.type}`);

      const { content, tokensUsed } = await callOpenAI(
        section.prompt,
        openaiApiKey
      );

      totalTokens += tokensUsed;

      const { error: insertError } = await supabase
        .from("report_sections")
        .upsert({
          student_id: studentId,
          section_type: section.type,
          content: content,
          tokens_used: tokensUsed,
          generated_at: new Date().toISOString(),
        });

      if (insertError) {
        console.error(`Error saving section ${section.type}:`, insertError);
      }

      generatedSections.push({ type: section.type, content });
    }

    const previousSectionsText = generatedSections
      .map((s) => `\n## ${s.type}\n${JSON.stringify(s.content, null, 2)}`)
      .join("\n");

    const overallInsightPrompt = getOverallInsightPrompt(
      testDataSummary,
      previousSectionsText
    );

    console.log("Generating overall insight");

    const { content: insightContent, tokensUsed: insightTokens } = await callOpenAI(
      overallInsightPrompt,
      openaiApiKey
    );

    totalTokens += insightTokens;

    await supabase.from("report_sections").upsert({
      student_id: studentId,
      section_type: "overall_insight",
      content: insightContent,
      tokens_used: insightTokens,
      generated_at: new Date().toISOString(),
    });

    await supabase
      .from("students")
      .update({
        report_status: "done",
        report_generated_at: new Date().toISOString(),
        report_generated_by: counselorEmail,
      })
      .eq("id", studentId);

    console.log(
      `Report generation complete. Total tokens used: ${totalTokens}`
    );

    return new Response(
      JSON.stringify({
        success: true,
        message: "Report generated successfully",
        sections_generated: 12,
        total_tokens: totalTokens,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error generating report:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Failed to generate report",
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
            "You are an expert career counselor and psychometric analyst. Provide responses in valid JSON format only. Always refer to the student in third person (the student, they, them) not second person (you, your).",
        },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.5,
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

function getStudentTypePrompt(testData: string): string {
  return `You are an expert career counselor and psychometric analyst. Based on the following comprehensive test results, provide a concise student type classification.

${testData}

Provide a single paragraph (4-5 sentences, 60-80 words) that captures the student's core identity. This should be written in third person.

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

Provide a CONCISE summary with exactly these sections:

1. **What This Test Measures**: 2-3 sentences maximum explaining the five dimensions.

2. **Results Table**: Present results in this exact 3-column format:
   | Trait | Score | Interpretation |

3. **What This Means For Them**: ONE paragraph only (4-5 sentences maximum) explaining how this personality type shows up. NO cross-referencing to other tests. NO career suggestions.

IMPORTANT: Keep total response under 150 words. Be concise and direct.

Format your response as structured JSON with this schema:
{
  "whatItMeasures": "2-3 sentence explanation",
  "results": {
    "personalityType": "Type code (e.g., ESFJ-A)",
    "dimensions": [
      {"name": "Extraversion", "score": "64%", "interpretation": "Brief trait description"}
    ]
  },
  "insights": "Single paragraph (4-5 sentences max) about what this means for the student"
}`;
}

function getTestHigh5Prompt(testData: string): string {
  return `You are an expert career counselor explaining the HIGH5 strengths test results.

${testData}

Provide a CONCISE summary with exactly these sections:

1. **What This Test Measures**: 2-3 sentences maximum.

2. **Results Table**: Present top 5 strengths in this exact 3-column format:
   | Strength | Domain | Interpretation |

3. **What This Means For Them**: ONE paragraph only (4-5 sentences maximum). NO cross-referencing to other tests. NO career suggestions.

IMPORTANT: Keep total response under 150 words.

Format your response as structured JSON with this schema:
{
  "whatItMeasures": "2-3 sentence explanation",
  "results": {
    "topFive": [
      {"rank": 1, "strength": "Name", "domain": "Domain", "interpretation": "Brief description"}
    ]
  },
  "insights": "Single paragraph (4-5 sentences max)"
}`;
}

function getTestBig5Prompt(testData: string): string {
  return `You are an expert career counselor explaining the Big Five personality test results.

${testData}

Provide a CONCISE summary with exactly these sections:

1. **What This Test Measures**: 2-3 sentences maximum.

2. **Results Table**: Present all 5 traits in this exact 3-column format:
   | Trait | Score | Interpretation |

3. **What This Means For Them**: ONE paragraph only (4-5 sentences maximum). NO cross-referencing to other tests. NO career suggestions.

IMPORTANT: Keep total response under 150 words.

Format your response as structured JSON with this schema:
{
  "whatItMeasures": "2-3 sentence explanation",
  "results": {
    "traits": [
      {"name": "Openness", "score": "56%", "interpretation": "Brief trait description"}
    ]
  },
  "insights": "Single paragraph (4-5 sentences max)"
}`;
}

function getTestRiasecPrompt(testData: string): string {
  return `You are an expert career counselor explaining the RIASEC career interest test results.

${testData}

Provide a CONCISE summary with exactly these sections:

1. **What This Test Measures**: 2-3 sentences maximum about Holland's six themes.

2. **Results Table**: Present ALL SIX themes in this exact 3-column format:
   | Theme | Score | Interpretation |
   Order by score (highest to lowest).

3. **Holland Code**: The 3-letter code must be returned as a separate field.

4. **What This Means For Them**: ONE paragraph only (4-5 sentences maximum). NO cross-referencing. NO detailed career lists.

IMPORTANT: Keep total response under 150 words.

Format your response as structured JSON with this schema:
{
  "whatItMeasures": "2-3 sentence explanation",
  "results": {
    "hollandCode": "Three-letter code (e.g., C-S-R)",
    "allThemes": [
      {"theme": "Conventional", "score": "26/32", "interpretation": "Brief interpretation"}
    ]
  },
  "insights": "Single paragraph (4-5 sentences max)"
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

  return `You are an expert career counselor analyzing the student's fit for the ${info.name} domain.

Domain Description: This domain ${info.description}.

Student Test Results:
${testData}

Based on the student's test results, provide:

1. **Strong Areas** (or "Relatively Stronger Areas"): List 3-7 specific majors/fields with brief evidence-based rationale (10-15 words each)
   Format: "**Field Name** – brief rationale citing specific test evidence"

2. **Weaker Areas** (or "Areas to Explore" or "Moderate Areas"): List 3-6 specific majors/fields with brief explanation of gaps (10-15 words each)
   Format: "**Field Name** – brief rationale explaining why it's a weaker fit"

IMPORTANT:
- Use BULLET FORMAT, not prose paragraphs
- Cite specific test scores and strength names
- Be honest about poor fits
- NO "Overall Fit Assessment" paragraph

Format your response as structured JSON with this schema:
{
  "strongerAreas": [
    {"field": "Business Administration & Management", "rationale": "excellent alignment with Conventional (26) + Commander + Deliverer for organizational leadership"}
  ],
  "weakerAreas": [
    {"field": "Economics (Theoretical/Quantitative)", "rationale": "very low Investigative (2) makes econometric research and mathematical modeling misaligned"}
  ]
}`;
}

function getCoreIdentityPrompt(testData: string): string {
  return `You are an expert career counselor synthesizing psychometric test results into a Core Identity Summary.

${testData}

Create TWO distinct outputs:

1. **Core Identity Table** with EXACTLY 4 rows:
   | Category | Key Characteristics |
   | Core Drive | {3-5 keywords with + separators} |
   | Personality | {4-5 comma-separated keywords} |
   | Work Style | {4-5 comma-separated keywords} |
   | Learning Style | {4-5 comma-separated keywords} |

2. **Strengths & Pathways**: Exactly 3-4 bullet points combining HIGH5 strengths with personality traits:
   Format: "**The {Archetype Name}** – {Strength 1} + {Strength 2}: {10-15 word description}"

Format your response as structured JSON with this schema:
{
  "coreIdentity": {
    "coreDrive": "Leadership + Achievement + Service",
    "personality": "Organized, Empathetic, Collaborative, Responsible",
    "workStyle": "Systematic, People-Focused, Reliable, Consensus-Building",
    "learningStyle": "Practical Application, Collaborative Learning, Structured Environments"
  },
  "strengthsPathways": [
    "**The Organized Leader** – Commander + Deliverer: orchestrates teams and projects efficiently while ensuring follow-through."
  ]
}`;
}

function getOverallInsightPrompt(
  testData: string,
  previousSections: string
): string {
  return `You are an expert career counselor creating an overall insight and potential majors list.

Student Test Results:
${testData}

All Previous Report Sections:
${previousSections}

Based on all the information above, provide:

1. **Overall Insight**: ONE paragraph (4-5 sentences) synthesizing:
   - Best-fit domains
   - Strongest alignment areas
   - Why these paths suit the student

2. **Potential Majors**: A list of 6-8 specific majors extracted from "Strong Areas" across all domains
   - Just major names, NO explanations
   - Deduplicate if needed
   - Order by strength of fit

Format your response as structured JSON with this schema:
{
  "overallInsight": "Single paragraph (4-5 sentences) synthesizing best-fit domains",
  "potentialMajors": [
    "Business Administration",
    "Human Resources Management",
    "Operations Management",
    "Nursing (Administration Track)",
    "Public Health",
    "Education Administration"
  ]
}`;
}
