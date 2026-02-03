# Psychometric Analysis Tool

Psychometric assessment platform for Grade 9-12 students. 4 tests (16P, HIGH5, Big Five, RIASEC) with AI-generated career guidance reports.

## Stack
React 19 + TypeScript + Vite | Supabase (PostgreSQL + Edge Functions) | CSS | Netlify

## Commands
```bash
npm run dev      # Start dev server (port 5173)
npm run build    # Build for production (ALWAYS run before committing)
npm run preview  # Preview production build
```

## Context Docs
Reference `.context/` files when needed:

| File | Load When |
|------|-----------|
| prd.md | Understanding requirements, adding features |
| progress.md | Checking what's done, planning next steps |
| todo.md | Picking up tasks, prioritizing work |
| db-schema.md | Database queries, migrations, data modeling |
| architecture.md | Understanding system design, data flow |
| tests.md | Modifying tests, scoring algorithms, adding questions |

## Specialized Reference Docs
| Folder | Load When |
|--------|-----------|
| `tests-data/` | Test specifications: all questions, scoring formulas, question mappings |
| `documentation/` | AI report generation: prompt architecture, 4-phase chain |

## Current Student Flow (ACTUAL)
1. Home → RegistrationModal (captures name, email, whatsapp BEFORE tests)
2. Take 3 tests in any order → RIASEC unlocks
3. Complete all 4 → Return to Home (4/4 shown)

**Note:** Contact info captured UPFRONT via RegistrationModal, NOT after tests.

## Key Patterns

### Data Safety (Critical)
- **localStorage is PRIMARY, Supabase is BACKUP**
- All responses saved to localStorage immediately
- Supabase sync is non-blocking (errors logged, never thrown)
- Never lose student progress due to network issues

### Test Component Pattern
Each test requires 4 files:
1. `src/lib/tests/{test}-config.ts` - Questions & metadata
2. `src/lib/tests/{test}-evaluator.ts` - Scoring algorithm
3. `src/pages/Test{Name}.tsx` - Wrapper binding config to Test.tsx
4. `src/pages/Results{Name}.tsx` - Results display

### Database Rules
```typescript
// ALWAYS use {} for in_progress tests, NEVER null
result_data: {}

// Use .maybeSingle() for zero-or-one row queries
.maybeSingle()  // NOT .single()
```

### Route Generation
```typescript
testName.toLowerCase().replace(/\s+/g, '-')
// "Big Five" → "/test/big-five"
```

### Colors
NEVER use purple/indigo/violet. Likert scale uses specific colors defined in globals.css.

### Responsive Design
Mobile-first (640px breakpoint). Likert scale: vertical on mobile, horizontal on desktop.

## Known Issues (Check todo.md)
- `ContactModal.tsx` is dead code (replaced by RegistrationModal)
- `ResultsRIASEC.tsx` missing Header component
- `VITE_WEBHOOK_URL` defined but NOT used in code

---
**IMPORTANT:** After ANY code change, update relevant `.context/` docs to keep this system accurate.
