---
created: '2025-12-14'
updated: '2025-12-21'
status: active
audit: '#7 - Architecture Review + Provider Migration Complete'
source: '_internal/cockpit/knowledge/findings/2025-12-14_07-architecture.md'
---

# Architecture Baseline - ResetPulse (December 2025)

> Rapport consolidé de l'audit #7 Architecture Review avec état actuel et recommandations

## Executive Summary

**Compliance Score**: 85% (GOOD)

| Catégorie | Score | Notes |
|-----------|-------|-------|
| ADR-01 Structure | 90% | `_internal/` déviation documentée |
| ADR-02 Naming | 85% | Clés palette FR = P0 |
| Component Structure | 100% | PascalCase parfait |
| Context API | 100% | Non sur-engineered |
| Frontmatter | 75% | 3 fichiers racine manquants |
| i18n | 70% | 6 composants hardcodés |

---

## Current Architecture State

### Source Code Structure (`src/`)

```
src/
├── components/     # Grouped by feature
│   ├── bars/       # Screen orchestrators (CommandBar, CarouselBar)
│   ├── carousels/  # ActivityCarousel, PaletteCarousel
│   ├── controls/   # Reusable UI controls (CircularToggle, PresetPills)
│   ├── dial/       # Timer dial (TimeTimer, TimerDial, DialBase, etc.)
│   ├── drawers/    # Drawer components (OptionsDrawerContent, SettingsButton)
│   ├── layout/     # ErrorBoundary, Drawer, Icons
│   ├── modals/     # PremiumModal, DiscoveryModal, SettingsModal
│   ├── onboarding/ # OnboardingController, WelcomeScreen, Tooltip
├── config/         # Configuration & constants
│   ├── activities.js       # 4 FREE + 14 PREMIUM activities
│   ├── timerPalettes.js    # 2 FREE + 13 PREMIUM palettes
│   ├── revenuecat.js       # IAP configuration
│   └── testMode.js         # DEV_MODE toggle
├── contexts/       # State management
│   ├── TimerConfigContext.jsx    # Unified provider (completed Dec 21)
│   └── PurchaseContext.jsx
├── dev/            # Development tools
├── hooks/          # Custom hooks (useTimer, useTranslation, etc.)
├── i18n/           # 15 languages supported
├── screens/        # Screen components
│   ├── TimerScreen.jsx
│   └── onboarding/
├── services/       # External services (analytics)
├── styles/         # Style utilities
├── theme/          # Theme tokens & provider
└── utils/          # Utility functions
```

**Status**: ✅ COMPLIANT with ADR-01

### Documentation Structure (`_internal/`)

```
_internal/
├── cockpit/        # Project operations
│   ├── workflow/   # Missions (active, backlog, done)
│   ├── knowledge/  # Findings, devlog
│   └── planning/   # Roadmap, templates
└── docs/           # Documentation
    ├── guides/     # Operational docs
    ├── decisions/  # ADRs & strategies
    ├── reports/    # Audits & analyses
    └── legacy/     # Historical reference
```

**Status**: ⚠️ P1 - Uses `_internal/` instead of system `__cockpit__/` + `_docs_/`
**Resolution**: See ADR-resetpulse-internal-structure.md

---

## Critical Violations (P0)

### 1. French Palette Keys

**Location**: `src/config/timerPalettes.js`

```javascript
// CURRENT (violation)
sérénité: {
  colors: [...],
  get name() { return i18n.t("palettes.sérénité"); }
}

// EXPECTED (ADR-02 compliant)
serenity: {
  colors: [...],
  get name() { return i18n.t("palettes.serenity"); }
}
```

**Impact**: 4 files affected
**Fix Effort**: 2-3 hours
**Owner**: Claude-Engineer (Phase 3)

### 2. Missing Frontmatter

| File | Status |
|------|--------|
| `/README.md` | ❌ Missing |
| `/CHANGELOG.md` | ❌ Missing |
| `/scripts/README.md` | ❌ Missing |

**Fix Effort**: 15 minutes
**Owner**: Claude-Engineer (Phase 3)

---

## High Priority Issues (P1)

### 1. i18n Hardcoded Strings

**Components with French hardcoded text**:

| Component | Strings |
|-----------|---------|
| `DiscoveryModal.jsx` | CTA, dismiss text |
| `MoreActivitiesModal.jsx` | title, subtitle, tagline |
| `MoreColorsModal.jsx` | title, subtitle, tagline |
| `ActivityCarousel.jsx` | Toast messages |
| `PaletteCarousel.jsx` | Toast, accessibilityLabel |

**Tracking**: `src/i18n/TODO.md`
**Fix Effort**: 4-6 hours

### 2. Frontmatter Inconsistencies

- 3 files missing `updated` field
- 2 files using double quotes (standard: single quotes)

---

## Compliant Areas (100%)

| Area | Evidence | Date |
|------|----------|------|
| **Component Naming** | 100+ components use PascalCase | Dec 14 |
| **Constants Naming** | `DEV_MODE`, `SOUND_FILES`, `REVENUECAT_CONFIG` | Dec 14 |
| **Directory Depth** | Max 4 levels (compliant) | Dec 14 |
| **Context API** | Consolidated to 1 unified provider (TimerConfigContext) | Dec 21 ✅ |
| **Theme/Palette Separation** | UI theme vs timer colors (now in unified context) | Dec 21 ✅ |
| **Provider Tree** | App.js using single TimerConfigProvider for dev + prod | Dec 21 ✅ |

---

## Recommendations

### Completed (Dec 21, 2025)

- ✅ Provider consolidation (TimerOptions + TimerPalette + UserPreferences → TimerConfigContext)
- ✅ Unified destructuring pattern across 18 consuming files
- ✅ PulseButton stop functionality in ControlBar (added onLongPressComplete)
- ✅ MessageZone display for all activities (removed restrictive condition)

### Immediate (Before Next Release)

1. Refactor French palette keys → English
2. Add frontmatter to 3 root markdown files
3. Complete i18n migration (6 components)
4. Verify `DEV_MODE = false` for production

### Medium-term

1. Standardize frontmatter format (single quotes)
2. Create ADR for `_internal/` structure deviation
3. Archive legacy docs with `status: archived`

### Long-term

1. Evaluate `_external/` structure
2. Migrate i18n TODO.md to cockpit workflow
3. Establish frontmatter `type` field convention

---

## Related Documents

- **Source Audit**: `_internal/cockpit/knowledge/findings/2025-12-14_07-architecture.md`
- **Structure ADR**: `_internal/docs/decisions/adr-resetpulse-internal-structure.md`
- **Legacy Comparison**: `_internal/docs/legacy/architecture.legacy.md`

---

**Generated by**: Atlas/Claude-Architect (Phase 2)
**Date**: 2025-12-14
**Next Review**: Post-P0 fixes
