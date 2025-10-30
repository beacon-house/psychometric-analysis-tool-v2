# Functional Requirements - Psychometric Analysis Tool

Last Updated: October 30, 2025

## Golden Rule
**Get context, think design and layout first, think of the target user's interactions first and only then work on the rest of the implementations.**

## Tech Stack
- **Frontend:** React 19.2.0 with TypeScript
- **Routing:** React Router DOM 7.1.3
- **Build Tool:** Vite 7.1.11
- **Database:** Supabase (PostgreSQL with RLS)
- **Storage:** localStorage (client-side persistence) + Supabase (server-side persistence)
- **Styling:** CSS Modules
- **Webhook Integration:** Make.com (POST on completion)

## User Personas

### Primary User: Student (Grade 9-12)
- Takes psychometric tests independently
- Navigates between tests
- Saves progress and completes tests at their own pace
- Provides contact information after completing all tests

### Secondary User: Internal Team Member (Future)
- Views student test status and progress
- Manages lead pipeline
- Updates student status in CRM flow

## Core User Stories

### 1. Landing & Test Selection
**As a student**, I want to see all available tests with my progress so I can choose which test to take next.

**Acceptance Criteria:**
- Display dashboard with 4 test cards (16 Personalities, HIGH5, Big Five, RIASEC)
- Show test status: locked, available, in_progress, completed
- Display overall progress indicator (X of 4 tests completed)
- Show test metadata: title, description, question count, estimated time
- RIASEC test remains locked until 3 tests are completed

**Implementation:**
- Component: `Home.tsx`
- Test metadata: `src/lib/tests.ts`
- Hook: `useStudentData.ts`

### 2. Starting a Test
**As a student**, I want to start a test and answer questions one at a time so I can provide thoughtful responses.

**Acceptance Criteria:**
- Navigate to test interface when clicking "Start Test" or "Resume Test"
- Display one question at a time
- Show progress indicator (Question X of Y)
- Save each response to localStorage and Supabase
- Allow navigation to previous questions
- Provide "Save & Exit" option to pause and resume later

**Implementation:**
- Universal component: `Test.tsx`
- Test-specific wrappers: `Test16Personalities.tsx`, `TestHigh5.tsx`, `TestBigFive.tsx`
- Question component: `TestQuestion.tsx`
- Response component: `LikertScale.tsx`

### 3. Test Question Data Sources
**Test configurations are loaded from:**
- 16 Personalities: `src/lib/tests/16personalities-config.ts`
- HIGH5: `src/lib/tests/high5-config.ts`
- Big Five: `src/lib/tests/big5-config.ts`
- RIASEC: `src/lib/tests/riasec-config.ts`

### 4. Test Progress Persistence
**As a student**, I want my progress to be saved automatically so I don't lose my answers if I close the browser.

**Acceptance Criteria:**
- Auto-save each answer to localStorage immediately
- Create in_progress record in test_results when test starts
- Resume from last answered question when returning
- Maintain session via UUID stored in localStorage
- Create student record in Supabase on first test interaction

**Implementation:**
- Storage utility: `src/lib/storage.ts`
- Database client: `src/lib/supabase.ts`
- Hook: `useStudentData.ts`

### 5. Completing a Test
**As a student**, I want to see my results immediately after finishing a test so I understand my personality profile.

**Acceptance Criteria:**
- Evaluate responses using test-specific algorithm
- Calculate scores and interpretations
- Update `test_results` with results and mark as completed
- Mark test as completed in localStorage
- Redirect to results page with evaluation data
- For RIASEC: Show contact modal after completion

**Implementation:**
- Evaluation logic:
  - 16 Personalities: `src/lib/tests/16personalities-evaluator.ts`
  - HIGH5: `src/lib/tests/high5-evaluator.ts`
  - Big Five: `src/lib/tests/big5-evaluator.ts`
  - RIASEC: `src/lib/tests/riasec-evaluator.ts`
- Universal test handler: `Test.tsx` (handleTestCompletion)

### 6. Viewing Test Results
**As a student**, I want to see detailed results with visualizations so I can understand my personality traits.

**Acceptance Criteria:**
- Display test-specific result format with appropriate visualizations
- Load results from location state (if navigated from test completion)
- Fallback: Fetch results from Supabase if refreshing results page
- Show "Continue to Dashboard" button to return home
- Results persist and are retrievable anytime

**Implementation:**
- Results pages: `Results16Personalities.tsx`, `ResultsHigh5.tsx`, `ResultsBigFive.tsx`, `ResultsRIASEC.tsx`
- Each results page fetches from `test_results` table using student_id + test_name

### 7. Contact Information Collection
**As a student**, I want to provide my contact details after completing the RIASEC test so I can receive my comprehensive reports.

**Acceptance Criteria:**
- Modal appears automatically after completing RIASEC test
- Modal is non-dismissable (must submit to proceed)
- Required fields: Student name, Parent email, Parent WhatsApp
- Form validation for email and phone formats
- Update student record in Supabase with contact info
- Update overall_status to 'contact_submitted'
- Trigger webhook to Make.com with complete student data
- Navigate to NextSteps confirmation page

**Implementation:**
- Component: `ContactModal.tsx`
- Submission handler: `Test.tsx` (handleContactSubmit)
- Confirmation page: `NextSteps.tsx`
- Webhook URL: `VITE_WEBHOOK_URL` environment variable

### 8. Session Management
**As a student**, I want my session to persist across browser sessions so I can return anytime.

**Acceptance Criteria:**
- Generate UUID on first visit (client-side)
- Store UUID and all progress in localStorage
- Create student record in Supabase with UUID
- Use UUID to link all test responses and results
- No authentication required (anonymous access)

**Implementation:**
- UUID generation: `storage.ts` (initializeStudent)
- Session hook: `useStudentData.ts`
- Database tables: `students`, `test_responses`, `test_results`

## Database Schema

### Table: students
- `id` (uuid, PK): Student session identifier
- `student_name` (text): Student name (captured post-completion)
- `parent_email` (text): Parent email for reports
- `parent_whatsapp` (text): Parent WhatsApp for follow-up
- `overall_status` (text): Lead pipeline status
- `submission_timestamp` (timestamptz): Contact form submission time
- `created_at`, `updated_at` (timestamptz): Timestamps

### Table: test_results
- `id` (uuid, PK): Result record identifier
- `student_id` (uuid, FK): References students.id
- `test_name` (text): Test identifier (16Personalities, HIGH5, Big Five, RIASEC)
- `test_status` (text): 'in_progress' or 'completed'
- `result_data` (jsonb): Computed scores and interpretations (empty {} for in_progress)
- `completed_at` (timestamptz): Evaluation timestamp
- `created_at`, `updated_at` (timestamptz): Timestamps
- Unique constraint: (student_id, test_name)

Note: test_responses table was removed - localStorage handles all progress tracking during test-taking

## Business Logic

### Overall Status Pipeline
1. `test_in_progress`: Student is taking tests (default)
2. `reports_generated`: All tests completed, contact info submitted
3. `email_sent`: Reports sent to parent (managed by Make.com)
4. `call_scheduled`: Counselor call booked (managed externally)
5. `call_rescheduled`: Call rescheduled (managed externally)
6. `no_show`: Missed scheduled call (managed externally)
7. `call_done`: Call completed (managed externally)
8. `converted`: Lead converted to customer (managed externally)

### Test Unlock Logic
- 16 Personalities, HIGH5, Big Five: Always available
- RIASEC: Unlocked only after completing 3 other tests

### Data Flow
1. Student visits site � UUID generated � localStorage initialized � Student record created in Supabase
2. Student starts test � Test progress initialized in localStorage � in_progress record created in test_results
3. Student answers question � Response saved to localStorage (no database writes during test-taking)
4. Student completes test � Results evaluated � test_results updated with results and completed status � Redirected to results
5. Student completes RIASEC � Contact modal appears (non-dismissable)
6. Student submits contact � Student record updated � Webhook triggered � Redirected to NextSteps page

### Error Handling
- Database operations fail silently with console.error
- localStorage acts as primary source of truth
- Supabase stores final results and status only
- Results pages gracefully redirect to home if data not found
- User can continue even if database save fails (with confirmation dialog)

## Test Metadata Structure

Each test provides:
- `id`: Unique test identifier (TestName type)
- `title`: Display name
- `description`: Brief description for cards
- `questionCount`: Total questions
- `estimatedTime`: Time estimate string
- `icon`: Icon identifier for display
- `questions`: Array of question objects with id and text
- `responseScale`: Likert scale configuration
- `evaluateFunction`: Algorithm to compute results from responses

## Component Architecture

### Pages
- `Home.tsx`: Dashboard with test selection
- `Test.tsx`: Universal test-taking component
- `Test[TestName].tsx`: Test-specific configuration wrappers (16Personalities, High5, BigFive, RIASEC)
- `Results[TestName].tsx`: Test-specific results display
- `NextSteps.tsx`: Post-contact confirmation page

### Components
- `Header.tsx`: App header with branding
- `TestCard.tsx`: Individual test card with status
- `ProgressIndicator.tsx`: Overall completion progress
- `TestQuestion.tsx`: Question display with navigation
- `LikertScale.tsx`: Response scale input
- `ContactModal.tsx`: Contact information form

### Utilities
- `storage.ts`: localStorage CRUD operations
- `supabase.ts`: Supabase client singleton
- `tests.ts`: Test metadata and configuration

### Hooks
- `useStudentData.ts`: Student session and progress management

## Routes
- `/` - Home dashboard
- `/test/16personalities` - 16 Personalities test
- `/test/16personalities/results` - 16 Personalities results
- `/test/high5` - HIGH5 test
- `/test/high5/results` - HIGH5 results
- `/test/big-five` - Big Five test
- `/test/big-five/results` - Big Five results
- `/test/riasec` - RIASEC test
- `/test/riasec/results` - RIASEC results
- `/next-steps` - Post-contact confirmation page

## Environment Variables
- `VITE_SUPABASE_URL`: Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Supabase anonymous key
- `VITE_WEBHOOK_URL`: Make.com webhook endpoint (optional)

## Known Limitations
- No admin dashboard for team members
- Database operations fail silently without user notification
- No retry mechanism for failed Supabase operations
- Direct navigation to test pages may cause data inconsistencies
- No data reconciliation between localStorage and Supabase
