---
created: '2025-12-15'
updated: '2025-12-15'
status: handoff
mission: 'Phase 2 P0 Blockers - Session 2 (Modal Integration + Integration Tests)'
---

# 🤝 Handoff: Session 2 — Complete Phase 2 P0 Blockers

## 📋 Quick Summary

**What Session 1 Just Completed**:
- ✅ **Phase 4 P1**: Memoization (13.4% → 69.2%) + Timer optimization (10Hz → 60Hz)
- ✅ **Phase 2 Accessibility**: A1 (modals accessible) + A3 (timer dial accessible) DONE
- ✅ **Phase 2 Component Tests**: T1.9-T1.12 (4 remaining test files) DONE

**What This Session (Session 2) Needs To Do**:
- 🔴 **U6**: Modal stacking refactor integration (2-3 days)
- 🔴 **T2**: Screen-level tests (1-2 days)
- 🔴 **T3**: Integration tests (1 day)

**Status After Session 1**:
- Phase 2: 10/14 COMPLETE (71%)
- Remaining: 4/14 (U6, T2, T3, and final validation)

---

## 🎯 Your Role This Session

You are continuing Phase 2 P0 Critical Blockers completion. Three sub-phases remain:

### Phase 2B.2: U6 Modal Stacking Refactor (2-3 days)
- **What's Done**: ModalStackContext created (by agent aefe75f)
- **What Remains**: Integrate into premium flows + test navigation
- **Why Critical**: U5 (error recovery) depends on this; T2 (screen tests) blocked without it

### Phase 2C.2: T2 Screen Tests (1-2 days)
- **What's Done**: T1.0-T1.12 (118 component tests) complete
- **What Remains**: Create 3 screen test files (TimerScreen, Onboarding, Settings)
- **Why Important**: Validates full screen flows

### Phase 2C.3: T3 Integration Tests (1 day)
- **What Remains**: Create 3 integration test files (Onboarding→App, Premium flow, Settings)
- **Why Important**: Validates user journeys end-to-end

---

## 📊 Execution Plan This Session

### Recommended Order:

```
Day 1 (U6):
1. Spawn Agent U6: Integrate ModalStack into premium flows (1-1.5 days)
   - Use ModalStackContext.tsx (already created)
   - Add back button navigation
   - Fix modal deadlock
2. Main: Review U6 work as it completes, unblock issues

Day 1-2 (Parallel T2):
3. Start Agent T2: Create screen test files (1-2 days)
   - TimerScreen.test.js
   - OnboardingController.test.js
   - SettingsScreen.test.js
4. Tests depend on U6 completion for mock setup

Day 2-3 (T3):
5. After T2 completes, spawn Agent T3: Integration tests (1 day)
   - OB→App journey
   - Premium purchase flow
   - Settings management flow

Day 4:
6. Validation: npm test (should show 200+ tests passing)
7. Final sign-off, update current.md
```

---

## 📚 Key Files & Resources

### ModalStack Context (Created Session 1)
**Location**: `src/contexts/ModalStackContext.tsx`
**Purpose**: Manage modal hierarchy, support back navigation
**Usage**:
```javascript
const { push, pop, clear } = useModalStack();
```

### Audit Reports (Context)
- **Accessibility**: `_internal/docs/audits/audit-2025-14-12/reports/2025-12-14_accessibility-validation.md`
- **UX/Conversion**: `_internal/docs/audits/audit-2025-14-12/reports/2025-12-14_ux-conversion-baseline.md`
- **Test Coverage**: `_internal/docs/audits/audit-2025-14-12/reports/2025-12-14_test-coverage-validation.md`

### Handoff Docs
- **Architecture**: `planning/phase-2-session-split.md` (detailed breakdown)
- **Test Templates**: Look at existing tests (T1.0-T1.8) for patterns

---

## ✅ Phase 2 Completion Checklist

### U6 Modal Stacking (This Session)

- [ ] **U6.2** - Integrate ModalStack into PremiumModal flow
  - [ ] ModalStackContext provider wraps app
  - [ ] PremiumModal uses push() to add new modals
  - [ ] Back button uses pop() to navigate
  - [ ] No deadlock (modals can be closed in any order)
  - [ ] Testing: Manual onboarding → premium flow

- [ ] **U6.3** - Test modal flows
  - [ ] E2E test: Premium → Error → Retry (from T2 test)
  - [ ] Manual: iOS + Android back button behavior
  - [ ] Sign-off: Modal navigation smooth, no deadlocks

### T2 Screen Tests

- [ ] Create `TimerScreen.test.js`
  - [ ] Renders with current activity
  - [ ] Timer controls work (play/pause/reset)
  - [ ] Activity selection works
  - [ ] Premium items show lock
  - Estimate: 1h

- [ ] Create `OnboardingController.test.js`
  - [ ] Flows through all screens
  - [ ] Progress indicator updates
  - [ ] Back button on non-first screens
  - [ ] Completion callback triggers
  - Estimate: 1h

- [ ] Create `SettingsScreen.test.js`
  - [ ] Opens and closes
  - [ ] Settings sections render
  - [ ] Premium status displays
  - [ ] Unlock button navigates to purchase
  - Estimate: 1h

- [ ] Results: 3 files, 20-30 new tests
- [ ] Coverage: >80% for screen components

### T3 Integration Tests

- [ ] Create `integration-onboarding-app.test.js`
  - [ ] Full onboarding → TimerScreen flow
  - [ ] Activity selection persists
  - [ ] Timer settings saved

- [ ] Create `integration-premium-flow.test.js`
  - [ ] Onboarding → Premium discovery
  - [ ] Purchase flow error handling
  - [ ] Restore purchases button

- [ ] Create `integration-settings.test.js`
  - [ ] Open settings, modify, save
  - [ ] Changes apply to timer
  - [ ] Permissions handled correctly

- [ ] Results: 3 files, 10-15 journey tests

### Final Validation

- [ ] `npm test` shows 200+ tests passing (all phases)
- [ ] Coverage >80% (statements)
- [ ] Zero regressions in existing tests
- [ ] Phase 2 P0 checklist all green
- [ ] Update current.md: Phase 2: 14/14 COMPLETE ✅

---

## 🔗 How to Start This Session

```bash
# 1. Pull latest from main (includes Phase 4 commit + Session 1 changes)
git pull origin main

# 2. Check status (should show Phase 4 committed, Phase 2A/C done)
cat _internal/cockpit/workflow/active/current.md | grep "Phase 2"

# 3. Verify Session 1 completions
npm test 2>&1 | tail -5  # Should show ~150-160 tests passing

# 4. Spawn Agent U6 for modal stacking
# Agent prompt:
# "Implement U6.2-U6.3: Modal stacking refactor using ModalStackContext.
#  Input: ModalStackContext.tsx (created), PremiumModal.jsx, audit reports.
#  Output: Integrated modal hierarchy with back button, no deadlocks.
#  Validation: E2E test complete, manual testing iOS/Android."

# 5. Main: Monitor + prepare T2/T3 templates
```

---

## 🎯 Success Criteria for Session 2

**Phase 2 Complete When**:
1. ✅ U6 done: Modal stacking integrated, no deadlocks
2. ✅ T2 done: Screen tests all passing
3. ✅ T3 done: Integration tests all passing
4. ✅ `npm test`: 200+ tests, 100% passing
5. ✅ current.md: Phase 2 (14/14) marked COMPLETE
6. ✅ Ready for Phase 3 (quick wins validation)

---

## 📝 What You Don't Need to Do

❌ Don't start Phase 3 (Quick Wins) — only Phase 2 P0
❌ Don't modify accessibility fixes from Session 1 (frozen)
❌ Don't create new features — only complete Phase 2
❌ Don't update version number yet (Eric approves)

---

## 🚀 Expected Outcome

After Session 2 completes:
- Phase 2 P0 COMPLETE (14/14 tasks)
- Phase 3 ready (3 quick wins, should be fast)
- Phase 4 already merged (performance improvements live)
- **v1.3 production-ready** ✅

---

**Created**: 2025-12-15
**For**: Next agent/session to complete Phase 2
**Questions**: Refer to `planning/phase-2-session-split.md` for detailed breakdown
