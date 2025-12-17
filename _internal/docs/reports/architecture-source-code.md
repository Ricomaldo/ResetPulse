---
created: '2025-12-14'
updated: '2025-12-17'
status: active
type: architecture
source: 'Audit #7 + Legacy comparison + Dec 2025 refactor (dial/bars/controls)'
---

# Source Code Architecture - ResetPulse

> Documentation de l'architecture `/src/` consolidee depuis l'audit #7 et le challenge legacy

## Overview

ResetPulse suit une architecture **React Native modulaire** avec separation claire des responsabilites. Cette documentation capture l'etat actuel post-refacto (Dec 2025).

---

## Directory Structure

```
src/
├── components/           # UI Components (PascalCase)
│   ├── bars/            # Screen orchestrators (CommandBar, CarouselBar)
│   ├── carousels/       # ActivityCarousel, PaletteCarousel
│   ├── controls/        # Reusable UI controls (CircularToggle, PresetPills)
│   ├── dial/            # Timer dial components (TimerDial, DialBase, DialProgress)
│   ├── drawers/         # Drawer components (OptionsDrawerContent, SettingsButton)
│   ├── layout/          # ErrorBoundary, Drawer, Icons
│   ├── modals/          # PremiumModal, DiscoveryModal, SettingsModal
│   ├── onboarding/      # OnboardingController, WelcomeScreen, Tooltip
│
├── config/              # Configuration & Constants
│   ├── activities.js    # Activity definitions (FREE: 4, PREMIUM: 14)
│   ├── timerPalettes.js # Palette definitions (FREE: 2, PREMIUM: 13)
│   ├── revenuecat.js    # IAP configuration
│   ├── sounds.js        # Sound mappings
│   └── testMode.js      # DEV_MODE toggle
│
├── contexts/            # React Context Providers
│   ├── TimerPaletteContext.jsx   # Timer colors
│   ├── TimerOptionsContext.jsx   # Timer settings
│   └── PurchaseContext.jsx       # Premium/IAP state
│
├── dev/                 # Development Tools
│   ├── DevPremiumContext.js      # Mock premium status
│   └── DevFab.jsx                # Dev toggle button
│
├── hooks/               # Custom Hooks
│   ├── useTimer.js              # Core timer logic (CRITICAL)
│   ├── useTranslation.js        # i18n wrapper
│   ├── usePremiumStatus.js      # Premium checks
│   ├── useAnalytics.js          # Mixpanel wrapper
│   ├── usePersistedState.js     # AsyncStorage wrapper
│   └── useNotificationTimer.js  # Background notifications
│
├── i18n/                # Internationalization
│   ├── translations/    # 15 language files
│   ├── index.js         # i18n-js setup
│   └── TODO.md          # Pending translations
│
├── screens/             # Screen Components
│   ├── TimerScreen.jsx          # Main app screen
│   └── onboarding/              # Onboarding flow screens
│       ├── OnboardingFlow.jsx
│       └── filters/             # Filter1-6 screens
│
├── services/            # External Services
│   └── analytics.js     # Mixpanel implementation
│
├── styles/              # Style Utilities
│   ├── gridLayout.js    # Layout calculations
│   └── responsive.js    # Responsive scaling
│
├── theme/               # Theme System
│   ├── ThemeProvider.jsx # Theme context
│   ├── colors.js         # Light/Dark colors
│   └── tokens.js         # Design tokens
│
├── utils/               # Utility Functions
│   ├── haptics.js       # Haptic feedback
│   ├── logger.js        # Centralized logging
│   └── PlatformTouchable.jsx  # Cross-platform touch
│
└── test-utils/          # Test Helpers
```

---

## Naming Conventions (ADR-02 Compliant)

| Type | Convention | Example | Status |
|------|------------|---------|--------|
| **Components** | PascalCase | `TimerDial.jsx` | ✅ 100% |
| **Hooks** | camelCase + `use` prefix | `useTimer.js` | ✅ 100% |
| **Contexts** | PascalCase + `Context` suffix | `TimerPaletteContext.jsx` | ✅ 100% |
| **Utils** | camelCase | `haptics.js` | ✅ 100% |
| **Config** | camelCase | `timerPalettes.js` | ✅ 100% |
| **Constants** | SCREAMING_SNAKE | `DEV_MODE`, `SOUND_FILES` | ✅ 100% |

### Known Violation (P0)

**File**: `src/config/timerPalettes.js`
**Issue**: Object keys in French (e.g., `serenite`)
**Fix Scope**: Refactor ALL keys to English (Eric decision: Option B)

---

## Architecture Patterns

### 1. Context API Usage

```
App
├── ThemeProvider          (UI theme)
├── TimerPaletteProvider   (Timer colors)
├── TimerOptionsProvider   (Timer settings)
├── PurchaseProvider       (Premium state)
└── [Dev] DevPremiumProvider (Mock premium)
```

**Status**: ✅ Clean separation, no over-engineering

### 2. Error Boundaries

```
App
└── ErrorBoundary (src/components/layout/ErrorBoundary.jsx)
    └── Screen components
```

**Status**: ✅ Implemented (was proposed in legacy M1-M2)

### 3. Freemium Architecture

```
config/activities.js     →  FREE: 4, PREMIUM: 14
config/timerPalettes.js  →  FREE: 2, PREMIUM: 13

hooks/usePremiumStatus.js  →  Central premium check
contexts/PurchaseContext.jsx  →  RevenueCat state

components/carousels/*  →  Show free items + "+" button
components/modals/*     →  Discovery/Premium modals
```

**Status**: ✅ Clean separation

### 4. Logging System

```javascript
// src/utils/logger.js
// Centralized logging with conditional output
// - DEV: Verbose
// - PROD: Errors only
```

**Status**: ✅ Implemented (was proposed in legacy audit)

---

## Critical Components

### useTimer Hook

**Location**: `src/hooks/useTimer.js`
**Tests**: `__tests__/hooks/useTimer.*.test.js`
**Criticality**: HIGH - Core timer logic

### TimerDial Component

**Location**: `src/components/dial/`
**Structure**:
- `TimeTimer.jsx` - Main orchestrator (timer logic + dial integration)
- `TimerDial.jsx` - Visual dial orchestrator
- `DialBase.jsx` - Static elements (graduations)
- `DialProgress.jsx` - Animated arc
- `DialCenter.jsx` - Emoji + pulse
- `ActivityLabel.jsx` - Activity emoji + label display
- `DigitalTimer.jsx` - Digital countdown display
- `timerConstants.js` - Dial modes and constants

### Onboarding Flow

**Location**: `src/screens/onboarding/`
**Version**: V2 (6-filter flow)
**Components**: `OnboardingFlow.jsx` + `Filter1-6.jsx`

---

## i18n Status

**Supported Languages**: 15
**Convention**: All visible text via `t()` hook

### Known Violations (P1)

| Component | Hardcoded Strings |
|-----------|-------------------|
| `DiscoveryModal.jsx` | CTA, dismiss text |
| `MoreActivitiesModal.jsx` | title, subtitle, tagline |
| `MoreColorsModal.jsx` | title, subtitle, tagline |
| `ActivityCarousel.jsx` | Toast messages |
| `PaletteCarousel.jsx` | Toast, accessibilityLabel |

**Tracking**: `src/i18n/TODO.md`

---

## Evolution from Legacy

### Implemented from Legacy Recommendations

| Recommendation | Source | Status |
|----------------|--------|--------|
| Error Boundaries | M1-M2 Architecture | ✅ Implemented |
| Logger centralized | M1-M2 Architecture | ✅ Implemented |
| Premium Context | M3 Code Audit | ✅ Implemented |
| useCallback/React.memo | M3 Code Audit | ❓ Partial |

### Still Pending

| Item | Source | Priority |
|------|--------|----------|
| React.memo on all components | M3 Code Audit | P2 |
| useCallback on all handlers | M3 Code Audit | P2 |
| Magic numbers extraction | M3 Code Audit | P2 |

---

## References

- **Audit Source**: `_internal/cockpit/knowledge/findings/2025-12-14_07-architecture.md`
- **Legacy Code Audit**: `_internal/docs/legacy/audits-AUDIT_PROPRE_CODE_2025.md`
- **Legacy Error Boundaries**: `_internal/docs/legacy/decisions-error-boundaries-architecture.md`
- **Theme System**: `_internal/docs/legacy/architecture-theme-management.md`

---

**Generated by**: Atlas/Claude-Architect (Phase 2)
**Date**: 2025-12-14
