# Product Requirements Document

**Last Updated:** 2026-02-03

## Overview
Psychometric assessment platform for Grade 9-12 students targeting Ivy League admissions. Students complete 4 tests, counselors generate AI reports for career guidance.

## User Types
- **Students** (registered via modal): Take tests, view results
- **Counselors** (authenticated): View students, generate/view AI reports, select recommendations

## Core Features

### Student Journey (ACTUAL FLOW)
1. Land on Home → RegistrationModal appears (first visit)
2. Submit: Name, Parent Email, WhatsApp → UUID created
3. See 4 test cards (3 available, RIASEC locked)
4. Take any 3 tests in any order → RIASEC unlocks
5. Complete all 4 → Return to Home (shows 4/4 complete)
6. NextSteps page accessible but not auto-triggered

**Note:** Contact info captured BEFORE tests via RegistrationModal, NOT after completion.

### Test System
| Test | Questions | Measures |
|------|-----------|----------|
| 16 Personalities | 32 | EI, SN, TF, JP, AT dimensions → 4-letter code |
| HIGH5 | 120 | 20 strengths → Top 5 ranked |
| Big Five (OCEAN) | 50 | O, C, E, A, N traits → STEN scores |
| RIASEC | 48 | 6 Holland themes → 3-letter code |

### AI Report System
- 13 sections generated via OpenAI GPT-4o
- 4-phase prompt chaining (parallel → sequential)
- Selective regeneration for failed sections
- Token usage tracking per section
- Recommendation selection system (counselors pick majors)

### Report Sections (13 total)
1. student_type (classification paragraph)
2. test_16p, test_high5, test_big5, test_riasec (summaries)
3. core_identity_summary
4. domain_stem, domain_biology, domain_liberal_arts, domain_business, domain_interdisciplinary
5. overall_insight (includes handpicked majors from counselor selections)

## Business Rules
- **Test unlock**: RIASEC locked until 3 others complete (completedCount < 3)
- **Test retake**: Not allowed - shows "View Results" after completion
- **Data safety**: localStorage primary, Supabase backup (never block on DB errors)
- **Route pattern**: `testName.toLowerCase().replace(/\s+/g, '-')`
- **Report generation**: Requires all 4 tests completed

## Non-Functional Requirements
- Mobile-first responsive design (640px breakpoint)
- Progress persistence across sessions
- No purple/indigo/violet colors
