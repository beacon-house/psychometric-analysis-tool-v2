# Convex Migration Research

**Created:** 2026-02-03
**Status:** Research complete, implementation pending
**Decision:** Pending Krishna's review

---

## Overview

This document contains research for migrating from Supabase to Convex database. The goal is to simplify the dev/staging/prod workflow by leveraging Convex's built-in environment branching.

## Current Setup (Supabase)

```
GitHub Repo
├── main branch ──────► Netlify (Production URL)
│                       └── ENV: Production Supabase project
│
└── staging-v2 branch ─► Netlify (Staging URL)
                         └── ENV: Staging Supabase project
```

**Pain Points:**
- Two separate Supabase projects to maintain
- Manual SQL migrations must be run in correct order on both databases
- Easy to forget or cause drift between staging and prod

## Target Setup (Convex)

```
GitHub Repo
├── main branch ──────► Netlify + Convex prod deployment
│
└── staging-v2 branch ─► Netlify + Convex dev deployment

ONE Convex Project
├── dev deployment ──── equivalent to staging
└── prod deployment ─── production
```

**Benefits:**
- Single project with multiple deployments
- Schema changes propagate automatically on deploy
- No manual SQL migrations
- Built-in environment branching

---

## Sources Referenced

- [Migrating data from Postgres to Convex](https://stack.convex.dev/migrate-data-postgres-to-convex)
- [Convex Data Import](https://docs.convex.dev/database/import-export/import)
- [Deploying to Production](https://docs.convex.dev/production)
- [Using Convex with Netlify](https://docs.convex.dev/production/hosting/netlify)
- [Convex Schemas](https://docs.convex.dev/database/schemas)
- [Convex Authentication](https://docs.convex.dev/auth)
- [Convex Actions](https://docs.convex.dev/functions/actions)
- [HTTP Actions](https://docs.convex.dev/functions/http-actions)

---

## How Convex Dev/Prod Works

| Aspect | Supabase (Current) | Convex (Target) |
|--------|-------------------|-----------------|
| **Projects** | 2 separate projects | 1 project with multiple deployments |
| **Deployments** | Manual env var switching | Dev deployment per developer + 1 prod |
| **Migrations** | Manual SQL files | Automatic on `npx convex deploy` |
| **Schema Changes** | SQL migrations | Code-first (schema.ts), auto-validated |
| **Data Sync** | Manual | Schema must match data (enforced) |

---

## Potential Migration Challenges

### 1. Schema Translation
Supabase uses PostgreSQL types, Convex uses its own type system.

| Supabase | Convex |
|----------|--------|
| `uuid` (PK) | `v.id("tableName")` (auto-generated) |
| `uuid` (FK) | `v.id("otherTable")` |
| `text` | `v.string()` |
| `boolean` | `v.boolean()` |
| `integer` | `v.number()` |
| `timestamptz` | `v.number()` (Unix timestamp) |
| `jsonb` | `v.any()` or structured `v.object({...})` |

### 2. Foreign Key References
- Supabase uses UUID strings for FKs
- Convex uses native `Id<"tableName">` types
- After import, references are strings, need migration to Convex IDs
- 6-step migration process required

### 3. Edge Functions → Convex Actions
- `generate-report` and `regenerate-report-sections` need rewrite
- Convex Actions can call OpenAI directly, similar pattern
- Actions are Node.js-like (not Deno like Supabase Edge Functions)

### 4. Authentication
- Supabase Auth → Clerk (recommended for Convex)
- Only 3-4 admin users, can recreate accounts
- Not a blocker

### 5. Real-time Subscriptions
- Actually easier in Convex
- `useQuery` is reactive by default
- No extra code needed

### 6. Row-Level Security (RLS)
- Supabase RLS → Convex function-level auth checks
- Need to implement auth checks in each function via `ctx.auth`

### 7. Data Import with Preserved IDs
- Can import with original IDs
- String IDs need migration to Convex native IDs
- ZIP exports preserve `_id` and `_creationTime`

---

## Data Migration Strategy

### Phase 1: Staging Migration (Test)

```bash
# 1. Export staging Supabase data → JSONL files
psql -c "\copy (SELECT row_to_json(students) FROM students) TO 'students.jsonl'"
psql -c "\copy (SELECT row_to_json(test_results) FROM test_results) TO 'test_results.jsonl'"
psql -c "\copy (SELECT row_to_json(report_sections) FROM report_sections) TO 'report_sections.jsonl'"
psql -c "\copy (SELECT row_to_json(selected_recommendations) FROM selected_recommendations) TO 'selected_recommendations.jsonl'"

# 2. Create Convex schema (convex/schema.ts)

# 3. Import into Convex dev deployment
npx convex import --table students students.jsonl
npx convex import --table test_results test_results.jsonl
npx convex import --table report_sections report_sections.jsonl
npx convex import --table selected_recommendations selected_recommendations.jsonl

# 4. Run FK migration (convert string UUIDs to Convex IDs)

# 5. Update React code to use Convex

# 6. Test thoroughly
```

### Phase 2: Production Migration (After Staging Validated)

```bash
# 1. Export production Supabase data → JSONL files

# 2. Import into Convex production deployment
npx convex import --prod --table students students.jsonl
# (repeat for all tables)

# 3. Run same FK migration on prod

# 4. Deploy frontend changes to main branch
```

---

## Netlify + Convex Setup

**Build Command:**
```bash
npx convex deploy --cmd 'npm run build'
```

**Environment Variables in Netlify:**
```
CONVEX_DEPLOY_KEY=<your-production-deploy-key>
```

**How it works:**
1. `npx convex deploy` reads `CONVEX_DEPLOY_KEY`
2. Deploys Convex functions to production
3. Sets `VITE_CONVEX_URL` automatically
4. Runs `npm run build` which uses that URL
5. Frontend connects to correct Convex deployment

---

## Code Changes Required

### New Files to Create
```
convex/
├── schema.ts          # Database schema
├── students.ts        # Student queries/mutations
├── testResults.ts     # Test results queries/mutations
├── reportSections.ts  # Report section queries/mutations
├── reports.ts         # Report generation action (replaces Edge Function)
├── auth.ts            # Auth configuration
└── http.ts            # HTTP endpoints (if needed for webhooks)
```

### Files to Modify
```
src/
├── main.tsx           # Wrap with ConvexProvider (+ ClerkProvider)
├── lib/supabase.ts    # DELETE or replace
├── pages/AdminLogin.tsx    # Update to use Clerk
├── pages/AdminDashboard.tsx # Replace Supabase queries
├── pages/ReportViewer.tsx   # Replace Supabase queries
├── pages/Test.tsx          # Replace Supabase mutations
├── pages/Home.tsx          # Replace Supabase mutations
```

### Dependencies
```bash
# Remove
npm uninstall @supabase/supabase-js

# Add
npm install convex
npm install @clerk/clerk-react  # For admin auth
```

---

## Recommended Migration Order

1. Set up Convex project - `npx convex dev`
2. Define schema - `convex/schema.ts`
3. Write basic queries/mutations - Students, TestResults
4. Test with fresh data - Verify schema works
5. Export staging Supabase data - JSONL format
6. Import into Convex dev - `npx convex import`
7. Update React components - One by one, test each
8. Set up Clerk for admin auth - 3-4 accounts
9. Migrate Edge Functions - Report generation action
10. Full staging test - All flows work
11. Production migration - Same process with prod data

---

## Data to Preserve

| Table | Records | Priority |
|-------|---------|----------|
| `students` | All student records with contact info | Critical |
| `test_results` | All completed tests with scores | Critical |
| `report_sections` | AI-generated report content | Critical |
| `selected_recommendations` | Counselor-selected majors | Important |

---

## Questions to Decide Before Implementation

1. **Auth Provider:** Clerk vs Auth0 vs custom?
2. **Migration Timing:** When to do prod migration (weekend? low traffic time?)
3. **Rollback Plan:** Keep Supabase running in parallel initially?
4. **Webhook:** Implement Make.com webhook during migration or after?

---

## Next Steps

When ready to implement:
1. Review this document
2. Create Convex account and project
3. Start with schema definition
4. Test with staging data first
5. Only proceed to prod after full validation

---

**This document will be updated as implementation progresses.**
