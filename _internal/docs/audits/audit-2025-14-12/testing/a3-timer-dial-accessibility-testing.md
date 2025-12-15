---
created: '2025-12-15'
updated: '2025-12-15'
status: active
priority: P0-CRITICAL
test_type: accessibility
wcag_target: '2.1 AA'
---

# A3 - Timer Dial Accessibility Testing Guide

## Overview

This document provides comprehensive testing procedures for the timer dial accessibility implementation (Task A3). The timer dial is the **core feature** of ResetPulse and must be fully accessible to screen reader users.

---

## What Was Implemented

### 1. Accessible DigitalTimer Component
- **File**: `src/components/timer/DigitalTimer.jsx`
- **Features**:
  - Dynamic accessibility label with time remaining and status
  - `accessibilityRole="timer"`
  - `accessibilityLiveRegion="polite"` for automatic announcements
  - `accessibilityValue` with min/max/current values

### 2. Accessible TimerDial Component
- **File**: `src/components/timer/TimerDial.jsx`
- **Features**:
  - Accessibility label with duration and activity name
  - Contextual hint (adjustable when stopped, tap to toggle when running)
  - `accessibilityRole="adjustable"` when stopped, `"timer"` when running
  - Custom accessibility actions for increment/decrement (VoiceOver gestures)
  - SVG elements hidden from screen readers (parent handles all announcements)

### 3. Timer State Announcements
- **File**: `src/hooks/useTimer.js`
- **Features**:
  - Announces when timer starts: "{activity} started" or "Timer running"
  - Announces when timer pauses: "Timer paused"
  - Announces when timer completes: "{activity} completed" or "Timer completed!"
  - Uses `AccessibilityInfo.announceForAccessibility()` for explicit announcements

### 4. i18n Support
- **File**: `locales/en.json`
- **New keys** under `accessibility.timer`:
  - `dial`: Timer dial label with minutes and activity
  - `dialAdjustable`: Hint for adjusting duration
  - `dialTapToToggle`: Hint for tap to start/pause
  - `timeRemaining`: Live region announcement format
  - `timerRunning`, `timerPaused`, `timerStopped`: Status labels
  - `timerCompleted`: Completion announcement
  - `activityStarted`, `activityCompleted`: Activity-specific announcements
  - `durationChanged`: Duration change announcement

---

## VoiceOver Testing (iOS)

### Prerequisites
1. **Enable VoiceOver**: Settings → Accessibility → VoiceOver → ON
2. **Optional**: Enable VoiceOver Practice mode to learn gestures
3. **Recommended**: Use 3-finger triple-tap to toggle VoiceOver quickly
4. **Device**: Test on actual iPhone (simulator VoiceOver has limitations)

### VoiceOver Gestures Reference
| Action | Gesture |
|--------|---------|
| Move to next element | Swipe right |
| Move to previous element | Swipe left |
| Activate element | Double-tap |
| Adjust value | Swipe up/down (when on adjustable) |
| Read from top | Two-finger swipe up |
| Read from current position | Two-finger swipe down |

---

## Test Scenarios

### ✅ Test 1: Timer Dial Discovery (Stopped State)

**Steps**:
1. Open ResetPulse
2. Enable VoiceOver (Settings → Accessibility → VoiceOver)
3. Navigate to timer dial (swipe right until focused)

**Expected Announcements**:
- **Label**: "Timer dial, {X} minutes set, {Activity Name}"
  - Example: "Timer dial, 25 minutes set, Work"
- **Role**: "Adjustable" (VoiceOver says "adjustable" after label)
- **Hint**: "Adjustable. Swipe up or down to change duration. Tap to start or pause timer"

**Pass Criteria**:
- ✅ Timer dial announces duration
- ✅ Activity name is announced
- ✅ Dial is identified as "adjustable"
- ✅ Hint explains how to adjust and activate

---

### ✅ Test 2: Adjust Duration via VoiceOver Gestures

**Steps**:
1. Focus on timer dial (stopped state)
2. **Swipe up** with one finger (VoiceOver gesture for "increment")
3. Listen for announcement
4. **Swipe down** with one finger (VoiceOver gesture for "decrement")
5. Listen for announcement

**Expected Behavior**:
- **Swipe up**: Duration increases by 1 minute
  - Announcement: "Timer dial, {X+1} minutes set, {Activity}"
- **Swipe down**: Duration decreases by 1 minute
  - Announcement: "Timer dial, {X-1} minutes set, {Activity}"

**Pass Criteria**:
- ✅ Swipe up increases duration by 1 minute
- ✅ Swipe down decreases duration by 1 minute
- ✅ Each adjustment announces new duration
- ✅ Duration cannot go below 0 minutes

**Note**: This uses VoiceOver's built-in adjustable actions, not manual dragging.

---

### ✅ Test 3: Start Timer via VoiceOver

**Steps**:
1. Focus on timer dial (stopped state)
2. **Double-tap** to activate
3. Listen for announcements

**Expected Announcements** (in sequence):
1. **Immediate**: "{Activity} started" (e.g., "Work started")
   - OR "Timer running" (if no activity selected)
2. **After 1-2 seconds**: "{MM:SS} remaining, timer running"
   - Example: "25:00 remaining, timer running"

**Expected State Change**:
- Role changes from "adjustable" to "timer"
- Hint changes to: "Tap to start or pause timer"

**Pass Criteria**:
- ✅ Timer starts when double-tapped
- ✅ Activity start announcement is heard
- ✅ Live region begins announcing time updates
- ✅ Role changes to "timer"

---

### ✅ Test 4: Live Region Announcements (Timer Running)

**Steps**:
1. Start timer (see Test 3)
2. **Do not touch the screen** — let VoiceOver announce automatically
3. Listen for periodic announcements

**Expected Behavior**:
- VoiceOver announces time remaining every few seconds (controlled by `accessibilityLiveRegion="polite"`)
- Announcements follow pattern: "{MM:SS} remaining, timer running"
- Examples:
  - "24:58 remaining, timer running"
  - "24:45 remaining, timer running"
  - "24:30 remaining, timer running"

**Pass Criteria**:
- ✅ Time remaining is announced automatically
- ✅ Announcements are polite (not interrupting user actions)
- ✅ Format is clear and consistent
- ✅ Updates occur without user interaction

**Note**: Frequency of announcements is controlled by iOS VoiceOver. It will not announce every second (too disruptive), but every 5-15 seconds is normal.

---

### ✅ Test 5: Pause Timer via VoiceOver

**Steps**:
1. Start timer (see Test 3)
2. Let timer run for 10-15 seconds
3. Focus on timer dial
4. **Double-tap** to pause

**Expected Announcements**:
- **Immediate**: "Timer paused"
- **After pause**: "{MM:SS} remaining, timer paused"

**Expected State Change**:
- Role remains "timer"
- Hint: "Tap to start or pause timer"
- Live region stops announcing automatically

**Pass Criteria**:
- ✅ Timer pauses when double-tapped
- ✅ Pause announcement is heard
- ✅ Time remaining is announced with "paused" status
- ✅ No further live announcements while paused

---

### ✅ Test 6: Resume Timer via VoiceOver

**Steps**:
1. Pause timer (see Test 5)
2. Focus on timer dial
3. **Double-tap** to resume

**Expected Announcements**:
- **Immediate**: "{Activity} started" (or "Timer running")
- **After resume**: "{MM:SS} remaining, timer running"

**Pass Criteria**:
- ✅ Timer resumes when double-tapped
- ✅ Resume announcement is heard
- ✅ Live region resumes announcing time updates

---

### ✅ Test 7: Timer Completion Announcement

**Steps**:
1. Set timer to **1 minute** (swipe up/down to adjust)
2. Start timer (double-tap)
3. Wait for timer to complete (1 minute)
4. Listen for completion announcement

**Expected Announcements** (in sequence):
1. **At 00:05**: "00:05 remaining, timer running"
2. **At 00:00**: "{Activity} completed" (e.g., "Work completed")
   - OR "Timer completed!" (if no activity)
3. **Sound**: Completion sound plays (if enabled)
4. **Haptic**: Success haptic feedback

**Pass Criteria**:
- ✅ Completion announcement is clear and immediate
- ✅ Activity name is included in announcement (if applicable)
- ✅ Sound and haptic feedback accompany announcement
- ✅ Timer state resets properly

---

### ✅ Test 8: Digital Timer Accessibility

**Steps**:
1. Start timer
2. Navigate to digital timer display (below dial)
3. Focus on digital timer element

**Expected Announcements**:
- **Label**: "{MM:SS} remaining, timer running"
  - Example: "24:45 remaining, timer running"
- **Role**: "Timer"
- **Live Region**: Announces automatically when time changes

**Pass Criteria**:
- ✅ Digital timer is discoverable via swipe navigation
- ✅ Time is announced in MM:SS format
- ✅ Status (running/paused) is announced
- ✅ Updates announce automatically (polite live region)

---

### ✅ Test 9: SVG Elements Hidden from Screen Reader

**Steps**:
1. Enable VoiceOver
2. Navigate through timer screen with swipe right
3. Observe what elements are announced

**Expected Behavior**:
- **Announced**: Timer dial container, digital timer, activity carousel, palette carousel, settings button
- **NOT announced**: Individual SVG circles, graduation marks, numbers, emoji, progress arc

**Pass Criteria**:
- ✅ Only interactive/meaningful elements are announced
- ✅ Decorative SVG elements are hidden
- ✅ User is not overwhelmed by visual details
- ✅ Navigation is efficient and clear

---

### ✅ Test 10: Activity Selection Impact

**Steps**:
1. Change activity (swipe to activity carousel, select new activity)
2. Return focus to timer dial
3. Listen for updated announcement

**Expected Announcement**:
- Label updates to include new activity: "Timer dial, {X} minutes set, {New Activity}"
  - Example: "Timer dial, 20 minutes set, Meditation"

**Pass Criteria**:
- ✅ Timer dial label updates when activity changes
- ✅ New activity name is announced
- ✅ Duration remains the same (unless activity has default duration)

---

### ✅ Test 11: Multiple Language Support

**Steps**:
1. Change device language to **French** (Settings → General → Language & Region)
2. Restart app
3. Enable VoiceOver
4. Navigate to timer dial
5. Start timer
6. Listen for announcements in French

**Expected Behavior**:
- All accessibility labels are in French
- Example: "Cadran de minuterie, 25 minutes définies, Travail"
- Announcements use French translations

**Pass Criteria**:
- ✅ All announcements are in selected language
- ✅ No English fallback for accessibility labels
- ✅ i18n keys are properly translated

**Test Languages**:
- ✅ English (en)
- ✅ French (fr)
- ✅ Spanish (es)
- ⚠️ German (de) - requires translation keys to be added
- ⚠️ Other languages - require translation keys to be added

---

### ✅ Test 12: Screen Reader + Physical Interaction

**Steps**:
1. Enable VoiceOver
2. **Tap directly** on timer dial (not double-tap)
3. Observe behavior

**Expected Behavior**:
- **First tap**: Focuses the dial, announces label
- **Second tap (double-tap)**: Activates dial (starts/pauses timer)

**Alternative Test**:
1. Enable VoiceOver
2. **Drag** on timer dial to adjust duration
3. Observe announcements

**Expected Behavior**:
- Duration changes as you drag
- VoiceOver announces new duration when drag completes

**Pass Criteria**:
- ✅ Focus behavior is correct
- ✅ Activation requires double-tap (standard VoiceOver)
- ✅ Drag interaction still works with VoiceOver enabled
- ✅ No conflicting gestures

---

## TalkBack Testing (Android)

### Prerequisites
1. **Enable TalkBack**: Settings → Accessibility → TalkBack → ON
2. **Device**: Test on actual Android device (emulator TalkBack has limitations)

### TalkBack Gestures Reference
| Action | Gesture |
|--------|---------|
| Move to next element | Swipe right |
| Move to previous element | Swipe left |
| Activate element | Double-tap |
| Adjust value | Swipe up/down (when on adjustable) |

### Key Tests
- ✅ All VoiceOver tests (1-12) should be repeated on Android with TalkBack
- ✅ Verify announcements are clear and timely
- ✅ Verify adjustable actions work (swipe up/down)
- ✅ Verify live region announcements occur

**Note**: TalkBack behavior may differ slightly from VoiceOver (e.g., announcement frequency, verbosity). Both should provide full timer access.

---

## Automated Testing Recommendations

### Unit Tests (Jest)
Create tests in `__tests__/components/timer/`:

```javascript
// DigitalTimer.test.js
describe('DigitalTimer Accessibility', () => {
  it('should have timer role', () => {
    const { getByRole } = render(<DigitalTimer remaining={300} isRunning={true} />);
    expect(getByRole('timer')).toBeTruthy();
  });

  it('should announce time remaining', () => {
    const { getByLabelText } = render(<DigitalTimer remaining={300} isRunning={true} />);
    expect(getByLabelText(/5:00 remaining/i)).toBeTruthy();
  });

  it('should have live region for updates', () => {
    const { getByA11yLiveRegion } = render(<DigitalTimer remaining={300} isRunning={true} />);
    expect(getByA11yLiveRegion('polite')).toBeTruthy();
  });
});

// TimerDial.test.js
describe('TimerDial Accessibility', () => {
  it('should have adjustable role when stopped', () => {
    const { getByRole } = render(<TimerDial duration={1500} isRunning={false} />);
    expect(getByRole('adjustable')).toBeTruthy();
  });

  it('should have timer role when running', () => {
    const { getByRole } = render(<TimerDial duration={1500} isRunning={true} />);
    expect(getByRole('timer')).toBeTruthy();
  });

  it('should announce duration and activity', () => {
    const activity = { label: 'Work' };
    const { getByLabelText } = render(
      <TimerDial duration={1500} currentActivity={activity} />
    );
    expect(getByLabelText(/25 minutes set, Work/i)).toBeTruthy();
  });
});
```

---

## Known Limitations & SVG Accessibility

### Why SVG Elements Are Hidden

- **Problem**: SVG components (circles, paths, text) are not naturally accessible
- **Solution**: Hide all SVG from screen readers, handle accessibility at parent level
- **Implementation**:
  ```jsx
  <Svg accessible={false} importantForAccessibility="no">
  ```

### What This Means for Users

**Without this implementation**:
- ❌ VoiceOver would announce each SVG element separately
- ❌ "Circle, Circle, Line, Line, Text 5, Text 10, Text 15..."
- ❌ Dozens of meaningless announcements
- ❌ Very poor user experience

**With this implementation**:
- ✅ VoiceOver announces one meaningful label: "Timer dial, 25 minutes set, Work"
- ✅ User can adjust duration with swipe up/down
- ✅ User can start/pause with double-tap
- ✅ Time updates announced automatically
- ✅ Clean, efficient navigation

---

## Success Criteria Summary

All tests must pass for A3 completion:

### Core Functionality (P0)
- ✅ Timer dial is discoverable with VoiceOver
- ✅ Duration is announced clearly
- ✅ Activity name is announced
- ✅ Dial can be adjusted via swipe up/down
- ✅ Timer can be started/paused via double-tap
- ✅ Time remaining announces automatically (live region)
- ✅ Timer completion is announced
- ✅ All announcements use i18n (multi-language)

### Touch Targets (P0)
- ✅ Timer dial touch area ≥44×44pt (280pt minimum, confirmed)
- ✅ No conflicts with VoiceOver gestures

### Screen Reader Efficiency (P1)
- ✅ SVG decorative elements hidden from screen readers
- ✅ Only meaningful elements announced
- ✅ Navigation is efficient (not overwhelming)

### Cross-Platform (P1)
- ✅ Works with VoiceOver (iOS)
- ✅ Works with TalkBack (Android)
- ⚠️ Minor platform differences acceptable (announcement frequency)

---

## Reporting Issues

If any test fails, document:

1. **Test ID**: Which test failed (e.g., "Test 3: Start Timer")
2. **Platform**: iOS/Android, VoiceOver/TalkBack
3. **Expected**: What should have happened
4. **Actual**: What actually happened
5. **Steps to Reproduce**: Exact steps to recreate issue
6. **Device**: Model and OS version

**Example Issue Report**:
```
Test 7: Timer Completion Announcement
Platform: iOS 17.2, VoiceOver
Expected: "Work completed" announcement
Actual: No announcement heard
Steps:
1. Set timer to 1 minute
2. Start timer
3. Wait for completion
Device: iPhone 14 Pro, iOS 17.2
```

---

## Next Steps

After A3 testing passes:

1. **A4 - Color Contrast**: Fix brand primary color
2. **A5 - Reduce Motion**: Implement motion preference detection
3. **A6 - i18n All Labels**: Translate accessibility keys to all 15 languages
4. **Regression Testing**: Re-run all A3 tests after A4-A6 changes

---

## References

- **Audit Report**: `_internal/docs/audits/audit-2025-14-12/reports/2025-12-14_accessibility-baseline.md`
- **Handoff Doc**: `_internal/docs/audits/audit-2025-14-12/handoffs/handoff-engineer-accessibility.md`
- **WCAG 2.1 AA**:
  - 1.3.1 Info and Relationships
  - 2.1.1 Keyboard
  - 4.1.2 Name, Role, Value
  - 4.1.3 Status Messages
- **Apple VoiceOver Guide**: https://support.apple.com/guide/iphone/voiceover
- **React Native Accessibility**: https://reactnative.dev/docs/accessibility

---

**Document Status**: Active
**Last Updated**: 2025-12-15
**Next Review**: After A3 implementation complete
