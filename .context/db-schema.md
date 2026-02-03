# Database Schema

**Last Updated:** 2026-02-03
**Platform:** Supabase (PostgreSQL)
**Project:** apply-new-adms-lp-v2

## Tables

### students
```sql
id (UUID, PK)
student_name (text, nullable)
parent_email (text, nullable)
parent_whatsapp (text, nullable)
overall_status (text, default: 'test_in_progress')
  -- Values: test_in_progress, reports_generated, email_sent,
  --         call_scheduled, call_rescheduled, no_show, call_done, converted
report_generated (boolean, default: false)
report_status (text, default: 'tests_not_complete')
  -- Values: tests_not_complete, ready_to_generate, generation_in_progress, done, error
report_generated_by (text, nullable)
report_generated_at (timestamptz, nullable)
report_error_message (text, nullable)
submission_timestamp (timestamptz, nullable)
created_at (timestamptz, default: now())
updated_at (timestamptz, default: now())
```

### test_results
```sql
id (UUID, PK)
student_id (UUID, FK → students.id ON DELETE CASCADE)
test_name (text, NOT NULL)
  -- Values: "16Personalities", "HIGH5", "Big Five", "RIASEC"
test_status (text, default: 'in_progress')
  -- Values: in_progress, completed, abandoned
result_data (jsonb, default: {})  -- NEVER null!
completed_at (timestamptz, default: now())
created_at (timestamptz, default: now())
updated_at (timestamptz, default: now())
UNIQUE: (student_id, test_name)
```

### report_sections
```sql
id (UUID, PK)
student_id (UUID, FK → students.id ON DELETE CASCADE)
section_type (text, NOT NULL)
  -- Values: student_type, test_16p, test_high5, test_big5, test_riasec,
  --         core_identity_summary, domain_stem, domain_biology,
  --         domain_liberal_arts, domain_business, domain_interdisciplinary,
  --         overall_insight
content (jsonb, NOT NULL, default: {})
generated_at (timestamptz, default: now())
tokens_used (integer, default: 0)
error_message (text, nullable)
created_at (timestamptz, default: now())
updated_at (timestamptz, default: now())
UNIQUE INDEX: (student_id, section_type)
```

### selected_recommendations
```sql
id (UUID, PK)
student_id (UUID, FK → students.id ON DELETE CASCADE)
domain (text, NOT NULL)
section (text, NOT NULL)  -- 'strongerAreas' | 'weakerAreas'
recommendation_text (text, NOT NULL)
is_custom (boolean, default: false)
selected_by (text, nullable)
created_at (timestamptz, default: now())
updated_at (timestamptz, default: now())
CHECK: section IN ('strongerAreas', 'weakerAreas')
```

## RLS Policies
- **Anonymous users**: INSERT, SELECT, UPDATE on students & test_results (UUID-based)
- **Authenticated counselors**: Full SELECT/UPDATE on all tables
- **Service role (edge functions)**: INSERT/UPDATE on report_sections & selected_recommendations

## Key Indexes
- `idx_students_email`, `idx_students_status`, `idx_students_created`
- `idx_students_report_generated`, `idx_students_report_status`
- `idx_test_results_student`, `idx_test_results_test_name`
- `idx_report_sections_student_id`, `idx_report_sections_section_type`

## Critical Rules
1. `result_data` must be `{}` for in_progress, NEVER `null`
2. Use `.maybeSingle()` for zero-or-one row queries, NOT `.single()`
3. Test names must match TypeScript types exactly ("Big Five" with space)
4. Timestamps auto-update via triggers
