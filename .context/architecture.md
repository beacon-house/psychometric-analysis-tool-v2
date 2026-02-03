# Architecture

**Last Updated:** 2026-02-03

## Tech Stack
- **Frontend:** React 19.2.0 + TypeScript + React Router 7.1.3
- **Build:** Vite 7.1.11
- **Backend:** Supabase (PostgreSQL + Edge Functions)
- **Styling:** CSS (mobile-first, no framework)
- **Hosting:** Netlify

## Data Flow (ACTUAL)

```
Student Flow:
1. Home page → RegistrationModal (first visit)
   └─ Capture: name, email, whatsapp
   └─ initializeRegisteredStudent() → UUID + contact in localStorage
   └─ Create student record in Supabase

2. Test selection → Test.tsx
   └─ Create test_results record (status='in_progress', result_data={})
   └─ Each response → localStorage immediately (NOT synced to Supabase)
   └─ Final question → Run evaluator → Upsert result_data to Supabase
   └─ Navigate to Results page

3. Results page
   └─ Try location.state?.evaluation first
   └─ Fallback: localStorage
   └─ Fallback: Supabase query

4. After all 4 tests → Return to Home (shows 4/4)
   └─ NextSteps page exists but NOT auto-triggered
   └─ Webhook NOT implemented (VITE_WEBHOOK_URL unused)

Admin Flow:
Login (Supabase Auth) → Dashboard → Generate Report
└─ Fetch all test results → 4-phase AI generation → report_sections table
└─ View/Regenerate report → Select recommendations → Save to selected_recommendations
```

## Key Principle
**localStorage is PRIMARY, Supabase is BACKUP**
- All responses saved to localStorage immediately
- Supabase sync is non-blocking (errors logged, not thrown)
- Never lose student progress due to network issues

## Directory Structure

```
src/
├── components/     # 12 components (RegistrationModal, TestCard, LikertScale, etc.)
│                   # NOTE: ContactModal.tsx exists but is UNUSED
├── pages/          # 12 pages (Home, Test, Results*, Admin*, NextSteps)
├── lib/
│   ├── tests/     # {test}-config.ts + {test}-evaluator.ts per test
│   ├── storage.ts # localStorage management (includes initializeRegisteredStudent)
│   ├── supabase.ts
│   ├── promptTemplates.ts
│   ├── reportDataFormatter.ts
│   └── reportRegeneration.ts
├── hooks/          # useStudentData.ts
├── styles/         # 22 CSS files (mobile-first)
└── types/          # index.ts (171 lines, all types)

supabase/
├── migrations/     # Schema migrations
└── functions/      # generate-report, regenerate-report-sections
```

## Test Component Pattern
Each test requires:
1. `src/lib/tests/{test}-config.ts` - Questions & metadata
2. `src/lib/tests/{test}-evaluator.ts` - Scoring algorithm
3. `src/pages/Test{Name}.tsx` - Wrapper binding config to Test.tsx
4. `src/pages/Results{Name}.tsx` - Results display

## AI Report Generation (Edge Function)
- Model: GPT-4o-2024-08-06
- 13 sections, 4-phase process:
  - Phase 1: 5 parallel calls (test summaries + student_type)
  - Phase 2: 2 sequential calls (identity + pathways)
  - Phase 3: 5 sequential calls (career domains)
  - Phase 4: 1 call (overall insight)
- Upsert pattern prevents duplicates
- Token tracking per section
- **Full prompt architecture**: See `documentation/psychometric-report-generation-context.md`

## Routes
| Path | Component | Auth |
|------|-----------|------|
| `/` | Home | None (shows RegistrationModal if not registered) |
| `/test/16personalities` | Test | None |
| `/test/16personalities/results` | Results16Personalities | None |
| `/test/high5` | Test | None |
| `/test/high5/results` | ResultsHigh5 | None |
| `/test/big-five` | Test | None |
| `/test/big-five/results` | ResultsBigFive | None |
| `/test/riasec` | Test | None |
| `/test/riasec/results` | ResultsRIASEC | None |
| `/next-steps` | NextSteps | None |
| `/admin` | AdminLogin | None |
| `/admin/dashboard` | AdminDashboard | Required |
| `/admin/reports/:studentId` | ReportViewer | Required |

## Environment Variables
```
VITE_SUPABASE_URL        # Required
VITE_SUPABASE_ANON_KEY   # Required
VITE_WEBHOOK_URL         # Defined but NOT USED in code
VITE_OPENAI_API_KEY      # Edge function secret
```
