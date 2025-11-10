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
- `student_id`, `section_type`, `content` (jsonb), `tokens_used`, `error_message`

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

## Key Files Reference

- `src/types/index.ts` - All TypeScript type definitions
- `src/lib/storage.ts` - localStorage management utilities
- `src/lib/supabase.ts` - Supabase client initialization
- `src/pages/Test.tsx` - Universal test component (handles all 4 tests)
- `src/lib/tests/*` - Test configurations and evaluators
- `documentation/project-context.md` - Comprehensive project documentation
- `documentation/psychometric-report-generation-context.md` - AI report prompts

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

## Before Production

- [ ] Remove temporary reset button from Home.tsx
- [ ] Verify all environment variables are set
- [ ] Test on multiple browsers and screen sizes
- [ ] Verify Supabase RLS policies are production-ready
- [ ] Run `npm run build` and test preview
- [ ] Verify webhook integration with Make.com
- [ ] Test admin dashboard authentication
- [ ] Verify AI report generation costs and rate limits
