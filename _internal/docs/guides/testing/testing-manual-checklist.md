---
created: '2025-12-14'
updated: '2025-12-14'
status: active
type: checklist
---

# Manual Testing Checklist - ResetPulse

> Essential manual tests before store submissions

## Quick Pre-Release (15 min)

### Core Timer
- [ ] Timer starts/pauses/resets
- [ ] Duration dial responds to touch
- [ ] Sound plays at completion
- [ ] Haptic feedback works

### Freemium
- [ ] Free activities accessible (4)
- [ ] Free palettes accessible (2)
- [ ] Premium lock visible on others
- [ ] Premium modal opens on locked tap

### Settings
- [ ] Theme toggle works (light/dark/auto)
- [ ] 25/60 mode switch works
- [ ] Minimal interface toggle works
- [ ] Keep screen awake works

---

## i18n Spot Check (10 min)

Test **3 languages** (FR + EN + 1 Asian):

- [ ] All visible text translated
- [ ] No raw keys showing (`onboarding.title`)
- [ ] Buttons not clipped
- [ ] Price displays correctly (€/$)

**If Arabic**: RTL layout not broken

---

## IAP Validation (10 min)

### Sandbox Purchase
- [ ] Premium modal shows price
- [ ] Purchase sheet opens (Apple/Google)
- [ ] Success unlocks all content
- [ ] Alert confirms purchase

### Restore
- [ ] "Restore purchases" works
- [ ] Previously purchased account restores
- [ ] Alert confirms restoration

---

## Audio Critical (5 min)

### Silent Mode (iOS)
- [ ] Physical switch to silent
- [ ] Timer completion → sound plays

### Background
- [ ] Start timer → go home
- [ ] Wait for completion → sound plays

---

## Regression Flags

If any of these fail, **BLOCK release**:
- App crash on launch
- Timer doesn't start
- Purchase doesn't unlock
- Sound doesn't play (silent mode)

---

**Total time**: ~40 min
**Run before**: Each store submission
