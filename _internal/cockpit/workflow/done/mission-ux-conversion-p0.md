---
created: '2025-12-15'
updated: '2025-12-15'
status: active
mission: 'UX / Conversion P0 (Parallel to Phase 2A)'
next_session: true
parallel_to: 'mission-post-audits-fix-sequence.md (Phase 2U)'
blocking: 'Phase 2T (test) waits on U6 completion'
---

# Mission: UX / Conversion P0 — ResetPulse

**This mission runs in parallel** with Phase 2A (Accessibility) and Phase 2T (Test Coverage).

**Execution Order**: U1 → U2 → U3 → U4 → U5 → U6 (modal stacking is the 2-3 day blocker)

---

## 🚀 Quick Start

**You are here** to fix 6 P0 blockers preventing conversion. No users can purchase right now.

1. **2 min** → Read sections below
2. **Understand scope** → 6 fixes, U6 is the blocker (2-3 days)
3. **Follow links** → Audit reports explain each issue
4. **Implement & checkbox** → Fix, test, commit
5. **Done** → Main agent discovers Phase B complete

**Resources**:
- Audit findings: [`audit-2025-14-12/reports/2025-12-14_ux-conversion-validation.md`](../../docs/audits/audit-2025-14-12/reports/2025-12-14_ux-conversion-validation.md) + [`audit-2025-14-12/reports/2025-12-14_ux-conversion-baseline.md`](../../docs/audits/audit-2025-14-12/reports/2025-12-14_ux-conversion-baseline.md)
- Handoff: [`audit-2025-14-12/handoffs/handoff-engineer-ux-conversion.md`](../../docs/audits/audit-2025-14-12/handoffs/handoff-engineer-ux-conversion.md)
- Main mission: [`mission-post-audits-fix-sequence.md`](mission-post-audits-fix-sequence.md) (for context)

---

## 🎯 Objective

Fix 6 UX/Conversion P0 blockers to unblock payment flow.

**Current State**:
- ❌ DEV_MODE visible in production (user confusion)
- ❌ AsyncStorage blocks app launch 500-1000ms (poor UX)
- ❌ Paywall broken (Filter 090, no RevenueCat integration)
- ❌ No progress indicator (30-40% onboarding abandonment)
- ❌ No error recovery (users can't retry after failure)
- ❌ Modal stacking deadlock (2-3 levels deep, no navigation)

**Impact**: 0% onboarding conversion currently → 15-25% target after fixes

**Timeline**: ~18-22 hours (excluding U6 which is 2-3 days)

---

## 📋 U1: DEV_MODE Disabled (1 minute)

**Issue**: Dev controls visible in production. Users see internal toggles.

**File**: `src/config/testMode.js`

**What to do**:
```javascript
// Current
export const DEV_MODE = true;

// Should be
export const DEV_MODE = false;
```

**Validation**:
- App launches normally
- No DevFab visible (corner toggle gone)
- Settings page shows normal UI

**Checklist**:
- [ ] U1 - DEV_MODE = false in testMode.js
- [ ] App launches, no DevFab visible
- [ ] npm test passing

---

## 📋 U2: AsyncStorage Async (4-6 hours)

**Issue**: AsyncStorage blocks app launch 500-1000ms. Causes blank screen on Android.

**Root Cause**: Synchronous initialization in `App.js` waits for AsyncStorage without error boundaries.

**Files to update**:
- `App.js` → Move AsyncStorage init to useEffect with loading state
- `src/contexts/PurchaseContext.js` → Remove blocking init, use lazy load
- `src/contexts/TimerPaletteContext.js` → Same pattern

**What to do**:
1. Add `isInitialized` state in App.js
2. Move AsyncStorage calls to useEffect
3. Show splash screen while loading (200ms max)
4. Error boundary for timeout fallback (5s max)

**Validation**:
- App launches < 500ms (use React DevTools Profiler)
- No blank screen on Android
- All contexts properly initialized after useEffect

**Checklist**:
- [ ] U2.1 - App.js: Move AsyncStorage to useEffect
- [ ] U2.2 - Add isInitialized state + loading UI
- [ ] U2.3 - PurchaseContext lazy init
- [ ] U2.4 - TimerPaletteContext lazy init
- [ ] U2.5 - Profile launch time (< 500ms)
- [ ] U2.6 - Test on Android emulator
- [ ] npm test passing

---

## 📋 U3: Paywall Integration (2-4 hours)

**Issue**: Filter 090 broken, NO RevenueCat integration.

**Root Cause**: Paywall modal logic incomplete. RevenueCat not called on premium action.

**Files to update**:
- `src/components/modals/PremiumModal.js` → Integrate RevenueCat purchase call
- `src/contexts/PurchaseContext.js` → Add purchase handler
- `src/services/analytics.js` → Track purchase events

**What to do**:
1. In PremiumModal, import `usePremiumStatus` hook
2. Add purchase button handler calling RevenueCat
3. Handle success/error states
4. Track analytics event (purchase_initiated, purchase_completed, purchase_failed)
5. Close modal on success

**Validation**:
- Premium modal opens without error
- Purchase button triggers RevenueCat SDK
- Success callback updates PurchaseContext
- Failures show error message + retry button (U5)

**Checklist**:
- [ ] U3.1 - PremiumModal: Add RevenueCat integration
- [ ] U3.2 - PurchaseContext: Add purchase handler
- [ ] U3.3 - Analytics: Track purchase events
- [ ] U3.4 - Error handling: Show errors, don't crash
- [ ] U3.5 - Test on iOS + Android
- [ ] npm test passing

---

## 📋 U4: Progress Indicator (2-4 hours)

**Issue**: Onboarding abandonment 30-40% (vs 5-10% industry). No progress feedback.

**Files to update**:
- `src/components/onboarding/OnboardingController.js` → Add progress bar
- `src/screens/OnboardingScreen.js` → Display step N of 6

**What to do**:
1. Add progress bar at top: "Step 3 of 6"
2. Show visual bar (current % filled)
3. Add "Back" button on steps 2+ (return to previous step)
4. Smooth animation between steps

**Validation**:
- Progress bar visible on all 6 steps
- Updates smoothly
- Back button works
- Feels less overwhelming

**Checklist**:
- [ ] U4.1 - Add ProgressBar component
- [ ] U4.2 - Integrate into OnboardingController
- [ ] U4.3 - Add back navigation
- [ ] U4.4 - Animation smooth
- [ ] U4.5 - Test all 6 steps
- [ ] npm test passing

---

## 📋 U5: Purchase Error Recovery (2-3 hours)

**Issue**: No retry button after purchase failure. Lost revenue.

**Files to update**:
- `src/components/modals/PremiumModal.js` → Add error state + retry
- `src/contexts/PurchaseContext.js` → Add retry handler

**What to do**:
1. Add error state to PremiumModal
2. On purchase failure, show error message + "Retry" button
3. "Retry" calls purchase flow again
4. After 3 failed attempts, show "Contact support" link

**Validation**:
- Simulate network error → error shown
- Click "Retry" → purchase retries
- After 3 fails → support link appears

**Checklist**:
- [ ] U5.1 - PremiumModal: Add error state
- [ ] U5.2 - Show error message + retry button
- [ ] U5.3 - Implement retry logic (max 3x)
- [ ] U5.4 - Add support link after failures
- [ ] U5.5 - Test error scenarios
- [ ] npm test passing

---

## 📋 U6: Modal Stacking (2-3 days) ⚠️ BLOCKING

**Issue**: 2-3 levels deep modals, no back navigation. Users stuck.

**Example flow**: OnboardingController → MoreActivitiesModal → PremiumModal → (stuck, can't go back)

**Files to update**:
- `src/components/modals/ModalStack.js` (NEW) → Central modal state manager
- All modals → Use ModalStack context instead of local state
- Navigation: Add back button to exit modal chain

**What to do**:

### Phase U6.1: Create ModalStack Context (4-6h)
```javascript
// src/contexts/ModalStackContext.js
- Stack of modals (FIFO queue)
- push(modalComponent, props)
- pop() → back button
- clear() → close all

// Usage in component:
const { push, pop } = useModalStack();
<Button onPress={() => push(PremiumModal, { activity: 'work' })} />
<BackButton onPress={() => pop()} />
```

### Phase U6.2: Integrate into all modals (6-8h)
- PremiumModal
- DiscoveryModal
- MoreActivitiesModal
- MoreColorsModal
- (any others)

### Phase U6.3: Test modal chains (2-3h)
- Chain A: OnboardingController → MoreActivitiesModal → PremiumModal → back to Onboarding
- Chain B: TimerScreen → DiscoveryModal → PremiumModal → back to Timer
- Chain C: Settings → MoreColorsModal → PremiumModal → back to Settings

**Validation**:
- No "deadlock" scenarios
- Back button works from any modal depth
- Modal transitions smooth
- No orphaned modals (memory leaks)

**Checklist**:
- [ ] U6.1 - ModalStack context created
- [ ] U6.2 - PremiumModal integrated
- [ ] U6.3 - DiscoveryModal integrated
- [ ] U6.4 - MoreActivitiesModal integrated
- [ ] U6.5 - MoreColorsModal integrated
- [ ] U6.6 - Test modal chains (all 3)
- [ ] U6.7 - Memory leak check (React DevTools Profiler)
- [ ] npm test passing 100%

**Impact**: Unblocks Phase 2T (tests can now validate U6 flows)

---

## ✅ Validation & Sign-off

**Before marking complete**:

```bash
npm test                    # All tests passing
npm run ios                 # iOS app runs smoothly
npm run android             # Android app runs < 500ms startup
# Manual testing:
# - Complete onboarding → see progress bar
# - Trigger premium → RevenueCat called
# - Fail purchase → see retry button
# - Open modals in chain → back button works
```

**Success Criteria**:
- ✅ All 6 fixes implemented
- ✅ No regressions (npm test 100%)
- ✅ U1 → U5 done before U6 (or parallel if confident)
- ✅ U6 completes → Phase 2T unblocked

---

## 📌 Execution Notes

- **U1**: 1 minute (turn off DEV_MODE)
- **U2**: 4-6 hours (async loading)
- **U3**: 2-4 hours (RevenueCat integration)
- **U4**: 2-4 hours (progress bar)
- **U5**: 2-3 hours (error recovery)
- **U6**: 2-3 days (modal stacking, the big one)

**Total**: ~18-22 hours + U6's 2-3 days

**Parallelization**: U1-U5 can be done sequentially. U6 is standalone and takes the longest.

---

## 🔗 Related Documents

- **Audit Report** (UX validation): [`audit-2025-14-12/reports/2025-12-14_ux-conversion-validation.md`](../../docs/audits/audit-2025-14-12/reports/2025-12-14_ux-conversion-validation.md)
- **Audit Report** (UX baseline): [`audit-2025-14-12/reports/2025-12-14_ux-conversion-baseline.md`](../../docs/audits/audit-2025-14-12/reports/2025-12-14_ux-conversion-baseline.md)
- **Handoff** (implementation guide): [`audit-2025-14-12/handoffs/handoff-engineer-ux-conversion.md`](../../docs/audits/audit-2025-14-12/handoffs/handoff-engineer-ux-conversion.md)
- **Main Mission** (context): [`mission-post-audits-fix-sequence.md`](mission-post-audits-fix-sequence.md)

---

**Created**: 2025-12-15
**Status**: Ready for parallel execution
**Depends On**: Nothing (runs independently)
