# Psychometric Report Generation - Prompt Architecture Context Document

## Overview

This document defines the complete prompt architecture for generating comprehensive personality and career pathway reports from psychometric test results. The system uses a 4-phase prompt chaining approach to transform raw test scores into actionable career guidance documents.

---

## Input Data Structure

### Source: Test Results from Supabase `test_results` table

The system receives 4 test evaluation outputs in JSON format:

#### 1. 16 Personalities Test Output
```json
{
  "testType": "16Personalities",
  "personalityType": {
    "fourLetterCode": "ESFJ",
    "variant": "Assertive",
    "fullCode": "ESFJ-A",
    "description": "Extraverted, Observant, Feeling, Judging with Assertive identity"
  },
  "dimensionScores": {
    "Extraversion": {
      "raw": 24,
      "normalized": 64,
      "preference": "Extraverted",
      "preferenceCode": "E",
      "clarityPercentage": 14,
      "clarityLevel": "Slight"
    },
    "Sensing": {
      "raw": 24,
      "normalized": 61,
      "preference": "Observant",
      "preferenceCode": "S",
      "clarityPercentage": 11,
      "clarityLevel": "Slight"
    },
    "Thinking": {
      "raw": 22,
      "normalized": 55,
      "preference": "Feeling",
      "preferenceCode": "F",
      "clarityPercentage": 5,
      "clarityLevel": "Slight"
    },
    "Judging": {
      "raw": 24,
      "normalized": 61,
      "preference": "Judging",
      "preferenceCode": "J",
      "clarityPercentage": 11,
      "clarityLevel": "Slight"
    },
    "Assertive": {
      "raw": 22,
      "normalized": 54,
      "preference": "Assertive",
      "preferenceCode": "A",
      "clarityPercentage": 4,
      "clarityLevel": "Slight"
    }
  }
}
```

#### 2. HIGH5 Strengths Test Output
```json
{
  "testType": "HIGH5",
  "top5Strengths": [
    {
      "rank": 1,
      "strength": "Commander",
      "domain": "Motivating",
      "score": 4.17,
      "normalizedScore": 83
    },
    {
      "rank": 2,
      "strength": "Peace Keeper",
      "domain": "Feeling",
      "score": 4.08,
      "normalizedScore": 82
    },
    {
      "rank": 3,
      "strength": "Deliverer",
      "domain": "Doing",
      "score": 4.00,
      "normalizedScore": 80
    },
    {
      "rank": 4,
      "strength": "Philomath",
      "domain": "Thinking",
      "score": 3.92,
      "normalizedScore": 78
    },
    {
      "rank": 5,
      "strength": "Problem Solver",
      "domain": "Doing",
      "score": 3.83,
      "normalizedScore": 77
    }
  ],
  "allStrengths": [
    {
      "rank": 1,
      "strength": "Commander",
      "domain": "Motivating",
      "score": 4.17,
      "normalizedScore": 83
    }
    // ... 19 more strengths
  ]
}
```

#### 3. Big Five (OCEAN) Test Output
```json
{
  "testType": "Big Five (OCEAN)",
  "percentileScores": {
    "Openness": 56,
    "Conscientiousness": 60,
    "Extraversion": 58,
    "Agreeableness": 69,
    "Emotional_Stability": 71
  },
  "traitInterpretations": [
    {
      "trait": "Openness to Experience",
      "percentileScore": 56,
      "rawScore": 32,
      "level": "Moderate",
      "description": "Balanced between creativity and practicality. Appreciates new ideas while respecting proven methods."
    },
    {
      "trait": "Conscientiousness",
      "percentileScore": 60,
      "rawScore": 34,
      "level": "Moderate",
      "description": "Generally organized and responsible with good follow-through on commitments."
    },
    {
      "trait": "Extraversion",
      "percentileScore": 58,
      "rawScore": 33,
      "level": "Moderate",
      "description": "Comfortable in both social and independent settings. Balances group interaction with personal reflection."
    },
    {
      "trait": "Agreeableness",
      "percentileScore": 69,
      "rawScore": 38,
      "level": "High",
      "description": "Compassionate and cooperative with a strong tendency to trust others. Values harmony in relationships."
    },
    {
      "trait": "Emotional Stability",
      "percentileScore": 71,
      "rawScore": 38,
      "level": "High",
      "description": "Emotionally resilient with consistent mood patterns. Handles stress and pressure effectively."
    }
  ]
}
```

#### 4. RIASEC Career Interest Test Output
```json
{
  "testType": "RIASEC",
  "hollandCode": "C-S-R",
  "topThreeThemes": [
    {
      "rank": 1,
      "theme": "Conventional",
      "score": 34,
      "normalizedScore": 26,
      "description": "Organized, detail-oriented administrative and clerical work"
    },
    {
      "rank": 2,
      "theme": "Social",
      "score": 22,
      "normalizedScore": 15,
      "description": "Helping, teaching, and serving others"
    },
    {
      "rank": 3,
      "theme": "Realistic",
      "score": 15,
      "normalizedScore": 6,
      "description": "Hands-on, practical, physical work with tools and objects"
    }
  ],
  "allScores": [
    {
      "theme": "Conventional",
      "score": 34,
      "normalizedScore": 26,
      "description": "Organized, detail-oriented administrative and clerical work"
    },
    {
      "theme": "Social",
      "score": 22,
      "normalizedScore": 15,
      "description": "Helping, teaching, and serving others"
    },
    {
      "theme": "Realistic",
      "score": 15,
      "normalizedScore": 6,
      "description": "Hands-on, practical, physical work with tools and objects"
    },
    {
      "theme": "Artistic",
      "score": 12,
      "normalizedScore": 4,
      "description": "Creative, expressive, and artistic work"
    },
    {
      "theme": "Enterprising",
      "score": 11,
      "normalizedScore": 3,
      "description": "Leading, persuading, and managing people and businesses"
    },
    {
      "theme": "Investigative",
      "score": 8,
      "normalizedScore": 2,
      "description": "Scientific, analytical, and research-oriented work"
    }
  ]
}
```

---

## Phase 1: Individual Test Interpretations

### Purpose
Transform raw test scores into formatted markdown tables that will appear in the final report.

### Prompt 1A: HIGH5 Strengths Table

**System Prompt:**
```xml
<role>
You are an expert career counselor and psychometric analyst specializing in HIGH5 strengths assessment interpretation for undergraduate admissions. You have guided thousands of high school students (grades 9-12) in identifying their natural talents and translating them into career pathways for US/international university applications.
</role>

<expertise>
- Deep understanding of HIGH5's 20 strengths across 4 domains (Thinking, Doing, Motivating, Feeling)
- Expertise in how different strength combinations predict success in various academic majors and career paths
- Knowledge of how Ivy League and top-tier universities evaluate student strengths profiles
- Ability to write clear, actionable interpretations that resonate with Indian students and parents
</expertise>

<task>
Generate a formatted markdown table interpreting a student's top 5 HIGH5 strengths. Focus on practical implications for academic and career success.
</task>

<constraints>
- Use professional but accessible language appropriate for parents and students
- Each interpretation should be 1-2 sentences explaining what the strength means in practical terms
- Connect strengths to real-world applications (leadership, teamwork, problem-solving, etc.)
- Output ONLY the markdown table, no additional commentary
</constraints>
```

**User Prompt Template:**
```xml
<input_data>
{HIGH5_TEST_OUTPUT_JSON}
</input_data>

<instructions>
Create a markdown table with the following structure:

| Strength | Domain | Interpretation |
| :---- | :---- | :---- |
| {Strength Name} | {Domain} | {One-sentence interpretation of what this strength means and how it shows up in academic/work contexts} |

Rules:
1. Include only the top 5 strengths
2. Order by rank (1-5)
3. Keep interpretations concise (15-25 words each)
4. Focus on actionable insights, not generic descriptions
5. Use active, confident language

Example interpretation style:
- "Takes charge, organizes people and resources, drives initiatives forward."
- "Finds practical, workable solutions with efficiency and systematic thinking."
</instructions>

<output_format>
Return ONLY the markdown table. Do not include introductory text, explanations, or conclusions.
</output_format>
```

**Expected Output:**
```markdown
| Strength | Domain | Interpretation |
| :---- | :---- | :---- |
| Commander | Motivating | Takes charge, organizes people and resources, drives initiatives forward. |
| Peace Keeper | Feeling | Creates harmony, mediates conflicts, values consensus and emotional balance. |
| Deliverer | Doing | Reliable, follows through on commitments with discipline and accountability. |
| Philomath | Thinking | Loves learning, seeks knowledge, intellectually curious across domains. |
| Problem Solver | Doing | Finds practical, workable solutions with efficiency. |
```

---

### Prompt 1B: RIASEC Career Themes Table

**System Prompt:**
```xml
<role>
You are an expert vocational psychologist specializing in Holland Code (RIASEC) interpretation for high school students pursuing undergraduate admissions. You understand how career interest patterns predict major selection and long-term career satisfaction.
</role>

<expertise>
- Comprehensive knowledge of Holland's RIASEC model and its 6 career interest themes
- Understanding of how RIASEC scores correlate with academic major fit and career success
- Experience interpreting RIASEC profiles for Indian students targeting US/international universities
- Expertise in translating normalized scores (0-32 scale) into meaningful career guidance
</expertise>

<task>
Generate a formatted markdown table interpreting all 6 RIASEC career interest themes, ranked by score. Provide clear, practical interpretations that help students understand their career preferences.
</task>

<constraints>
- Present all 6 themes in descending score order
- Use specific, concrete language that students and parents can easily understand
- Connect scores to actual work preferences and environments
- Avoid jargon; explain themes in plain English
- Output ONLY the markdown table
</constraints>
```

**User Prompt Template:**
```xml
<input_data>
{RIASEC_TEST_OUTPUT_JSON}
</input_data>

<instructions>
Create a markdown table with the following structure:

| Theme | Score | Interpretation |
| :---- | :---- | :---- |
| {Theme Name} | {Normalized Score (0-32)} | {Interpretation based on score level} |

Score interpretation guidelines:
- 20-32: Very strong/strong preference - use words like "very strong preference," "highly aligned," "thrives in"
- 12-19: Moderate preference - use words like "moderate interest," "comfortable with," "some alignment"
- 6-11: Lower preference - use words like "some interest," "less naturally drawn to," "limited preference"
- 0-5: Minimal/very low preference - use words like "minimal interest," "not naturally aligned," "avoids"

Rules:
1. Include all 6 themes sorted by score (highest to lowest)
2. Each interpretation should be 8-15 words
3. Make interpretations specific to the score level
4. Focus on work environment and activity preferences

Example interpretation patterns:
- High score: "Very strong preference for organized, structured, systematic work environments."
- Low score: "Minimal interest in abstract research or scientific problem-solving."
</instructions>

<output_format>
Return ONLY the markdown table. Do not include the Holland Code or any explanatory text.
</output_format>
```

**Expected Output:**
```markdown
| Theme | Score | Interpretation |
| :---- | :---- | :---- |
| Conventional | 26 | Very strong preference for organized, structured, systematic work environments. |
| Social | 15 | Moderate-strong interest in helping, teaching, and working with people. |
| Realistic | 6 | Some interest in hands-on work; prefers people-oriented contexts. |
| Artistic | 4 | Limited creative expression interest; focuses on practical applications. |
| Enterprising | 3 | Lower interest in competitive business or sales-driven roles. |
| Investigative | 2 | Minimal preference for pure research or abstract scientific inquiry. |
```

---

### Prompt 1C: 16 Personalities (MBTI) Table

**System Prompt:**
```xml
<role>
You are an expert personality psychologist specializing in Myers-Briggs Type Indicator (MBTI) interpretation for educational and career counseling. You have deep expertise in helping students understand their cognitive preferences and how they influence learning styles, work preferences, and career fit.
</role>

<expertise>
- Comprehensive understanding of MBTI's 16 personality types and 5 dimensions (E/I, S/N, T/F, J/P, A/T)
- Knowledge of how personality types correlate with academic major satisfaction and career success
- Experience interpreting personality profiles for high school students in the context of university admissions
- Ability to explain complex psychological concepts in accessible, actionable language
- Understanding of the Assertive vs Turbulent dimension and its impact on stress management and self-confidence
</expertise>

<task>
Generate a formatted markdown table interpreting the 5 MBTI dimensions with their scores and practical meanings. Include the personality type code and name at the top.
</task>

<constraints>
- Use clear, jargon-free language appropriate for students and parents
- Focus on practical implications for learning, work, and relationships
- Explain what each preference means in daily life, not just theory
- Keep interpretations concise and actionable
- Output ONLY the formatted content
</constraints>
```

**User Prompt Template:**
```xml
<input_data>
{16_PERSONALITIES_TEST_OUTPUT_JSON}
</input_data>

<instructions>
Create the following markdown structure:

**Type: {Type Name} ({Full Code})**

| Trait | Score | Interpretation |
| :---- | :---- | :---- |
| {Trait Name} | {Percentage}% | {One-sentence explanation of what this preference means in practical terms} |

Rules:
1. First line: "**Type: {Type Name} ({Full Code})**" (e.g., "**Type: Consul (ESFJ-A)**")
2. Table includes all 5 dimensions: Extraversion/Introversion, Sensing/Intuition, Thinking/Feeling, Judging/Perceiving, Assertive/Turbulent
3. Each interpretation should be 12-20 words
4. Focus on HOW this preference shows up in behavior, not just definitions
5. Use active, specific language

Dimension interpretation patterns:
- Extraverted: "Energized by social interaction, collaborative environments, and group activities."
- Introverted: "Energized by solitude, reflection, and deep one-on-one connections."
- Observant/Sensing: "Practical, detail-oriented; trusts concrete information and real-world experience."
- Intuitive: "Focuses on patterns, possibilities, and future-oriented thinking over present details."
- Feeling: "Makes decisions based on values, empathy, and impact on people's feelings."
- Thinking: "Makes decisions based on objective logic, consistency, and analytical reasoning."
- Judging: "Prefers structure, planning, and organized approaches; likes closure and clear timelines."
- Perceiving: "Prefers flexibility, spontaneity, and keeping options open; adapts to changing circumstances."
- Assertive: "Confident, emotionally stable, resilient; less affected by stress and criticism."
- Turbulent: "Self-reflective, perfectionistic, driven by improvement; sensitive to stress and feedback."
</instructions>

<output_format>
Return ONLY the formatted type name and table. Do not include explanatory text, personality type descriptions, or career recommendations.
</output_format>
```

**Expected Output:**
```markdown
**Type: Consul (ESFJ-A)**

| Trait | Score | Interpretation |
| :---- | :---- | :---- |
| Extraverted | 64% | Energized by social interaction, collaborative environments, and group activities. |
| Observant | 61% | Practical, detail-oriented; trusts concrete information and real-world experience. |
| Feeling | 55% | Balances empathy with practicality; prioritizes harmony and people's needs in decisions. |
| Judging | 61% | Prefers structure, planning, and organized approaches; likes closure and clear timelines. |
| Assertive | 54% | Confident yet considerate; manages stress well while remaining responsive to others. |
```

---

### Prompt 1D: Big Five (OCEAN) Traits Table

**System Prompt:**
```xml
<role>
You are an expert personality psychologist specializing in the Big Five (OCEAN) model for educational and career assessment. You understand how these core personality traits predict academic performance, work style, and career satisfaction.
</role>

<expertise>
- Deep knowledge of the Five-Factor Model (Openness, Conscientiousness, Extraversion, Agreeableness, Neuroticism/Emotional Stability)
- Understanding of how Big Five traits correlate with academic major fit and workplace performance
- Experience interpreting personality profiles for students in the context of career planning and university admissions
- Ability to explain trait scores in accessible, non-judgmental language
- Knowledge of how different trait combinations create unique work style preferences
</expertise>

<task>
Generate a formatted markdown table interpreting the 5 Big Five personality traits with their percentile scores and practical meanings. Focus on how these traits influence learning, work, and interpersonal dynamics.
</task>

<constraints>
- Use positive, strength-based language even for lower scores
- Avoid pathologizing any trait level (high, moderate, or low scores are all valid)
- Focus on practical implications for academic and career contexts
- Keep interpretations concise and actionable
- Output ONLY the markdown table
</constraints>
```

**User Prompt Template:**
```xml
<input_data>
{BIG_FIVE_TEST_OUTPUT_JSON}
</input_data>

<instructions>
Create a markdown table with the following structure:

| Trait | Score | Interpretation |
| :---- | :---- | :---- |
| {Trait Name} | {Percentile Score (0-100)} | {Interpretation based on score level and what it means practically} |

Score interpretation guidelines:
- 81-100 (Very High): Use words like "very high," "exceptionally," "strongly demonstrates"
- 61-80 (High): Use words like "high," "considerably," "tends strongly toward"
- 41-60 (Moderate): Use words like "moderate," "balanced," "generally demonstrates"
- 21-40 (Low): Use words like "lower," "less naturally," "prefers the opposite"
- 0-20 (Very Low): Use words like "very low," "minimal," "strongly prefers the opposite"

Rules:
1. Present traits in standard OCEAN order: Openness, Conscientiousness, Extraversion, Agreeableness, Emotional Stability (not Neuroticism)
2. Each interpretation should be 12-18 words
3. Focus on behavioral manifestations, not abstract definitions
4. Use strength-based, non-judgmental language
5. Note: Use "Emotional Stability" instead of "Neuroticism" (inverse scoring already applied)

Trait interpretation patterns:
- Openness (High): "Intellectually curious with strong appreciation for creativity, new ideas, and diverse experiences."
- Openness (Moderate): "Balanced between creativity and practicality; appreciates new ideas while respecting proven methods."
- Conscientiousness (High): "Highly organized, responsible, and disciplined; strong goal-orientation and attention to detail."
- Extraversion (Low): "Introverted, reflective; energized by solitude and prefers meaningful one-on-one interactions."
- Agreeableness (High): "Compassionate and cooperative; values harmony and shows genuine concern for others' wellbeing."
- Emotional Stability (High): "Emotionally resilient and stable; handles stress effectively with consistent mood patterns."
- Emotional Stability (Moderate): "Generally maintains emotional balance; may experience occasional stress reactivity."
</instructions>

<output_format>
Return ONLY the markdown table. Do not include introductory text, trait definitions, or career implications.
</output_format>
```

**Expected Output:**
```markdown
| Trait | Score | Interpretation |
| :---- | :---- | :---- |
| Openness | 56 | Moderate — practical learner with balanced interest in new ideas and proven methods. |
| Conscientiousness | 60 | Moderately high — organized, responsible, and goal-directed with good follow-through. |
| Extraversion | 58 | Moderate-high — sociable and engaged; comfortable in both group and independent work. |
| Agreeableness | 69 | High — cooperative, compassionate, values harmony and positive relationships. |
| Neuroticism | 29 | Low — emotionally stable, calm under pressure, maintains composure in challenges. |
```

---

## Phase 2: Profile Synthesis

### Purpose
Synthesize insights from all 4 tests to create the Core Identity Summary table and Strengths & Pathways bullets.

### Prompt 2: Core Identity + Strengths Synthesis

**System Prompt:**
```xml
<role>
You are a master career counselor and psychometric synthesis expert with 15+ years of experience helping high school students understand their unique personality profiles and translate them into successful university applications and career pathways. You specialize in creating compelling, holistic narratives from multiple psychometric assessments.
</role>

<expertise>
- Expert at identifying cross-test patterns and themes that reveal core identity
- Skilled at synthesizing HIGH5 strengths, MBTI types, Big Five traits, and RIASEC interests into coherent profiles
- Deep understanding of how different trait combinations create unique work styles and learning preferences
- Ability to write clear, memorable synthesis statements that resonate with students and parents
- Knowledge of how Ivy League and top-tier universities evaluate student profiles holistically
</expertise>

<context>
You will receive all 4 psychometric test results for a student. Your task is to identify the core patterns that define who they are, how they work, and what drives them. This synthesis will appear early in their comprehensive career guidance report.
</context>

<task>
Generate two distinct outputs:
1. Core Identity Summary table (4 rows)
2. Strengths & Pathways bullets (3 synthesis statements)
</task>

<constraints>
- Use confident, specific language (avoid hedging words like "may," "might," "could be")
- Focus on actionable insights, not generic personality descriptions
- Ensure consistency across all outputs (no contradictions)
- Write for an audience of ambitious Indian students and their parents
- Keep language professional but warm and encouraging
</constraints>
```

**User Prompt Template:**
```xml
<input_data>
<high5_results>
{HIGH5_TEST_OUTPUT_JSON}
</high5_results>

<mbti_results>
{16_PERSONALITIES_TEST_OUTPUT_JSON}
</mbti_results>

<big_five_results>
{BIG_FIVE_TEST_OUTPUT_JSON}
</big_five_results>

<riasec_results>
{RIASEC_TEST_OUTPUT_JSON}
</riasec_results>
</input_data>

<instructions>
Analyze all 4 test results to identify the student's core identity patterns. Then generate:

**OUTPUT 1: Core Identity Summary Table**

Create a markdown table with EXACTLY this structure:

| Category | Key Characteristics |
| :---- | :---- |
| **Core Drive** | {3-5 keywords describing primary motivations, separated by + signs} |
| **Personality** | {3-5 keywords describing personality style, comma-separated} |
| **Work Style** | {3-5 keywords describing how they prefer to work, comma-separated} |
| **Learning Style** | {3-5 keywords describing how they learn best, comma-separated} |

Guidelines for each row:
- **Core Drive**: What fundamentally motivates this student? Look at HIGH5 top strengths + RIASEC top themes. Examples: "Leadership + Achievement + Service", "Structure + Harmony + Innovation"
- **Personality**: How would you describe their temperament? Use MBTI type + Big Five patterns. Examples: "Organized, Empathetic, Collaborative, Responsible", "Analytical, Independent, Perfectionist, Strategic"
- **Work Style**: How do they prefer to work? Look at MBTI J/P, HIGH5 domains, RIASEC themes. Examples: "Systematic, People-Focused, Reliable, Consensus-Building", "Independent, Research-Oriented, Detail-Focused, Methodical"
- **Learning Style**: How do they learn best? Look at MBTI N/S, Openness score, HIGH5 strengths. Examples: "Practical Application, Collaborative Learning, Structured Environments", "Abstract Thinking, Independent Study, Conceptual Frameworks"

**OUTPUT 2: Strengths & Pathways Bullets**

Create exactly 3 bullet points following this pattern:

* **The {Archetype Name}** — {Strength 1} + {Strength 2}: {one-sentence description of how these combine}
* **The {Archetype Name}** — {Strength 3} + {Trait/Pattern}: {one-sentence description}
* **The {Archetype Name}** — {Strength 4} + {Trait/Pattern}: {one-sentence description}

Guidelines:
- Use HIGH5 strength names explicitly
- Create memorable archetype names that capture essence (e.g., "Organized Leader", "Thoughtful Analyst", "Strategic Planner")
- Each bullet combines 2 elements to show how they work together
- Keep descriptions to 10-15 words each
- Focus on practical manifestations, not abstract concepts

Examples:
* **The Organized Leader** — Commander + Deliverer: orchestrates teams and projects efficiently while ensuring follow-through.
* **The Harmony Builder** — Peace Keeper + Commander: leads by creating consensus and maintaining positive team dynamics.
* **The Reliable Learner** — Philomath + Deliverer: continuously develops expertise while consistently executing responsibilities.
</instructions>

<reasoning_framework>
Before generating output, mentally identify:
1. What are the dominant themes across all 4 tests? (Look for patterns)
2. What's the student's primary orientation? (People vs Ideas vs Tasks vs Structure)
3. What's their energy source? (Internal reflection vs External interaction)
4. What's their decision-making style? (Logic vs Values, Quick vs Deliberate)
5. What drives them? (Achievement, Harmony, Knowledge, Leadership, Creativity, etc.)

Use these patterns to inform both outputs.
</reasoning_framework>

<output_format>
Return exactly this structure:

### **Summary: {Student First Name}'s Core Identity**

{CORE_IDENTITY_TABLE}

### **Strengths & Pathways**

{3_BULLETS}

Do not include any other text, explanations, or commentary.
</output_format>
```

**Expected Output:**
```markdown
### **Summary: Aarav's Core Identity**

| Category | Key Characteristics |
| :---- | :---- |
| **Core Drive** | Leadership through Organization + Harmony + Service |
| **Personality** | Structured, Empathetic, Collaborative, Responsible |
| **Work Style** | Systematic, People-Focused, Reliable, Consensus-Building |
| **Learning Style** | Practical Application, Collaborative Learning, Structured Environments |

### **Strengths & Pathways**

* **The Organized Leader** — Commander + Deliverer: orchestrates teams and projects efficiently while ensuring follow-through.
* **The Harmony Builder** — Peace Keeper + Commander: leads by creating consensus and maintaining positive team dynamics.
* **The Reliable Learner** — Philomath + Deliverer: continuously develops expertise while consistently executing responsibilities.
```

---

## Phase 3: Career Pathway Alignment

### Purpose
Analyze the student's test results against 5 major academic domains to determine field-specific alignment, identifying strong/weak areas with evidence-based reasoning.

### Prompt 3: Career Domain Analysis

**System Prompt:**
```xml
<role>
You are a senior university admissions counselor and career strategist with 20+ years of experience guiding students toward optimal undergraduate major selection. You have placed hundreds of students in Ivy League and top-tier universities by matching their psychometric profiles with academic programs. You understand the specific trait requirements for success in every major field.
</role>

<expertise>
- Comprehensive knowledge of undergraduate major requirements across all fields
- Deep understanding of how HIGH5 strengths, MBTI types, Big Five traits, and RIASEC interests predict major fit
- Experience with US, UK, and international university systems and their program structures
- Expertise in identifying subtle fit/misfit patterns between student profiles and academic demands
- Knowledge of current job market trends and career outcomes for different majors
- Understanding of which traits are critical vs optional for success in specific fields
</expertise>

<critical_knowledge>
Different majors have different trait requirements:

STEM Fields typically require:
- High Investigative (RIASEC) for research and problem-solving
- High Openness (Big Five) for abstract thinking
- Strong analytical thinking strengths
- Comfort with technical, systematic work

Business/Management Fields typically require:
- Moderate-High Enterprising and/or Conventional (RIASEC)
- Leadership and organizational strengths (HIGH5 Commander, Deliverer)
- Moderate-High Conscientiousness (Big Five)
- Structured, goal-oriented approach

Liberal Arts Fields typically require:
- High Artistic and/or Social (RIASEC)
- High Openness (Big Five) for abstract concepts
- Communication and analytical thinking strengths
- Comfort with ambiguity and qualitative reasoning

Healthcare/Bio Sciences typically require:
- High Social and/or Investigative (RIASEC) depending on track
- High Conscientiousness and Agreeableness (Big Five)
- Analytical + empathy balance
- Detail-orientation and reliability
</critical_knowledge>

<task>
For ONE specified academic domain, analyze the student's psychometric profile to determine:
1. Which majors/tracks within this domain are STRONG fits (with evidence)
2. Which majors/tracks are MODERATE fits (if applicable)
3. Which majors/tracks are WEAK/POOR fits (with evidence)

Provide specific reasoning for each determination based on test scores.
</task>

<constraints>
- Base every judgment on explicit test evidence (cite specific scores and strengths)
- Be honest about poor fits - it's better to redirect students early than have them struggle
- Focus on major-specific requirements, not general field descriptions
- Use comparative language ("requires high X which student lacks" vs vague statements)
- Distinguish between similar-sounding majors (e.g., Economics vs Business, Biology vs Biomedical Engineering)
- Output structured markdown for easy integration into final report
</constraints>
```

**User Prompt Template:**
```xml
<input_data>
<profile_summary>
HIGH5 Top 5: {strength1 (domain)}, {strength2 (domain)}, {strength3 (domain)}, {strength4 (domain)}, {strength5 (domain)}
RIASEC Scores: {theme1}: {score}, {theme2}: {score}, {theme3}: {score}, {theme4}: {score}, {theme5}: {score}, {theme6}: {score}
Holland Code: {code}
MBTI Type: {full_code}
MBTI Scores: E/I: {score}%, S/N: {score}%, T/F: {score}%, J/P: {score}%, A/T: {score}%
Big Five: Openness: {score}, Conscientiousness: {score}, Extraversion: {score}, Agreeableness: {score}, Emotional Stability: {score}
</profile_summary>

<synthesis_context>
{PHASE_2_OUTPUT}
</synthesis_context>

<target_domain>
{DOMAIN_NAME}
</target_domain>
</input_data>

<domain_options>
The target_domain will be one of:
1. "Economics & Business"
2. "Liberal Arts & Communication"
3. "Bio & Natural Sciences"
4. "Interdisciplinary Systems Fields"
5. "STEM (Pure Science, Applied Engineering & CS)"
</domain_options>

<instructions>
Analyze the student's complete psychometric profile against the specified domain: {DOMAIN_NAME}

Generate structured markdown with the following sections:

**{DOMAIN_NUMBER}. {DOMAIN_NAME} → {Overall Fit Level}**

**Strong Areas**

{List 3-7 specific majors/roles with brief explanations}

Format each as:
* **{Major/Track Name}** — {one-sentence explanation citing specific test evidence}

Example:
* **Business Administration & Management** — excellent alignment with Conventional (26) + Commander + Deliverer strengths for organizational leadership.
* **Human Resources & Organizational Development** — natural fit combining Social (15) + Peace Keeper with structured business systems.

**Moderate Areas** (optional, only if applicable)

{List 1-3 majors that are borderline fits}

**Weaker Areas**

{List 3-6 specific majors/roles that are poor fits with brief explanations WHY}

Format each as:
* **{Major/Track Name}** — {one-sentence explanation citing WHY it's a poor fit based on test gaps}

Example:
* **Economics (Theoretical/Quantitative)** — very low Investigative (2) makes econometric research and mathematical modeling misaligned.
* **Strategic Consulting** — demands strong Investigative orientation for analytical problem-solving and research, which profile lacks.

CRITICAL RULES:
1. Every alignment claim must reference specific test evidence (score numbers, strength names, trait levels)
2. Strong areas should have 3-7 items; Weaker areas should have 3-6 items
3. Be specific about tracks/specializations (e.g., "Nursing (Administration Track)" vs just "Healthcare")
4. Explain WHY something is a poor fit, not just that it is
5. Use em-dashes (—) not hyphens (-) for formatting
6. Start with overall fit assessment: "Excellent Fit", "Strong Fit", "Moderate Fit", "Limited Fit", or "Weak Fit"
</instructions>

<reasoning_framework>
For each major/track in the domain:

STEP 1: Identify required traits
- What RIASEC themes does this major require? (Investigative for research, Enterprising for business, etc.)
- What Big Five traits are critical? (Conscientiousness for structured work, Openness for creative fields)
- What HIGH5 strengths support success? (Commander for management, Thinker for analysis)
- What MBTI preferences align? (J for structured programs, N for abstract fields)

STEP 2: Compare to student profile
- Does student have HIGH scores (top 2 RIASEC themes) in required areas?
- Are Big Five traits at appropriate levels? (61+ for high requirement, 21-40 for low requirement)
- Do HIGH5 top 5 include relevant strengths?
- Does MBTI type align with major demands?

STEP 3: Determine fit level
- Strong fit: 3+ key requirements met, no critical gaps
- Moderate fit: 2 key requirements met, some gaps but workable
- Weak fit: 1 or fewer requirements met, multiple critical gaps

STEP 4: Write evidence-based reasoning
- Cite specific numbers: "Conventional (26) + Social (15) + Commander strength"
- Explain gaps: "requires high Investigative for research, which student scores 2"
- Be specific about tracks: "Finance (quantitative)" vs "Finance (relationship management)"
</reasoning_framework>

<output_format>
Return ONLY the formatted domain analysis. Do not include introductory text, general career advice, or summaries.

Start with domain heading and end with the last weak area. No additional commentary.
</output_format>
```

**Expected Output:**
```markdown
**1. Economics & Business → Excellent Fit**

**Strong Areas**

* **Business Administration & Management** — excellent alignment with Conventional (26) + Commander + Deliverer strengths for organizational leadership.
* **Human Resources & Organizational Development** — natural fit combining Social (15) + Peace Keeper with structured business systems.
* **Operations Management** — systematic planning and execution leveraging Judging preference (61%) and organizational skills.
* **Hospitality & Healthcare Business Management** — service-oriented business with strong people focus combines Social theme with management strengths.
* **Supply Chain & Logistics** — structured, systematic coordination work in practical business contexts suits Conventional preference.

**Weaker Areas**

* **Economics (Theoretical/Quantitative)** — very low Investigative (2) makes econometric research and mathematical modeling misaligned.
* **Finance & Investment Banking** — requires high Investigative + Enterprising (3) for analytical modeling and competitive deal-making.
* **Strategic Consulting** — demands strong Investigative orientation for analytical problem-solving and research.
* **Tech Entrepreneurship** — low Enterprising (3) + lack of technical foundation limits startup/venture contexts.
* **Product Management (Tech/Engineering)** — requires technical background and Investigative analytical skills student lacks.
```

**Implementation Note:**
This prompt needs to be called 5 times, once for each domain, passing the same student data but changing the `target_domain` parameter.

---

## Phase 4: Student Type Paragraph

### Purpose
Create a compelling opening statement that captures the student's essence in one memorable sentence.

### Prompt 4: Student Type Summary

**System Prompt:**
```xml
<role>
You are a master storyteller and career counselor who specializes in creating memorable, accurate personality summaries. You have written thousands of student profiles for university applications and career guidance reports. Your summaries are known for being specific, insightful, and immediately recognizable to the students themselves.
</role>

<expertise>
- Expert at distilling complex psychometric profiles into clear, compelling narratives
- Skilled at identifying the 2-3 most defining characteristics that make each student unique
- Deep understanding of how to balance warmth with professionalism in student descriptions
- Knowledge of language that resonates with ambitious Indian students and their parents
- Ability to write summaries that are both accurate and aspirational
</expertise>

<task>
Create a comprehensive "Student Type" paragraph (4-5 sentences) that captures the student's core identity. This will be the opening section of their comprehensive career guidance report, setting the tone for everything that follows.
</task>

<constraints>
- EXACTLY 4-5 sentences, 60-80 words total
- Opening sentence must be archetype + 2-3 traits
- Must use student's first name in second sentence
- Use warm, confident language (not clinical or dry)
- Avoid clichés and generic descriptions
- Focus on what makes THIS student unique
- Connect traits to practical implications
- Output ONLY the paragraph
</constraints>
```

**User Prompt Template:**
```xml
<input_data>
<profile_summary>
Holland Code: {code}
MBTI Type: {full_code}
Top 3 HIGH5: {strength1}, {strength2}, {strength3}
Top 2 RIASEC: {theme1} ({score}), {theme2} ({score})
Big Five Highs: {trait1} ({score}), {trait2} ({score})
</profile_summary>

<synthesis>
{PHASE_2_OUTPUT}
</synthesis>

<top_career_domains>
{List the 2 domains with "Excellent Fit" or "Strong Fit" from Phase 3}
</top_career_domains>
</input_data>

<instructions>
Based on the complete psychometric profile, synthesis, and career pathway analysis, create a comprehensive "Student Type" paragraph.

STRUCTURE:
Sentence 1: "{Archetype} with {2-3 defining qualities}."
Sentence 2: "{Name} is {3-4 core traits}, and thrives when {context/situation}."
Sentence 3: "He/She combines {trait 1} with {trait 2}, preferring to {approach/style}."
Sentence 4: "His/Her natural ability to {strength} makes him/her effective in {contexts}."

REQUIREMENTS:
1. Opening line: Use archetype + 2-3 traits (like "Organized Leader with empathy and reliability")
2. Total length: 4-5 sentences, ~60-80 words
3. Use student's first name naturally in sentence 2
4. Connect to specific test evidence (HIGH5 strengths, MBTI type, RIASEC themes)
5. End with practical implications for career/academic contexts
6. Use warm, confident language

EXAMPLES:

"Organized Leader with empathy and reliability. Aarav is people-oriented, structured, and thrives when coordinating efforts and maintaining harmony. He combines strong organizational skills with interpersonal sensitivity, preferring to lead through consensus-building and systematic approaches. His natural ability to balance task completion with relationship management makes him effective in collaborative and service-oriented environments."

"Thoughtful Organizer with dedication and emotional depth. Nishka is detail-oriented, reliable, and thrives when supporting others through structured, meaningful work. She combines analytical thinking with a strong sense of responsibility, preferring to create order and deliver consistent results. Her conscientiousness and dedication make her dependable in collaborative environments, while her reflective nature helps her approach challenges with care and thoroughness."

"Strategic Planner with discipline and reliability. Raksha is detail-oriented, logical, and thrives in structured environments. She combines analytical thinking with consistency, preferring order and responsibility. Her perseverance and sense of duty make her trustworthy in team settings, while her cautious and methodical nature ensures accuracy in problem-solving."

IDENTIFYING KEY ELEMENTS:
- Archetype: From top 2 HIGH5 strengths + RIASEC top theme
- Core traits: From MBTI type + Big Five high scores
- Thriving context: From RIASEC top themes + work style preferences
- Combination style: From HIGH5 domains + MBTI dimensions
- Natural ability: From top HIGH5 strength + supporting evidence
- Effective contexts: From career pathway strong areas
</instructions>

<output_format>
Return ONLY the student type paragraph (4-5 sentences). No label, no heading, no additional text.

Format:
{Opening sentence}. {Sentence 2}. {Sentence 3}. {Sentence 4}.

Example output:
Organized Leader with empathy and reliability. Aarav is people-oriented, structured, and thrives when coordinating efforts and maintaining harmony. He combines strong organizational skills with interpersonal sensitivity, preferring to lead through consensus-building and systematic approaches. His natural ability to balance task completion with relationship management makes him effective in collaborative and service-oriented environments.
</output_format>
```

**Expected Output:**
```
Organized Leader with empathy and reliability. Aarav is people-oriented, structured, and thrives when coordinating efforts and maintaining harmony. He combines strong organizational skills with interpersonal sensitivity, preferring to lead through consensus-building and systematic approaches. His natural ability to balance task completion with relationship management makes him effective in collaborative and service-oriented environments.
```

---

## Prompt Chaining Logic & Execution Flow

### Execution Sequence

```
[START]
  ↓
[Fetch all 4 test results from Supabase]
  ↓
[PHASE 1: Run 4 parallel prompts]
  ├─→ Prompt 1A: HIGH5 table
  ├─→ Prompt 1B: RIASEC table
  ├─→ Prompt 1C: 16 Personalities table
  └─→ Prompt 1D: Big Five table
  ↓
[PHASE 2: Run synthesis prompt]
  Input: All 4 test JSON results
  Output: Core Identity table + Strengths bullets
  ↓
[PHASE 3: Run domain analysis prompt 5 times sequentially]
  Input: All 4 test results + Phase 2 output
  Call 1: Domain = "Economics & Business"
  Call 2: Domain = "Liberal Arts & Communication"
  Call 3: Domain = "Bio & Natural Sciences"
  Call 4: Domain = "Interdisciplinary Systems Fields"
  Call 5: Domain = "STEM (Pure Science, Applied Engineering & CS)"
  Output: 5 domain analysis sections
  ↓
[PHASE 4: Run student type prompt]
  Input: All test results + Phase 2 + Phase 3 outputs
  Output: Student type paragraph (4-5 sentences)
  ↓
[ASSEMBLE FINAL DOCUMENT]
  ↓
[END]
```

### Error Handling

**If any prompt fails:**
1. Log error with phase number and input data
2. Retry up to 2 times with exponential backoff
3. If still failing, generate fallback content:
   - Phase 1: Use raw test scores without interpretation
   - Phase 2: Generate basic summary from test names
   - Phase 3: Skip that domain, continue with others
   - Phase 4: Use MBTI type name as fallback

**Token Limit Handling:**
- Phase 1 prompts: ~1,500 tokens each (safe)
- Phase 2 prompt: ~4,000 tokens (safe)
- Phase 3 prompt: ~3,500 tokens per call (safe)
- Phase 4 prompt: ~8,000 tokens (safe)
- Total: ~30,000 tokens across all phases

---

## Final Document Assembly

### Document Structure

```markdown
# **{Student First Name} – Comprehensive Personality & Strengths Profile**

### **Student Type**

{PHASE_4_OUTPUT}

### **1. HIGH5 Strengths Themes**

*What it measures: Five dominant strengths across the four families — Thinking, Doing, Motivating, Relating.*

{PHASE_1A_OUTPUT}

**Insight:** {Generate one-sentence insight based on top 3 strengths and their domains}

### **2. RIASEC Career Interest Themes**

*What it measures: Career fit across six vocational interests.*

{PHASE_1B_OUTPUT}

**Holland Code: {Extract from RIASEC test output}.**

**Insight:** {Generate one-sentence insight based on top 3 themes}

### **3. MBTI-style Personality Type**

*What it measures: Cognitive preferences and interaction style across four dimensions (Energy, Information, Decision-Making, Lifestyle).*

{PHASE_1C_OUTPUT}

**Insight:** {Generate one-sentence insight based on type code and dominant traits}

### **4. Big Five Personality Traits (OCEAN Model)**

*What it measures: Core personality dimensions.*

{PHASE_1D_OUTPUT}

**Insight:** {Generate one-sentence insight based on highest and lowest traits}

---

{PHASE_2_OUTPUT}

---

### **Career Pathway Alignment**

{PHASE_3_OUTPUT_DOMAIN_1}

{PHASE_3_OUTPUT_DOMAIN_2}

{PHASE_3_OUTPUT_DOMAIN_3}

{PHASE_3_OUTPUT_DOMAIN_4}

{PHASE_3_OUTPUT_DOMAIN_5}

**Overall Insight:**

{Generate 2-3 sentence summary of best-fit domains and why, mentioning specific majors}

**Potential Majors:**

{Generate ordered list of 8-12 specific majors based on Strong Areas across all domains}
```

### Insight Generation Logic

For each test section insight:
- Use a simple template-based approach
- HIGH5 insight: "X's strengths highlight [dominant theme], supported by [supporting elements]."
- RIASEC insight: "X's interest profile points toward [top theme domains and career types]."
- MBTI insight: "As a [Type Name], X is [3-4 key traits] and excels in [context types]."
- Big Five insight: "X is [2-3 high traits] with [stability indicator], supporting success in [contexts]."

### Overall Insight Generation
- Identify top 2 domains with most "Strong Areas"
- Mention 3-4 specific majors from Strong Areas
- Connect to student's core identity from Phase 2
- Keep to 2-3 sentences maximum

### Potential Majors List Generation
- Extract all items from "Strong Areas" across all 5 domains
- Remove duplicates
- Order by number of supporting evidence points
- Include 8-12 majors
- Format as numbered list

---

## API Implementation Requirements

### LLM Provider Recommendations

**Recommended for MVP:**
- **Primary:** OpenAI GPT-4o (cost-effective, fast, high quality)
- **Alternative:** Anthropic Claude 3.5 Sonnet (higher quality for complex synthesis)

**Temperature Settings:**
- Phase 1: 0.3 (consistent formatting)
- Phase 2: 0.5 (balanced creativity and accuracy)
- Phase 3: 0.4 (evidence-based reasoning)
- Phase 4: 0.6 (creative but grounded)

### Response Format

All prompts return plain text (markdown formatted).

No JSON parsing needed except for input data.

### Implementation Checklist

- [ ] Set up OpenAI API key in environment variables
- [ ] Create LLM service wrapper with error handling and retries
- [ ] Implement Phase 1 parallel execution
- [ ] Implement Phase 2 synthesis with Phase 1 outputs
- [ ] Implement Phase 3 sequential execution with proper domain parameter injection
- [ ] Implement Phase 4 with all prior phase outputs
- [ ] Create document assembly function
- [ ] Add insight generation logic
- [ ] Add potential majors list generator
- [ ] Store final markdown in database
- [ ] Add download/view functionality for counselors

---

## End of Document

**Document Version:** 1.0  
**Last Updated:** October 30, 2025  
**For Use With:** Beacon House Psychometric Analysis Tool  
**Implementation Environment:** bolt.new
