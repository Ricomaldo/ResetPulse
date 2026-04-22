---
created: '2025-12-14'
updated: '2025-12-14'
status: active
type: handoff
target: Claude-Engineer
priority: P1
---

# Handoff: Large Files Refactoring

> Instructions pour Claude-Engineer — Refactoring des fichiers volumineux (P1)

## Context

Suite a l'audit #1 Code Quality et decision Eric (2025-12-14), le refactoring des large files est promu en **P1 (prioritaire)**.

**Source**: `_internal/docs/reports/audit-code-quality-baseline-2025-12.md`

---

## Scope

### Files to Refactor

| File | Current Lines | Target | Priority |
|------|---------------|--------|----------|
| `src/components/modals/SettingsModal.jsx` | 1,124 | <300 | HIGH |
| `src/services/analytics.js` | 640 | <300 | MEDIUM |
| `src/components/carousels/ActivityCarousel.jsx` | 607 | <300 | MEDIUM |

---

## 1. SettingsModal.jsx (1,124 lines → <300)

### Current Structure Analysis

Le fichier gere :
- 3 sub-modals (Premium, MoreColors, MoreActivities)
- Multiple state handlers (settings, theme, IAP)
- UI rendering pour tous les settings

### Extraction Strategy

```
src/components/modals/
├── SettingsModal.jsx          # Main orchestrator (<300 lines)
├── settings/                  # NEW subdirectory
│   ├── PremiumSettings.jsx    # ~150 lines (IAP, premium status)
│   ├── ThemeSettings.jsx      # ~100 lines (theme toggle, colors)
│   ├── TimerSettings.jsx      # ~100 lines (duration mode, rotation)
│   ├── SoundSettings.jsx      # ~80 lines (audio preferences)
│   └── AboutSection.jsx       # ~80 lines (version, links, reset)
└── index.js                   # Re-exports
```

### Refactoring Steps

1. **Identify logical sections** in SettingsModal.jsx
2. **Create `settings/` subdirectory**
3. **Extract PremiumSettings** (RevenueCat, IAP, premium status display)
4. **Extract ThemeSettings** (dark mode toggle, theme preferences)
5. **Extract TimerSettings** (25/60 mode, rotation direction)
6. **Extract SoundSettings** (audio on/off, volume)
7. **Extract AboutSection** (version info, support links, reset onboarding)
8. **Update SettingsModal.jsx** to import and compose extracted components
9. **Verify no regressions** (`npm test`)

### Guidelines

- **Keep state in parent** when shared across sections
- **Pass callbacks as props** for actions
- **Use composition** over prop drilling (consider context if >3 levels)
- **Maintain existing behavior** — pure refactor, no feature changes

---

## 2. analytics.js (640 lines → <300)

### Current Structure Analysis

Single service class with 25+ tracking methods :
- Onboarding events
- Timer events
- Premium/IAP events
- Activity events
- UI interaction events

### Modularization Strategy

```
src/services/
├── analytics.js               # Main entry point + init (<150 lines)
├── analytics/                 # NEW subdirectory
│   ├── onboardingEvents.js    # ~80 lines
│   ├── timerEvents.js         # ~80 lines
│   ├── premiumEvents.js       # ~80 lines
│   ├── activityEvents.js      # ~80 lines
│   └── uiEvents.js            # ~80 lines
└── index.js                   # Re-exports
```

### Refactoring Steps

1. **Identify event categories** in analytics.js
2. **Create `analytics/` subdirectory**
3. **Extract onboardingEvents** (funnel tracking, step completion)
4. **Extract timerEvents** (start, stop, pause, complete)
5. **Extract premiumEvents** (paywall shown, purchase, restore)
6. **Extract activityEvents** (selection, custom activity CRUD)
7. **Extract uiEvents** (settings opened, modal interactions)
8. **Update analytics.js** to import and re-export
9. **Verify no regressions** (`npm test`)

### Guidelines

- **Keep Mixpanel instance** in main analytics.js
- **Pass instance to modules** or use singleton pattern
- **Maintain same public API** — callers shouldn't change
- **Add JSDoc** to exported functions

---

## 3. ActivityCarousel.jsx (607 lines → <300)

### Current Structure Analysis

Complex carousel with :
- Item rendering logic
- Animation handling
- Premium/free filtering
- Plus button logic

### Extraction Strategy

```
src/components/carousels/
├── ActivityCarousel.jsx       # Main carousel logic (<250 lines)
├── carousel-items/            # NEW subdirectory
│   ├── ActivityItem.jsx       # ~100 lines (single item render)
│   ├── PlusButton.jsx         # ~60 lines (add more button)
│   └── CarouselHeader.jsx     # ~50 lines (title, count)
└── index.js                   # Re-exports
```

### Refactoring Steps

1. **Identify render sections** in ActivityCarousel.jsx
2. **Create `carousel-items/` subdirectory**
3. **Extract ActivityItem** (single activity card render)
4. **Extract PlusButton** (freemium "+" button at end)
5. **Extract CarouselHeader** if present (title display)
6. **Update ActivityCarousel.jsx** to use extracted components
7. **Verify no regressions** (`npm test`)

### Guidelines

- **Keep carousel state** in parent (scroll position, selected)
- **Pass item data as props** to ActivityItem
- **Maintain animations** — ensure refs work after extraction
- **Test freemium behavior** — free vs premium items display

---

## Verification Checklist

After each file refactoring:

```bash
# Run all tests
npm test

# Check specific component tests if available
npm test -- --testPathPattern=SettingsModal
npm test -- --testPathPattern=analytics
npm test -- --testPathPattern=ActivityCarousel

# Verify app runs
npx expo start
```

### Expected Outcomes

- [ ] SettingsModal.jsx < 300 lines
- [ ] analytics.js < 300 lines (main file)
- [ ] ActivityCarousel.jsx < 300 lines
- [ ] All tests still pass (135/135)
- [ ] No UI regressions
- [ ] No new lint errors

---

## Post-Refactoring

### Update Documentation

After completing refactoring, update:
- `_internal/docs/reports/audit-code-quality-baseline-2025-12.md` → mark as done
- `_internal/docs/reports/architecture-source-code.md` → add new file structure

### Coverage Targets (Next Phase)

Once refactoring complete, address:
- Increase `analytics.js` coverage (47% → 80%)
- Standardize console logging (7 unwrapped statements)

---

## Notes

- **Pure refactoring** — no feature changes
- **Maintain backward compatibility** — public APIs unchanged
- **Test after each extraction** — catch regressions early
- **Use ESLint/Prettier** — newly created config files

---

**Generated by**: Atlas/Claude-Architect
**Date**: 2025-12-14
**For**: Claude-Engineer Phase 3
