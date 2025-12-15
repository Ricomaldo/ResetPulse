---
created: '2025-12-15'
updated: '2025-12-15'
status: active
mission: 'Post-Audits Fix Sequence'
next_session: true
---

# Mission: Post-Audits Fix Sequence — ResetPulse v1.4

## 🎯 Objectif

Transformer les 14 P0 findings (audit-2025-14-12) en fixes séquencées, validées, et production-ready.

**Timeline**: ~40-50 jours (solo) ou parallélisé par domaine
**Prerequisite**: Lire `../../docs/audits/audit-2025-14-12/INDEX.md` pour contexte

---

## 📊 Phase Overview

| Phase | Focus | P-Level | Est. Time | Blocking? | Next |
|-------|-------|---------|-----------|-----------|------|
| **Phase 1** | Foundation (already done) | — | — | ✅ Complete | Phase 2 |
| **Phase 2** | **P0 Critical Blockers** | P0 | 18-22h + 13-20h + 3-5d | ❌ YES | Phase 3 |
| **Phase 3** | Quick Wins | P0/P1 | 20min | ✅ No | Phase 4 |
| **Phase 4** | P1 Deferred | P1/P2 | TBD | ⚠️ v1.4-v1.5 | — |

---

## ✅ PHASE 1: Foundation (COMPLETED)

All baseline audits established. Security, Code Quality, Architecture validated.

- [x] Architecture (98% ✅)
- [x] Code Quality (85% ✅)
- [x] Security (88% ✅)
- [x] Analytics (Good ✅)

**Status**: Ready for Phase 2

---

## 🔴 PHASE 2: P0 Critical Blockers (BLOCKING PRODUCTION)

### A. Accessibility (P0) — 18-22 hours

**Issue**: App NOT accessible for neuroatypical users. WCAG AA 58% (F grade).

| # | Fix | Issue | Impact | Time | Source |
|---|-----|-------|--------|------|--------|
| A1 | Modals accessible | 12 modals, 1 label (8% accessibility) | Screen readers cannot use premium | 4h | [`audit-accessibility-validation`](../../../docs/audits/audit-2025-14-12/reports/2025-12-14_accessibility-validation.md) |
| A2 | Touch targets | 90%+ violations of 44×44pt min | Motor impairment users cannot interact | 6h | [`audit-accessibility-validation`](../../../docs/audits/audit-2025-14-12/reports/2025-12-14_accessibility-validation.md) |
| A3 | Timer dial accessible | Core feature not accessible to screen readers | Blind users cannot use main feature | 8h | [`audit-accessibility-baseline`](../../../docs/audits/audit-2025-14-12/reports/2025-12-14_accessibility-baseline.md) |
| A4 | Color contrast | #e5a8a3 = 2.89:1 on white (FAIL WCAG AA) | Low vision users cannot read | 4-6h | [`audit-accessibility-baseline`](../../../docs/audits/audit-2025-14-12/reports/2025-12-14_accessibility-baseline.md) |

**Execution Order**: A4 → A2 → A1 → A3 (dependency: A4 theme, then UI fixes, then complex components)
**Validation**: Run VoiceOver (iOS) + TalkBack (Android) after each fix
**Handoff**: [`handoff-engineer-accessibility.md`](../../../docs/audits/audit-2025-14-12/handoffs/handoff-engineer-accessibility.md)

**Checklist**:
- [ ] A1 - Modals accessibility (4h)
- [ ] A2 - Touch targets (6h)
- [ ] A3 - Timer dial (8h)
- [ ] A4 - Color contrast (4-6h)
- [ ] Validation: VoiceOver + TalkBack testing
- [ ] Sign-off: WCAG AA 80%+ achieved

---

### B. UX / Conversion (P0) — 13-20 hours

**Issue**: 6 P0 blockers prevent any conversion. Broken paywall, DEV_MODE visible, modal stacking deadlock.

| # | Fix | Issue | Impact | Time | Source |
|---|-----|-------|--------|------|--------|
| U1 | DEV_MODE disabled | Dev controls visible in production | Users see internal toggles | 1min | [`audit-ux-validation`](../../../docs/audits/audit-2025-14-12/reports/2025-12-14_ux-conversion-validation.md) |
| U2 | AsyncStorage async | Blocks app launch 500-1000ms | Poor first impression, Android blank screen | 4-6h | [`audit-ux-baseline`](../../../docs/audits/audit-2025-14-12/reports/2025-12-14_ux-conversion-baseline.md) |
| U3 | Paywall integration | Filter 090 broken, NO RevenueCat | 0% onboarding conversion | 2-4h | [`audit-ux-validation`](../../../docs/audits/audit-2025-14-12/reports/2025-12-14_ux-conversion-validation.md) |
| U4 | Progress indicator | Onboarding abandonment 30-40% (vs 5-10% industry) | High drop-off, no progress feedback | 2-4h | [`audit-ux-baseline`](../../../docs/audits/audit-2025-14-12/reports/2025-12-14_ux-conversion-baseline.md) |
| U5 | Purchase error recovery | No retry button, lost revenue | Users cannot retry after error | 2-3h | [`audit-ux-baseline`](../../../docs/audits/audit-2025-14-12/reports/2025-12-14_ux-conversion-baseline.md) |
| U6 | Modal stacking | 2-3 levels deep, no back nav (deadlock) | Users abandon premium flow | 2-3 days | [`audit-ux-baseline`](../../../docs/audits/audit-2025-14-12/reports/2025-12-14_ux-conversion-baseline.md) |

**Execution Order**: U1 (1min) → U2 (4-6h) → U3 (2-4h) → U4 (2-4h) → U5 (2-3h) → U6 (2-3 days)
**Validation**: E2E funnel test: Onboarding → Timer creation → Premium discovery → Purchase
**Handoff**: See UX/Conversion in [`handoff-engineer-ux-conversion`](../../../docs/audits/audit-2025-14-12/handoffs/handoff-engineer-ux-conversion.md) from docs/guides/

**Checklist**:
- [ ] U1 - Disable DEV_MODE (1min)
- [ ] U2 - AsyncStorage async load (4-6h)
- [ ] U3 - Fix paywall integration (2-4h)
- [ ] U4 - Add progress indicator (2-4h)
- [ ] U5 - Error recovery + retry (2-3h)
- [ ] U6 - Modal stacking refactor (2-3 days)
- [ ] Validation: Funnel test Android + iOS
- [ ] Sign-off: Conversion metrics >5%

---

### C. Test Coverage (P0) — 3-5 days

**Issue**: ZERO component, screen, integration tests. Coverage 65.7% (statements) but structure incomplete.

| # | Fix | Issue | Impact | Time | Source |
|---|-----|-------|--------|------|--------|
| T1 | Component tests | 0% coverage for 44 components | Modal, carousel, button tests missing | 1-2d | [`audit-test-validation`](../../../docs/audits/audit-2025-14-12/reports/2025-12-14_test-coverage-validation.md) |
| T2 | Screen tests | 0% coverage for 18 screens | Onboarding, TimerScreen, Settings untested | 1-2d | [`audit-test-validation`](../../../docs/audits/audit-2025-14-12/reports/2025-12-14_test-coverage-validation.md) |
| T3 | Integration tests | 0% coverage OB→App, premium flows | End-to-end user journeys | 1d | [`audit-test-validation`](../../../docs/audits/audit-2025-14-12/reports/2025-12-14_test-coverage-validation.md) |

**Execution Order**: Parallel (start after U6 completes) or staggered
**Validation**: `npm test` 100% passing, coverage >80%
**Handoff**: [`handoff-engineer-test-coverage.md`](../../../docs/audits/audit-2025-14-12/handoffs/handoff-engineer-test-coverage.md)

**Checklist**:
- [ ] T1 - Component tests framework + 10 key components (1-2d)
- [ ] T2 - Screen tests for core flows (1-2d)
- [ ] T3 - Integration tests OB→App (1d)
- [ ] npm test passing 100%
- [ ] Coverage >80% (statements)
- [ ] Sign-off: No regressions, all green

---

## 🟡 PHASE 3: Quick Wins (NOT BLOCKING, EASY FIXES)

### 3A. Performance (P0 identified) — 10 minutes

- [ ] Remove unused `react-native-reanimated` (3-5MB bloat) → Bundle optimization
  - Source: [`audit-performance-validation`](../../../docs/audits/audit-2025-14-12/reports/2025-12-14_performance-validation.md)

### 3B. Design System (P0 identified) — 5 minutes

- [ ] Fix `DestructiveButton` (colors.semantic.error undefined)
  - Source: [`audit-design-validation`](../../../docs/audits/audit-2025-14-12/reports/2025-12-14_design-system-validation.md)

### 3C. Premium Integration (P1) — 5 minutes

- [ ] Add `trackPurchaseRestored()` to `conversion-events.js`
  - Source: [`audit-premium-validation`](../../../docs/audits/audit-2025-14-12/reports/2025-12-14_premium-integration-validation.md)

**Checklist**:
- [ ] Remove Reanimated (1min)
- [ ] Fix DestructiveButton (5min)
- [ ] Add analytics method (5min)
- [ ] Validate bundle size reduced
- [ ] npm test passing

---

## 📋 PHASE 4: P1 Deferred (v1.4-v1.5 Roadmap)

Scheduled for v1.4 release cycle (not blocking v1.3):

### 4A. Performance (P1) — 2-4 hours
- [ ] Remove 86 excessive useEffect hooks (optimize)
- [ ] Increase memoization coverage (13.4% → 50%+)
- [ ] Timer: Replace setTimeout 10Hz polling with better mechanism
- Source: [`audit-performance-validation`](../../../docs/audits/audit-2025-14-12/reports/2025-12-14_performance-validation.md)

### 4B. Design System (P1) — 3-4 hours
- [ ] Typography tokens 0% adoption → 80%+ adoption (90 hardcoded fontWeight)
- [ ] Remove hardcoded emojis in MoreActivitiesModal
- [ ] Clean up unused FREEMIUM_CONFIG
- Source: [`audit-design-validation`](../../../docs/audits/audit-2025-14-12/reports/2025-12-14_design-system-validation.md)

### 4C. UX / Conversion (P1) — 5-8 hours
- [ ] Add lock indicators on premium items
- [ ] Fix confusing Filter 060 labels
- [ ] Add back button to onboarding
- [ ] Add premium section in settings
- [ ] Optimize permission request timing (23% dropout)
- Source: [`audit-ux-baseline`](../../../docs/audits/audit-2025-14-12/reports/2025-12-14_ux-conversion-baseline.md) + [`validation`](../../../docs/audits/audit-2025-14-12/reports/2025-12-14_ux-conversion-validation.md)

---

## 🔗 Document References

| Resource | Purpose |
|----------|---------|
| [`INDEX.md`](../../../docs/audits/audit-2025-14-12/INDEX.md) | 10-audit summary, production readiness, quick reference |
| [`CHECKLIST.md`](../../../docs/audits/audit-2025-14-12/CHECKLIST.md) | Exhaustive P0/P1/P2/P3 findings (46+) with links |
| `/reports/` | Individual audit baseline + validation reports |
| `/handoffs/` | Engineer context per domain (a11y, design, perf, etc.) |
| `/docs/reports/` | Architecture, design decisions, legal docs |

---

## 📈 Success Metrics

### Phase 2 (P0 Fixes)
- [ ] Accessibility: WCAG AA 80%+ (from 58%)
- [ ] UX/Conversion: Funnel >5% (from broken)
- [ ] Test Coverage: 80%+ (from 65.7%)
- [ ] `npm test` 100% passing, zero regressions

### Phase 3 (Quick Wins)
- [ ] Bundle size reduced 3-5MB
- [ ] DestructiveButton functional
- [ ] Analytics complete for purchase restoration

### Phase 4 (Deferred)
- [ ] Scheduled for v1.4 planning
- [ ] No blocking issues

---

## 🚀 Execution Notes

**Parallelization** :
- A11y (A1-A4) and UX (U1-U5) can run in parallel (~10-15h critical path)
- U6 (modal stacking) may unlock Test Coverage phase faster
- Test Coverage (T1-T3) best after Phase 2 (reduces rework)

**Sign-offs** :
- A11y: Eric (accessibility specialist) or QA with VoiceOver/TalkBack
- UX: Eric (product) or PM with conversion metrics validation
- Tests: CI/CD must pass 100%

**Rollback Plan** :
- Each phase is isolated; P0 fixes can be reverted if regressions found
- Phase 3 (quick wins) are safe, low-risk changes

---

## 📝 Session Flow

```
Session Start:
1. Read INDEX.md (2min overview)
2. Pick Phase 2 section (A, B, or C)
3. Open relevant audit reports from /reports/
4. Implement + validate
5. Mark checklist items ✅
6. Move to next fix

Session Checkpoint:
- Update current.md with progress
- Link to specific commit(s) per fix
- Note blockers or discoveries
```

---

**Archive Link**: `../../docs/audits/audit-2025-14-12/`
**Cockpit Link**: `../../workflow/done/mission-audits-post-refacto.md` (completion log)
**Previous Audits**: See `/docs/audits/audit-2025-14-12/reports/`

Last Updated: 2025-12-15
Status: Ready for execution
