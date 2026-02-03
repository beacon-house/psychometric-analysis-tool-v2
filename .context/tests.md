# Psychometric Tests Reference

**Last Updated:** 2026-02-03

## Overview
| Test | Questions | Config File | Evaluator | Route |
|------|-----------|-------------|-----------|-------|
| 16 Personalities | 32 | 16personalities-config.ts | 16personalities-evaluator.ts | /test/16personalities |
| HIGH5 | 120 | high5-config.ts | high5-evaluator.ts | /test/high5 |
| Big Five | 50 | big5-config.ts | big5-evaluator.ts | /test/big-five |
| RIASEC | 48 | riasec-config.ts | riasec-evaluator.ts | /test/riasec |

## 16 Personalities
**Measures:** 5 dimensions → 4-letter code (e.g., INTJ-A)

| Dimension | Low | High |
|-----------|-----|------|
| EI | Extraversion | Introversion |
| SN | Sensing | Intuition |
| TF | Thinking | Feeling |
| JP | Judging | Perceiving |
| AT | Assertive | Turbulent |

**Scoring:**
- Forward/reverse-keyed items
- Raw scores normalized to 0-100
- Clarity percentage per dimension

## HIGH5 Strengths
**Measures:** 20 strengths across 4 domains → Top 5 ranked

| Domain | Strengths |
|--------|-----------|
| Doing | Deliverer, Time Keeper, Focus Expert |
| Feeling | Coach, Empathizer, Optimist, Peace Keeper, Believer |
| Motivating | Catalyst, Commander, Self-Believer, Storyteller, Winner |
| Thinking | Analyst, Brainstormer, Philomath, Strategist, Thinker |

**Scoring:**
- Sum per strength → Rank → Top 5
- Domain breakdown percentage

## Big Five (OCEAN)
**Measures:** 5 traits → STEN scores (1-10)

| Trait | Description |
|-------|-------------|
| O | Openness to Experience |
| C | Conscientiousness |
| E | Extraversion |
| A | Agreeableness |
| N | Neuroticism |

**Scoring:**
- Forward/reverse-keyed items
- Raw → STEN (M=5.5, SD=2) → T-score (M=50, SD=10) → Percentile

## RIASEC Career Interest
**Measures:** 6 Holland themes → 3-letter code (e.g., IAE)

| Theme | Description |
|-------|-------------|
| R | Realistic (hands-on, practical) |
| I | Investigative (analytical, research) |
| A | Artistic (creative, expressive) |
| S | Social (people-oriented, helping) |
| E | Enterprising (leadership, business) |
| C | Conventional (organized, data) |

**Scoring:**
- 8 questions per theme
- Sum → Rank → Top 3 = Holland code

## Adding/Modifying Questions
1. Edit `src/lib/tests/{test}-config.ts`
2. Add question to `questions` array
3. Map question ID to dimension in `questionMapping`
4. Update `totalQuestions` if count changed

## Modifying Scoring
1. Edit `src/lib/tests/{test}-evaluator.ts`
2. Update `evaluate()` function
3. Ensure return type matches `src/types/index.ts`

## Test Specifications (Source of Truth)
Full test specifications with all questions, scoring algorithms, and scientific basis are in `tests-data/`:

| File | Contains |
|------|----------|
| `16-personalities-test.md` | 32 questions, dimension mapping, reverse scoring, type definitions |
| `big-5-test.md` | 50 questions, OCEAN scoring, percentile formulas |
| `high-5-test.md` | 120 questions, 20 strengths, domain breakdown |
| `riasec-career-test.md` | 48 questions, Holland code logic |
| `high5-question-strength-mapping.md` | Maps 120 questions to specific strengths |

**Use these when:** Debugging evaluators, understanding scoring logic, verifying question-to-dimension mappings.
