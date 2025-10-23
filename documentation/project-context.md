# Project Context - Psychometric Analysis Tool

**Last Updated:** October 23, 2025

## Golden Rule

> **"Get context, think design and layout first, think of the target user's interactions first and only then work on the rest of the implementations."**

This is the fundamental principle guiding all development decisions. Always prioritize:
1. Understanding the full context
2. Planning the design and layout
3. Considering user interactions and experience
4. Only then implementing the technical solution

## Project Overview

A web-based psychometric assessment platform designed for Grade 9-12 students to take four comprehensive personality and career tests. The platform saves progress automatically, provides detailed results, and integrates with Make.com for lead management.

### Target Users
- **Primary:** Students (Grade 9-12) taking tests independently
- **Secondary:** Internal team members managing leads (future feature)

## Architecture & Tech Stack

### Frontend
- **Framework:** React 19.2.0 with TypeScript
- **Routing:** React Router DOM 7.1.3
- **Build Tool:** Vite 7.1.11
- **Styling:** CSS (with mobile-first responsive design)

### Backend & Data
- **Database:** Supabase (PostgreSQL with Row Level Security)
- **Client Storage:** localStorage (primary source of truth)
- **Server Storage:** Supabase (backup/sync mechanism)
- **Integration:** Make.com webhook (on completion)

### Key Design Principles
- **Data Safety First:** localStorage is primary, Supabase is backup
- **Fail Gracefully:** Database errors logged, not blocking
- **Auto-Save Everything:** Every response saved immediately
- **Session Persistence:** UUID-based anonymous sessions

## Implementation Status

### Completed Features

#### 1. Three Psychometric Tests (Fully Implemented)
- **16 Personalities Test** (32 questions, 8-10 minutes)
  - Myers-Briggs based assessment
  - 5 dimensions: E/I, S/N, T/F, J/P, A/T
  - Route: `/test/16personalities`
  - Results: Personality type code, dimension scores, clarity levels

- **HIGH5 Strengths Test** (120 questions, 15-20 minutes)
  - 20 strengths across 4 domains
  - Route: `/test/high5`
  - Results: Top 5 strengths, full 20 ranked, domain breakdown

- **Big Five (OCEAN) Test** (50 questions, 8-10 minutes)
  - 5 traits: Openness, Conscientiousness, Extraversion, Agreeableness, Emotional Stability
  - Route: `/test/big-five`
  - Results: Percentile scores, trait interpretations, comparison charts

#### 2. Core Functionality
- [x] Student session management (UUID-based)
- [x] Progress tracking and auto-save
- [x] Question-by-question navigation
- [x] Resume test from last answered question
- [x] Save & Exit functionality
- [x] Test evaluation and scoring
- [x] Results display with visualizations
- [x] Overall progress indicator (X of 4 tests completed)
- [x] Test status tracking (available, in_progress, completed, locked)
- [x] Contact information collection (after all tests)
- [x] Webhook integration with Make.com
- [x] Temporary reset button for clearing progress

#### 3. Database Structure (Supabase)

**Tables Implemented:**

**students table:**
- `id` (uuid, PK) - Student session identifier
- `student_name` (text) - Captured after completion
- `parent_email` (text) - For reports
- `parent_whatsapp` (text) - For follow-up
- `overall_status` (text) - Pipeline status
- `submission_timestamp` (timestamptz)
- `created_at`, `updated_at` (timestamptz)

**test_responses table:**
- `id` (uuid, PK)
- `student_id` (uuid, FK -> students.id)
- `test_name` (text) - "16Personalities", "HIGH5", "Big Five"
- `test_status` (text) - "in_progress" or "completed"
- `responses` (jsonb) - All question-answer pairs
- `completed_at` (timestamptz)
- Unique constraint: (student_id, test_name)

**test_results table:**
- `id` (uuid, PK)
- `student_id` (uuid, FK -> students.id)
- `test_name` (text)
- `result_data` (jsonb) - Computed scores and interpretations
- `completed_at` (timestamptz)
- Unique constraint: (student_id, test_name)

### Pending Features
- [ ] RIASEC Career Test (48 questions, 10-12 minutes)
- [ ] Admin dashboard for team members
- [ ] Lead management interface
- [ ] Retry mechanism for failed Supabase operations
- [ ] Data reconciliation between localStorage and Supabase

## Design Framework

### Color System
**Likert Scale Color Coding:**
- Strongly Disagree (1): `#ffe5e5` bg, `#c41e3a` text
- Disagree (2): `#fff0e5` bg, `#d97706` text
- Neutral (3): `#f0f0f0` bg, `#666` text
- Agree (4): `#e5f5e5` bg, `#059669` text
- Strongly Agree (5): `#d0f0d0` bg, `#047857` text

**Progress Indicators:**
- Gradient: `#3b82f6` (blue) to `#10b981` (green)

**IMPORTANT:** Never use purple, indigo, or violet hues unless explicitly requested.

### Layout Principles
1. **Fixed Containers:** Question text in fixed-height containers for consistent button placement
2. **Single Responsibility:** Separate question display from response options
3. **Mobile-First:** Design for mobile, enhance for desktop
4. **Consistent Spacing:** 8px system throughout

### Responsive Breakpoints
- **Mobile:** <= 640px - Vertical Likert scale, full-width buttons
- **Tablet:** 641px-1024px
- **Desktop:** > 1024px

### Typography
- Question text: 22px (desktop), 18px (mobile), weight 600
- Line height: 1.5 for body, 1.2 for headings
- Max-width: 700px for optimal reading

## Technical Implementation Details

### Route Structure
```
/ - Home dashboard
/test/16personalities - 16 Personalities test
/test/16personalities/results - Results page
/test/high5 - HIGH5 test
/test/high5/results - Results page
/test/big-five - Big Five test
/test/big-five/results - Results page
```

**Route Generation Rule:**
`testName.toLowerCase().replace(/\s+/g, '-')`

### localStorage Schema
```javascript
{
  "uuid": "student-uuid",
  "overallStatus": "test_in_progress",
  "studentName": "...",  // Added after completion
  "parentEmail": "...",  // Added after completion
  "parentWhatsapp": "...",  // Added after completion
  "testProgress": {
    "16Personalities": {
      "testName": "16Personalities",
      "currentQuestion": 15,
      "totalQuestions": 32,
      "responses": { "q1": 3, "q2": 5, ... },
      "startedAt": "ISO timestamp",
      "completedAt": "ISO timestamp"  // Only when completed
    },
    "HIGH5": { ... },
    "Big Five": { ... },
    "RIASEC": undefined
  }
}
```

### Test Configuration Pattern
Each test follows this structure:
- **Config file:** `src/lib/tests/{test}-config.ts` - Questions and metadata
- **Evaluator:** `src/lib/tests/{test}-evaluator.ts` - Scoring algorithm
- **Test wrapper:** `src/pages/Test{TestName}.tsx` - Configuration binding
- **Results page:** `src/pages/Results{TestName}.tsx` - Results display

### Universal Test Component
`Test.tsx` is a reusable component that:
- Handles question progression
- Manages response state
- Auto-saves to localStorage and Supabase
- Evaluates results on completion
- Navigates to results page with data

## Critical Business Rules

### Test Unlock Logic
- **16 Personalities, HIGH5, Big Five:** Always available
- **RIASEC:** Unlocked only after completing 3 other tests

### Overall Status Pipeline
1. `test_in_progress` - Default state
2. `reports_generated` - All tests done, contact submitted
3. `email_sent` - Reports sent (managed by Make.com)
4. `call_scheduled` - Counselor call booked
5. `call_rescheduled` - Call rescheduled
6. `no_show` - Missed call
7. `call_done` - Call completed
8. `converted` - Lead converted to customer

### Data Flow
1. **First Visit:** UUID generated -> localStorage initialized -> Student record in Supabase
2. **During Test:** Each response -> localStorage -> Background sync to Supabase
3. **Test Completion:** Evaluate -> Save results to `test_results` -> Update `test_responses` -> Navigate to results
4. **All Tests Done:** Contact modal appears
5. **Contact Submit:** Update student record -> Sync all data -> Trigger webhook

## Recent Fixes & Issues Resolved

### Issue #1: Big Five Blank Screen (FIXED - Oct 23, 2025)
**Problem:** Users saw blank screen after completing Big Five test
**Root Cause:** Route mismatch
- Generated route: `/test/big-five/results`
- Defined route: `/test/bigfive/results`

**Solution:** Standardized all routes to use hyphenated format (`big-five`)

### Debugging Enhancements
Added comprehensive console logging in `Test.tsx`:
- Logs every response save to Supabase
- Logs evaluation process
- Logs database save operations
- Logs navigation routes
- Format: `[TestName] Action: details`

Example:
```
[Big Five] Saving response to Supabase: {student_id: "...", question: "q25", total_responses: 25}
[Big Five] Successfully saved response to Supabase
```

### Temporary Development Feature
Added "Reset All Progress (Temporary)" button on home page:
- Red button between progress bar and test cards
- Clears localStorage and reloads page
- Includes confirmation dialog
- **Note:** Remove before production launch

## Development Guidelines

### File Organization
- Keep files under 500 lines
- Follow Single Responsibility Principle
- Use proper imports/exports (no globals)
- Group related functionality in dedicated directories
- Remove unused files explicitly

### Code Standards
- Always add file header comments describing purpose
- Use TypeScript for type safety
- Implement lazy loading where applicable
- Mobile-first responsive design
- Never add comments unless explicitly requested

### Database Operations
- localStorage is the primary source of truth
- Supabase operations fail silently with console.error
- Never block UI for database operations
- Use `.maybeSingle()` for zero-or-one row queries
- Always use proper error handling

### Testing Approach
- Clear localStorage to retest: Use reset button or browser DevTools
- Check browser console for detailed logs
- Verify Supabase tables after test completion
- Test on multiple screen sizes

## Security & Data Integrity

### Data Safety
- DATA INTEGRITY IS HIGHEST PRIORITY
- Never use destructive operations without safeguards
- All database operations have error handling
- localStorage acts as backup if database fails

### Row Level Security (RLS)
- All tables have RLS enabled (managed by Supabase migrations)
- Current implementation: Anonymous access allowed
- Future: Implement proper authentication-based RLS policies

## Database Best Practices

1. Always use migrations for schema changes
2. Include detailed markdown summaries in migration files
3. Use `IF EXISTS` / `IF NOT EXISTS` for safety
4. Set meaningful default values
5. Never use transaction control statements
6. Test name convention: Use exact TypeScript type (e.g., "Big Five" with space)

## Future Considerations

### Planned Enhancements
- Admin dashboard with student progress tracking
- Enhanced error recovery and retry mechanisms
- Data reconciliation between localStorage and Supabase
- Direct navigation protection (validate student session)
- Proper authentication system with RLS
- Remove temporary reset button before launch

### Known Limitations
- No admin dashboard yet
- Database operations fail silently
- No retry mechanism for failed operations
- Direct URL navigation may cause inconsistencies
- RIASEC test not implemented

## Integration Points

### Make.com Webhook
**Trigger:** After all 4 tests completed and contact info submitted
**Payload:**
```json
{
  "studentId": "uuid",
  "studentName": "...",
  "parentEmail": "...",
  "parentWhatsapp": "...",
  "completedTests": ["16Personalities", "HIGH5", "Big Five", "RIASEC"],
  "timestamp": "ISO timestamp"
}
```

### Environment Variables
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key
- `VITE_WEBHOOK_URL` - Make.com webhook endpoint (optional)

## Key Insights & Learnings

### What Works Well
1. Universal Test component pattern - highly reusable
2. localStorage-first approach - resilient to network issues
3. Background Supabase sync - non-blocking user experience
4. Detailed console logging - excellent for debugging
5. TypeScript types - prevents many errors early

### What Needs Attention
1. Error recovery mechanisms
2. Admin interface for team
3. Data reconciliation logic
4. Direct URL navigation protection
5. Production-ready RLS policies

## Development Checklist for New Features

When adding new features, always:
- [ ] Read and understand existing patterns
- [ ] Design UI/UX before coding
- [ ] Consider mobile-first approach
- [ ] Follow the golden rule (context -> design -> interactions -> implementation)
- [ ] Add comprehensive error handling
- [ ] Include console logging for debugging
- [ ] Test on multiple screen sizes
- [ ] Update this document with changes
- [ ] Run `npm run build` before committing
- [ ] Verify both localStorage and Supabase data

---

**Remember:** This is a student-facing tool. Every interaction should be smooth, forgiving, and encouraging. Never lose their progress, never make them repeat work, and always provide clear feedback about what's happening.
https://stackblitz.com/storage/blobs/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBCSHVBamdJPSIsImV4cCI6bnVsbCwicHVyIjoiYmxvYl9pZCJ9fQ==--6f7d2c623e252234abd32346ff11eedcf2c9db94//project-context.md