---
created: '2025-12-16'
updated: '2025-12-16'
status: active
title: Magnetic Snap Granularity Audit
author: Claude
---

# Magnetic Snap Granularity Audit

## Executive Summary

**Finding**: The magnetic snap implementation is **not properly adapted to dial scale visual layout**. Snap points are misaligned with graduation marks in 4 of 6 scales (1min, 5min, 10min, 25min). This creates cognitive friction during interaction: the dial "sticks" to positions without visible marks.

**Severity**: Medium - UX friction, not broken functionality

**Recommendation**: Realign snap increments to match visual hierarchy or reconsider snap during drag

---

## Understanding the System

### How Graduation Marks Work

Graduation marks are rendered from `useDialOrientation.js:174-198`:
```javascript
const totalMarks = config.totalMarks; // = maxMinutes
for (let i = 0; i < totalMarks; i++) {
  const isMajor = i % config.majorTickInterval === 0;
  // Render mark every 1 minute
}
```

**Key insight**: Every graduation mark = 1 minute interval. Major vs minor determined by majorTickInterval.

### How Magnetic Snap Works

From `timerConstants.js` and `TimeTimer.jsx:119-127`:
```javascript
const magneticSnapMinutes = (dialMode.magneticSnapSeconds || 10) / 60;
minutes = Math.round(minutes / magneticSnapMinutes) * magneticSnapMinutes;
```

Snap is applied in two contexts:
1. **Graduation taps** (TimeTimer.jsx): User taps, value rounded to nearest snap
2. **Continuous drag** (TimerDial.jsx→TimeTimer.jsx): Every movement calls handleGraduationTap, which applies snap

---

## Scale-by-Scale Analysis

### 1min Scale (60s max)
- **Graduations**: Every 1 minute = 1 total mark
- **Major marks**: At 1 minute (majorTickInterval: 1)
- **Magnetic snap**: Every 5 seconds
- **Positions per minute**: 60s ÷ 5s = **12 snap positions**
- **Alignment**: ❌ **MISALIGNED** - No graduation marks at 0:05, 0:10, 0:15, etc.
- **Visual density**: Very high - many snap points but only 1 visual reference point
- **Problem**: User taps position 0:10 (visible gap), snaps to 0:10, but no mark to guide
- **User experience**: Confusing - snap feels arbitrary with no visual feedback

---

### 5min Scale (300s max)
- **Graduations**: Every 1 minute = 5 total marks
- **Major marks**: At 1, 2, 3, 4, 5 minutes (majorTickInterval: 1, all marks are major)
- **Magnetic snap**: Every 10 seconds
- **Positions per minute**: 60s ÷ 10s = **6 snap positions per minute**
- **Alignment**: ❌ **MISALIGNED** - Snap at 0:10, 0:20, 0:30, 0:40, 0:50 are BETWEEN marks
  - Snap points: 10s, 20s, 30s, 40s, 50s (between 0min and 1min mark)
  - Only every 6th snap (1:00, 2:00, 3:00) aligns
- **Visual density**: High - 6 snap positions but only 5 major marks across 5 minutes
- **Problem**: Most snaps don't align with visual marks
- **User experience**: "Why does it snap here? I don't see a mark!"

---

### 10min Scale (600s max)
- **Graduations**: Every 1 minute = 10 total marks
- **Major marks**: At 2, 4, 6, 8, 10 minutes (majorTickInterval: 2)
- **Magnetic snap**: Every 15 seconds
- **Positions per minute**: 60s ÷ 15s = **4 snap positions per minute**
- **Alignment**: ❌ **PARTIALLY MISALIGNED**
  - Snap at: 15s, 30s, 45s, 1:00m, 1:15, 1:30, 1:45, 2:00, ...
  - Only every 4th snap (1:00, 2:00, 3:00, etc.) aligns with minor marks
  - Every 8th snap (2:00, 4:00, 6:00, etc.) aligns with major marks
- **Visual density**: Medium - 4 snap per minute vs 2 mark types (major every 2min, minor every 1min)
- **Problem**: Most snaps align with minor marks, some miss entirely
- **User experience**: Better than 5min, but still inconsistent

---

### 25min Scale (1500s max)
- **Graduations**: Every 1 minute = 25 total marks
- **Major marks**: At 5, 10, 15, 20, 25 minutes (majorTickInterval: 5)
- **Magnetic snap**: Every 30 seconds
- **Positions per minute**: 60s ÷ 30s = **2 snap positions per minute**
- **Alignment**: ❌ **MISALIGNED**
  - Snap at: 30s, 1:00m, 1:30, 2:00m, 2:30, 3:00m, ...
  - Only every other snap (1:00, 2:00, 3:00, ...) aligns with minute marks
  - Every 5th snap (5:00, 10:00, 15:00) aligns with major marks
- **Visual density**: Medium-low - 2 snap per minute vs sparse major marks (every 5min)
- **Problem**: 50% of snaps are between marks, confusing visual feedback
- **User experience**: Arbitrary snap behavior

---

### 45min Scale (2700s max)
- **Graduations**: Every 1 minute = 45 total marks
- **Major marks**: At 5, 10, 15, 20, 25, 30, 35, 40, 45 minutes (majorTickInterval: 5)
- **Magnetic snap**: Every 60 seconds = **1 minute exactly**
- **Alignment**: ✅ **PERFECTLY ALIGNED** - Snap at every minute mark
- **Visual density**: Low - 1 snap per minute, major mark every 5 minutes
- **User experience**: Snap feels natural, aligns with visible marks

---

### 60min Scale (3600s max)
- **Graduations**: Every 1 minute = 60 total marks
- **Major marks**: At 5, 10, 15, ..., 60 minutes (majorTickInterval: 5)
- **Magnetic snap**: Every 60 seconds = **1 minute exactly**
- **Alignment**: ✅ **PERFECTLY ALIGNED** - Snap at every minute mark
- **Visual density**: Low - 1 snap per minute, major mark every 5 minutes
- **User experience**: Snap feels natural, aligns with visible marks

---

## Summary Table

| Scale | Max | Snap (s) | Per-Min | Marks | Major | Alignment | Status |
|-------|-----|----------|---------|-------|-------|-----------|--------|
| **1min** | 60s | 5 | 12 | 1 | 1 | ❌ | Misaligned |
| **5min** | 300s | 10 | 6 | 5 | 5 | ❌ | Misaligned |
| **10min** | 600s | 15 | 4 | 10 | 5 | ❌ | Partial |
| **25min** | 1500s | 30 | 2 | 25 | 5 | ❌ | Misaligned |
| **45min** | 2700s | 60 | 1 | 45 | 9 | ✅ | Perfect |
| **60min** | 3600s | 60 | 1 | 60 | 12 | ✅ | Perfect |

---

## Root Cause Analysis

The magnetic snap was designed to provide **tap precision** (handleGraduationTap in TimeTimer.jsx), but:

1. **Tap snap values** were chosen arbitrarily per scale without considering visual layout
2. **Snap values don't reference majorTickInterval** - they're independent of visual hierarchy
3. **Snap is applied during continuous drag** (via onPanResponderMove) where it creates stickiness

### Why This Matters

During user interaction:
1. User drags or taps dial
2. Position rounds to nearest snap increment
3. If snap doesn't align with marks, user sees "jittery" or "sticky" behavior at wrong positions
4. Cognitive friction: "Why did it snap there? I don't see a mark!"

This is especially pronounced on 5min scale where **50-67% of snap positions have no visual mark**.

---

## Impact Assessment

### Affected Scales (UX Issues)
- **5min**: 5 out of 6 snap positions per minute miss all marks
- **10min**: Mixed - 75% hit marks, 25% miss
- **25min**: 50% of snaps miss marks
- **1min**: All snaps miss the single mark

### Severity by Usage
- **5min**: HIGH - Pomodoro break timer (common use case), most snap misalignment
- **25min**: MEDIUM - Primary Pomodoro timer, 50% misalignment
- **10min**: MEDIUM - Medium work timer, mixed misalignment
- **1min**: MEDIUM - Quick timer, but only 1 reference point anyway
- **45min/60min**: LOW - Uncommon, perfectly aligned anyway

---

## Recommended Solutions

### Option 1: Align Snap to Minute Marks (Safest)
Change all scales to snap every 1 minute (matching graduation interval):
```javascript
magneticSnapSeconds: 60  // All scales
```
**Pros**: Perfect alignment, predictable, simple
**Cons**: 1min/5min scales feel coarse, less granular control

---

### Option 2: Align Snap to Major Marks (Smart)
Sync snap to majorTickInterval per scale:
```javascript
'1min':  { magneticSnapSeconds: 60, majorTickInterval: 1 }  // Snap 1:00
'5min':  { magneticSnapSeconds: 60, majorTickInterval: 1 }  // Snap 1:00
'10min': { magneticSnapSeconds: 120, majorTickInterval: 2 } // Snap 2:00
'25min': { magneticSnapSeconds: 300, majorTickInterval: 5 } // Snap 5:00
'45min': { magneticSnapSeconds: 300, majorTickInterval: 5 } // Snap 5:00 (same as 25min)
'60min': { magneticSnapSeconds: 300, majorTickInterval: 5 } // Snap 5:00 (same as 25min)
```
**Pros**: Snaps align with prominent marks, feels intentional
**Cons**: Coarser than current (less granular), requires calculation logic

---

### Option 3: Remove Snap During Drag (Alternative)
Keep snap only for **tap on graduation** (precise rounding), remove from continuous drag:
- Modify TimerDial.jsx to NOT call handleGraduationTap during drag, or
- Add flag to skip snap during drag in handleGraduationTap
**Pros**: Smooth continuous drag without stickiness, tap remains precise
**Cons**: Tap and drag feel different

---

### Option 4: Add Visual Indicators (UX Enhancement)
Render subtle visual feedback at snap points (faint dots or rings):
- Requires DialProgress or DialBase modification
- Makes snap points visible so misalignment becomes expected
**Pros**: Explains why snap occurs at seemingly random points
**Cons**: Visual clutter, doesn't solve the core issue

---

## Recommendation

**Recommended: Option 2 (Align Snap to Major Marks)**

Rationale:
- Snap aligns with strongest visual hierarchy (major marks)
- User can predict where snap will occur
- Provides good balance between precision and usability
- Matches what 45min/60min already do (1min snap = aligns with major)

Implementation:
1. Update magneticSnapSeconds in timerConstants.js
2. Minor adjustment in handleGraduationTap logic if needed
3. Test all scales for tap and drag feel

---

## Testing Checklist

After any change:
- [ ] 1min scale: Tap and drag feel responsive, snap predictable
- [ ] 5min scale: Snap aligns with minute marks consistently
- [ ] 10min scale: Snap aligns with major marks (every 2min)
- [ ] 25min scale: Snap aligns with major marks (every 5min)
- [ ] 45min scale: Still feels natural (currently perfect)
- [ ] 60min scale: Still feels natural (currently perfect)
- [ ] Drag at high velocity: No unexpected snaps
- [ ] Tap on marks: Rounds to intended position
- [ ] User feedback: Snap feels intentional, not arbitrary

---

## Files to Update

If implementing fix:
- `src/components/timer/timerConstants.js` - Adjust magneticSnapSeconds
- Possibly `src/components/layout/TimeTimer.jsx` - If snap calculation logic changes
- Tests: `__tests__/` - Verify snap behavior per scale

---

## Audit Complete

**Status**: Ready for implementation decision
**Next Step**: User approval on recommended solution (Option 2)
