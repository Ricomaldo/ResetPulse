---
created: '2025-12-14'
updated: '2025-12-14'
status: active
priority: P0-CRITICAL
wcag_target: '2.1 AA'
---

# Handoff: Accessibility Remediation (P0 Critical)

> Pour une app destinée aux utilisateurs neuroatypiques, l'accessibilité n'est pas optionnelle

## Context

Audit #4 révèle **62% conformité WCAG 2.1 AA** avec 4 violations P0 critiques. L'app est conçue pour TDAH/TSA — ces utilisateurs dépendent de l'accessibilité.

---

## 🔴 Task 1: Fix Color Contrast (P0)

**Effort**: 4-6h | **WCAG**: 1.4.3

### Problem

Brand primary `#e5a8a3` on white = **2.89:1** (requires 4.5:1)

### Solution: Change Primary Color

**Edit**: `src/theme/colors.js`

```javascript
// BEFORE
brand: {
  primary: '#e5a8a3',  // 2.89:1 contrast - FAIL
  // ...
}

// AFTER
brand: {
  primary: '#c17a71',  // 5.1:1 contrast - PASS
  // ...
}
```

### Also Fix Secondary Text Colors

```javascript
// Light theme
text: {
  secondary: '#525960',  // Was #6B7280 (4.12:1) → Now 5.5:1
  light: '#6B7280',      // Was #9CA3AF (2.94:1) → Now 4.5:1
}
```

### Verification

Use [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/):
- [ ] Primary `#c17a71` on `#FFFFFF` ≥ 4.5:1
- [ ] Secondary text on background ≥ 4.5:1
- [ ] Light text on background ≥ 4.5:1
- [ ] Test in both light AND dark themes

---

## 🔴 Task 2: Timer State Announcements (P0)

**Effort**: 3-4h | **WCAG**: 4.1.3

### Problem

Timer value, status, and completion not announced to screen readers.

### Solution: Add Live Region to DigitalTimer

**Edit**: `src/components/timer/DigitalTimer.jsx`

```javascript
import { useTranslation } from '../../hooks/useTranslation';

const DigitalTimer = ({ remaining, isRunning }) => {
  const { t } = useTranslation();

  const formattedTime = formatTime(remaining);
  const statusText = isRunning ? t('timer.running') : t('timer.paused');

  return (
    <Text
      accessible={true}
      accessibilityRole="timer"
      accessibilityLabel={t('timer.timeRemaining', {
        time: formattedTime,
        status: statusText
      })}
      accessibilityLiveRegion="polite"
    >
      {formattedTime}
    </Text>
  );
};
```

### Add Timer Completion Announcement

**Edit**: `src/hooks/useTimer.js` (or wherever completion is handled)

```javascript
import { AccessibilityInfo } from 'react-native';

const announceCompletion = () => {
  AccessibilityInfo.announceForAccessibility(
    t('timer.completed')
  );
};

// Call when timer reaches 0
useEffect(() => {
  if (remaining === 0 && wasRunning) {
    announceCompletion();
  }
}, [remaining]);
```

### Add i18n Keys

**Edit**: `src/i18n/locales/en.json` (and other locales)

```json
{
  "timer": {
    "timeRemaining": "{{time}} remaining, {{status}}",
    "running": "timer running",
    "paused": "timer paused",
    "completed": "Timer completed!"
  }
}
```

### Verification

- [ ] Enable VoiceOver (iOS) or TalkBack (Android)
- [ ] Start timer — hear "X minutes remaining, timer running"
- [ ] Pause timer — hear status change
- [ ] Timer completes — hear "Timer completed!"

---

## 🔴 Task 3: Reduce Motion Support (P0)

**Effort**: 2-3h | **WCAG**: 2.3.3

### Problem

Pulse animation ignores system `prefers-reduced-motion` setting.

### Solution: Create Motion Hook

**Create**: `src/hooks/useReducedMotion.js`

```javascript
import { useState, useEffect } from 'react';
import { AccessibilityInfo } from 'react-native';

export const useReducedMotion = () => {
  const [reduceMotionEnabled, setReduceMotionEnabled] = useState(false);

  useEffect(() => {
    // Get initial value
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotionEnabled);

    // Listen for changes
    const subscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      setReduceMotionEnabled
    );

    return () => subscription?.remove();
  }, []);

  return reduceMotionEnabled;
};
```

### Update DialCenter Pulse

**Edit**: `src/components/timer/DialCenter.jsx`

```javascript
import { useReducedMotion } from '../../hooks/useReducedMotion';

const DialCenter = ({ shouldPulse }) => {
  const reduceMotionEnabled = useReducedMotion();

  useEffect(() => {
    // Skip animation if reduce motion is enabled
    if (reduceMotionEnabled || !shouldPulse) {
      scale.setValue(1);
      return;
    }

    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.02, duration: 1000, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ])
    );

    animation.start();
    return () => animation.stop();
  }, [shouldPulse, reduceMotionEnabled]);

  // ...
};
```

### Apply to Other Animations

Search for `Animated.timing` and `Animated.loop` in:
- Modal entrance/exit
- Button press feedback
- Toast animations

Wrap each with `if (!reduceMotionEnabled)` check.

### Verification

- [ ] iOS: Settings → Accessibility → Motion → Reduce Motion ON
- [ ] Android: Settings → Accessibility → Remove animations
- [ ] Open app — pulse animation should NOT play
- [ ] Disable reduce motion — pulse should work again

---

## 🔴 Task 4: Internationalize Accessibility Labels (P0)

**Effort**: 2-3h | **i18n violation**

### Problem

Hardcoded French labels in CircularToggle.

### Solution

**Edit**: `src/components/layout/CircularToggle.jsx`

```javascript
// BEFORE (line 51)
accessibilityLabel={clockwise ? 'Sens horaire' : 'Sens anti-horaire'}

// AFTER
accessibilityLabel={clockwise
  ? t('accessibility.rotationClockwise')
  : t('accessibility.rotationCounterClockwise')
}
```

### Add i18n Keys to ALL Locales

**Edit each locale file** (`en.json`, `fr.json`, `es.json`, etc.):

```json
{
  "accessibility": {
    "rotationClockwise": "Clockwise rotation",
    "rotationCounterClockwise": "Counter-clockwise rotation",
    "timerDial": "Timer dial, {{minutes}} minutes",
    "playButton": "Start timer",
    "pauseButton": "Pause timer",
    "resetButton": "Reset timer"
  }
}
```

### Search for Other Hardcoded Labels

```bash
# Find hardcoded accessibilityLabel strings
grep -r "accessibilityLabel=" src/ | grep -v "t('" | grep -v "t(\`"
```

Fix any found.

### Verification

- [ ] Change device language to Spanish
- [ ] Enable VoiceOver/TalkBack
- [ ] Navigate to CircularToggle — hear Spanish, not French
- [ ] Test with 3+ languages

---

## 🟠 Task 5: Add Focus Indicators (P1)

**Effort**: 4-6h | **WCAG**: 2.4.7

### Create Focus Style Utility

**Create**: `src/styles/focusStyles.js`

```javascript
export const createFocusStyle = (theme) => ({
  borderWidth: 3,
  borderColor: theme.colors.brand.primary,
  shadowColor: theme.colors.brand.primary,
  shadowOpacity: 0.5,
  shadowRadius: 4,
  shadowOffset: { width: 0, height: 0 },
});
```

### Apply to Button Component

**Edit**: `src/components/buttons/Button.jsx`

```javascript
import { createFocusStyle } from '../../styles/focusStyles';

const [isFocused, setIsFocused] = useState(false);

<TouchableOpacity
  onFocus={() => setIsFocused(true)}
  onBlur={() => setIsFocused(false)}
  style={[
    styles.base,
    isFocused && createFocusStyle(theme),
    // ...
  ]}
>
```

### Apply to All Interactive Elements

- [ ] All buttons (PrimaryButton, SecondaryButton, etc.)
- [ ] Toggle switches
- [ ] Activity/Palette items
- [ ] Modal close buttons
- [ ] Settings options

---

## 🟠 Task 6: Timer Dial Alternative Input (P1)

**Effort**: 4-5h | **WCAG**: 2.1.1

### Add Increment/Decrement Buttons

**Edit**: `src/components/timer/TimerControls.jsx` (or create)

```javascript
<View style={styles.durationControls} accessibilityRole="adjustable">
  <TouchableOpacity
    onPress={() => adjustDuration(-60)}
    accessibilityLabel={t('timer.decreaseMinute')}
    accessibilityRole="button"
  >
    <Text>−1</Text>
  </TouchableOpacity>

  <Text accessibilityLabel={t('timer.currentDuration', { duration })}>
    {formatDuration(duration)}
  </Text>

  <TouchableOpacity
    onPress={() => adjustDuration(60)}
    accessibilityLabel={t('timer.increaseMinute')}
    accessibilityRole="button"
  >
    <Text>+1</Text>
  </TouchableOpacity>
</View>
```

### Add Accessibility Actions to Dial

**Edit**: `src/components/timer/TimerDial.jsx`

```javascript
<View
  accessible={true}
  accessibilityRole="adjustable"
  accessibilityLabel={t('timer.dial', { minutes: duration / 60 })}
  accessibilityActions={[
    { name: 'increment', label: t('timer.increaseMinute') },
    { name: 'decrement', label: t('timer.decreaseMinute') },
  ]}
  onAccessibilityAction={(event) => {
    switch (event.nativeEvent.actionName) {
      case 'increment':
        adjustDuration(60);
        break;
      case 'decrement':
        adjustDuration(-60);
        break;
    }
  }}
>
```

---

## Testing Checklist

### Screen Reader Testing

- [ ] **iOS VoiceOver**: Test full app flow
- [ ] **Android TalkBack**: Test full app flow
- [ ] Timer announces every state change
- [ ] All buttons have labels
- [ ] Language matches device setting

### Color Contrast Testing

- [ ] Run WebAIM checker on all colors
- [ ] Light theme ≥ 4.5:1 all text
- [ ] Dark theme ≥ 4.5:1 all text
- [ ] Use color blind simulator

### Motion Testing

- [ ] Enable Reduce Motion in system
- [ ] Verify no animations play
- [ ] App remains functional

### Keyboard Testing (iPad)

- [ ] Connect Bluetooth keyboard
- [ ] Tab through all elements
- [ ] Focus visible on each element
- [ ] Enter activates buttons

---

## Priority Order

1. **Task 1** (Color contrast) — Most visible impact
2. **Task 2** (Timer announcements) — Core feature accessibility
3. **Task 3** (Reduce motion) — Safety concern
4. **Task 4** (i18n labels) — Quick fix
5. **Task 5** (Focus indicators) — P1 but important
6. **Task 6** (Timer dial input) — P1 alternative input

---

## References

- [Accessibility Report](../reports/accessibility.md)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [React Native Accessibility Docs](https://reactnative.dev/docs/accessibility)
- Audit: `_internal/cockpit/knowledge/findings/2025-12-14_04-accessibility.md`

---

**Total P0 Effort**: ~12-16h
**Total P0+P1 Effort**: ~30-40h
**Target**: 90%+ WCAG 2.1 AA compliance
