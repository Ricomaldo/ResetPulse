---
created: '2025-12-15'
updated: '2025-12-15'
status: active
---

# Timer Optimization: Testing Checklist

## Pre-Testing Setup

### Environment Verification

- [ ] Device/simulator running iOS or Android
- [ ] App built with latest code (`npm run ios` or `npm run android`)
- [ ] `DEV_MODE` enabled in `src/config/testMode.js` (for debug logs)
- [ ] Console logs visible (Metro bundler or device console)

### Code Verification

- [ ] `src/hooks/useTimer.js` has been updated with RAF/setTimeout hybrid
- [ ] `rafRef` added (line 54)
- [ ] `isInForegroundRef` added (line 59)
- [ ] `updateTimer` uses hybrid approach (lines 71-79)
- [ ] Effect cleanup handles both RAF and setTimeout (lines 162-193, 204-213)
- [ ] AppState handler switches mechanisms (lines 216-271)

---

## Unit Testing

### Run Existing Tests

**Command**: `npm run test:timer`

**Expected**:
- [ ] All tests pass (no regressions)
- [ ] Initialization tests pass
- [ ] Start/Pause/Reset tests pass
- [ ] Duration management tests pass
- [ ] Progress calculation tests pass
- [ ] Edge case tests pass

**If any fail**: Review test output, ensure mock setup is correct (RAF may need mocking in Jest)

---

## Functional Testing (Manual)

### Test 1: Basic Timer Flow (Foreground)

**Steps**:
1. [ ] Open app
2. [ ] Set timer to 1 minute
3. [ ] Start timer
4. [ ] Observe countdown animation

**Expected**:
- [ ] Animation is smooth (no jerky steps)
- [ ] Countdown updates appear fluid (60 FPS)
- [ ] Timer completes at exactly 0:00
- [ ] Completion feedback plays (sound + haptic)

**Debug logs** (if `__DEV__` enabled):
```
⏱️ [timestamp] Timer démarré : 1min 0s
⏰ [timestamp] Timer de 1min 0s terminé!
```

---

### Test 2: Background Behavior

**Steps**:
1. [ ] Open app
2. [ ] Set timer to 5 minutes
3. [ ] Start timer
4. [ ] Immediately background app (swipe to home screen)
5. [ ] Wait 30 seconds
6. [ ] Return to app

**Expected**:
- [ ] Timer continues counting in background
- [ ] Notification scheduled (check system notification center)
- [ ] On return, timer shows correct remaining time (within 1-2 seconds)
- [ ] Animation resumes smoothly in foreground

**Debug logs**:
```
⏱️ [timestamp] Timer démarré : 5min 0s
(app backgrounded - logs may not appear until foreground)
🔔 Timer terminé. App était en background: true/false
```

---

### Test 3: Foreground → Background → Foreground

**Steps**:
1. [ ] Start timer (2 minutes)
2. [ ] Watch for 10 seconds (foreground - should be smooth)
3. [ ] Background app
4. [ ] Wait 20 seconds
5. [ ] Return to foreground
6. [ ] Watch for 10 seconds (should be smooth again)
7. [ ] Repeat 2-3 times

**Expected**:
- [ ] Smooth animation in foreground (both times)
- [ ] No stutter on state transitions
- [ ] Timer accuracy maintained (±1-2 seconds acceptable due to 1Hz background)
- [ ] No crashes or hangs

**Mechanism verification** (check code execution):
- [ ] RAF running in foreground (check with breakpoint or log)
- [ ] setTimeout running in background (check with breakpoint or log)
- [ ] Transition cancels old mechanism and starts new one

---

### Test 4: Pause/Resume in Different States

**Steps**:
1. [ ] Start timer (3 minutes)
2. [ ] Pause after 10 seconds (foreground)
3. [ ] Resume
4. [ ] Background app
5. [ ] Wait 10 seconds
6. [ ] Return to foreground
7. [ ] Pause again
8. [ ] Resume
9. [ ] Let timer complete

**Expected**:
- [ ] Pause stops timer immediately (no drift)
- [ ] Resume continues from paused time
- [ ] Pause/resume work in both foreground and background
- [ ] Completion triggers correctly after resume
- [ ] No duplicate completions

---

### Test 5: Reset Timer

**Steps**:
1. [ ] Start timer (1 minute)
2. [ ] Let run for 20 seconds
3. [ ] Reset timer
4. [ ] Start new timer (30 seconds)
5. [ ] Background app
6. [ ] Wait 10 seconds
7. [ ] Return to foreground
8. [ ] Reset timer

**Expected**:
- [ ] Reset stops timer immediately
- [ ] Remaining time resets to 0 (not duration)
- [ ] Can set new duration after reset
- [ ] Reset works in foreground
- [ ] Reset works after returning from background
- [ ] No leftover RAF or setTimeout after reset (verify cleanup)

---

### Test 6: Rapid State Changes

**Steps**:
1. [ ] Start timer (1 minute)
2. [ ] Rapidly switch apps (foreground → background → foreground) 5-10 times
3. [ ] Observe timer behavior

**Expected**:
- [ ] No crashes
- [ ] Timer continues (may drift slightly due to transitions)
- [ ] Animation remains smooth in foreground
- [ ] No memory leaks (use Xcode Instruments or Android Profiler)

---

### Test 7: Timer Completion in Background

**Steps**:
1. [ ] Set timer to 30 seconds
2. [ ] Start timer
3. [ ] Immediately background app
4. [ ] Wait 35 seconds (let timer complete in background)
5. [ ] Check notification
6. [ ] Return to app

**Expected**:
- [ ] Notification fires at completion
- [ ] App shows "C'est fini" message
- [ ] Audio does NOT play (notification already played sound)
- [ ] `wasInBackgroundRef.current` is true (check debug log)

**Debug log**:
```
🔔 Timer terminé. App était en background: true
```

---

## Performance Testing

### Test 8: Battery Usage (iOS - Xcode Instruments)

**Steps**:
1. [ ] Connect device to Mac
2. [ ] Open Xcode → Product → Profile → Energy Log
3. [ ] Start 10-minute timer in app
4. [ ] Background app after 10 seconds
5. [ ] Let timer run for 5 minutes in background
6. [ ] Return to foreground
7. [ ] Stop profiling

**Expected**:
- [ ] Foreground: Normal CPU usage (animation rendering expected)
- [ ] Background: Minimal CPU usage (only 1 update/second)
- [ ] Energy impact: Low or Very Low
- [ ] No continuous CPU spikes in background

**Compare with old version** (if available):
- [ ] Background CPU usage reduced by ~80-90%

---

### Test 9: Animation Frame Rate (Foreground)

**Steps**:
1. [ ] Enable "Show FPS" in React Native debug menu (Cmd+D on iOS simulator)
2. [ ] Start timer
3. [ ] Observe FPS counter

**Expected**:
- [ ] FPS: 60 (or close to 60)
- [ ] No frame drops during countdown
- [ ] Consistent frame times

**Before optimization**: FPS may dip due to unnecessary re-renders
**After optimization**: Steady 60 FPS

---

### Test 10: Memory Leaks

**Steps**:
1. [ ] Use Xcode Instruments (Leaks tool) or Android Studio Profiler
2. [ ] Start/stop timer 10-20 times
3. [ ] Background/foreground app 10-20 times
4. [ ] Check for retained objects

**Expected**:
- [ ] No memory leaks detected
- [ ] RAF and setTimeout properly canceled
- [ ] Component unmount cleans up all refs

---

## Edge Cases

### Test 11: Zero Duration

**Steps**:
1. [ ] Set timer to 0 seconds (or reset to 0)
2. [ ] Attempt to start timer

**Expected**:
- [ ] Timer does NOT start (line 213: `if (remaining === 0) return`)
- [ ] No crash
- [ ] User must set duration first

---

### Test 12: Very Short Timer (< 1 second)

**Steps**:
1. [ ] Manually set duration to 1 second (via code or dev mode)
2. [ ] Start timer
3. [ ] Observe completion

**Expected**:
- [ ] Timer completes correctly
- [ ] Completion feedback triggers (sound + haptic)
- [ ] No duplicate completions

**Note**: Background mode won't be tested here (completes too fast)

---

### Test 13: Very Long Timer (> 1 hour)

**Steps**:
1. [ ] Set timer to 90 minutes
2. [ ] Start timer
3. [ ] Background app
4. [ ] Wait 5 minutes
5. [ ] Return to foreground

**Expected**:
- [ ] Timer still running
- [ ] Remaining time accurate (within 1-2 seconds)
- [ ] Animation resumes smoothly
- [ ] Notification scheduled for full duration

---

### Test 14: Low Battery Mode (iOS)

**Steps**:
1. [ ] Enable Low Power Mode in iOS settings
2. [ ] Start timer (5 minutes)
3. [ ] Observe animation

**Expected**:
- [ ] Animation still smooth (iOS may throttle RAF to 30Hz, still better than 10Hz)
- [ ] Timer accuracy maintained
- [ ] No crashes

**Note**: Low Power Mode may affect RAF frequency, but won't break functionality

---

## Regression Testing

### Test 15: All Existing Functionality

**Verify these still work**:
- [ ] Activity carousel (free + premium)
- [ ] Palette carousel (free + premium)
- [ ] Sound selection
- [ ] Analytics tracking (check Mixpanel debug logs)
- [ ] Premium modal on timer start (if free user)
- [ ] Onboarding flow (if new user)
- [ ] i18n (test in different language)
- [ ] Dark mode (if supported)

---

## Automated Testing Recommendations

### New Unit Tests to Add

**File**: `__tests__/hooks/useTimer.test.js`

**Tests to implement**:
1. [ ] `it('uses RAF in foreground')`
2. [ ] `it('uses setTimeout in background')`
3. [ ] `it('switches from RAF to setTimeout on background')`
4. [ ] `it('switches from setTimeout to RAF on foreground')`
5. [ ] `it('cleans up both RAF and setTimeout on unmount')`
6. [ ] `it('maintains timer accuracy across state transitions')`

**Mocking required**:
```javascript
// Mock requestAnimationFrame and cancelAnimationFrame
global.requestAnimationFrame = jest.fn((cb) => setTimeout(cb, 16));
global.cancelAnimationFrame = jest.fn(clearTimeout);

// Mock AppState
import { AppState } from 'react-native';
AppState.currentState = 'active'; // or 'background'
```

---

## Acceptance Criteria

### Must Pass

- [ ] All existing unit tests pass
- [ ] Timer starts/pauses/resets correctly
- [ ] Foreground animation is smooth (subjective but noticeable)
- [ ] Background timer continues running
- [ ] No memory leaks
- [ ] No crashes in any scenario

### Nice to Have

- [ ] Battery usage measurably improved (Instruments)
- [ ] FPS consistently 60 in foreground
- [ ] New unit tests added for RAF/setTimeout switching

### Known Limitations

- [ ] Background timer updates at 1Hz (may drift by ±1 second during long background sessions)
  - **Acceptable**: Timer uses `Date.now() - startTime` so accuracy is maintained
- [ ] Low Power Mode may reduce RAF to 30Hz
  - **Acceptable**: Still 3x better than old 10Hz

---

## Sign-Off

**Tested by**: _________________
**Date**: _________________
**Device/Simulator**: _________________
**iOS/Android Version**: _________________

**Result**:
- [ ] ✅ All tests passed - Ready for production
- [ ] ⚠️ Minor issues found (list below) - Needs review
- [ ] ❌ Critical issues found (list below) - Do not merge

**Issues found**:
```
(list any issues discovered during testing)
```

**Notes**:
```
(any additional observations or recommendations)
```
