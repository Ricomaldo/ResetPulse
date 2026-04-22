---
created: '2025-12-20'
updated: '2025-12-20'
status: active
report_type: architecture
scope: general-architecture
---

# Rapport d'Architecture Générale : ResetPulse

## 1. Vue d'ensemble

ResetPulse est une application React Native/Expo pour des timers visuels ciblant les utilisateurs neuroatypiques. L'architecture suit un pattern **Context-based State Management** avec persistence AsyncStorage et UI basée sur BottomSheet.

**Principes architecturaux:**
- Timer core logic isolé dans hooks (`useTimer`)
- Global state via Context API (6 contextes principaux)
- Component hierarchy: Screen → Zones (Dial/Aside) → Sub-components
- Persistence automatique des préférences utilisateur
- Deux écrans principaux: TimerScreen et OnboardingFlow

---

## 2. Fichiers Timer principal

### 2.1 Hooks Timer Core

| Fichier | Description |
|---------|-------------|
| **`/hooks/useTimer.js`** | **Core timer engine** - Gère: duration, remaining, running state, RAF/setTimeout hybrid pour foreground/background, completion callbacks, haptics, audio feedback, analytics tracking. Exports: {duration, remaining, running, progress, isCompleted, startTimer, stopTimer, resetTimer} |
| `/hooks/useTimerKeepAwake.js` | Garde écran allumé pendant timer via `react-native-keep-awake` |
| `/hooks/useNotificationTimer.js` | Background notifications via `react-native-notifee` |
| `/hooks/useSimpleAudio.js` | Sound playback pour completion feedback |

### 2.2 Screens/Components Principaux

| Fichier | Description |
|---------|-------------|
| **`/screens/TimerScreen.jsx`** | **Main app screen** - Wraps TimerOptionsProvider, manages: settingsModal, twoTimersModal, premiumModal, timerState (REST/RUNNING/COMPLETE), displayMessage computation. Orchestrates DialZone + AsideZone |
| **`/components/dial/TimerDial.jsx`** | **Visual dial component** - SVG-based dial with: progress arc, graduations, center display, drag interaction (Gesture API), long-press detection, animation hints |
| **`/components/dial/TimeTimer.jsx`** | **Timer wrapper** - Wraps useTimer hook, syncs with TimerOptionsContext, handles duration sync, exposes timerRef to parent |
| `/components/dial/dial/DialBase.jsx` | Background circle SVG |
| `/components/dial/dial/DialProgress.jsx` | Progress arc animation |
| `/components/dial/dial/DialGraduations.jsx` | Minute markers (0-60 graduation) |
| `/components/dial/dial/DialCenter.jsx` | Central display (time/emoji/color) |

### 2.3 Layout Zones

| Fichier | Description |
|---------|-------------|
| **`/components/layout/DialZone.jsx`** | **Portrait 62% container** - Centers TimeTimer, responsive height, landscape-aware |
| **`/components/layout/AsideZone.jsx`** | **BottomSheet 3-snap drawer** - Snap points: 15% (FavoriteToolBox), 38% (ToolBox), 90% (SettingsPanel). Includes MessageZone overlay for activity label |
| `/components/layout/aside-content/FavoriteToolBox.jsx` | **Snap 15%** - Renders favorite tool (commands/activities/colors/none) |
| `/components/layout/aside-content/ToolBox.jsx` | **Snap 38%** - All 3 tools (ControlBar + ActivityCarousel + PaletteCarousel) |
| `/components/layout/SplashScreen.jsx` | Loading screen during context initialization |

### 2.4 Services/Utils Timer

| Fichier | Description |
|---------|-------------|
| `/components/dial/timerConstants.js` | TIMER_SVG dims, TIMER_PROPORTIONS, COLORS palettes, getDialMode(scaleMode) |
| `/services/analytics/timer-events.js` | trackTimerStarted, trackTimerCompleted, trackTimerAbandoned |
| `/test-utils/timer-helpers.js` | Jest utilities pour testing useTimer |
| `/utils/haptics.js` | notification('success'/'warning'), timerStart() |

---

## 3. Fichiers Options de personnalisation

### 3.1 Settings UI Components

| Fichier | Description |
|---------|-------------|
| **`/components/settings/SettingsPanel.jsx`** | **Main settings container** - Snap 90% drawer content, renders all sections (General, Theme, Dial, Sound, etc.) |
| `/components/settings/SettingsCard.jsx` | Reusable card wrapper pour settings sections |
| `/components/settings/SectionHeader.jsx` | Section titles avec icons |
| `/components/settings/FavoritesActivitySection.jsx` | Toggle favorite activities (max 3) |
| `/components/settings/FavoritesPaletteSection.jsx` | Toggle favorite palettes (max 4) |
| `/components/settings/SelectionCard.jsx` | Option card avec visual selection state |
| `/components/settings/AboutSection.jsx` | Version, links, credits |
| `/components/settings/CardTitle.jsx` | Helper for section titles |

### 3.2 Settings Modals (détaillés)

| Fichier | Description |
|---------|-------------|
| `/components/modals/settings/SettingsGeneralSection.jsx` | Keep awake, sound toggle, pulse toggle |
| `/components/modals/settings/SettingsThemeSection.jsx` | Light/dark/system theme selection |
| `/components/modals/settings/SettingsDialSection.jsx` | Clockwise toggle, scale mode (25min, 60min, custom) |
| `/components/modals/settings/SettingsSoundSection.jsx` | Sound selection picker |
| `/components/modals/settings/SettingsCarouselBarSection.jsx` | Favorite tool selector (commands/activities/colors/none) |
| `/components/modals/settings/SettingsCommandBarSection.jsx` | Command timings (longPressConfirm, longPressStart, startAnimation) |

### 3.3 Pickers (Modal Controls)

| Fichier | Description |
|---------|-------------|
| `/components/pickers/DurationSlider.jsx` | Slider 1-90min, gradient background |
| `/components/pickers/SoundPicker.jsx` | Sound selection avec preview |
| `/components/pickers/EmojiPicker.jsx` | Emoji selection pour custom activities |
| `/components/pickers/PalettePreview.jsx` | 4-color palette preview grid |

### 3.4 Hooks Customization

| Hook | Usage |
|------|-------|
| `useCustomActivities()` | Read/create/edit custom activities |
| `usePremiumStatus()` | Check premium + override via DevPremiumContext |
| `usePersistedState(key, default)` | Async localStorage wrapper |
| `usePersistedObject(key, default)` | Multi-key persistence (TimerOptionsContext) |
| `useTranslation()` | i18n.t() wrapper |
| `useReducedMotion()` | Accessibility: reduce animations |
| `useModalNavigation()` | Stack modal navigation |

---

## 4. Fichiers Gestion des states globaux

### 4.1 Contextes Principaux

#### **TimerOptionsContext** (`/contexts/TimerOptionsContext.jsx`)
- **Responsabilité:** Core timer options persistence (21 propriétés)
- **Storage:** `@ResetPulse:timerOptions`
- **States:** shouldPulse, showDigitalTimer, showActivityEmoji, keepAwakeEnabled, clockwise, scaleMode, currentActivity, currentDuration, favoriteActivities, favoritePalettes, selectedSoundId, activityDurations, completedTimersCount, hasSeenTwoTimersModal, longPressConfirmDuration, longPressStartDuration, startAnimationDuration, showTime, interactionProfile
- **Helpers:** saveActivityDuration(), incrementCompletedTimers(), toggleFavoritePalette()

#### **TimerPaletteContext** (`/contexts/TimerPaletteContext.jsx`)
- **Responsabilité:** Timer color palette selection (separate from theme)
- **Storage:** `@ResetPulse:timerPalette`, `@ResetPulse:selectedColor`
- **States:** currentPalette, selectedColorIndex, paletteColors, timerColors
- **Config Source:** `/config/timer-palettes.js` (15 palettes, 2 free + 13 premium)

#### **UserPreferencesContext** (`/contexts/UserPreferencesContext.jsx`)
- **Responsabilité:** User interface preferences (which tool to show in snap 15%)
- **Storage:** `@ResetPulse:favoriteToolMode`
- **States:** favoriteToolMode ('activities', 'colors', 'commands', 'none')

#### **PurchaseContext** (`/contexts/PurchaseContext.jsx`)
- **Responsabilité:** RevenueCat IAP integration
- **Cache:** 24-hour TTL in AsyncStorage (`revenuecat_customer_info`)
- **States:** isPremium, isLoading, customerInfo, isPurchasing
- **Integration:** RevenueCat SDK, entitlements check

#### **ModalStackContext** (`/contexts/ModalStackContext.jsx`)
- **Responsabilité:** Modal stack navigation (FIFO)
- **States:** modalStack, navigation helpers (push, pop, popById, clear)

#### **ThemeProvider** (`/theme/ThemeProvider.jsx`)
- **Responsabilité:** Light/dark theme + color tokens
- **Storage:** `@ResetPulse:themeMode`

### 4.2 Config Files (Source of Truth)

| Fichier | Contenu |
|---------|---------|
| `/config/activities.js` | ACTIVITIES array: 1 basic + 4 free + 10 premium activities with metadata |
| `/config/timer-palettes.js` | TIMER_PALETTES object: 15 color palettes, getTimerColors() |
| `/config/sounds.js` | SOUNDS: all sound effect metadata |
| `/config/sounds-mapping.js` | Sound ID → require() mappings for import |
| `/config/revenuecat.js` | REVENUECAT_CONFIG, ENTITLEMENTS, PRODUCTS |
| `/config/test-mode.js` | DEV_MODE, DEV_DEFAULT_TIMER_CONFIG |
| `/config/snap-settings.js` | BottomSheet snap point heights (ADR-006) |
| `/config/activityMessages.js` | Activity ID → i18n message key mappings |

---

## 5. Hiérarchie des composants principaux

```
App (entry point, Route switching)
│
├── TimerScreen (Production app flow)
│   ├── TimerOptionsProvider [CONTEXT]
│   │   ├── SafeAreaView
│   │   │
│   │   ├── DialZone (62% height portrait, 100% landscape)
│   │   │   └── TimeTimer
│   │   │       └── TimerDial (SVG visual)
│   │   │           ├── DialBase (background circle)
│   │   │           ├── DialProgress (animated arc)
│   │   │           ├── DialGraduations (minute markers)
│   │   │           ├── DialCenter (time/emoji display)
│   │   │           ├── ActivityLabel (emoji + label)
│   │   │           └── [Gesture handlers: tap, drag, longPress]
│   │   │
│   │   ├── AsideZone (38% height portrait, hidden landscape) [BottomSheet]
│   │   │   ├── MessageZone (overlay: activity label + message)
│   │   │   │   └── DotsAnimation (for loading states)
│   │   │   │
│   │   │   └── BottomSheet (3 snap points)
│   │   │       ├── Snap 0 (15%) - FavoriteToolBox
│   │   │       │   └── [One tool based on favoriteToolMode]
│   │   │       │       ├── ControlBar (commands: play/reset/stop)
│   │   │       │       ├── ActivityCarousel (swipe activities)
│   │   │       │       └── PaletteCarousel (swipe colors)
│   │   │       │
│   │   │       ├── Snap 1 (38%) - ToolBox
│   │   │       │   └── All 3 tools visible
│   │   │       │       ├── ControlBar
│   │   │       │       ├── ActivityCarousel
│   │   │       │       └── PaletteCarousel
│   │   │       │
│   │   │       └── Snap 2 (90%) - SettingsPanel
│   │   │           ├── SettingsCard (General section)
│   │   │           ├── SettingsCard (Theme section)
│   │   │           ├── SettingsCard (Dial section)
│   │   │           ├── SettingsCard (Sound section)
│   │   │           ├── SettingsCard (Carousel section)
│   │   │           ├── SettingsCard (Command section)
│   │   │           └── SettingsCard (About section)
│   │   │
│   │   └── Modals (absolute positioned, behind contexts)
│   │       ├── TwoTimersModal (milestone: 2 timers completed)
│   │       └── PremiumModal (paywall)
│   │
│   └── [Providers wrapping TimerScreenContent]
│       ├── TimerPaletteProvider
│       ├── PurchaseProvider
│       ├── UserPreferencesProvider
│       └── ModalStackProvider
│
└── OnboardingFlow (First-time setup flow)
    └── [10 sequential filters]
        ├── Filter-010-opening.jsx
        ├── Filter-020-needs.jsx
        ├── Filter-030-creation.jsx
        ├── Filter-040-test.jsx
        ├── Filter-050-notifications.jsx
        ├── Filter-060-branch.jsx
        ├── Filter-070-vision-discover.jsx
        ├── Filter-080-sound-personalize.jsx
        ├── Filter-090-paywall-discover.jsx
        └── Filter-100-interface-personalize.jsx
```

---

## 6. Flux de données et dépendances

### 6.1 Timer State Flow

```
useTimer Hook (core engine)
    ↓
    [Maintains: duration, remaining, running, progress, isCompleted]
    ↓
TimeTimer Component
    ↓
    [Exposes: timerRef to parent (TimerScreen)]
    ↓
TimerScreen
    ↓
    [Reads timerRef for: start/stop/reset/progress]
    [Updates local: isTimerRunning, isTimerCompleted, timerState]
    ↓
    ├── DialZone [receives: onDialTap, onRunningChange]
    │   └── TimerDial [visual feedback]
    │
    └── AsideZone [receives: timerState, displayMessage, isCompleted]
        ├── MessageZone [activity label + status message]
        └── BottomSheet [ControlBar, ActivityCarousel, PaletteCarousel, SettingsPanel]
```

### 6.2 Activity Selection Flow

```
ActivityCarousel.onActivitySelect()
    ↓
TimerOptionsContext.setCurrentActivity()
    ↓
[Context state update]
    ↓
TimeTimer [dependency: currentActivity]
    ↓
useTimer [dependency: currentActivity for analytics/notifications]
    ↓
TimerDial [displays: currentActivity.emoji via ActivityLabel]
```

### 6.3 Palette Selection Flow

```
PaletteCarousel.onColorSelect()
    ↓
TimerPaletteContext.setColorIndex()
    ↓
[Context state update]
    ↓
TimeTimer [dependency: currentColor]
    ↓
TimerDial [displays: currentColor in progress arc + center]
```

### 6.4 Settings Persistence Flow

```
SettingsPanel.onSettingChange()
    ↓
TimerOptionsContext.updateValue() [async]
    ↓
usePersistedObject() [AsyncStorage write: @ResetPulse:timerOptions]
    ↓
[Persisted to device storage]
    ↓
[On app restart: TimerOptionsProvider loads from AsyncStorage]
```

### 6.5 Modal Stack Flow

```
ModalStackContext.pushModal(name, props)
    ↓
ModalStackRenderer [renders active modal]
    ↓
[BottomSheet appears with detached pattern]
    ↓
ModalStackContext.popModal() / closeAll()
    ↓
[BottomSheet closes with animation]
```

---

## 7. Hooks dépendances (Complete Map)

### Core Timer Hooks
- **useTimer()** ← depends on: TimerOptionsContext, TimerPaletteContext, useSimpleAudio, useNotificationTimer, analytics
- **useTimerKeepAwake()** ← uses react-native-keep-awake
- **useNotificationTimer()** ← uses react-native-notifee
- **useSimpleAudio()** ← uses react-native-sound

### Context Hooks
- **useTimerOptions()** ← TimerOptionsContext consumer
- **useTimerPalette()** ← TimerPaletteContext consumer
- **useUserPreferences()** ← UserPreferencesContext consumer
- **usePremiumStatus()** ← PurchaseContext consumer + DevPremiumContext override

### Data Persistence
- **usePersistedState(key, default)** ← AsyncStorage wrapper, returns [value, setValue, isLoading]
- **usePersistedObject(key, default)** ← Multi-key async persistence, returns {values, updateValue, isLoading}

### UI/UX Hooks
- **useTranslation()** ← i18n.t() wrapper
- **useAnalytics()** ← Mixpanel tracking
- **useScreenOrientation()** ← Portrait/landscape detection
- **useDialOrientation()** ← Dial-specific orientation logic
- **useReducedMotion()** ← Accessibility: motion preferences
- **useCustomActivities()** ← Custom activity CRUD
- **useModalNavigation()** ← Modal stack management
- **useAnimatedDots()** ← Loading animation state

### Performance/Debug
- **usePerformanceTracking()** ← FPS monitoring (dev only)

---

## 8. Intégrations externes

| Library | Usage | Context |
|---------|-------|---------|
| **@gorhom/bottom-sheet** | AsideZone BottomSheet 3-snap | Layout |
| **react-native-reanimated** | Animation engine (shared values, interpolations) | Dial, BottomSheet |
| **react-native-gesture-handler** | Gesture API for dial (tap, drag, longPress) | Dial interactions |
| **@react-native-async-storage** | Persistence layer | All contexts |
| **react-native-purchases** | RevenueCat IAP | PurchaseContext |
| **react-native-notifee** | Background notifications | Timer completion |
| **react-native-keep-awake** | Screen wake lock | Timer running |
| **i18n-js** | Translations (15 languages) | useTranslation hook |
| **react-native-sound** | Audio playback | useSimpleAudio |
| **Mixpanel** | Analytics tracking | useAnalytics |

---

## 9. Fichiers clés par fonction

### Timer Core
- `/hooks/useTimer.js` (445 lines) - Main logic
- `/components/dial/TimerDial.jsx` - Visual display
- `/components/dial/TimeTimer.jsx` - Wrapper component
- `/components/dial/timerConstants.js` - SVG dimensions + modes

### Options & Settings
- `/contexts/TimerOptionsContext.jsx` - Options persistence
- `/contexts/TimerPaletteContext.jsx` - Color persistence
- `/contexts/UserPreferencesContext.jsx` - UI preferences
- `/components/settings/SettingsPanel.jsx` - Settings UI
- `/components/modals/settings/*.jsx` - Settings sections

### Data Management
- `/config/activities.js` - Activity definitions
- `/config/timer-palettes.js` - Color palettes
- `/config/activityMessages.js` - Message mappings
- `/config/revenuecat.js` - IAP configuration

### State Management
- `TimerOptionsContext` (main timer options)
- `TimerPaletteContext` (colors)
- `UserPreferencesContext` (UI prefs)
- `PurchaseContext` (IAP status)
- `ModalStackContext` (modals)
- `ThemeProvider` (light/dark theme)

### UI Layout
- `/screens/TimerScreen.jsx` - Main screen
- `/components/layout/DialZone.jsx` - Dial container
- `/components/layout/AsideZone.jsx` - BottomSheet drawer
- `/components/layout/aside-content/FavoriteToolBox.jsx` - Snap 15%
- `/components/layout/aside-content/ToolBox.jsx` - Snap 38%

---

## 10. Statistiques architecturales

| Catégorie | Nombre |
|-----------|--------|
| **Contextes** | 6 (TimerOptions, TimerPalette, UserPreferences, Purchase, ModalStack, Theme) |
| **Hooks personnalisés** | 15 |
| **Screens** | 2 (TimerScreen, OnboardingFlow) |
| **Components** | 50+ (dial, layout, carousels, modals, controls, settings) |
| **Activities** | 15 total (1 basic, 4 free, 10 premium) |
| **Palettes** | 15 total (2 free, 13 premium) |
| **Sounds** | 6+ avec toggles |
| **Modals** | 7 (Premium, Discovery, MoreActivities, MoreColors, TwoTimers, CreateActivity, EditActivity) |
| **Settings Sections** | 7 (General, Theme, Dial, Sound, Carousel, Command, About) |
| **Onboarding Filters** | 10 sequential filters |
| **Languages** | 15 (i18n support) |

---

## 11. Notes importantes

1. **Timer Performance:** useTimer uses RAF (foreground) + setTimeout 1000ms (background) hybrid approach for battery efficiency
2. **State Isolation:** Each context is independent; no circular dependencies
3. **Persistence:** All user settings auto-persisted to AsyncStorage with key prefixing
4. **Freemium Model:** Premium check via usePremiumStatus() hook with RevenueCat + dev override
5. **ADRs Referenced:** ADR-007 (timer state machine: REST/RUNNING/COMPLETE), ADR-006 (BottomSheet), ADR-005 (UI snap points)
6. **Message System:** Activity-specific messages via explicit mappings in `/config/activityMessages.js`
7. **Accessibility:** Full screen reader support via AccessibilityInfo.announceForAccessibility()
8. **Onboarding:** Settings saved to AsyncStorage by onboarding flow, loaded by contexts on first app load

---

**Report Compiled**: 2025-12-20
**Scope**: Complete codebase exploration of ResetPulse src/
**Format**: Architecture diagram + dependency map + file reference guide
