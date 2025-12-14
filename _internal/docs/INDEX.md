---
created: '2025-12-14'
updated: '2025-12-14'
status: active
---

# ResetPulse Documentation Index

> Point d'entree pour agents et developpeurs

## Quick Status (Dec 2025)

| Area | Grade | Key Metric | Doc |
|------|-------|------------|-----|
| **Security** | 🔴 B | P0 blocker (API keys) | [reports/security.md](reports/security.md) |
| **Accessibility** | 🔴 62% | WCAG 2.1 AA non-compliant | [reports/accessibility.md](reports/accessibility.md) |
| **Design System** | 8/10 | 95% token compliance | [reports/design-system.md](reports/design-system.md) |
| **Performance** | B+ | TTI ~1000ms | [reports/performance.md](reports/performance.md) |
| **Code Quality** | ✅ | 135/135 tests | [reports/code-quality.md](reports/code-quality.md) |
| **Test Coverage** | ⚠️ | <40% overall | [reports/test-coverage.md](reports/test-coverage.md) |
| **Architecture** | 85% | ADR compliant | [reports/architecture.md](reports/architecture.md) |
| **Analytics** | A- (85%) | 38 events, 0 P0 | [reports/analytics.md](reports/analytics.md) |
| **UX/Conversion** | 🔴 C+ (68%) | 4 P0, funnel gaps | [reports/ux-conversion.md](reports/ux-conversion.md) |
| **Premium** | B+ (82%) | 2 P0, 95% complete | [reports/premium.md](reports/premium.md) |

---

## Guides (How-To)

| Topic | File | Description |
|-------|------|-------------|
| **🚨 Security (P0)** | [guides/handoff-engineer-security.md](guides/handoff-engineer-security.md) | API keys remediation (URGENT) |
| **Accessibility (P0)** | [guides/handoff-engineer-accessibility.md](guides/handoff-engineer-accessibility.md) | WCAG contrast, motion, timer a11y |
| **UX/Conversion (P0)** | [guides/handoff-engineer-ux-conversion.md](guides/handoff-engineer-ux-conversion.md) | Progress indicator, modal stacking, error recovery |
| **Premium (P0)** | [guides/handoff-engineer-premium.md](guides/handoff-engineer-premium.md) | Validation, debug logging, purchase UX |
| **Design System** | [guides/handoff-engineer-design-system.md](guides/handoff-engineer-design-system.md) | Button component + consolidation |
| **Manual Testing** | [guides/testing/testing-manual-checklist.md](guides/testing/testing-manual-checklist.md) | 40 min pre-release checklist |
| **Refactoring** | [guides/handoff-engineer-refactoring.md](guides/handoff-engineer-refactoring.md) | Large files extraction |
| **Test Coverage** | [guides/handoff-engineer-test-coverage.md](guides/handoff-engineer-test-coverage.md) | Missing hooks tests |
| **Performance** | [guides/handoff-engineer-performance.md](guides/handoff-engineer-performance.md) | RevenueCat cache + TTI |

---

## Decisions (Why)

| ADR | Status | Topic |
|-----|--------|-------|
| [adr-resetpulse-internal-structure.md](decisions/adr-resetpulse-internal-structure.md) | ✅ Active | `_internal/` vs `__project__/` |
| [adr-keep-awake.md](decisions/adr-keep-awake.md) | ✅ Validated | Screen awake during timer |

---

## Reports (State)

| Report | Content |
|--------|---------|
| [security.md](reports/security.md) | 🔴 P0 API keys, OWASP compliance |
| [accessibility.md](reports/accessibility.md) | 🔴 WCAG 2.1 AA (62%), P0 contrast |
| [design-system.md](reports/design-system.md) | Tokens, components, consistency |
| [architecture.md](reports/architecture.md) | Codebase structure, compliance |
| [architecture-source-code.md](reports/architecture-source-code.md) | `/src/` detailed mapping |
| [code-quality.md](reports/code-quality.md) | Tests, linting, coverage |
| [test-coverage.md](reports/test-coverage.md) | Test suite inventory, gaps |
| [performance.md](reports/performance.md) | Startup, memory, bundle |

---

## Legacy Reference

> 12 reference files kept in `legacy/`, 38 unprocessed moved to `legacy/.archives/`

| File | Purpose |
|------|---------|
| [legacy/TRACKER.md](legacy/TRACKER.md) | Reference files inventory |
| [legacy/architecture.legacy.md](legacy/architecture.legacy.md) | Before/after comparison |
| [legacy/code-quality.legacy.md](legacy/code-quality.legacy.md) | M3 → Dec 2025 evolution |
| [legacy/test-coverage.legacy.md](legacy/test-coverage.legacy.md) | Testing patterns extracted |
| [legacy/performance.legacy.md](legacy/performance.legacy.md) | Keep-awake validation |
| [legacy/legal-PRIVACY_POLICY.md](legacy/legal-PRIVACY_POLICY.md) | ⚠️ OUTDATED (needs update) |

---

## Entry Points by Role

### New Agent (First Time)
1. Read this INDEX
2. Check [Quick Status](#quick-status-dec-2025) for current state
3. Read relevant report for your task

### Engineer (Coding)
1. Check [Guides](#guides-how-to) for handoffs
2. Read specific report for context
3. Follow verification checklist in handoff

### Architect (Planning)
1. Review [Decisions](#decisions-why) for rationale
2. Check [Reports](#reports-state) for baselines
3. Reference [Legacy](#legacy-reference) for history

---

## Audit Progress

| Audit | Status | Docs Created |
|-------|--------|--------------|
| #7 Architecture | ✅ Done | architecture.md, adr-internal-structure |
| #1 Code Quality | ✅ Done | code-quality.md |
| #6 Test Coverage | ✅ Done | test-coverage.md, manual-checklist |
| #2 Performance | ✅ Done | performance.md, adr-keep-awake |
| #3 Security | ✅ Done | security.md, handoff-security (P0) |
| #8 Design System | ✅ Done | design-system.md, handoff-design-system |
| #4 Accessibility | ✅ Done | accessibility.md, handoff-accessibility (P0) |
| #9 Analytics | ✅ Done | analytics.md (no handoff - 0 P0) |
| #5 UX/Conversion | ✅ Done | ux-conversion.md, handoff-ux-conversion (P0) |
| #10 Premium | ✅ Done | premium.md, handoff-premium (P0) |

---

**Last Updated**: 2025-12-14
