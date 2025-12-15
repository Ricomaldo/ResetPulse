---
created: '2025-12-15'
updated: '2025-12-15'
status: active
mission: 'Test Coverage P0 (Parallel to Phase 2A/U)'
next_session: true
parallel_to: 'mission-post-audits-fix-sequence.md (Phase 2C)'
---

# Mission: Test Coverage P0 — ResetPulse

**This mission runs in parallel** with Phase 2A (Accessibility) and Phase 2U (UX/Conversion).

When Phase 2U completes, the main agent will start Phase 2C and discover it's already done! 🎉

---

## 🚀 Quick Start

**You are here** to build component + screen + integration tests. No code changes needed yet — just test infrastructure + key test files.

1. **2 min** → Read sections below
2. **Understand scope** → T1 = framework setup + 10 key components
3. **Follow links** → Audit report explains each gap
4. **Implement & checkbox** → Commit test files
5. **Done** → When agent reaches Phase 2C, tests are ready

**Resources**:
- Audit finding: [`audit-2025-14-12/reports/2025-12-14_test-coverage-validation.md`](../../docs/audits/audit-2025-14-12/reports/2025-12-14_test-coverage-validation.md)
- Handoff: [`audit-2025-14-12/handoffs/handoff-engineer-test-coverage.md`](../../docs/audits/audit-2025-14-12/handoffs/handoff-engineer-test-coverage.md)
- Main mission: [`mission-post-audits-fix-sequence.md`](mission-post-audits-fix-sequence.md) (for context)

---

## 🎯 Objective

Add test infrastructure + 10 key component tests to unblock Phase 2C.

**Current State**:
- ✅ Unit tests: 178 passing (hooks + services)
- ❌ Component tests: 0% (44 components untested)
- ❌ Screen tests: 0% (18 screens untested)
- ❌ Integration tests: 0% (user journeys untested)

**Target State** (Phase 2C):
- ✅ Unit tests: 178 passing + enhanced
- ✅ Component tests: 15+ core tests (T1 deliverable)
- ✅ Screen tests: 5+ core screen tests (T2 deliverable)
- ✅ Integration tests: 3+ user journey tests (T3 deliverable)

**Timeline**: 3-5 days (parallel execution)

---

## 📋 Phase T1: Component Test Framework + 10 Key Components

**Est. Time**: 1-2 days

### Setup (2-3 hours)

- [ ] **T1.1** Create test infrastructure
  - [ ] Jest config for React Native (shallow render + native mocks)
  - [ ] Mock file: `__mocks__/react-native.js` (Button, View, Text, ScrollView)
  - [ ] Mock file: `__mocks__/react-native-purchases.js` (RevenueCat stubs)
  - [ ] Test utils: `__tests__/utils/test-setup.js` (render helper, context providers)
  - [ ] Install dependencies: `@testing-library/react-native`, `@react-native-testing-library/hooks`

**Checklist**:
- [ ] Jest config created
- [ ] Mock files in place
- [ ] Test utils helper created
- [ ] Dependencies installed
- [ ] `npm test` runs without errors

### 10 Key Components (1-2 days)

Choose 10 highest-risk components from 44. Priority:

| Component | Risk | Est. Time | Status |
|-----------|------|-----------|--------|
| **Modals** | Very high (12 modals, accessibility blocker) | 3h | `[ ]` |
| ActivityCarousel | High (freemium UX) | 2h | `[ ]` |
| PaletteCarousel | High (freemium UX) | 2h | `[ ]` |
| TimerDial | Very high (core feature, accessibility) | 3h | `[ ]` |
| PremiumBadge | High (paywall) | 1h | `[ ]` |
| OnboardingStep | High (conversion funnel) | 2h | `[ ]` |
| ActivityButton | Medium | 1h | `[ ]` |
| DurationSelector | Medium | 1h | `[ ]` |
| DiscoveryCard | Medium | 1h | `[ ]` |
| SettingsToggle | Low | 1h | `[ ]` |

**Test file location**: `__tests__/components/[ComponentName].test.js`

**Test coverage for each**:
- Renders without crash
- Props validation (basic types)
- User interactions (press, swipe)
- Accessibility (ARIA labels, semantic structure)
- Conditional rendering (premium vs free)

**Checklist**:
- [ ] T1.1 - Infrastructure setup ✅
- [ ] T1.2 - PremiumModal.test.js
- [ ] T1.3 - DiscoveryModal.test.js
- [ ] T1.4 - ActivityCarousel.test.js
- [ ] T1.5 - PaletteCarousel.test.js
- [ ] T1.6 - TimerDial.test.js
- [ ] T1.7 - OnboardingStep.test.js
- [ ] T1.8 - PremiumBadge.test.js
- [ ] T1.9 - DurationSelector.test.js
- [ ] T1.10 - SettingsToggle.test.js
- [ ] T1.11 - ActivityButton.test.js
- [ ] npm test passing 100%
- [ ] Coverage > 50% (statements)

---

## 📋 Phase T2: Screen Tests (Parallel, 1-2 days)

**Est. Time**: 1-2 days

Focus on 3 high-risk screens:

| Screen | Risk | Tests | Status |
|--------|------|-------|--------|
| **TimerScreen** | Very high (main app) | Render, timer lifecycle, activity switch | `[ ]` |
| **OnboardingController** | Very high (conversion) | Flow through 6 steps, completion | `[ ]` |
| **SettingsScreen** | High (premium toggle) | Premium features visibility | `[ ]` |

**Test file location**: `__tests__/screens/[ScreenName].test.js`

**Checklist**:
- [ ] T2.1 - TimerScreen.test.js (render + timer lifecycle)
- [ ] T2.2 - OnboardingController.test.js (full flow)
- [ ] T2.3 - SettingsScreen.test.js (premium visibility)
- [ ] npm test passing 100%
- [ ] Coverage > 60% (statements)

---

## 📋 Phase T3: Integration Tests (1 day)

**Est. Time**: 1 day

User journeys:

| Journey | Tests | Status |
|---------|-------|--------|
| **OB → App** | Complete onboarding, land on TimerScreen | `[ ]` |
| **Premium Discovery** | Free → Discovery modal → Paywall | `[ ]` |
| **Timer Create & Run** | Select activity → Set duration → Run timer | `[ ]` |

**Test file location**: `__tests__/integration/[Journey].test.js`

**Checklist**:
- [ ] T3.1 - integration-onboarding-to-app.test.js
- [ ] T3.2 - integration-premium-discovery.test.js
- [ ] T3.3 - integration-timer-creation.test.js
- [ ] npm test passing 100%
- [ ] Coverage > 80% (statements)

---

## ✅ Validation & Sign-off

**Before marking complete**:

```bash
npm test                    # All tests passing
npm run test:coverage       # Coverage >80%
git status                  # No uncommitted changes
```

**Success Criteria**:
- ✅ All tests passing (npm test)
- ✅ Coverage ≥ 80% (statements)
- ✅ No regressions on existing tests
- ✅ Components accessible (semantic HTML)

---

## 📌 Notes

- **No code changes** in Phase 2A/U yet — tests are written to pass with current code
- **Tests become validation** once fixes are applied in Phase 2A/U/C
- **Commit strategy**: Commit test files separately from fixes (cleaner history)
- **Running in parallel**: Main agent works on A/U while this agent builds tests
- **Handoff**: When main agent reaches Phase 2C, all tests are ready

---

## 🔗 Related Documents

- **Audit Report** (findings): [`audit-2025-14-12/reports/2025-12-14_test-coverage-validation.md`](../../docs/audits/audit-2025-14-12/reports/2025-12-14_test-coverage-validation.md)
- **Handoff** (implementation guide): [`audit-2025-14-12/handoffs/handoff-engineer-test-coverage.md`](../../docs/audits/audit-2025-14-12/handoffs/handoff-engineer-test-coverage.md)
- **Main Mission** (context): [`mission-post-audits-fix-sequence.md`](mission-post-audits-fix-sequence.md)
- **Testing Guide**: `../../README.md` (Testing section)

---

**Created**: 2025-12-15
**Status**: Ready for parallel execution
**Depends On**: Nothing (runs independently)
