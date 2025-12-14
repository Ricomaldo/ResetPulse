---
created: '2025-12-14'
updated: '2025-12-14'
status: active
---

# Design System Report — ResetPulse

> État du système de design et cohérence visuelle

## Quick Status

| Aspect | Grade | Status |
|--------|-------|--------|
| **Overall** | **8/10** | ✅ Solid foundation |
| **Color System** | 9/10 | ✅ Excellent |
| **Typography** | 8/10 | ✅ Very Good |
| **Spacing** | 9/10 | ✅ Excellent |
| **Components** | 6/10 | ⚠️ Duplicated patterns |
| **Responsive** | 10/10 | ✅ Excellent |
| **Documentation** | 3/10 | ⚠️ Missing |

---

## Design Tokens

### Color System ✅ A

**File**: `src/theme/colors.js`

| Category | Count | Usage |
|----------|-------|-------|
| Brand colors | 5 | Buttons, headers, accents |
| Semantic (per theme) | 11 | Text, backgrounds, borders |
| Fixed colors | 2 | White, black |
| Palette colors | 60 | Timer dial (15 palettes × 4) |
| **Total** | **78** | 100% accounted for |

**Token Compliance**: 95% token-based, 5% hardcoded

---

### Typography System ✅ B+

**Files**: `src/theme/tokens.js`, `src/styles/platformStyles.js`

**Scale** (10 levels):
```
xs: 11px → sm: 13px → base: 15px → md: 17px → lg: 20px → xl: 24px → xxl: 32px
```

**Named Styles**: timer, title, subtitle, body, caption, button

---

### Spacing System ✅ A

**File**: `src/theme/tokens.js`

**Golden Ratio Grid**:
```
xs: 4px → sm: 8px → md: 13px → lg: 21px → xl: 34px → xxl: 55px
```

**Usage**: 155 instances across 35 components (95% adoption)

---

### Responsive System ✅ A+

**File**: `src/styles/responsive.js`

**`rs()` Function**:
- Base device: iPhone 13/14 (390×844)
- Modes: `width`, `height`, `min`, `max`
- Usage: 145+ instances across 28 components

---

## 🟠 P1 — High Priority Issues

### 1. Hardcoded Button Text Color `#FFFFFF`

**Count**: 12 instances
**Fix**: Replace with `theme.colors.fixed.white`
**Effort**: 15 min

### 2. Inconsistent Border Radius Patterns

**Issue**: Mix of `theme.borderRadius.lg` and `rs(16, "min")`
**Files**: PaletteCarousel, Filter-010-opening
**Fix**: Standardize approach

### 3. Modal Overlay Color Duplicated

**Count**: 8 modals with identical rgba patterns
**Fix**: Centralize in `theme.colors.overlay`
**Effort**: 1h

### 4. No Centralized Button Component

**Issue**: 7 modals define identical button patterns (~150 lines duplicated)
**Fix**: Create `src/components/buttons/Button.jsx`
**Effort**: 3-4h

→ See [handoff-engineer-design-system.md](../guides/handoff-engineer-design-system.md)

---

## 🟡 P2 — Refinements

### 1. Settings Styles Not Extracted

`settingsStyles.js` exists but mostly empty. SettingsModal has 28 inline StyleSheet declarations.

### 2. Typography Token Reference Indirect

45+ instances use `rs(17, "min")` instead of `theme.fontSize.base`. Works but less clear.

---

## Component Inventory

### Modals (8 total)

| Modal | Button Pattern | Status |
|-------|---------------|--------|
| PremiumModal | primary, secondary, restore | Duplicated |
| DiscoveryModal | primary, secondary | Duplicated |
| CreateActivityModal | primary, secondary, delete | Duplicated |
| EditActivityModal | primary, secondary, delete | Duplicated |
| SettingsModal | inline sections | Duplicated |
| MoreColorsModal | primary, secondary | Duplicated |
| MoreActivitiesModal | primary, secondary | Duplicated |
| TwoTimersModal | custom | Unique |

**Finding**: 7 modals define identical button patterns independently.

---

### Carousels (2 total) ✅

| Carousel | Affordance | Token Compliance |
|----------|------------|------------------|
| ActivityCarousel | Peek + plus button | ✅ Consistent |
| PaletteCarousel | Plus button | ⚠️ Mixed border radius |

---

### Palette System ✅ Perfect (10/10)

- **Free**: 2 palettes (serenity, earth)
- **Premium**: 13 palettes
- **Total**: 15 palettes, 60 hex codes
- All valid, no duplicates, WCAG AA compliant

---

## Onboarding Coherence ✅ Excellent

- 10+ filter screens with consistent design patterns
- OB → App transition: Smooth, no visual breaks
- Same ThemeProvider throughout

---

## Design System Maturity

| Dimension | Level | Notes |
|-----------|-------|-------|
| Token Definition | 4/5 | Well-defined |
| Token Adoption | 4/5 | 95% compliance |
| Component Consistency | 3/5 | Duplicated patterns |
| Documentation | 2/5 | Missing |
| Scalability | 3/5 | Copy patterns for new modals |
| Responsive Design | 5/5 | Excellent |
| Accessibility | 4/5 | WCAG AA compliant |

**Overall**: Level 3/5 — Ready for consolidation

---

## Recommendations Priority

| Priority | Task | Effort |
|----------|------|--------|
| P1 | Create Button component library | 3-4h |
| P1 | Fix hardcoded #FFFFFF | 15min |
| P1 | Centralize overlay color | 1h |
| P2 | Extract settings styles | 3-4h |
| P2 | Standardize border radius | 2h |
| P2 | Create design system docs | 4h |

---

## Legacy Reference

| Doc | Status | Notes |
|-----|--------|-------|
| [carousel-affordance.md](../legacy/decisions-carousel-affordance.md) | 📌 Kept | Implemented, rationale preserved |

---

**Last Audit**: 2025-12-14 (Claude-Discovery)
**Grade Trajectory**: 8/10 → 9/10 after P1 fixes
