# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Psychometric Analysis Tool - A web-based platform for Grade 9-12 students to take four personality and career assessment tests (16 Personalities, HIGH5, Big Five, RIASEC), with automatic progress saving, results visualization, and AI-generated comprehensive career guidance reports.

## Development Commands

```bash
# Development server
npm run dev

# Build for production (ALWAYS run before committing)
npm run build

# Preview production build
npm run preview
```

## Architecture Overview

### Data Flow Architecture

**Critical: localStorage is PRIMARY, Supabase is BACKUP**

1. **Student Journey**: UUID generation → localStorage initialization → Supabase student record
2. **During Tests**: All responses saved to localStorage immediately, background sync to Supabase (non-blocking)
3. **Test Completion**: Evaluate results → Update Supabase test_results → Navigate to results page
4. **After All Tests**: Contact modal → Webhook trigger → NextSteps page
5. **Admin Flow**: Login → Dashboard → Generate Reports (AI) → View/Download

### Tech Stack

- **Frontend**: React 19.2.0 + TypeScript + React Router 7.1.3
- **Build**: Vite 7.1.11
- **Backend**: Supabase (PostgreSQL)
- **Styling**: CSS (mobile-first, no framework)
- **Storage**: localStorage (primary) + Supabase (backup)
- **Integration**: Make.com webhook

### Key Design Principles

1. **Data Safety First**: Never lose student progress. localStorage always takes precedence.
2. **Fail Gracefully**: Database errors are logged but never block UI operations.
3. **Mobile-First**: Design for 640px mobile first, then enhance for larger screens.
4. **Golden Rule**: "Get context, think design and layout first, think of the target user's interactions first and only then work on the rest of the implementations."

## Critical Business Rules

### Test Unlock Logic
- 16 Personalities, HIGH5, Big Five: Always available
- RIASEC: Unlocked ONLY after completing all 3 other tests

### Overall Status Pipeline
```
test_in_progress → reports_generated → email_sent → call_scheduled
→ call_rescheduled/no_show → call_done → converted
```

### Route Generation Rule
```typescript
testName.toLowerCase().replace(/\s+/g, '-')
// Example: "Big Five" → "/test/big-five"
```

## Code Organization Patterns

### Universal Test Component Pattern

The `Test.tsx` component is reusable for all tests. Each test requires:

1. **Config file**: `src/lib/tests/{test}-config.ts` - Questions and metadata
2. **Evaluator**: `src/lib/tests/{test}-evaluator.ts` - Scoring algorithm
3. **Test wrapper**: `src/pages/Test{TestName}.tsx` - Binds config to Test.tsx
4. **Results page**: `src/pages/Results{TestName}.tsx` - Display results

### Database Schema (Supabase)

**students** table:
- `id` (uuid, PK) - Student session identifier
- `student_name`, `parent_email`, `parent_whatsapp` - Captured after all tests
- `overall_status` - Pipeline status (see above)
- `report_generated` (boolean), `report_status`, `report_generated_by`, `report_generated_at`

**test_results** table:
- `id` (uuid, PK)
- `student_id` (uuid, FK → students.id)
- `test_name` - "16Personalities" | "HIGH5" | "Big Five" | "RIASEC"
- `test_status` - "in_progress" | "completed"
- `result_data` (jsonb) - Computed scores (empty {} for in_progress)
- Unique constraint: `(student_id, test_name)`

**report_sections** table (for AI-generated reports):
- `id` (uuid, PK)
- `student_id` (uuid, FK → students.id)
- `section_type` (text) - One of 12 report section types
- `content` (jsonb) - AI-generated markdown content
- `tokens_used` (integer) - API usage tracking
- `error_message` (text | null) - Error details if generation failed
- `generated_at`, `created_at`, `updated_at`

### Key TypeScript Types

Located in `src/types/index.ts` (157 lines):

**Test Types**:
```typescript
type TestName = "16Personalities" | "HIGH5" | "Big Five" | "RIASEC";
type TestStatus = "locked" | "available" | "in_progress" | "completed";
```

**Status Types**:
```typescript
type OverallStatus = "test_in_progress" | "reports_generated" | "email_sent"
  | "call_scheduled" | "call_rescheduled" | "no_show" | "call_done" | "converted";

type ReportStatus = "tests_not_complete" | "ready_to_generate"
  | "generation_in_progress" | "done" | "error";
```

**Report Section Types** (12 sections):
```typescript
type ReportSectionType =
  | "student_type"
  | "test_16p" | "test_high5" | "test_big5" | "test_riasec"
  | "core_identity_summary"
  | "domain_stem" | "domain_biology" | "domain_liberal_arts"
  | "domain_business" | "domain_interdisciplinary"
  | "overall_insight";
```

**Data Structures**:
```typescript
interface StudentData {
  uuid: string;
  overallStatus: OverallStatus;
  studentName?: string;
  parentEmail?: string;
  parentWhatsapp?: string;
  testProgress: {
    [key in TestName]?: TestProgress;
  };
}

interface TestProgress {
  testName: TestName;
  currentQuestion: number;
  totalQuestions: number;
  responses: { [questionId: string]: number };
  startedAt: string;
  completedAt?: string;
}

interface StudentWithTests {
  id: string;
  student_name: string | null;
  parent_email: string | null;
  parent_whatsapp: string | null;
  overall_status: OverallStatus;
  report_status: ReportStatus;
  report_generated_at: string | null;
  report_error_message: string | null;
  test_results: Array<{
    test_name: TestName;
    test_status: "in_progress" | "completed";
    completed_at: string | null;
  }>;
}
```

### localStorage Schema

```typescript
{
  uuid: "student-uuid",
  overallStatus: "test_in_progress",
  studentName?: string,
  parentEmail?: string,
  parentWhatsapp?: string,
  testProgress: {
    "16Personalities": {
      testName: "16Personalities",
      currentQuestion: 15,
      totalQuestions: 32,
      responses: { "q1": 3, "q2": 5 },
      startedAt: "ISO timestamp",
      completedAt?: "ISO timestamp"
    },
    "HIGH5": {...},
    "Big Five": {...},
    "RIASEC": undefined
  }
}
```

## Design System

### Color Palette (NEVER use purple/indigo/violet)

**Likert Scale Colors**:
- Strongly Disagree (1): `#ffe5e5` bg, `#c41e3a` text
- Disagree (2): `#fff0e5` bg, `#d97706` text
- Neutral (3): `#f0f0f0` bg, `#666` text
- Agree (4): `#e5f5e5` bg, `#059669` text
- Strongly Agree (5): `#d0f0d0` bg, `#047857` text

**Progress**: Gradient from `#3b82f6` (blue) to `#10b981` (green)

### Responsive Design

**Mobile (≤640px)**:
- Vertical Likert scale (56px height buttons, full-width)
- 120px min-height question containers
- 18px question text, 15px labels

**Desktop (>1024px)**:
- Horizontal Likert scale
- 150px min-height question containers
- 22px question text

### Layout Principles

1. **Fixed Containers**: Question text in fixed-height containers for consistent button placement
2. **Single Responsibility**: Separate question display from response options
3. **Consistent Spacing**: 8px system throughout
4. **Max-width**: 700px for optimal reading

## AI Report Generation

The system uses a 4-phase prompt chaining approach with OpenAI/Anthropic APIs to generate comprehensive career guidance reports:

1. **Phase 1**: Individual test interpretations (4 parallel prompts → markdown tables)
2. **Phase 2**: Profile synthesis (Core Identity + Strengths & Pathways)
3. **Phase 3**: Career domain analysis (5 sequential prompts, one per domain)
4. **Phase 4**: Student type paragraph (4-5 sentence summary)

See `documentation/psychometric-report-generation-context.md` for complete prompt architecture.

### Report Sections Generated

The system generates 12 distinct report sections:

**Profile Sections**:
1. `student_type` - 4-5 sentence student classification paragraph
2. `core_identity_summary` - Synthesized personality profile

**Test Summary Sections** (Phase 1 - Parallel):
3. `test_16p` - 16 Personalities interpretation (markdown table)
4. `test_high5` - HIGH5 strengths summary (markdown table)
5. `test_big5` - Big Five personality analysis (markdown table)
6. `test_riasec` - RIASEC career interests (markdown table)

**Career Domain Sections** (Phase 3 - Sequential):
7. `domain_stem` - STEM & Applied Sciences pathway
8. `domain_biology` - Biology & Natural Sciences pathway
9. `domain_liberal_arts` - Liberal Arts & Communications pathway
10. `domain_business` - Business, Economics & Law pathway
11. `domain_interdisciplinary` - Interdisciplinary & Systems pathway

**Summary Section**:
12. `overall_insight` - Final recommendations and next steps

### Selective Regeneration Logic

Located in `src/lib/reportRegeneration.ts`, this feature allows:
- **Error Recovery**: Regenerate only failed sections (status: null or error_message present)
- **Section Preservation**: Keep successfully generated sections unchanged
- **Grouped Regeneration**: Regenerate entire categories (e.g., all career domains)
- **Timestamp Updates**: Track when sections were regenerated
- **Token Tracking**: Monitor AI API usage per section

The ReportViewer UI provides buttons to regenerate:
- Individual sections
- Section groups (Student Profile, Test Summaries, Career Pathways)
- Entire report

## Test Implementations Deep Dive

### 16 Personalities Test
**Questions**: 32 items
**Response Scale**: 5-point Likert (Strongly Disagree → Strongly Agree)
**Dimensions**:
- **EI (Extraversion vs Introversion)**: Energy direction (outward vs inward)
- **SN (Sensing vs Intuition)**: Information processing (concrete vs abstract)
- **TF (Thinking vs Feeling)**: Decision-making (logic vs values)
- **JP (Judging vs Perceiving)**: Lifestyle approach (structured vs flexible)
- **AT (Assertive vs Turbulent)**: Identity (confident vs self-conscious)

**Scoring**:
- Forward and reverse-keyed items
- Raw scores normalized to 0-100 scale
- Generates 4-letter code (e.g., INTJ-A, ENFP-T)
- Clarity percentage calculated for each dimension

**Output**: Personality type with detailed descriptions for all 5 dimensions

---

### HIGH5 Strengths Test
**Questions**: 120 items
**Response Scale**: 5-point Likert
**Strengths Measured**: 20 strengths across 4 domains

**Doing Domain** (3 strengths):
- Deliverer, Time Keeper, Focus Expert

**Feeling Domain** (5 strengths):
- Coach, Empathizer, Optimist, Peace Keeper, Believer

**Motivating Domain** (5 strengths):
- Catalyst, Commander, Self-Believer, Storyteller, Winner

**Thinking Domain** (7 strengths):
- Analyst, Brainstormer, Philomath, Strategist, Thinker

**Scoring**:
- Calculate score for each of 20 strengths
- Identify top 5 strengths (ranked by score)
- Domain breakdown showing distribution across Doing/Feeling/Motivating/Thinking
- Percentile scoring for each strength

**Output**: Top 5 strengths with domain distribution and detailed descriptions

---

### Big Five (OCEAN) Personality Test
**Questions**: 50 items
**Response Scale**: 5-point Likert
**Dimensions**:
- **Openness to Experience**: Curiosity, creativity, preference for novelty
- **Conscientiousness**: Organization, dependability, discipline
- **Extraversion**: Sociability, assertiveness, energy level
- **Agreeableness**: Compassion, cooperation, trust
- **Neuroticism**: Emotional stability, anxiety, moodiness

**Scoring**:
- Forward and reverse-keyed items
- Raw score calculation (sum of responses)
- **STEN scoring**: Standard Ten scale (1-10, M=5.5, SD=2)
- **T-score normalization**: Mean=50, SD=10
- **Percentile conversion**: Position relative to norm group

**Output**: 5 dimension scores with percentiles and detailed trait descriptions

---

### RIASEC Career Interest Test
**Questions**: 48 items
**Response Scale**: 5-point Likert (Not Interested → Very Interested)
**Holland Themes**:

1. **Realistic (R)**: Hands-on, practical, mechanical activities
2. **Investigative (I)**: Analytical, research-oriented, scientific
3. **Artistic (A)**: Creative, expressive, unstructured activities
4. **Social (S)**: People-oriented, helping, teaching
5. **Enterprising (E)**: Leadership, persuasion, business
6. **Conventional (C)**: Organized, detail-oriented, data management

**Scoring**:
- Sum responses for each of 6 themes (8 questions per theme)
- Rank themes by score
- Generate **3-letter Holland code** (e.g., IAE, SER)
- Identify top 3 themes

**Output**: Holland code with career pathway suggestions for each theme

## Core Utilities & Services

### localStorage Management (`src/lib/storage.ts`)
**Functions**:
- `getStudentData()` - Retrieve complete student session
- `setStudentData()` - Persist full session to localStorage
- `initializeStudent()` - Create new session with UUID
- `updateTestProgress()` - Update test state (question position, responses)
- `saveResponse()` - Save individual question response
- `completeTest()` - Mark test as completed with timestamp
- `updateContactInfo()` - Save student name, parent email, WhatsApp
- `areAllTestsCompleted()` - Check if all 4 tests finished
- `getCompletedTestCount()` - Count completed tests (for RIASEC unlock)
- `clearData()` - Reset entire student session
- `resetTest()` - Reset specific test (for development testing)

**Critical Pattern**: Always update localStorage FIRST, then sync to Supabase in background

---

### Report Data Formatting (`src/lib/reportDataFormatter.ts`)
**Functions**:
- `fetchStudentTestResults(studentId)` - Retrieve all test results from Supabase
- `validateAllTestsCompleted(results)` - Ensure 4/4 tests completed
- `format16PersonalitiesData(result)` - Prepare 16P data for AI prompt
- `formatHigh5Data(result)` - Prepare HIGH5 data for AI prompt
- `formatBigFiveData(result)` - Prepare Big Five data for AI prompt
- `formatRIASECData(result)` - Prepare RIASEC data for AI prompt

**Purpose**: Transform database JSON into structured format for AI consumption

---

### Custom Hooks (`src/hooks/useStudentData.ts`)
**Hook**: `useStudentData()`

**Returns**:
```typescript
{
  studentData: StudentData | null,
  updateProgress: (testName, updates) => void,
  saveResponse: (testName, questionId, value) => void,
  completeTest: (testName, resultData) => void,
  updateContactInfo: (name, email, whatsapp) => void,
  getCompletedCount: () => number,
  areAllTestsCompleted: () => boolean
}
```

**Purpose**: Centralized state management for student session with automatic localStorage synchronization

## Important Development Rules

### Database Operations

```typescript
// ALWAYS use this pattern for in_progress tests
result_data: {}  // NOT null - causes constraint violation

// For zero-or-one row queries
.maybeSingle()  // NOT .single() which errors on no rows

// Error handling (never block UI)
try {
  await supabase.from('table').insert(data);
} catch (error) {
  console.error('[Context] Database error:', error);
  // Continue - localStorage has the data
}
```

### File Organization

- Keep files under 500 lines
- Add file header comments describing purpose
- Remove unused files explicitly
- Group related functionality in dedicated directories

### Testing Approach

- Use temporary "Reset All Progress" button on home page (remove before production)
- Check browser console for detailed logs (format: `[TestName] Action: details`)
- Clear localStorage: Browser DevTools → Application → Local Storage
- Verify Supabase tables after operations

## Common Pitfalls to Avoid

1. **Route Mismatches**: Generated routes MUST match defined routes exactly
   - Generated: `testName.toLowerCase().replace(/\s+/g, '-')`
   - Defined in App.tsx: `/test/big-five` (NOT `/test/bigfive`)

2. **Database Constraint Violations**:
   - In-progress tests: `result_data: {}` (NOT `null`)
   - Test names: Match TypeScript types exactly ("Big Five" with space)

3. **Color Usage**: NEVER use purple, indigo, or violet hues unless explicitly requested

4. **Data Loss**: NEVER perform destructive operations without safeguards. Always check localStorage first.

5. **Mobile Design**: Always test on mobile breakpoints. Likert scale must be vertical on mobile.

## Admin Dashboard Features

### Routes
- `/admin` - Login page (Supabase Auth)
- `/admin/dashboard` - Student list with test completion status
- `/admin/reports/:studentId` - View/regenerate AI reports

### Report Generation Flow
1. Admin clicks "Generate Report" for completed student
2. System fetches all 4 test results from Supabase
3. Runs 4-phase AI prompt chain (see above)
4. Stores each section in `report_sections` table
5. Updates student `report_status` to "done"
6. Displays formatted markdown report

### Regeneration
Admin can regenerate specific sections or entire reports. System updates `report_generated_at` and `report_generated_by` timestamps.

### Admin Dashboard Enhancements (Recent Updates)
The admin dashboard has been significantly enhanced with:
- **Action Buttons**: Three distinct actions for each student:
  - **Generate** - Start AI report generation for students who completed all tests
  - **Regenerate** - Retry failed report generations (preserves successful sections)
  - **View** - Navigate to ReportViewer to see completed reports
- **Status Visualization**: Color-coded badges for report status
  - Tests Not Complete (gray)
  - Ready to Generate (blue)
  - Generation in Progress (yellow)
  - Done (green)
  - Error (red)
- **Student Statistics**: Total student count and completion metrics
- **Test Status Indicators**: Visual symbols for each test (✓ completed, ⋯ in progress, − not started)
- **Profile Dropdown**: User authentication info with sign-out functionality
- **Error Handling**: Display error messages for failed generations

## Environment Variables

```bash
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_WEBHOOK_URL=make-com-webhook-url  # Optional
```

## Migration Best Practices

1. Always use migrations for schema changes (never manual SQL)
2. Include detailed markdown summaries in migration files
3. Use `IF EXISTS` / `IF NOT EXISTS` for safety
4. Set meaningful default values
5. Never use transaction control statements (Supabase handles it)
6. Test name convention: Use exact TypeScript type names

## Project Structure

```
src/
├── components/          # Reusable UI components (10+ components)
│   ├── Avatar.tsx
│   ├── ContactModal.tsx
│   ├── Header.tsx
│   ├── LikertScale.tsx
│   ├── ProfileDropdown.tsx
│   ├── ProgressIndicator.tsx
│   ├── RegenerationLoadingModal.tsx
│   ├── TestCard.tsx
│   └── TestQuestion.tsx
├── hooks/               # Custom React hooks
│   └── useStudentData.ts - Centralized student state management
├── lib/                 # Business logic and utilities
│   ├── tests/          # Test configurations and evaluators
│   │   ├── 16personalities-config.ts (82 lines, 32 questions, 5 dimensions)
│   │   ├── 16personalities-evaluator.ts (227 lines, 4-letter code generation)
│   │   ├── big5-config.ts (139 lines, 50 questions, OCEAN dimensions)
│   │   ├── big5-evaluator.ts (173 lines, STEN + T-score conversion)
│   │   ├── high5-config.ts (364 lines, 120 questions, 20 strengths)
│   │   ├── high5-evaluator.ts (195 lines, top 5 identification)
│   │   ├── riasec-config.ts (103 lines, 48 questions, 6 Holland themes)
│   │   └── riasec-evaluator.ts (210 lines, 3-letter code generation)
│   ├── promptTemplates.ts (400+ lines) - AI report prompt templates
│   ├── reportDataFormatter.ts - Format test data for AI consumption
│   ├── reportRegeneration.ts - Selective section regeneration logic
│   ├── storage.ts (135 lines) - localStorage management
│   ├── supabase.ts - Supabase client + auth helpers
│   └── tests.ts - Test metadata and ordering
├── pages/               # Page components (routes)
│   ├── AdminDashboard.tsx (441 lines) - Student management interface
│   ├── AdminLogin.tsx (131 lines) - Authentication page
│   ├── Home.tsx (310 lines) - Test dashboard with progress tracking
│   ├── NextSteps.tsx - Confirmation after contact submission
│   ├── ReportViewer.tsx (600+ lines) - AI report display & regeneration
│   ├── Results16Personalities.tsx (80+ lines)
│   ├── ResultsBigFive.tsx (200+ lines)
│   ├── ResultsHigh5.tsx (200+ lines)
│   ├── ResultsRIASEC.tsx (200+ lines)
│   ├── Test.tsx (280 lines) - Universal test component
│   ├── Test16Personalities.tsx - Wrapper for 16P test
│   ├── TestBigFive.tsx - Wrapper for Big Five test
│   ├── TestHigh5.tsx - Wrapper for HIGH5 test
│   └── TestRIASEC.tsx - Wrapper for RIASEC test
├── styles/              # CSS stylesheets (17 files, mobile-first)
└── types/               # TypeScript type definitions
    └── index.ts (157 lines) - All types and interfaces

supabase/functions/      # Edge functions
└── generate-report/     # AI report generation (4-phase process)

documentation/           # Project documentation
├── project-context.md
└── psychometric-report-generation-context.md

tests-data/             # Test specifications and question data
```

## Complete Routes Map

### Student Routes
- `/` - Home (test dashboard with progress tracking)
- `/test/16personalities` - 16 Personalities test
- `/test/16personalities/results` - 16 Personalities results
- `/test/high5` - HIGH5 strengths test
- `/test/high5/results` - HIGH5 results
- `/test/big-five` - Big Five personality test
- `/test/big-five/results` - Big Five results
- `/test/riasec` - RIASEC career interest test
- `/test/riasec/results` - RIASEC results
- `/next-steps` - Confirmation page after contact submission

### Admin Routes
- `/admin` - Login page (Supabase Auth)
- `/admin/dashboard` - Student list with test completion status
- `/admin/reports/:studentId` - Report viewer with regeneration

## Key Files Reference

### Core Infrastructure
- `src/types/index.ts` (157 lines) - All TypeScript type definitions
- `src/lib/storage.ts` (135 lines) - localStorage management utilities
- `src/lib/supabase.ts` - Supabase client initialization + auth helpers
- `src/hooks/useStudentData.ts` - Centralized student state hook

### Test System
- `src/pages/Test.tsx` (280 lines) - Universal test component (handles all 4 tests)
- `src/lib/tests/*` - Test configurations and evaluators (8 files)
- `src/lib/tests.ts` - Test metadata and display ordering

### AI Report System
- `supabase/functions/generate-report/index.ts` - 4-phase AI generation
- `src/lib/promptTemplates.ts` (400+ lines) - AI prompt templates
- `src/lib/reportDataFormatter.ts` - Format test data for prompts
- `src/lib/reportRegeneration.ts` - Selective section regeneration
- `src/pages/ReportViewer.tsx` (600+ lines) - Report display interface
- `src/components/RegenerationLoadingModal.tsx` - Loading feedback

### Admin System
- `src/pages/AdminDashboard.tsx` (441 lines) - Student management
- `src/pages/AdminLogin.tsx` (131 lines) - Authentication

### Documentation
- `documentation/project-context.md` - Comprehensive project documentation
- `documentation/psychometric-report-generation-context.md` - AI report prompts
- `CLAUDE.md` - Development guidelines (this file)

## Debugging Tips

1. **Console Logging**: Test.tsx includes comprehensive logging:
   ```
   [Big Five] Saving response to Supabase: {student_id, question, total_responses}
   [Big Five] Successfully saved response to Supabase
   ```

2. **Common Issues**:
   - Blank screen after test: Check route mismatch
   - Database save errors: Check constraint violations (result_data: null)
   - Progress lost: Verify localStorage is not disabled
   - Test not unlocking: Check completion count (RIASEC needs 3 others)

3. **Data Verification**:
   - localStorage: DevTools → Application → Local Storage
   - Supabase: Check `students` and `test_results` tables
   - Network: DevTools → Network → Filter by "supabase"

## UI Components Reference

### Core Components

**TestCard** (`src/components/TestCard.tsx`)
- Displays individual test with icon, title, description
- Shows status badge (Available, In Progress, Completed, Locked)
- Click-through navigation to test pages
- Used on Home page

**LikertScale** (`src/components/LikertScale.tsx`)
- 5-point response scale with color coding
- Responsive: Horizontal (desktop) / Vertical (mobile)
- Props: `value`, `onChange`, `disabled`

**TestQuestion** (`src/components/TestQuestion.tsx`)
- Question display with fixed-height container
- Integrates with LikertScale component
- Shows current question number

**ProgressIndicator** (`src/components/ProgressIndicator.tsx`)
- Visual progress bar with gradient (blue → green)
- Displays "X/4 tests completed"
- Used on Home page

**ContactModal** (`src/components/ContactModal.tsx`)
- Lead capture form (student name, parent email, WhatsApp)
- Form validation with error messages
- Webhook trigger on submission
- Auto-shows when all 4 tests completed

**RegenerationLoadingModal** (`src/components/RegenerationLoadingModal.tsx`)
- 6-stage animated loading experience
- Progress bar with elapsed time
- Estimated time remaining
- Used during report regeneration

**Avatar** (`src/components/Avatar.tsx`)
- User profile avatar with fallback initials
- Used in admin dashboard ProfileDropdown

**ProfileDropdown** (`src/components/ProfileDropdown.tsx`)
- User menu with email display
- Sign out functionality
- Used in AdminDashboard header

## Recent Updates & Enhancements

### AdminDashboard Improvements (Latest Commits)
**Files Updated**: `AdminDashboard.tsx`, `AdminDashboard.css`

**Changes**:
1. **Action Button Refinement**:
   - Clear visual hierarchy for Generate/Regenerate/View buttons
   - Disabled states for inappropriate actions
   - Tooltip-style button labels

2. **Status Badge System**:
   - Color-coded badges for all report states
   - Consistent styling across dashboard

3. **Student Table Enhancement**:
   - Improved test completion indicators (✓ ⋯ −)
   - Better spacing and alignment
   - Responsive design for smaller screens

4. **Error Display**:
   - Show error messages inline for failed reports
   - Truncate long error messages with ellipsis

### ReportViewer Enhancements
**Files Updated**: `ReportViewer.css`

**Changes**:
1. **Layout Improvements**:
   - Better section spacing and typography
   - Improved table of contents styling
   - Enhanced markdown rendering

2. **Regeneration UI**:
   - Clear visual feedback during regeneration
   - Section-by-section regeneration controls
   - Progress tracking for multi-section regeneration

### Overall Architecture Status
The codebase is **production-ready** with:
- ✅ Complete test ecosystem (4 psychometric assessments)
- ✅ AI-powered report generation with error recovery
- ✅ Robust admin dashboard with full student management
- ✅ localStorage-first architecture with Supabase backup
- ✅ Mobile-responsive design throughout
- ✅ Comprehensive error handling and logging
- ✅ Type-safe TypeScript implementation

## Quick Reference: Common Tasks

### Adding a New Question to a Test
1. Edit the config file: `src/lib/tests/{test}-config.ts`
2. Add question object to `questions` array
3. Map question ID to dimension in `questionMapping`
4. Update `totalQuestions` in test metadata
5. Test completion flow still works with localStorage/Supabase sync

### Modifying Test Scoring Algorithm
1. Edit evaluator file: `src/lib/tests/{test}-evaluator.ts`
2. Update the `evaluate()` function logic
3. Ensure return type matches `{TestName}Result` interface in `src/types/index.ts`
4. Test with sample data to verify calculations

### Adding a New Report Section
1. Add section type to `ReportSectionType` union in `src/types/index.ts`
2. Create prompt template in `src/lib/promptTemplates.ts`
3. Update edge function: `supabase/functions/generate-report/index.ts`
4. Add section handling to `ReportViewer.tsx`
5. Update section categories in `reportRegeneration.ts`

### Debugging Student Data Issues
```typescript
// In browser console:
localStorage.getItem('psychometric_student_data') // View raw data
JSON.parse(localStorage.getItem('psychometric_student_data')) // Parsed object

// Check Supabase tables:
// 1. students table - Student records and status
// 2. test_results table - Test completion and scores
// 3. report_sections table - AI-generated report content
```

### Testing Report Generation Locally
1. Run Supabase local: `supabase start`
2. Deploy function: `supabase functions deploy generate-report`
3. Set secrets: `OPENAI_API_KEY` or `ANTHROPIC_API_KEY`
4. Trigger from admin dashboard or curl to edge function

### Modifying UI/Styling
**Test Interface**:
- Layout: `src/styles/Test.css`
- Likert scale: `src/styles/LikertScale.css`
- Questions: `src/styles/TestQuestion.css`

**Results Pages**: Each test has dedicated CSS file
- `src/styles/Results16Personalities.css`
- `src/styles/ResultsHigh5.css`
- etc.

**Admin Interface**:
- Dashboard: `src/styles/AdminDashboard.css`
- Report Viewer: `src/styles/ReportViewer.css`

**Responsive Breakpoints**:
```css
/* Mobile: Base styles (≤640px) */
@media (min-width: 641px) { /* Tablet */ }
@media (min-width: 1024px) { /* Desktop */ }
```

### Common localStorage Operations
```typescript
import { getStudentData, setStudentData, initializeStudent } from './lib/storage';

// Get current student
const student = getStudentData();

// Initialize new student
const uuid = initializeStudent();

// Update test progress
updateTestProgress("Big Five", { currentQuestion: 10 });

// Save response
saveResponse("Big Five", "q5", 4);

// Complete test
completeTest("Big Five", evaluatedResults);

// Clear all data (testing only)
clearData();
```

### Database Query Patterns
```typescript
// Always use .maybeSingle() for zero-or-one row queries
const { data, error } = await supabase
  .from('test_results')
  .select('*')
  .eq('student_id', uuid)
  .eq('test_name', 'Big Five')
  .maybeSingle(); // NOT .single()

// In-progress tests: Always use {} not null
await supabase.from('test_results').insert({
  student_id: uuid,
  test_name: 'Big Five',
  test_status: 'in_progress',
  result_data: {} // NEVER null
});
```

### Typical Student Flow
1. **Home page** → Student gets UUID, sees 4 test cards
2. **Click test** → Navigate to `/test/{test-name}`
3. **Take test** → Responses saved to localStorage + Supabase (background)
4. **Complete test** → Evaluator runs, scores saved, navigate to `/test/{test-name}/results`
5. **View results** → Display from localStorage (primary) or Supabase (fallback)
6. **Return home** → Progress indicator shows 1/4, 2/4, 3/4
7. **Complete all 4** → ContactModal auto-appears
8. **Submit contact** → Webhook triggered, navigate to `/next-steps`
9. **Admin generates report** → 4-phase AI generation, 12 sections created
10. **Admin views report** → Formatted display with regeneration options

## Before Production

- [ ] Remove temporary reset button from Home.tsx
- [ ] Verify all environment variables are set
- [ ] Test on multiple browsers and screen sizes
- [ ] Verify Supabase RLS policies are production-ready
- [ ] Run `npm run build` and test preview
- [ ] Verify webhook integration with Make.com
- [ ] Test admin dashboard authentication
- [ ] Verify AI report generation costs and rate limits
