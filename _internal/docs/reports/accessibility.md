---
created: '2025-12-14'
updated: '2025-12-14'
status: active
wcag_target: '2.1 AA'
---

# Accessibility Report — ResetPulse

> État de conformité WCAG 2.1 AA pour utilisateurs neuroatypiques

## Quick Status

| Aspect | Score | Status |
|--------|-------|--------|
| **WCAG 2.1 AA Overall** | **62%** | ⚠️ Non-compliant |
| **Color Contrast (Light)** | 38% | 🔴 FAIL |
| **Color Contrast (Dark)** | 72% | ⚠️ Partial |
| **Screen Reader Labels** | 53% | ⚠️ Partial |
| **Touch Targets** | 87% | ✅ Good |
| **Focus Indicators** | 0% | 🔴 FAIL |
| **Keyboard Navigation** | 0% | 🔴 FAIL |
| **Motion Preferences** | 0% | 🔴 FAIL |

---

## 🔴 P0 — Critical WCAG Violations (4)

### 1. Color Contrast Failure (WCAG 1.4.3)

**Brand Primary on White**: `#e5a8a3` = **2.89:1** (requires 4.5:1)

| Color Pair | Current | Required | Status |
|------------|---------|----------|--------|
| Primary on white | 2.89:1 | 4.5:1 | 🔴 FAIL |
| Text secondary on bg | 4.12:1 | 4.5:1 | 🔴 FAIL |
| Text light on bg | 2.94:1 | 4.5:1 | 🔴 FAIL |

**Affected**: 15+ components (buttons, active states, borders)

**Fix**: Change primary to `#c17a71` (achieves 5.1:1)

### 2. Missing Timer Announcements (WCAG 4.1.3)

- Timer value: NOT announced
- Timer status (running/paused): NOT announced
- Timer completion: NOT announced

**Impact**: Timer unusable for blind/low-vision users

### 3. No Motion Preference Support (WCAG 2.3.3)

- Pulse animation ignores `prefers-reduced-motion`
- All animations play regardless of user setting

**Impact**: Affects vestibular disorders, photosensitivity

### 4. Hardcoded French Accessibility Labels

**Location**: `CircularToggle.jsx:51`
```javascript
accessibilityLabel={clockwise ? 'Sens horaire' : 'Sens anti-horaire'}
// Should use t('accessibility.rotationClockwise')
```

**Impact**: Non-French users get French screen reader labels

---

## 🟠 P1 — Important Gaps (5)

| Issue | WCAG | Impact |
|-------|------|--------|
| Timer dial keyboard-only | 2.1.1 | Can't adjust without touch |
| No focus indicators | 2.4.7 | Can't track focus visually |
| Incomplete hints | 3.3.2 | 40% components lack context |
| No keyboard nav | 2.1.1 | No tab order, no shortcuts |
| Text scaling untested | 1.4.4 | May break at large sizes |

---

## 🟡 P2 — Enhancements (6)

- Touch target spacing (emoji grid 4px → 8px)
- Close button hitSlop needed
- Missing accessibilityRole on some buttons
- No live regions for toasts
- Modal dialog role incomplete
- Carousel "X of Y" announcements

---

## WCAG 2.1 AA Scorecard

| Principle | Score | Key Failures |
|-----------|-------|--------------|
| **Perceivable** | 52% | Color contrast |
| **Operable** | 28% | Keyboard, focus |
| **Understandable** | 67% | Labels i18n |
| **Robust** | 62% | Status messages |

---

## What's Working ✅

- **Touch targets**: 87% meet 44×44pt minimum
- **Accessibility labels**: 53 components have labels
- **Accessibility roles**: 85% proper button/switch roles
- **Dark theme contrast**: Better than light (72%)
- **Premium gating**: Proper disabled states
- **Pulse warning**: User warned before enabling

---

## Target Audience Considerations

**ResetPulse serves neuroatypical users (ADHD, ASD)**. For this audience:

| Need | Current Support |
|------|-----------------|
| Clear visual contrast | 🔴 Insufficient |
| Audio feedback for time | 🔴 Missing |
| Motion control | 🔴 Not implemented |
| Keyboard alternatives | 🔴 None |
| Predictable interactions | ✅ Good |

---

## Remediation Effort

| Priority | Tasks | Effort |
|----------|-------|--------|
| **P0** | Color contrast, timer a11y, motion, i18n | 12-16h |
| **P1** | Focus indicators, keyboard nav, hints | 18-24h |
| **P2** | Touch targets, live regions, polish | 6-8h |
| **Total** | | **3-5 days** |

---

## ⚠️ Legacy Doc Warning

**File**: `legacy/audits-WCAG_CONTRAST_AUDIT.md` (Sept 2025)

**Claims**: "WCAG 2.1 AA compliant", "Focus indicators present", "Keyboard navigation"

**Reality (Dec 2025)**: 62% compliant, 0% focus, 0% keyboard

**Status**: Legacy doc is **OUTDATED and INCORRECT**. Colors changed since M3.

---

## References

- [Handoff: Accessibility Remediation](../guides/handoff-engineer-accessibility.md)
- [Legacy: WCAG Contrast Audit](../legacy/audits-WCAG_CONTRAST_AUDIT.md) — ⚠️ OUTDATED
- Audit source: `_internal/cockpit/knowledge/findings/2025-12-14_04-accessibility.md`

---

**Last Audit**: 2025-12-14 (Claude-Discovery)
**Target**: 90%+ WCAG 2.1 AA after P0+P1 fixes
