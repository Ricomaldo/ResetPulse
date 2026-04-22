---
created: '2025-12-15'
updated: '2025-12-15'
status: active
priority: P0
wcag_target: '2.1 AA'
test_type: 'VoiceOver / TalkBack Accessibility Testing'
---

# Modal Accessibility Testing Guide

This guide provides step-by-step instructions to test all modal accessibility improvements using VoiceOver (iOS) and TalkBack (Android).

## Prerequisites

### iOS (VoiceOver)
- Device: iPhone or iPad running iOS 14+
- **Enable VoiceOver**: Settings → Accessibility → VoiceOver → ON
- **Quick toggle**: Triple-click side/home button (configure in Accessibility Shortcuts)

### Android (TalkBack)
- Device: Android phone/tablet running Android 8+
- **Enable TalkBack**: Settings → Accessibility → TalkBack → ON
- **Quick toggle**: Volume Up + Volume Down (hold for 3 seconds)

---

## VoiceOver Testing Steps

### Modal 1: PremiumModal

**Trigger**: Tap "+" button in activities or palettes carousel

**Test Checklist**:
1. [ ] **Modal opens**: VoiceOver announces "Unlock everything, dialog, Dialog to unlock premium features with 7-day free trial"
2. [ ] **Header**: Navigate to header → announces "Unlock everything, header"
3. [ ] **Body text**: Swipe right → announces full description
4. [ ] **Features text**: Swipe right → announces "7 DAYS FREE"
5. [ ] **Price text**: Swipe right → announces price with formatting
6. [ ] **Primary button**: Swipe right → announces "Unlock premium for [price], button, Start 7-day free trial, then one-time payment"
7. [ ] **Secondary button**: Swipe right → announces "Close premium offer, button, Closes this dialog and returns to the app"
8. [ ] **Restore button**: Swipe right → announces "Restore previous purchases, button, Restore premium access if you already purchased"
9. [ ] **Button activation**: Double-tap any button → triggers action
10. [ ] **Modal closes**: When dismissed, VoiceOver returns focus to trigger element
11. [ ] **Disabled state**: During purchase/restore, buttons announce "dimmed" or "disabled"

**Expected VoiceOver Announcements**:
```
Modal opens → "Unlock everything. Dialog. Dialog to unlock premium features with 7-day free trial."
Primary button → "Unlock premium for 4.99 euros. Button. Start 7-day free trial, then one-time payment."
Close button → "Close premium offer. Button. Closes this dialog and returns to the app."
```

---

### Modal 2: DiscoveryModal (MoreActivitiesModal)

**Trigger**: Tap "+" at end of activities carousel

**Test Checklist**:
1. [ ] **Modal opens**: Announces "Even more moments, dialog, Preview of premium content available with subscription"
2. [ ] **Header**: "Even more moments, header"
3. [ ] **Subtitle**: "Nap, writing, reading, yoga..."
4. [ ] **Activities list**: "List of premium activities, list"
5. [ ] **Individual emojis**: Each emoji announces with name (e.g., "😴 Nap, text")
6. [ ] **Tagline**: "Every moment deserves its color"
7. [ ] **Unlock button**: "Unlock everything - 7 days free, button, Start 7-day free trial, then one-time payment"
8. [ ] **Dismiss button**: "Maybe later, button, Closes this dialog and returns to the app"
9. [ ] **Overlay tap**: Tapping overlay outside modal closes it

**Expected VoiceOver Announcements**:
```
Modal opens → "Even more moments. Dialog. Preview of premium content available with subscription."
Activities list → "List of premium activities. List."
Emoji → "Nap emoji. Text."
```

---

### Modal 3: DiscoveryModal (MoreColorsModal)

**Trigger**: Tap "+" at end of palettes carousel

**Test Checklist**:
1. [ ] **Modal opens**: "Even more colors, dialog, Preview of premium content available with subscription"
2. [ ] **Header**: "Even more colors, header"
3. [ ] **Subtitle**: "Ocean, forest, lavender, duck..."
4. [ ] **Palettes list**: "List of premium color palettes, list"
5. [ ] **Individual palettes**: Each announces "Color palette: [name], text" (e.g., "Color palette: Ocean")
6. [ ] **Color circles**: Hidden from VoiceOver (decorative, announced via palette name)
7. [ ] **Tagline**: "Every mood, its atmosphere."
8. [ ] **Unlock button**: Works as expected
9. [ ] **Dismiss button**: Works as expected

**Expected VoiceOver Announcements**:
```
Modal opens → "Even more colors. Dialog. Preview of premium content available with subscription."
Palettes list → "List of premium color palettes. List."
Palette item → "Color palette: Ocean. Text."
```

---

### Modal 4: SettingsModal

**Trigger**: Tap gear icon (⚙️) in app

**Test Checklist**:
1. [ ] **Modal opens**: "Settings, dialog, Configure app interface, timer behavior, and appearance"
2. [ ] **Header**: "Settings, header"
3. [ ] **Close button (×)**: "Close settings, button, Closes this dialog and returns to the app"
4. [ ] **Section headers**: Each announces with "header" role
   - [ ] "Interface, header"
   - [ ] "Timer, header"
   - [ ] "Appearance, header"
   - [ ] "About, header"
5. [ ] **Toggles/switches**: Each announces current state (on/off)
6. [ ] **Palette grid**: Navigable with swipe gestures
7. [ ] **Activity favorites**: Can toggle favorites with VoiceOver
8. [ ] **Scrollable content**: Scroll gestures work with 3-finger swipe up/down
9. [ ] **Nested modals**: Settings → Tap "+" → Discovery modal opens → Both accessible

**Expected VoiceOver Announcements**:
```
Modal opens → "Settings. Dialog. Configure app interface, timer behavior, and appearance."
Close button → "Close settings. Button. Closes this dialog and returns to the app."
Toggle → "Minimal interface. Switch. On." (or "Off")
```

---

### Modal 5: CreateActivityModal

**Trigger**: Tap "+" button in custom activities area

**Test Checklist**:
1. [ ] **Modal opens**: "Create activity, dialog, Create a custom activity with emoji, name, and duration"
2. [ ] **Header**: "Create activity, header"
3. [ ] **Close button (X)**: "Close create activity, button, Closes this dialog and returns to the app"
4. [ ] **Section labels**: "Choose emoji", "Activity name", "Default duration"
5. [ ] **Emoji picker**: Grid navigable, each emoji announces
6. [ ] **Text input**: "Activity name, text field, placeholder Ex: Guitar, Cooking..."
7. [ ] **Character counter**: Announces "15/20"
8. [ ] **Duration slider**: Value announces as you adjust
9. [ ] **Preview section**: Shows selected emoji + name
10. [ ] **Cancel button**: "Cancel, button, Closes this dialog and returns to the app"
11. [ ] **Create button**: "Create, button, Creates the custom activity and adds it to your list"
12. [ ] **Disabled state**: Create button disabled when form invalid → announces "dimmed"

**Expected VoiceOver Announcements**:
```
Modal opens → "Create activity. Dialog. Create a custom activity with emoji, name, and duration."
Text input → "Activity name. Text field. Ex: Guitar, Cooking..."
Create button → "Create. Button. Creates the custom activity and adds it to your list."
```

---

### Modal 6: EditActivityModal

**Trigger**: Long press on custom activity

**Test Checklist**:
1. [ ] **Modal opens**: "Edit activity, dialog, Edit or delete this custom activity"
2. [ ] **Header**: "Edit activity, header"
3. [ ] **Close button (X)**: "Close edit activity, button, Closes this dialog and returns to the app"
4. [ ] **Emoji picker**: Pre-selected emoji visible
5. [ ] **Text input**: Pre-filled with activity name
6. [ ] **Duration slider**: Pre-set to saved duration
7. [ ] **Usage stats**: If exists, announces "Used X times"
8. [ ] **Cancel button**: "Cancel, button, Closes this dialog and returns to the app"
9. [ ] **Save button**: "Save, button, Saves changes to this activity"
10. [ ] **Delete button**: "Delete, button, Permanently deletes this custom activity"
11. [ ] **Delete confirmation**: Alert dialog accessible with VoiceOver

**Expected VoiceOver Announcements**:
```
Modal opens → "Edit activity. Dialog. Edit or delete this custom activity."
Save button → "Save. Button. Saves changes to this activity."
Delete button → "Delete. Button. Permanently deletes this custom activity."
```

---

### Modal 7: TwoTimersModal

**Trigger**: Complete 2 timers (automatic)

**Test Checklist**:
1. [ ] **Modal opens**: "You've created 2 moments!, dialog, Congratulations modal after completing 2 timers"
2. [ ] **Emoji**: "Celebration, 🎉"
3. [ ] **Header**: "You've created 2 moments!, header"
4. [ ] **Message**: "Want to explore more colors and activities?"
5. [ ] **Explore button**: "Explore premium, button, Opens settings to discover premium features"
6. [ ] **Dismiss button**: "Maybe later, button, Closes this dialog and returns to the app"

**Expected VoiceOver Announcements**:
```
Modal opens → "You've created 2 moments!. Dialog. Congratulations modal after completing 2 timers."
Emoji → "Celebration."
Explore button → "Explore premium. Button. Opens settings to discover premium features."
```

---

## Common Testing Patterns

### Focus Management
- [ ] **Modal opens**: Focus moves to modal container
- [ ] **Modal closes**: Focus returns to trigger element
- [ ] **Tab trap**: VoiceOver cannot escape modal (swipe only navigates within)
- [ ] **First element**: First swipe lands on modal title/header

### Button States
- [ ] **Enabled**: Button announces normally
- [ ] **Disabled**: Button announces "dimmed" or "disabled"
- [ ] **Loading**: ActivityIndicator announces operation in progress

### Overlay/Backdrop
- [ ] **Overlay tap**: Tapping outside modal closes it
- [ ] **Overlay hidden**: Overlay has `accessible={false}` (VoiceOver ignores it)

### Screen Reader Announcements
- [ ] **Modal title**: Announced when modal opens
- [ ] **Roles**: Headers, buttons, text fields announce correct role
- [ ] **Hints**: Actions explain what will happen (e.g., "Closes this dialog")
- [ ] **State**: Current state announced (on/off, selected, disabled)

---

## TalkBack Testing (Android)

### Key Differences from VoiceOver
- **Navigation**: Swipe right/left to move between elements
- **Activation**: Double-tap to activate
- **Reading order**: May differ slightly from iOS
- **State announcements**: "Checked" vs "Selected"

### Test All 7 Modals
Repeat the same test checklists above using TalkBack. Pay attention to:
- [ ] Announcements are clear and understandable
- [ ] Navigation order is logical
- [ ] All interactive elements are reachable
- [ ] Modal role is announced
- [ ] Hints provide useful context

---

## Automated Testing (Optional)

### React Native Testing Library

```javascript
import { render, screen } from '@testing-library/react-native';
import PremiumModal from '../PremiumModal';

test('PremiumModal has correct accessibility props', () => {
  const { getByLabelText, getByRole } = render(
    <PremiumModal visible={true} onClose={() => {}} />
  );

  // Check modal dialog role
  expect(getByLabelText('Unlock everything')).toBeTruthy();
  expect(getByRole('dialog')).toBeTruthy();

  // Check buttons
  expect(getByRole('button', { name: /Unlock premium/ })).toBeTruthy();
  expect(getByRole('button', { name: /Close premium/ })).toBeTruthy();
});
```

---

## Known Issues / Edge Cases

### Issue 1: Focus Return on iOS
- **Problem**: Sometimes focus doesn't return to trigger element after modal closes
- **Workaround**: Use `onDismiss` callback to manually set focus
- **Status**: Monitor in production

### Issue 2: ActivityIndicator Not Announced
- **Problem**: Loading spinners may not announce on all devices
- **Workaround**: Add `accessibilityLabel="Loading"` to ActivityIndicator
- **Status**: Already implemented in PremiumModal

### Issue 3: Nested Modals
- **Problem**: SettingsModal → DiscoveryModal creates modal stack
- **Workaround**: Both modals accessible, but navigation can be confusing
- **Status**: Acceptable UX, document in user guide

---

## Sign-Off Checklist

Before marking this task complete, verify:

- [ ] All 7 modals tested with VoiceOver (iOS)
- [ ] All 7 modals tested with TalkBack (Android)
- [ ] Focus management correct (trap + return)
- [ ] All buttons/inputs have labels and hints
- [ ] Modal titles announced on open
- [ ] Close buttons accessible and labeled
- [ ] Disabled states announced correctly
- [ ] No VoiceOver navigation escapes modal
- [ ] i18n keys added to all 15 supported languages (or fallback to English)

---

## VoiceOver Quick Reference

| Gesture | Action |
|---------|--------|
| Swipe right | Next element |
| Swipe left | Previous element |
| Double-tap | Activate element |
| Triple-tap | Additional action (if available) |
| 2-finger swipe up/down | Scroll |
| 2-finger double-tap | Magic tap (pause/play) |
| Rotor (2-finger rotate) | Change navigation mode |
| 3-finger swipe left/right | Page navigation |

---

## TalkBack Quick Reference

| Gesture | Action |
|---------|--------|
| Swipe right | Next element |
| Swipe left | Previous element |
| Double-tap | Activate element |
| Swipe up then right | Next heading |
| Swipe down then right | Previous heading |
| Swipe down then left | Read from top |
| 3-finger swipe | Navigate by granularity |

---

## Additional Resources

- [React Native Accessibility Docs](https://reactnative.dev/docs/accessibility)
- [WCAG 2.1 AA Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [iOS VoiceOver Guide](https://support.apple.com/guide/iphone/turn-on-and-practice-voiceover-iph3e2e415f/ios)
- [Android TalkBack Guide](https://support.google.com/accessibility/android/answer/6283677)
- [WebAIM Screen Reader Testing](https://webaim.org/articles/screenreader_testing/)

---

**Testing completed by**: _____________
**Date**: _____________
**Platform**: iOS ☐  Android ☐  Both ☐
**Issues found**: _____________
**Status**: ☐ Pass  ☐ Fail  ☐ Pass with notes
