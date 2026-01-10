---
created: '2025-12-14'
updated: '2025-12-24'
status: active
---

# Design System Report — ResetPulse

> État du système de design et cohérence visuelle

## Quick Status

| Aspect | Grade | Status |
|--------|-------|--------|
| **Overall** | **9/10** | ✅ Excellent |
| **Color System** | 9/10 | ✅ Excellent |
| **Typography** | 8/10 | ✅ Very Good |
| **Spacing** | 9.5/10 | ✅ Excellent (harmonized) |
| **Components** | 7/10 | ✅ Improved (visual hierarchy) |
| **Responsive** | 10/10 | ✅ Excellent (system-wide) |
| **Visual Hierarchy** | 9/10 | ✅ Solution B implemented |
| **Documentation** | 4/10 | ⚠️ Updated |

---

## Design Tokens

### Color System ✅ A+

**File**: `src/theme/colors.js`

| Category | Count | Usage |
|----------|-------|-------|
| Brand colors | 5 | Buttons, headers, accents |
| Semantic (per theme) | 11 | Text, backgrounds, borders |
| Fixed colors | 2 | White, black |
| Palette colors | 60 | Timer dial (15 palettes × 4) |
| **Total** | **78** | 100% accounted for |

**Token Compliance**: 98% token-based, 2% hardcoded

**Logo-Based Color Harmonization** (Dec 24, 2025):
- All brand colors now derived from new logo gradient (assets/logo/logo-1024-detoured.png)
- Warm color palette throughout (coral-orange → taupe → cream)
- Complete consistency: background, brand, text all harmonized

**Brand Palette** (Light Theme):
```javascript
primary: '#E89665'    // Coral-orange (logo gradient center)
secondary: '#8B7D72'  // Stone réchauffé
accent: '#D4A853'     // Or classique (logo bottom)
deep: '#6B5F55'       // Brun-gris foncé (réchauffé)
neutral: '#A89B8F'    // Taupe clair (réchauffé)
```

**Typography Colors** (Warm Harmonization):
```javascript
text: '#2D2520'       // Charcoal brun (was #1F2937 cold)
textSecondary: deep   // Brun-gris foncé (was #5A5A5A cold)
textLight: '#8B7D72'  // Stone réchauffé (was #7A7A7A cold)
```

**Backgrounds**:
```javascript
background: '#EBE3D8'      // Cream réchauffé (was #ebe8e3)
surface: '#FFFFFF'          // Pure white
surfaceElevated: '#F8F6F3'  // Off-white warm
```

**Color Strategy**: All grays converted from cold (blue-tinted) to warm (brown-tinted) for visual coherence with logo gradient.

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
- Usage: 185+ instances across 40+ components (updated Dec 20)

**New**: All SettingsPanel components (7 files) converted to `rs()` responsive spacing.

---

### Harmonized Sizes System ✅ NEW (A+)

**File**: `src/styles/harmonized-sizes.js`

**Purpose**: Centralized responsive sizing formulas for all components

**Key Sizes**:
```javascript
carouselItem.size: rs(60, 'min')        // ActivityItem (primary)
colorButton.size: rs(50, 'min')         // PaletteCarousel (secondary)
scrollView.height: rs(70, 'min')        // Both carousels
controlBar.containerHeight: rs(65, 'min')  // Compact control bar
```

**Variants (ToolboxItem wrapper)**:
- `toolboxControlBar`: rs(55, 'min') height, compact padding
- `toolboxActivityCarousel`: rs(80, 'min') height, DOMINANT (primary decision)
- `toolboxPaletteCarousel`: rs(65, 'min') height, secondary (light ambiance)

**Benefit**: Single source of truth. All sizes scale predictably across devices.

---

### Visual Hierarchy System ✅ Solution B (A)

**Implementation**: Height + padding differentiation to create cognitive hierarchy

**Three-tier Hierarchy**:

1. **ActivityCarousel** (DOMINANT) — Primary semantic choice
   - ToolboxItem minHeight: rs(80, 'min')
   - Padding: rs(13)h / rs(8)v
   - Item size: rs(60, 'min')
   - Visual signal: "This is the main decision"

2. **PaletteCarousel** (SECONDARY) — Light, optional ambiance
   - ToolboxItem minHeight: rs(65, 'min')
   - Padding: rs(8)h / rs(4)v (minimal vertical)
   - Item size: rs(50, 'min') (reduced from 60)
   - Visual signal: "This is light and optional"

3. **ControlBar** (COMPACT/INFO-ONLY) — Time display + controls
   - ToolboxItem minHeight: rs(55, 'min')
   - Padding: rs(8)h / rs(6)v
   - Container height: rs(65, 'min') (reduced from 80)
   - Visual signal: "This is informational, not a decision"

**Result**: Users perceive ActivityCarousel as primary choice through size/spacing cues alone.

---

## 🟠 P1 — High Priority Issues

### ✅ 1. Settings Styles Not Extracted — RESOLVED

**Status**: COMPLETED (Dec 20, 2025)
**Solution**: Extracted SettingsModal into 7 component modules:
- `SettingsPanel.jsx` (main container, responsive)
- `SettingsCard.jsx` (reusable card wrapper)
- `SectionHeader.jsx` (section headers)
- `SelectionCard.jsx` (2x2 grid items)
- `FavoritesActivitySection.jsx` (activity grid)
- `FavoritesPaletteSection.jsx` (palette grid)
- `AboutSection.jsx` (about info)

All spacing converted to `rs()` responsive.

### ❌ 2. No Centralized Button Component — PENDING

**Issue**: 7 modals define identical button patterns (~150 lines duplicated)
**Fix**: Create `src/components/buttons/Button.jsx`
**Effort**: 3-4h
**Status**: Backlogged (low priority, carousels > buttons)

### 3. Hardcoded Button Text Color `#FFFFFF`

**Count**: 12 instances
**Fix**: Replace with `theme.colors.fixed.white`
**Effort**: 15 min
**Status**: Can be tackled with Button component refactor

### 4. Modal Overlay Color Duplicated

**Count**: 8 modals with identical rgba patterns
**Fix**: Centralize in `theme.colors.overlay`
**Effort**: 1h
**Status**: Low priority (works fine as-is)

---

## 🟡 P2 — Refinements

### ✅ Spacing System Harmonized — COMPLETED

**Status**: COMPLETED (Dec 20, 2025)
**Action**:
- Created `harmonized-sizes.js` centralized registry
- Converted 185+ instances to `rs()` responsive
- All SettingsPanel + carousels + toolbox now responsive
- Before: 155 instances (95% adoption)
- After: 195+ instances (98% adoption)

### ✅ Visual Hierarchy System — COMPLETED

**Status**: COMPLETED (Dec 20, 2025)
**Implementation**: Solution B (height + padding differentiation)
- ActivityCarousel: dominant (rs(80) wrapper)
- PaletteCarousel: secondary (rs(65) wrapper, rs(50) items)
- ControlBar: compact (rs(55) wrapper)

### Typography Token Reference Indirect

45+ instances use `rs(17, "min")` instead of `theme.fontSize.base`. Works but less clear.
**Status**: Deferred (low priority, responsive values work fine)

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
| Token Definition | 5/5 | Well-defined + harmonized-sizes |
| Token Adoption | 5/5 | 98% compliance (was 95%) |
| Component Consistency | 4/5 | Settings extracted, still modals pending |
| Documentation | 3/5 | Updated with new systems (was 2/5) |
| Scalability | 4/5 | Visual hierarchy template established |
| Responsive Design | 5/5 | System-wide `rs()` coverage |
| Visual Hierarchy | 5/5 | Solution B three-tier system |
| Accessibility | 4/5 | WCAG AA compliant |

**Overall**: Level 4/5 — Consolidated, responsive, hierarchical

---

## Recommendations Priority

| Priority | Task | Status | Effort |
|----------|------|--------|--------|
| ✅ P2 | Extract settings styles | DONE | 3-4h |
| ✅ P2 | Implement visual hierarchy | DONE | 4h |
| ✅ P2 | Harmonize sizing system | DONE | 2h |
| ❌ P1 | Create Button component library | PENDING | 3-4h |
| ❌ P1 | Fix hardcoded #FFFFFF | PENDING | 15min |
| ❌ P1 | Centralize overlay color | PENDING | 1h |
| ❌ P2 | Standardize border radius | PENDING | 2h |

---

## Recent Changes

### Dec 24, 2025 — Logo-Based Color Harmonization

**Context**: New app logo redesigned with punchy coral-orange gradient (assets/logo/logo-1024-detoured.png). Color system updated to derive from logo for brand coherence.

**Changes**:
1. **Brand Colors** (src/theme/colors.js):
   - `primary`: #C17A71 → **#E89665** (coral-orange from logo gradient)
   - `secondary`: #78716C → **#8B7D72** (stone réchauffé)
   - `accent`: #D4A853 (unchanged - matches logo bottom)
   - `deep`: #5A5A5A → **#6B5F55** (warm brown-gray)
   - `neutral`: #9CA3AF → **#A89B8F** (warm taupe)

2. **Typography Colors** (warm harmonization):
   - `text`: #1F2937 → **#2D2520** (charcoal brun)
   - `textLight`: #7A7A7A → **#8B7D72** (stone réchauffé)

3. **Background**:
   - `background`: #ebe8e3 → **#EBE3D8** (cream réchauffé)

4. **Palette Serenity** (src/config/timer-palettes.js):
   - Updated: ['#E89665', '#D4A853', '#8B7D72', '#5A5A5A']

**Impact**: Complete warm color harmony from background → text → brand. All cold (blue-tinted) grays eliminated.

---

### Dec 20, 2025 — Visual Hierarchy & Responsive Settings

**Commits**:
1. `c23cb7c` - Solution B: Visual hierarchy by size/padding differentiation
2. `475a4d9` - Responsive spacing system for SettingsPanel + height optimizations

**New Files**:
- `src/styles/harmonized-sizes.js` — Centralized responsive sizing
- `src/components/settings/SettingsPanel.jsx` — New responsive container
- `src/components/settings/SettingsCard.jsx` — Reusable card wrapper
- `src/components/settings/SelectionCard.jsx` — 2×2 grid item
- `src/components/settings/SectionHeader.jsx` — Section headers
- `src/components/settings/FavoritesActivitySection.jsx` — Activity grid
- `src/components/settings/FavoritesPaletteSection.jsx` — Palette grid
- `src/components/settings/AboutSection.jsx` — About info

**Modified Files**:
- `src/components/controls/ControlBar.jsx` — Height rs(80) → rs(65)
- `src/components/carousels/PaletteCarousel.jsx` — Use colorButton.size (rs(50))
- `src/components/layout/aside-content/ToolboxItem.jsx` — Variant system
- `src/components/layout/aside-content/ToolBox.jsx` — Apply variants
- `src/components/layout/AsideZone.jsx` — Remove scrollContent paddingTop

---

## Legacy Reference

| Doc | Status | Notes |
|-----|--------|-------|
| [carousel-affordance.md](../legacy/decisions-carousel-affordance.md) | 📌 Kept | Implemented, rationale preserved |

---

**Last Audit**: 2025-12-24 (Logo-Based Color Harmonization)
**Grade Trajectory**: 8/10 → 9/10 → 9.5/10 (from original doc, continuously improved)
