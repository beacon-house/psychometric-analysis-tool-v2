# Task List

**Last Updated:** 2026-02-03

## Priority: Critical (Bugs)

### Actual Bugs Found
- [ ] Add `<Header />` to ResultsRIASEC.tsx (missing, all other results pages have it)
- [ ] Remove or delete ContactModal.tsx (dead code, 175 lines unused)
- [ ] Implement Make.com webhook (VITE_WEBHOOK_URL exists but no code uses it)

## Priority: High

### Before Production
- [ ] Remove temporary reset button from Home.tsx (if still present)
- [ ] Verify all environment variables are set
- [ ] Test on multiple browsers and screen sizes
- [ ] Run `npm run build` and test preview
- [ ] Test admin authentication flow
- [ ] Verify AI report generation costs/rate limits
- [ ] Remove console.log statements from production code

### Webhook Integration
- [ ] Implement webhook trigger in storage.ts or Home.tsx
- [ ] Decide trigger point: after registration OR after all tests complete
- [ ] Test Make.com webhook receives payload correctly

## Priority: Medium

### Features
- [ ] PDF export for generated reports
- [ ] Counselor assignment dropdown in dashboard
- [ ] Auto-redirect to NextSteps after all 4 tests complete
- [ ] Report editing UI for counselors

### Improvements
- [ ] Add loading skeletons instead of spinners
- [ ] Implement caching in ReportViewer
- [ ] Add ARIA labels for accessibility
- [ ] Add keyboard navigation support

## Priority: Low

### Future Enhancements
- [ ] WhatsApp Business API integration
- [ ] Google Calendar booking integration
- [ ] Bulk student import from CSV
- [ ] Analytics dashboard (completion rates, funnel metrics)
- [ ] Multi-language support (Hindi, Tamil)

### Technical Debt
- [ ] Add Jest/Vitest automated tests
- [ ] Split ReportViewer.tsx (1049 lines → smaller components)
- [ ] Add React.memo to expensive components
- [ ] Consolidate CSS files where possible
- [ ] Clean up dead code (ContactModal.tsx)

## Completed Recently
- [x] Fixed RLS policies for registration flow
- [x] Registration modal pre-test capture (RegistrationModal)
- [x] Admin dashboard action buttons
- [x] Status badge system
- [x] Regeneration loading modal
- [x] Recommendation selection system in ReportViewer
