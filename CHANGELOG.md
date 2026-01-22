---
created: '2025-12-14'
updated: '2026-01-22'
status: active
---

## [2.1.5] - 2026-01-22

### 🐛 Critical Bugfixes

#### Timer Core Logic (useTimer.js)
- **Fixed timer not ticking**: Timer now counts down properly on both iOS and Android
  - Root cause: Stale closure in `updateTimer` callback - state values (`startTime`, `duration`, `running`) were captured at creation time
  - Effect sequence bug: RAF/setTimeout called old version of `updateTimer` with `startTime=null` in closure
  - Solution: Migrated to refs pattern (`runningRef`, `startTimeRef`, `durationRef`, `remainingRef`) to avoid closure staleness
  - `updateTimer` now has empty dependency array `[]` and uses `.current` values (always fresh)

- **Fixed incorrect elapsed time tracking**: Stop/reset now report accurate elapsed seconds
  - `stopTimer` and `resetTimer` were using stale state values from closure
  - Migrated to refs: `durationRef.current - remainingRef.current`
  - Analytics now correctly track `elapsed_seconds` when timer is abandoned

- **Fixed premature notification cancellation**: Scheduled notifications no longer cancelled immediately after start
  - Cleanup effect had `cancelTimerNotification` in dependencies → re-triggered on every function recreation
  - Changed to empty deps `[]` with captured function reference (cleanup only on unmount)

### 📚 Technical Notes

**React Closure Pattern**: When a `useCallback` captures frequently-changing values (states/props) but is used in effects with stable dependencies (RAF, intervals), use refs to prevent stale closures:

```javascript
// ❌ Before: Callback recreated on every state change
const callback = useCallback(() => {
  // Uses state directly (stale in RAF closure)
}, [state, otherState]);

// ✅ After: Callback stable, always uses fresh values
const stateRef = useRef(state);
stateRef.current = state; // Sync every render
const callback = useCallback(() => {
  // Uses stateRef.current (always fresh)
}, []); // Never recreated
```

---

## [2.1.4] - 2026-01-16

### ✨ Visual & Animation Enhancements

#### PulseButton Second Hand Animation
- **Added rotating indicator**: Shows time passing with smooth animation during RUNNING state
  - Second hand (trotteuse) completes one rotation per minute (60s cycle)
  - Comet trail effect: 4 dots with decreasing size (100% → 80% → 60% → 40%) and opacity
  - Uses accent color (gold #D4A853) for visual coherence
  - Positioned on outer edge of button with `pointerEvents="none"` (doesn't block tap/long press)

#### PulseButton Long Press Visual
- **Changed progress circle color**: White → accent (gold) for consistency with second hand
- Background circle and animated progress both use `theme.colors.brand.accent`

#### Message Animation System
- **Breathing fade effect**: Message and dots pulse together during RUNNING state
  - Opacity range: 1.0 → 0.65 → 1.0 (35% variation, 3s cycle)
  - More visible than previous 15% variation
  - Synchronized with sequential dots animation
- **Sequential dots animation**: Redesigned for clearer progression
  - Pattern: 0 → 1 → 1+2 → 1+2+3 → pause → reset
  - 1 second between each state
  - 500ms hold at full state (1+2+3)
  - 1 second pause at empty state
  - Total cycle: ~5.7 seconds
- **Color refinement**:
  - Message text: `theme.colors.text` (charcoal #2D2520)
  - Dots: `theme.colors.brand.neutral` (taupe #A89B8F)

### 🎯 UX Improvements

#### Activity Change Protection
- **Block activity selection while timer running**: Prevents accidental changes during session
  - ActivityCarousel receives `isRunning` prop from parent components
  - Guard in `handleActivityPress` blocks tap when `isRunning === true`
  - Haptic warning feedback (`haptics.warning()`) on blocked attempt
  - Visual feedback: carousel dims to 50% opacity when disabled
  - Applies to both FavoriteToolBox (snap 18%) and ToolBox (snap 32%)

#### BottomSheet Gesture Handling
- **Improved scroll/swipe recognition**: Better distinction between vertical drawer swipe and horizontal carousel scroll
  - `activeOffsetY={[-10, 10]}`: Requires 10px vertical movement before capturing gesture
  - `failOffsetX={[-10, 10]}`: Releases gesture if 10px horizontal movement (for carousels)
  - `bounces` enabled only at snap 2 (90%) where Settings content scrolls
  - `overScrollMode="never"` on Android for cleaner UX
  - Fixes occasional scroll blocking at snap 2

#### ControlBar Layout
- **Removed background**: ToolboxItem no longer applies `surfaceElevated` background to `controlBar` variant
  - Digital timer now transparent, blends with drawer background
  - Cleaner visual hierarchy
- **Improved vertical spacing**: Added `marginTop: rs(16)` to push digital timer down slightly
  - Better visual balance in drawer

### 🐛 Bug Fixes

#### Component Prop Propagation
- **Fixed isRunning prop chain**: Properly flows from TimerScreen → AsideZone → SheetContent → FavoriteToolBox/ToolBox → ActivityCarousel/ControlBar
- **PropTypes consistency**: Added/updated PropTypes for all modified components

#### Notification Race Condition (CRITICAL)
- **Fixed orphaned notifications**: Resolved race condition causing "notifications from nowhere"
  - **Root cause**: `cancelTimerNotification()` could run before `scheduleTimerNotification()` finished setting the notification ID, leaving orphaned notifications
  - **Solution**: Promise-based synchronization ensures cancel WAITS for in-progress schedule to complete
    - Added `schedulingPromiseRef` to track in-flight schedule operations
    - Both schedule and cancel now enforce mutual exclusion via promise synchronization
    - Cancel always waits for schedule to complete before proceeding, ensuring notification ID is set
  - **Fixes scenarios**:
    - Rapid start → stop → start cycles
    - Component unmount during scheduling
    - Multiple rapid timer starts
    - Double-tap start button
  - **Files**: `src/hooks/useNotificationTimer.js`, `src/hooks/useTimer.js`
  - **Documentation**: See `_internal/docs/reports/notification-race-condition-fix.md` for comprehensive test matrix

#### Restart the Guide Button
- **Fixed non-functional button**: "Restart the guide" button in About section was not working
  - **Root cause**: `handleResetOnboarding` function was never propagated from App.js to SettingsPanel
  - **Solution**: Propagated `onResetOnboarding` prop through entire component chain:
    - App.js → AppContent → TimerScreen → AsideZone → SheetContent → SettingsPanel → AboutSection
  - Button now correctly resets onboarding state and returns user to onboarding flow
  - **Files**: `App.js`, `src/screens/TimerScreen.jsx`, `src/components/layout/AsideZone.jsx`

#### Onboarding Duration Button Width
- **Fixed layout overflow**: Only 4 duration buttons fit on one line instead of 5 in screen 030 (activity creation)
  - **Root cause**: Duration buttons had `minWidth: 70px`, too wide for 5 buttons
  - **Solution**: Reduced `minWidth` to 62px
  - Calculation: Screen width 375px - padding 32px - gaps 32px = 311px available / 5 buttons = 62.2px each
  - All 5 duration presets (5, 15, 30, 45, 60 min) now fit on one line
  - **Files**: `src/components/forms/CustomizeStep.jsx`

### 🌍 i18n Complete Audit & Cleanup (CRITICAL)

#### Audit Infrastructure
- **Created 10 automated scripts** for comprehensive i18n validation:
  - `01-extract-keys.js`: Extract static + dynamic i18n keys from code
  - `02-parse-locales.js`: Parse all locale JSON files to flat maps
  - `03-audit-sync.js`: Detect P0/P1/P2/P3 issues (missing, pollution, obsolete, duplicates)
  - `04-generate-report.js`: Generate baseline/validation markdown reports
  - `05-consolidate-duplicates.js`: Auto-consolidate duplicate keys
  - `06-backfill-locales.js`: Backfill incomplete locales with EN placeholders
  - `07-cleanup-obsolete-keys.js`: Remove dead keys from all locales
  - `08-cleanup-backfilled-obsolete.js`: Clean extra obsolete keys from backfilled locales
  - `09-restore-missing-keys.js`: Restore accidentally deleted keys
  - `10-restore-all-missing-keys.js`: Emergency restoration script
- **Added npm scripts**: `i18n:audit`, `i18n:extract`, `i18n:parse`, `i18n:consolidate`, `i18n:backfill`, `i18n:cleanup`
- **Comprehensive reports**: Baseline and validation reports in `_internal/docs/audits/audit-2026-01-16/`

#### Extraction Regex Fix (CRITICAL)
- **Fixed key extraction pattern**: Regex only captured `t('key')` but missed `t('key', {params})`
  - **Old regex**: `/\bt\((['"\`])([^'"\`]+)\1\)/g`
  - **New regex**: `/\bt\((['"\`])([^'"\`]+)\1(?:,|\))/g`
  - Now correctly captures both `t('key')` and `t('key', {params})`
  - Prevented deletion of 14 actively-used keys with parameters

#### Locale Cleanup & Synchronization
- **Removed 220 obsolete keys** across all 15 locales (1,480 total removals)
  - Code coverage improved: 56% → 100% (286/286 keys used)
  - Reduced locale file sizes by ~44% (496 → 300 keys in FR/EN)
- **Backfilled 13 incomplete locales** from 43-55% to 100%:
  - ES, DE, IT, PT, RU, NL, JA, KO, ZH-Hans, ZH-Hant, AR, SV, NO
  - Added 1,861 keys total with EN placeholders
  - Professional translation plan documented: `_internal/docs/guides/i18n-translation-plan.md`
- **Fixed P1 locale pollution** (20 real issues):
  - EN: `accessibility.colorNumber`, `accessibility.discoverMorePalettes`, `discovery.*`
  - ES/DE/IT/PT: Discovery modal strings corrected

#### Critical Keys Restored
**14 keys with parameters** (initially deleted due to regex bug):
- `accessibility.unlockPremium` (with price)
- `accessibility.activity` (with name)
- `accessibility.colorNumber` (with number)
- `accessibility.paletteItem` (with name)
- `accessibility.timer.activityCompleted` (with activity)
- `accessibility.timer.activityStarted` (with activity)
- `accessibility.timer.dial` (with minutes, activity)
- `controls.digitalTimer.durationLabel` (with time)
- `controls.digitalTimer.timeLabel` (with time)
- `customActivities.edit.usageStats` (with count)
- `notifications.reminder.day3.bodyPersonalized` (with name, emoji, duration)
- `premium.price` (with price)
- `settings.favorites.activities.description` (with count)
- `settings.favorites.palettes.description` (with count)

**24 onboarding.intentions keys** (entire section restored):
- Persona labels: `relax`, `work`, `create`, `learn`, `move`, `other` (each with label + defaultName)
- Question 1 options: `focus`, `launch`, `breathe`, `children`, `other`
- Question 2 options: `starting`, `finishing`, `staying`, `managing`, `other`
- **Root cause**: Cleanup script missed template literal patterns used in persona mapping
- **Fix**: Restored from backup for FR/EN, copied EN structure to 13 backfilled locales

#### Final State
- ✅ **All 15 locales: 300 keys each** (100% synchronized)
- ✅ **P0 (missing keys): 0**
- ✅ **P2 (obsolete keys): 0**
- ✅ **Code coverage: 100%** (286/286 keys used)
- ✅ **Onboarding fully functional** (all persona screens working)
- ⚠️ **P1 (locale pollution): 69** (false positives - cognates like "Yoga", "Sport")
- ⚠️ **P3 (duplicate values): 3** (acceptable redundancy)

#### Documentation
- **Audit reports**: `_internal/docs/audits/audit-2026-01-16/`
  - Baseline report (initial state: P0=0, P1=85, P2=218, P3=43)
  - Validation report (final state: P0=0, P1=69, P2=0, P3=3)
  - Final summary with complete audit cycle
- **Translation plan**: `_internal/docs/guides/i18n-translation-plan.md`
  - 3-phase approach: Professional (ES/DE/IT/PT) → DeepL (RU/NL/JA/KO/ZH) → Community (AR/SV/NO)
  - Cost estimate: $1,498-$2,112 total

### 📦 Version Updates
- **Version**: 2.1.4
- **Android versionCode**: 25 (bumped from 24)
- **versionName**: 2.1.4
- Synchronized across package.json, app.json, build.gradle, and AboutSection

---

## [2.1.2] - 2026-01-15

### 🐛 Critical Bug Fix

#### Dial Drag Gesture Restored
- **Fixed broken dial drag**: Drag gesture was completely broken after implementing dead zone for PulseButton conflict
  - **Root cause**: Attempted to modify `isDragValid` SharedValue from JS thread (via `runOnJS` callback)
  - **Solution**: Moved dead zone distance calculation into `panGesture.onStart` worklet where SharedValue modification is allowed
  - SharedValues can only be modified in worklet context (UI thread), not from JS callbacks
  - Dial drag now works correctly while still protecting PulseButton (38% center dead zone)
  - All gesture interactions restored: drag arc, tap graduations, tap center button

### 📦 Version Updates
- **Android versionCode**: 23 (previously 22 in production)
- **versionName**: 2.1.2
- Synchronized across package.json, app.json, and build.gradle

---

## [2.1.1] - 2026-01-15

### 🎯 Scale & Duration Control Improvements

#### Double Tap Preset System
- **Replaced long press with double tap**: More discoverable and intuitive interaction
  - **1st tap**: Set duration (auto-reset to 60min scale if duration > current scale)
  - **2nd tap (within 400ms)**: Force scale to optimal for that duration
  - **Visual feedback**: Orange pulsing border during double-tap window (400ms)
  - **Escape hatch**: Double tap on already-active preset resets scale to 60min
  - New button variants: `selection-pulse` (animated border) and `selection-border` (scale indicator)
  - Removed hint system (pulse animation provides affordance)

#### Universal 60min Scale Reset
- **Auto-scale behavior change**: Duration > current scale now resets to 60min (not optimal scale)
  - Rationale: 60min = universal mental model (clock face), more predictable
  - User can still force optimal scale with double tap
  - Applied to PresetPills, ActivityCarousel, and custom activity creation

#### Auto-Scale for Activities
- **ActivityCarousel**: Auto-reset to 60min when selecting activity with duration > current scale
- **Custom activities**: Auto-reset to 60min when creating activity with duration > current scale
- Consistent behavior across all duration selection methods

#### Visual State System (4 states)
- **Neutral** (`selection`): Neither duration nor scale active
- **Duration active** (`accent`): Orange background when duration matches preset
- **Double-tap window** (`selection-pulse`): Orange animated border (400ms)
- **Scale active** (`selection-border`): Blue border when scale matches preset (but duration doesn't)

### 🐛 Bug Fixes

#### BottomSheet Snap Blocking
- **Fixed direct snap jumps**: Prevented 0→2 and 2→0 jumps using `onAnimate` callback
  - Previous `onChange`-based approach caused visual glitch (sheet animating to snap2 then retracting)
  - Now intercepts BEFORE animation starts, forcing stop at snap1 (38%)
  - Smoother, more controlled drawer behavior

#### Gesture Conflicts
- **Fixed dial drag/PulseButton conflict**: Increased center dead zone from 35% to 45%
  - Dial drag now ignores touches in center zone (protects PulseButton)
  - Added `isDragValid` SharedValue for gesture validation
  - PulseButton interaction no longer triggers dial drag

#### Snap Point Sizing
- **Improved affordance**: Snap point 0 increased from 15% to 18%
- **PresetPills size**: Always medium for better tap targets (removed compact mode)
- **Container heights**: Adjusted for better visual hierarchy

#### Haptics API
- **Fixed PresetPills haptics**: Corrected method names (`selection()` not `selectionHaptic()`)
  - Used correct HapticManager instance methods throughout

### 📝 Architecture & Code Quality

#### New Helper: scaleHelpers.js
- Centralized scale utilities: `getOptimalScale()`, `scaleToMode()`, `modeToScale()`
- DRY principle: Removed duplicate scale logic from PresetPills and ControlBar
- Simplified to 5 active scales: [5, 15, 30, 45, 60] minutes

#### Button Variants Extension
- Added `selection-pulse` variant with opacity pulse animation (0.8 ↔ 1, 400ms loop)
- Added `selection-border` variant for scale indicator (blue border)
- Pulse auto-starts/stops based on variant change

#### Code Cleanup
- Removed unused hint/toast system from PresetPills (replaced by pulse animation)
- Removed long press handlers (replaced by double tap)
- Cleaned up imports (Text, Animated, fontWeights, rs no longer needed)

### 📋 Files Changed
- `src/styles/buttonStyles.js`: New variants (selection-pulse, selection-border)
- `src/components/buttons/IconButton.jsx`: Pulse animation implementation
- `src/components/controls/PresetPills.jsx`: Double tap logic, removed hint system
- `src/components/carousels/ActivityCarousel.jsx`: Auto-scale to 60min
- `src/components/layout/AsideZone.jsx`: onAnimate snap blocking
- `src/components/dial/TimerDial.jsx`: Increased dead zone to 45%
- `src/components/dial/timerConstants.js`: CENTER_ZONE_RATIO 0.35 → 0.45
- `src/utils/scaleHelpers.js`: **NEW** - Centralized scale helpers
- `_internal/docs/decisions/ADR-011-auto-scale-duration-selection.md`: **NEW** - Auto-scale architecture decision

---

## [2.1.0] - 2026-01-13 (Previous Release)

### 🎨 UI/UX Improvements

#### Activity Creation & Editing
- **Simplified emoji picker**: Replaced emoji grid with native keyboard access
  - Removed 18-emoji grid from `CreateActivityForm` and `EditActivityModalContent`
  - Direct access to system emoji keyboard for unlimited emoji selection
  - Cleaner, more intuitive interface with single tap-to-select button
  - Better mobile-native experience (iOS/Android)

#### Visual Enhancements
- **Enlarged activity emoji in timer dial**: Increased from 32px to 48px (+50%)
  - Significantly improved visibility and readability
  - Better visual hierarchy for neuroatypical users (TDAH/TSA)
  - Emoji now serves as primary visual anchor
- **Refined dial center background**: Reduced opacity to 85% (D9 hex)
  - Subtle transparency improves emoji contrast
  - Lighter, more modern aesthetic
  - Applied to all button states (rest/running/complete) and halos

#### Palette Carousel Behavior
- **Disabled auto-selection on scroll**: Colors now activate only on tap
  - Prevents accidental color changes while browsing palettes
  - More deliberate, controlled user interaction
  - Infinite carousel loop still functional (premium mode)

#### i18n Improvements (French)
- Fixed missing accents in activity creation/editing UI
  - "Creer" → "Créer", "activite" → "activité"
  - "Duree par defaut" → "Durée par défaut"
  - "Apercu" → "Aperçu"

### 🐛 Bug Fixes

#### Critical Message Display Fix
- **Fixed activity message persistence bug**: Messages now display correctly when changing activities
  - Root cause: BottomSheet snap change was clearing messages
  - Root cause: Flash activity overlay was hiding messages instead of overlaying
  - Solution 1: Removed `onSnapChange` message clearing (TimerScreen.jsx:217)
  - Solution 2: Flash now overlays messages with 20% opacity background (MessageContent.jsx:338)
  - Messages remain visible and synchronized throughout all interactions

#### Message Synchronization
- **Improved flashActivity handling**: Messages update immediately with new activity
  - Fixed stale `currentActivity` reference in message computation
  - Flash activity now directly used for message calculation
  - Eliminated timing issues between state updates

### 📝 Files Changed
- `locales/fr.json`: Fixed accents (8 strings)
- `src/components/forms/CreateActivityForm.jsx`: Native emoji picker
- `src/components/modals/EditActivityModalContent.jsx`: Native emoji picker
- `src/components/buttons/PulseButton.jsx`: Emoji 48px + 85% opacity
- `src/components/carousels/PaletteCarousel.jsx`: Disabled auto-scroll selection
- `src/screens/TimerScreen.jsx`: Removed message clearing, fixed flashActivity sync
- `src/components/layout/AsideZone.jsx`: Removed onSnapChange callback
- `src/components/messaging/MessageContent.jsx`: Flash overlay instead of replacement

---

## [2.1.0] - 2026-01-13

### 🚀 Onboarding V2.1 - Complete Refactor

Major overhaul of the onboarding experience with a new linear 7-step flow optimized for conversion and user engagement.

#### New Onboarding Flow (ADR-010)
- **Filter-010-opening**: Breathing logo animation, tap to continue (ADHD-friendly, no auto-advance)
- **Filter-020-tool**: Tool selection with 4 options (Commandes, Presets, Dial, Tout)
- **Filter-025-intentions**: Q1 (intentions) + Q2 (challenges) for user profiling
- **Filter-030-creation**: Custom activity creation with emoji picker + intention mapping
- **Filter-060-sound**: Sound selection with preview (simplified, plays sound's own emoji)
- **Filter-070-notifications**: Improved copy for higher acceptance rate + immediate permission request
- **Filter-080-launch**: New launch screen replaces paywall (CTA: start timer immediately)

#### Removed Filters
- **Filter-040-test-start**: Removed (unnecessary friction)
- **Filter-050-test-stop**: Removed (unnecessary friction)
- **Filter-090-summary**: Removed (replaced by Filter-080-launch)

#### Sound System Overhaul
- Renamed sounds for emotional resonance (e.g., `bowl_tibetan` → `apaisement`)
- Sound preview shows sound's own emoji, not activity emoji
- Simplified sound selection UI

#### Post-Skip Reminder Notifications (Phase 5)
- Day 3 reminder: "Ton moment t'attend" with pre-selected activity
- Day 7 reminder: Opens paywall for conversion
- Smart scheduling based on skip date

#### Architecture Improvements
- **Config-driven flow**: FILTERS array with Component + needsData props
- **Standardized layouts**: OnboardingLayout with sticky titles in scrollable content
- **Design tokens**: All filters use spacing/typography tokens, no hardcoded values
- **BrandLogo component**: Real PNG logo for visual continuity (splash → onboarding)

#### i18n Improvements (15 languages)
- Filter-025: Natural wording for Q1/Q2 titles and choices
- Filter-030: Generic CTA "Créer mon moment" instead of intermediate name
- Filter-070: Rewritten copy for higher notification acceptance
- Fixed `%{variable}` interpolation syntax across all locales

---

### 📊 Analytics & Attribution

#### Added
- **Apple Search Ads Attribution Service**
  - New `src/services/attribution.js` for ROAS tracking
  - Integrates `@hexigames/react-native-apple-ads-attribution` SDK
  - Fetches attribution data on first iOS launch via AdServices API
  - Registers super properties: `source`, `asa_campaign_id`, `asa_attributed`, etc.
  - Graceful fallback to "organic" for Android/errors

- **Onboarding Analytics Events**
  - `onboarding_started`, `onboarding_completed`, `onboarding_abandoned`
  - `onboarding_step_viewed`, `onboarding_step_completed`
  - `tool_selected`, `creation_started`, `creation_completed`

---

### 🔧 Bug Fixes

#### Critical Fixes
- **Blank screen on app start**: Removed fade animation causing render issues
- **OB → App data persistence broken**: Fixed unified config save/load
- **Cyclical structure error**: Guard against React Native events in stepData
- **Timer completion bug**: Fixed notification cancellation on stop

#### Onboarding Fixes
- **Filter-010**: Removed auto-advance (ADHD-friendly)
- **Filter-020**: Logo replaced with emoji in dial preview
- **Filter-030**: Use intention label as default name, not hardcoded `defaultName`
- **Filter-060**: Sticky title in scrollable layout
- **Filter-070**: Request permission immediately after explanation
- **DevFab**: Fixed app navigation compatibility with unified config

#### Test Suite
- Deleted obsolete `onboardingConstants.test.js` (module removed)
- Deleted obsolete `OnboardingFlow.test.js` (V3 flow tests)
- Fixed `StepIndicator.test.js` mock path
- Updated `useTimer.test.js` to match current behavior
- All 161 tests pass

---

### 🔧 Settings & UX Improvements

#### Fixed
- **SettingsPanel content restored** after accidental deletion in cleanup commit
- **Premium favorites sections** now display correctly (prop drilling fixed)
- **FavoritesActivitySection grid**: 4 columns layout fixed (21% width)

#### Changed
- **Persona descriptions**: Functional instead of psychological
  - Old: "Je démarre vite, j'ai besoin de freiner"
  - New: "Démarrage rapide · Arrêt maintenu"
- **Pulse animation**: Epilepsy warning Alert on enable
- **PresetPills**: Disabled auto-scale adaptation
- **FitButton**: Added CircleGaugeIcon for scale adapter

#### i18n Migration
- SettingsPanel: 13+ strings migrated to `settings.*` keys
- FitButton: Label + accessibility migrated
- DigitalTimer, CircularToggle, PresetPills: Accessibility labels migrated
- PurchaseContext: Error messages migrated

---

### 📦 Technical

- **DEV_MODE**: Set to `false` for production
- **version-bump.js**: Fixed obsolete references
- **Cleanup**: Removed orphan filter files (040, 050, 090)

---

## [Unreleased - Current Sprint]

### 🔧 Provider Migration Completion + Bug Fixes (2025-12-21)

#### Fixed
- **ControlBar PulseButton Stop Button Not Working**
  - Added missing `onLongPressComplete` callback to PulseButton
  - Stop action now correctly routed based on interaction profile settings
  - Both simple mode (tap) and sophisticated mode (long press) now functional

- **MessageZone Not Displaying**
  - Removed overly restrictive condition that excluded 'none' activity
  - Messages now display for all activities including default 'none'
  - Message animations work correctly on app startup

#### Completed
- **Provider Migration Finalized**
  - 3 separate contexts (TimerOptions, TimerPalette, UserPreferences) consolidated into single TimerConfigContext
  - All 18 consuming files updated with proper namespaced destructuring
  - Zero deprecated hooks remaining (all old context references removed)
  - Verified: App.js using unified TimerConfigProvider in dev + production paths

---

### 🎨 UI/UX Review + Color System Refactor (2025-12-20)

#### Changed
- **Brand Color Palette Refined**
  - Primary (Coral): #C17A71 (consistent across light + dark modes)
  - Secondary (Neutral Gray): #78716C (improved contrast, better legibility)
  - Accent (Golden): #D4A853 (richer gold for visual warmth)
  - Dark mode primary now matches light for maximum brand cohesion

- **Color Tokens Hierarchy Established**
  - Screen backgrounds: `background` (#ebe8e3 cream)
  - Card surfaces: `surface` (#FFFFFF white)
  - Modal/elevated: `surfaceElevated` (#F8F6F3)
  - Systematically applied across 25+ components

- **Component Color Updates**
  - ActivityItem: buttons now use `surfaceElevated` for visibility
  - SelectionCard: ghost style with secondary/accent borders
  - SettingsCard/Panel: proper elevation hierarchy
  - SectionHeader: enhanced with coral primary, uppercase, bold
  - All Favorites sections: consistent `surfaceElevated` backgrounds

- **Timer Palettes Harmonized**
  - Palette 1 (Serenity): now uses system brand colors
  - Palette 2 (Earth): natural tones harmonized with cream background

- **Acceleration Optimization (DigitalTimer)**
  - Long-press increment phases compressed for faster responsiveness
  - Intervals: 60ms → 40ms → 25ms → 15ms (aggressive acceleration)
  - User reported manual +/- too slow, now provides immediate feedback

#### Technical Improvements
- colors.js condensed by 38% while preserving DEBUG_MODE logic
- Consistent theme token usage across 37 modified files
- Proper visual hierarchy in nested surfaces (screens < cards < modals)

#### Quality Assurance
- Non-modified files inventory created for dead code audit
- 98 stable files documented for future inspection
- Dark mode tested and verified

---

### 📦 2-Level Drawer Architecture (Options + Settings Modal)

#### Added
- **Simplified Options Drawer (Level 1)**
  - 3 core sections: Couleur, Activité, Échelle
  - Discrete "Réglages" button at bottom
  - Reduced cognitive load vs dual-state expandable drawer
  - Drawer closes automatically when settings opens

- **Separate Settings Modal (Level 2)**
  - Existing SettingsModal.jsx powers this
  - All advanced options: Sons, Thème, Haptics, Minimal Interface, Scale Modes
  - Independent modal architecture (not nested in drawer)
  - Full-featured settings experience without drawer limitations

- **Handle Styling (iOS Standard)**
  - 36px width × 4px height
  - Border color (light gray)
  - 2px borderRadius
  - Centered positioning

#### Changed
- ExpandableDrawerContent now pass-through to OptionsDrawerContent
- Removed complexity of nested ScrollView + dual state
- Settings button is now primary access point to advanced options
- No more "expand drawer" to see more settings

#### Benefits
1. Clearer mental model: Drawer = quick options, Modal = settings
2. Less scrolling in main interface
3. Better UX alignment with mobile standards (Gmail, Maps, etc)
4. Reduced complexity in drawer state management

---

### 🎯 Scale/Duration Separation + UI Clarity

#### Added
- **Dial scale and timer duration now separate concerns**
  - Tap preset button = change **scale only**, preserve duration (capped if needed)
  - Example: 3 min on 60-scale → tap "5" → 3 min stays on 5-scale
  - Example: 45 min on 60-scale → tap "5" → capped to 5 min on 5-scale
  - Drag on dial = adjust duration (within current scale)
  - Reset = restore initial duration

- **Improved UX terminology & visual feedback**
  - "Taille du cadran" → "Cadran" (more concrete, less cryptic)
  - Display current duration below preset pills
  - Format: "Durée · MM:SS" (monospace, updates in real-time)
  - User always sees both scale and duration simultaneously
  - No more "what does this button do?" confusion

#### Technical Details
- PresetPills now passes scale mode + preset minutes to parent
- TimerScreen calculates capped duration intelligently
- Scale updates via setScaleMode in TimerOptionsContext
- Duration updates independent of scale selection

#### Behavior Table
```
Action          | Scale        | Duration
Tap preset      | ✅ change    | ✅ preserve (cap)
Drag dial       | –            | ✅ adjust
Long-press      | –            | ✅ reset
Change activity | –            | ✅ per-activity
```

---

# Changelog

All notable changes to ResetPulse will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2025-12-15

### ✨ Phase 2 Complete — Production Release (P0 Blockers Eliminated)

**Major Release**: Accessibility, UX/Conversion, and Test Coverage overhaul

#### 🎯 P0 Blockers Addressed (14/14)

##### Phase 2A: Accessibility (WCAG AA)
- ✅ **A1**: 8 modals fully accessible (PremiumModal, DiscoveryModal, MoreActivities, MoreColors, Settings, CreateActivity, EditActivity, TwoTimers)
  - Added `accessibilityRole="dialog"`, `accessibilityViewIsModal={true}`, labels + hints
  - 23 i18n accessibility keys
- ✅ **A2**: 44pt touch target minimum on 90%+ interactive elements (buttons, sliders, carousel)
- ✅ **A3**: Timer dial fully accessible with live region announcements, dynamic roles, custom swipe actions
  - 11 i18n accessibility keys
- ✅ **A4**: Color contrast fixed (#e5a8a3 → WCAG AA compliant)

##### Phase 2B: UX/Conversion Pipeline
- ✅ **U1-U5**: DEV_MODE, AsyncStorage persistence, RevenueCat paywall integration, onboarding progress bar, error recovery
- ✅ **U6**: Modal stacking context (ModalStackContext + ModalStackRenderer) for nested navigation

##### Phase 2C: Test Coverage (Pragmatic Suite)
- ✅ **239/239 tests passing (100%)**
- 26 component smoke tests (7 files)
- 213 core tests (14 files: hooks, contexts, screens, units, configs)
- 0 linting errors in explorer

#### 🚀 Additional Improvements (Phase 4)
- Performance: 86 useEffects → 69, memoization coverage 13% → 69%, RAF 60Hz timer
- Design system: Typography tokens, hardcoded emojis removed
- UX: Lock indicators, labels fixed, back button, premium section, deferred permissions

#### 📦 Release Ready
- Jest suite 100% passing
- Clean git history (17 commits)
- .gitignore updated (coverage/ excluded)
- Production v2.0.0 candidate

---

## [Unreleased]

### 🔍 Quality Assurance - 10 Audits Post-Refacto Completed (100%)

**Date**: 2025-12-14
**Status**: ✅ MISSION COMPLETE
**Scope**: Architecture, Code Quality, Performance, Security, Test Coverage, Accessibility, UX/Conversion, Design System, Analytics, Premium Integration

#### Audit Results Summary

**Completed Audits** (10/10):
1. **Architecture Review** (98%, A+) - ADR-01 compliance, naming conventions, folder structure
2. **Code Quality** (85%, B) - ESLint setup, empty catch blocks, console logging
3. **Performance** (80%, B-) - Bundle size, runtime profiling, memory leaks
4. **Test Coverage** (53%, D+) - 65.7% statement coverage, 178 passing tests
5. **Security** (88%, B+) - npm audit clean, credentials secure, HTTPS enforced
6. **Design System** (78%, C+) - Color tokens 95%, Button Component created
7. **Accessibility** (58%, F) - WCAG 2.1 AA partial compliance
8. **Analytics** (✅ validated) - Mixpanel implementation complete
9. **UX/Conversion** (72%, C) - Onboarding flow, freemium UX, conversion triggers
10. **Premium Integration** (87%, B+) - RevenueCat SDK, purchase flow, freemium gating

#### Critical Security Wins

- ✅ **P0 RESOLVED**: All hardcoded credentials migrated to `.env` file
- ✅ **npm audit CLEAN**: 0 vulnerabilities (was 5)
- ✅ **RevenueCat API keys secure**: Server-first validation with cache fallback
- ✅ **HTTPS enforced**: All network calls secure
- ✅ **OWASP Top 10**: 95% compliant

#### Production Readiness Assessment

**✅ Production Ready**:
- Security (all P0 issues resolved)
- Premium Integration (after 5min P1 analytics fix)

**⚠️ NOT Production Ready**:
- Accessibility: 58% WCAG AA compliance (18-22h P0 fixes required)
  - Modals inaccessible to screen readers
  - Touch targets <44pt violations
  - Timer dial not accessible
  - Color contrast failures
- UX/Conversion: 6 P0 blockers (13-20h fixes required)
  - Filter 090 paywall broken (no RevenueCat purchase integration)
  - DEV_MODE enabled in production code
  - AsyncStorage blocks app launch
  - Purchase error recovery missing
  - Onboarding progress indicator missing
  - Modal stacking creates UX deadlock
- Test Coverage: 0% component/screen/integration tests (3-5 days)

#### Design System Improvements

- ✅ **Button Component created**: 4 variants (Primary, Secondary, Tertiary, Destructive)
  - Eliminated ~150 lines of duplication
  - Focus indicators on 85% of buttons
  - Consistent styling across app
- ✅ **Color tokens**: 295 usages across 43 files (95% adoption)
- ✅ **Spacing system**: Golden ratio scale (90% adoption)
- ✅ **Palette system**: 15 palettes well-organized

#### Continuous Improvement Loop Validated

**Methodology**: V1 baseline audit → dev-ops fixes → V2 validation audit → delta analysis

**Premium Integration Example**:
- V1 found: 2 P0 security issues (hardcoded API keys, no server validation)
- Fixes applied: Keys moved to `.env`, server-first validation implemented
- V2 validated: All fixes working, +5 points score improvement (82% → 87%)
- V2 discovered: 4 new minor issues (1 P1, 3 P2)

**Result**: Production readiness upgraded from "CRITICAL NO" to "YES"

#### Audit Reports Location

All audit reports available in:
- `_internal/cockpit/knowledge/findings/2025-12-14_NN-audit-name.v2.md`
- V1 baselines: `2025-12-14_NN-audit-name.md`
- V2 validations: `2025-12-14_NN-audit-name.v2.md`

#### Next Steps

- [ ] Fix P0 Accessibility issues (18-22h)
- [ ] Fix P0 UX/Conversion blockers (13-20h)
- [ ] Implement component/screen/integration tests (3-5 days)
- [ ] Fix P1 Premium Integration analytics method (5min)
- [ ] Fix P0 Design System DestructiveButton crash (5min)

---

### 🎨 UX Revolution - Bottom Drawer & Scale Modes

#### Added
- **Scale mode 45 minutes** - Nouveau mode cadran pour sessions focus étendues
  - Ajout du mode '45min' dans DIAL_MODES
  - Traductions FR/EN pour dialMode45
  - Mode par défaut aligné avec durée par défaut (45min)

- **6 presets de durée** sur 2 lignes - Accès rapide à toutes les échelles
  - 1, 5, 10, 25, 45, 60 minutes
  - Layout en grille 3x2 sur toute la largeur
  - Sélection automatique du scale mode approprié

#### Changed
- **Drawer d'options du haut → bas** - Geste naturel de swipe UP
  - Direction inversée pour meilleure ergonomie
  - Swipe UP depuis l'écran principal pour ouvrir les options
  - Hauteur optimisée à 50% de l'écran

- **Simplification du drawer** - Focus sur l'essentiel
  - Settings → Modal au lieu de drawer imbriqué
  - Icône settings en coin haut-droit du drawer
  - Ordre optimisé: Couleur → Activité → Durée

- **Style presets amélioré** - Cohérence avec onboarding
  - BorderRadius plus carré (lg au lieu de xxl)
  - Style identique à Filter2Creation
  - Pills qui s'étendent sur toute la largeur (flex: 1)

#### Fixed
- **Bug layout ActivityCarousel** - Espacement vertical corrigé
  - Suppression de `height: "100%"` qui causait l'étirement
  - Carrousel prend maintenant sa hauteur naturelle
  - Drawer content bien espacé et scrollable

### ⏱️ Timer Affordances & Intelligent Gesture Handling

#### Added
- **Play/Pause button in dial center** - Affordance visuelle pour interaction immédiate
  - Icon Ionicons: play (repos), pause (running), refresh (completed)
  - Couleur corail (brand.primary), 36px circle with 2px border at 50% opacity
  - Affichage conditionnel: emoji > pulse > button (priorité hiérarchique)
  - Bouton s'affiche quand: emoji désactivé ET timer au repos

- **Border styling** - Feedback visuel amélioré
  - PlayPauseButton: 2px border primary à 50% d'opacity (56px diameter)
  - DigitalTimer: 2px border identique pour cohérence
  - Améliore l'affordance et la visibilité de ces éléments interactifs

- **Reset timer via long-press** - Réinitialisation intuitive
  - Long-press (500ms) n'importe où sur le dial → reset
  - Restaure la durée initiale (pas 0)
  - Feedback haptique (selection pulse)
  - Fonctionne sur PlayPauseButton ET sur toute la surface du dial

- **Drawer expansion zone** - Smart gesture detection
  - Expansion trigger limitée à zone du handle (80px du haut)
  - Prévient l'expansion accidentelle du contenu
  - Collapse fonctionne partout (comportement standard)
  - ScrollView conflict resolution maintenue

- **Activity carousel navigation arrows** - Affordance de scroll bidirectionnel
  - Flèches chevron (← →) visibles seulement si scrollable
  - Auto-hide au début/fin du carousel
  - Smooth 100px scroll animation
  - 44pt touch targets (WCAG AA)
  - Haptic feedback sur interaction

#### Changed
- **Timer dial long-press detection** - Gesture-wide support
  - Implémentation dans PanResponder pour couverture complète
  - Distinction tap (<200ms) vs long-press (>=500ms) via timeDelta
  - Mouvement minimal required (<10px) pour éviter les faux positifs

- **useTimer.js resetTimer()** - Comportement amélioré
  - Restaure `remaining = duration` (au lieu de 0)
  - État "ready to restart" plus clair
  - Haptic feedback sur triggering

- **ActivityCarousel** - Enhanced scroll awareness
  - Tracks scroll position via onScroll event
  - Intelligent arrow visibility based on content width
  - Dynamic updates when drawer opens/closes

## [1.2.5] - 2025-12-05

### 🚀 Production Release - App Stores Live

**Status**: ✅ LIVE - Disponible sur App Store et Google Play

#### Release Information
- **Release Date**: 2025-12-04
- **iOS**: Disponible sur [App Store](https://apps.apple.com/fr/app/resetpulse/id6752913010)
- **Android**: Disponible sur [Google Play](https://play.google.com/store/apps/details?id=com.irimwebforge.resetpulse&pcampaignid=web_share)
- **Version**: 1.2.5
- **Screenshots**: Mis à jour pour v1.3 (iPhone, iPad, Android)

#### Store Links
- **App Store**: https://apps.apple.com/fr/app/resetpulse/id6752913010
- **Google Play**: https://play.google.com/store/apps/details?id=com.irimwebforge.resetpulse&pcampaignid=web_share

---

### 🌐 Site Web - Optimisation Copy & UX

**Status**: ✅ DÉPLOYÉ - http://resetpulse.irimwebforge.com

#### Added

- **Multilingue FR/EN complet** avec toggle de langue
  - Toutes les traductions selon framework satisfacteurs Max-Neef
  - Badges stores adaptés selon la langue
  - Meta tags SEO dynamiques

- **Toggle device iOS/Android** avec détection automatique
  - Détection user agent au chargement
  - Screenshots adaptatifs (4 combinaisons : FR/iOS, FR/Android, EN/iOS, EN/Android)
  - 20 screenshots organisés dans `assets/{lang}/{device}/`

- **Structure assets réorganisée**
  - Organisation par langue et device : `assets/fr/ios/`, `assets/fr/android/`, `assets/en/ios/`, `assets/en/android/`
  - Suppression des anciens fichiers à la racine

- **CTA secondaire** après section pricing
  - Badges stores répétés pour meilleure conversion
  - Synchronisation automatique avec la langue

- **Lazy loading** sur toutes les images screenshots
  - Performance améliorée au chargement

#### Changed

- **Copy optimisé selon framework satisfacteurs Max-Neef**
  - Hero : "Reprends le contrôle de ton attention" (satisfacteur Liberté)
  - Tutoiement uniforme (cohérence stores/app)
  - Authenticité TDA/H assumée ("Conçu pour cerveaux TDA/H")
  - Triple "Zéro" : surcharge visuelle, culpabilité, abonnement piège
  - Taglines mémorables : "Ton temps. Tes couleurs. Ton rythme."

- **Structure narrative améliorée**
  - Screenshots déplacés après section différenciation
  - Flux : Différenciation → Simplicité → Personnalisation → Screenshots → Pricing → CTA

- **Section Pricing améliorée**
  - Badge "POPULAIRE" sur carte Premium
  - Carte Premium agrandie (scale 1.05)
  - Meilleure hiérarchie visuelle

- **Hero section optimisée**
  - `min-height` réduit de 100vh à 85vh (meilleur ratio desktop)
  - Pricing hint visible : "Gratuit • 4,99€ version complète • Sans abonnement"

- **Toggles améliorés**
  - z-index augmenté à 10000
  - Fond plus opaque (0.98) pour meilleure lisibilité

- **Footer corrigé**
  - Copyright complet : "© 2025 IRIM WebForge • Eric Zuber" (FR et EN)

#### Technical

- **JavaScript vanilla** (aucune dépendance)
- **localStorage** pour préférences langue + device
- **Responsive design** optimisé mobile/tablette/desktop
- **SEO** : Meta tags dynamiques, Open Graph, Twitter Cards
- **Performance** : Lazy loading images, animations CSS optimisées

#### Deployment

- **Déployé sur** : http://resetpulse.irimwebforge.com
- **Méthode** : `scp -r` vers VPS (`/srv/www/internal/resetpulse.irimwebforge.com/`)
- **Date** : 2025-12-06

---

### 🎨 Freemium UX Overhaul - Discovery Modals & Carousels

**Objectif:** Améliorer l'expérience freemium avec découverte progressive du contenu premium

#### Added

- **Dossier modals/** (`src/components/modals/`)
  - Architecture centralisée pour toutes les modales
  - Export unifié via `index.js`

- **DiscoveryModal.jsx** - Modale générique de découverte premium
  - Props configurables: title, subtitle, tagline, children, ctaText, dismissText
  - CTA "Débloquer tout - 7 jours gratuits" → ouvre paywall
  - Réutilisable pour activités, couleurs, etc.

- **MoreActivitiesModal.jsx** - Découverte activités premium
  - Grille de 12 emojis premium
  - "Encore plus de moments" / "Sieste, écriture, lecture, yoga..."
  - Utilise DiscoveryModal comme base

- **MoreColorsModal.jsx** - Découverte palettes premium
  - Grille de 13 palettes avec aperçu 4 couleurs + nom
  - "Encore plus de couleurs" / "Océan, forêt, lavande, canard..."

- **Nouvelles activités premium**
  - `nap` (😴 Sieste) - 20min par défaut
  - `writing` (✍️ Écriture) - 30min par défaut

- **DevFab repositionné** en haut à gauche
  - Menu s'ouvre vers le bas
  - Meilleure ergonomie

#### Changed

- **ActivityCarousel** - Mode freemium
  - 4 activités gratuites + bouton "+"
  - Activités free: Travail 💻, Pause ☕, Méditation 🧘, Créativité 🎨
  - Bouton "+" ouvre MoreActivitiesModal
  - Méditation passée gratuite (était premium)
  - Créativité passée gratuite (était premium)

- **PaletteCarousel** - Mode freemium
  - 2 palettes gratuites (Terre, Soft Laser) + bouton "+"
  - Bouton "+" ouvre MoreColorsModal
  - Badge "Débloquer" supprimé (remplacé par Discovery modal)

- **activities.js** - Nouveau quatuor gratuit
  - FREE: work, break, meditation, creativity (4)
  - PREMIUM: nap, writing, reading, study, yoga, sport, walk, cooking, gaming, homework, music, cleaning (14 dont 2 nouvelles)
  - Activité `breathing` supprimée

- **Modales déplacées** vers `src/components/modals/`
  - PremiumModal, SettingsModal, DiscoveryModal, MoreActivitiesModal, MoreColorsModal
  - Imports mis à jour dans TimerScreen, ActivityCarousel, PaletteCarousel

#### Technical

- **Files Created**: 6 (DiscoveryModal, MoreActivitiesModal, MoreColorsModal, modals/index.js, MoreColorsModal)
- **Files Modified**: 8 (ActivityCarousel, PaletteCarousel, activities.js, DevFab, i18n fr/en, TimerScreen, SettingsModal)
- **i18n TODO** mis à jour avec nouveaux composants à traduire

---

## [1.2.4] - 2025-12-04

### 📊 Analytics Tracking Dashboard

#### Added

- **Tableau de tracking simplifié** (`analytics-dashboard/tracking.html`)
  - **Hebdo** : App Store + Google Play (vues, DL, stars) - S40 à S1
  - **Quotidien** : Mixpanel + RevenueCat (opens, onboard, PW views, trials, achats, revenue) - 31 jours déc
  - Édition inline (double-clic), localStorage auto, export JSON
  - Lignes TOTAL auto (sommes + moyennes)
  - Sections collapsibles
  - Calcul auto PW→Trial %

- **Historique données** (`analytics-dashboard/DATA-HISTORY.md`)
  - Données Oct/Nov/Déc extraites des captures
  - Sources : App Store Connect, Google Play Console, Mixpanel, RevenueCat

#### Removed

- `resetpulse-tracking.html` (remplacé par version simplifiée)
- `resetpulse-tracking-guide.html` (consolidé)

---

## [1.2.3] - 2025-12-02

### 🎨 Default Color Fix

#### Fixed

- **Couleur par défaut changée en bleu** (`src/config/timerPalettes.js`)
  - Avant : `#4A5568` (gris bleuté)
  - Après : `#3B82A0` (bleu terre/océan)
  - Première couleur vue par les nouveaux utilisateurs

---

### 🎯 Paywall Copy Optimization - Version Minimaliste

**Objectif:** Améliorer conversion paywall (5.71% → target >18%)

#### Changed

- **Copy paywall "Version C - Minimaliste punch"** (15 langues)
  - `premium.title`: "Débloque tout" (direct, action)
  - `premium.description`: "Toutes les couleurs.\nToutes les activités.\nTon confort maximum."
  - `premium.features`: "🎁 7 JOURS GRATUITS" (trial visible en premier)
  - `premium.price`: "Puis {price} une fois.\nÀ toi pour toujours."
  - `premium.trial`: Supprimé (intégré dans features)

- **Simplification UI** (`src/components/PremiumModal.jsx`)
  - Suppression du texte trial séparé (maintenant dans features box)
  - Prix dynamique avec interpolation `{price}`

---

## [1.2.2] - 2025-12-02

### 📊 Analytics Improvements

#### Added

- **`app_opened` event** (`App.js`)
  - Track app opens avec `is_first_launch` boolean
  - Utilise AsyncStorage pour détecter premier lancement
  - Event déclenché après init Mixpanel

#### Changed

- **Platform casing uniformisé** (`src/services/analytics.js`)
  - Avant : `platform: 'ios'` / `platform: 'android'` (minuscule)
  - Après : `platform: 'iOS'` / `platform: 'Android'` (casse standard)
  - Évite fragmentation données Mixpanel

- **`paywall_viewed` dédupliqué** (`src/components/PremiumModal.jsx`)
  - Avant : Event déclenché à chaque ouverture modal (même user = N events)
  - Après : Event déclenché une seule fois par session
  - Ratio paywall→trial plus fiable pour mesurer conversion

---

## [1.2.1] - 2025-12-02

### 🔧 Prix dynamique RevenueCat

#### Changed

- **Prix Premium dynamique** (`src/components/PremiumModal.jsx`)
  - Avant : Prix hardcodé dans i18n (4,99€, 49kr, ¥700, etc.)
  - Après : Prix récupéré dynamiquement via `priceString` de RevenueCat
  - Avantage : Le prix affiché correspond toujours au prix réel du store de l'utilisateur
  - Fallback : Si RevenueCat échoue, affiche le prix i18n hardcodé

- **Nouvelle clé i18n `premium.priceOnce`** (15 langues)
  - Texte "Une fois, pour toujours" séparé du prix
  - Permet l'affichage : `{priceString} - {t('premium.priceOnce')}`

---

## [1.2.0] - 2025-11-26

### 🌍 International Edition - Production Release

**Status**: ✅ READY FOR PRODUCTION - IAP Fixed!

#### Release Information
- **Release Name**: International Edition / Global Release
- **Android**: v1.2.0 (versionCode 20) - Internal Testing on Google Play
- **iOS**: v1.2.0 (buildNumber 21) - TestFlight
- **Build Date**: 2025-11-26

#### Major Features

### 🔧 Critical IAP Fix - RevenueCat Android Bug Workaround

**Status**: ✅ FIXED - Build 20 résout le bug critique

#### Fixed

- **Bug RevenueCat Android** - Achat Premium impossible
  - Problème : RevenueCat cherchait un type `subscription` pour un produit `non-consumable`
  - Symptôme : "Missing productDetails: productType='subs'" alors que Google Play retournait `type="inapp"`
  - Solution : Workaround utilisant `purchasePackage()` au lieu de `purchaseProduct()`
  - Nouveau produit : `com.irimwebforge.resetpulse.premium_lifetime_v2` (4,99€)
  - Build 20 : versionCode 20 avec workaround implémenté

### 🌍 M7.6 - Internationalisation (Phase 5 Complete)

**Status**: ✅ TESTING - 15 langues implémentées

#### Added

- **i18n Complete Coverage** - 15 langues supportées
  - Langues : FR, EN, ES, DE, IT, PT, NL, JA, KO, ZH-Hans, ZH-Hant, AR, RU, SV, NO
  - Strings : 160+ keys traduites (onboarding, settings, premium, palettes, activités, sons)
  - Système : react-i18next avec détection automatique langue device

- **Traductions manquantes ajoutées**
  - `premium.unlock`: "Débloquer ✨" → "Unlock ✨" (15 langues)
  - `premium.onboardingToast`: Toast onboarding palettes premium (15 langues)
  - `sounds.*`: 10 noms de sons traduits (bell_classic, microwave_vintage, etc.)
  - `palettes.automne`: "Automne" → "Autumn" / "Otoño" / "秋" (15 langues)
  - `palettes.lavande`: "Lavande" → "Lavender" / "Lavanda" / "ラベンダー" (15 langues)

- **Hooks i18n**
  - `useTranslation()` : Hook custom pour accès traductions
  - Utilisation : `const t = useTranslation(); t('settings.title')`

#### Changed

- **Chrono Numérique UX amélioré** (`src/components/timer/DigitalTimer.jsx`)
  - Avant : Visible uniquement quand timer lancé
  - Après : Visible en permanence (si activé dans settings)
  - Réglage cadran : Opacité 70% + temps dynamique en temps réel
  - Timer en cours : Opacité 100% + pulse subtil (échelle 1.02x)

- **Palettes optimisées** (`src/config/timerPalettes.js`)
  - **Doublons supprimés** : "verts" et "bleus" (identiques à "forêt" et "océan")
  - **Nouvelles palettes** :
    - `automne` : Tons chauds marron/cuivre (chocolat, cuivre, rouille, or)
    - `lavande` : Violets doux (violet moyen, orchidée, prune, lavande)
  - **Couleur onboarding** : Bleu (#4A5568) au lieu de vert (#68752C)
  - **Ordre optimisé** : Progression chromatique Énergie → Chaleur → Douceur → Sérénité
    - 🆓 Gratuites (2) : terre, softLaser
    - 🌈 Vives/Saturées (4) : classique, tropical, crépuscule, darkLaser
    - 🍁 Chauds/Terreux (2) : automne, aurore
    - 🌸 Pastels/Doux (4) : douce, pastel_girly, lavande, zen
    - 🌊 Nature/Bleu-Vert (3) : canard, forêt, océan

- **Refactoring i18n dans code**
  - `PaletteCarousel.jsx` : Badge "Débloquer ✨" utilise `t('premium.unlock')`
  - `PaletteCarousel.jsx` : Toast onboarding utilise `t('premium.onboardingToast')`
  - `soundsMapping.js` : Noms de sons utilisent `i18n.t('sounds.*')` avec getters

#### Technical

- **TEST_MODE** : Désactivé (`false`) - Mode production freemium actif
- **Fichiers modifiés** : 19 (15 locales + 4 composants)
- **Traductions totales** : 160+ keys × 15 langues = 2400+ strings
- **ProGuard Rules** : Added for RevenueCat SDK and Google Play Billing
- **Android Signing** : Fixed release configuration to use production keystore
- **Version Bump Script** : Automated version update across 5 files

#### Testing

- ✅ Tests hooks : 29/29 passed
- ✅ Compilation : OK (aucune erreur)
- ✅ Android AAB : Built successfully (65 MB)
- ✅ iOS Build : EAS build completed with auto-submit to TestFlight
- ⏳ Tests manuels : Android Internal Testing + iOS TestFlight

#### Deployment

- **Android Build Process**:
  - Fixed critical signing configuration issue (was using debug keystore for release)
  - Added ProGuard rules for RevenueCat to prevent obfuscation crashes
  - Build command: `./gradlew bundleRelease`
  - AAB location: `app/build/outputs/bundle/release/app-release.aab`

- **iOS Build Process**:
  - EAS build with production profile
  - Auto-submit enabled for TestFlight
  - Provisioning profile regenerated automatically
  - Build command: `eas build --platform ios --profile production --auto-submit`

---

## [1.1.8] - 2025-10-20

### 📊 M7.5 - Analytics Foundation Complete

**Status**: ✅ VALIDÉ - Events reçus dashboard Mixpanel

#### Added
- **Mixpanel Analytics Integration** - 6 events critiques trackés
  - `app_opened`: Attribution baseline (is_first_launch tracking)
  - `onboarding_completed`: Funnel top (target > 65% completion)
  - `paywall_viewed`: Reach measurement (source tracking)
  - `trial_started`: Intention achat (RevenueCat sync)
  - `purchase_completed`: Revenue tracking (price + transaction_id)
  - `purchase_failed`: Friction debug (error_code granulaire)

- **Analytics Service** (`src/services/analytics.js`)
  - Mixpanel SDK v3+ integration (mixpanel-react-native@3.1.2)
  - EU data residency configuration (https://api-eu.mixpanel.com)
  - Token projet: 4b1bd9b9a3be61afb7c19b40ad5a73de
  - Super properties: platform, app_version
  - Graceful fallback Expo Go
  - Flush immédiat DEV (debugging feedback)

- **Analytics Hook** (`src/hooks/useAnalytics.js`)
  - React hook optimisé (singleton, pas de recréation)
  - Usage: `const analytics = useAnalytics()`

#### Fixed
- **Token Organisation → Projet** - Events droppés silencieusement
  - Initial: 19fef5beb302264e8e3eaf9c0ccaed91 (organisation token)
  - Corrigé: 4b1bd9b9a3be61afb7c19b40ad5a73de (projet ResetPulse)

- **EU Data Residency RGPD** - Serveurs US → EU
  - Added: `setServerURL('https://api-eu.mixpanel.com')` après init()
  - Compliance: Data stays in EU (projet créé avec residency EU)

#### Technical
- **ProGuard Rules Android** - Obfuscation Mixpanel configured
  - `-keep class com.mixpanel.** { *; }`
  - Prevents crash production release builds

- **Debug Session** (1h30 token + endpoint)
  - Pattern validé: Test 1 event avant intégrer tous
  - Délai dashboard: 3-5 minutes (pas 30s instantané)
  - Logs diagnostics: token + server URL visibility

#### Changed
- **Version bump**: 1.1.7 → 1.1.8
- **App.js**: Mixpanel init au startup (Analytics.init())
- **PremiumModal.jsx**: trackPaywallViewed(source) on visible
- **PurchaseContext.jsx**: 3 events (trial_started, purchase_completed, purchase_failed)
- **OnboardingController.jsx**: trackOnboardingCompleted() on complete

#### Documentation
- **Learning Session Devlog** - `docs/devlog/analytics/mixpanel-m7-5-implementation.md`
  - Galères debug documentées (token + EU endpoint)
  - Checklist setup Mixpanel réutilisable MoodCycle
  - Erreurs classiques + solutions (économie 2h debug)

#### Next Steps (M7.6)
- [ ] expo-localization 15 langues (dimanche après-midi 4-6h)
- [ ] Metadata stores iOS/Android (lundi)
- [ ] Submit v1.2.0 production simultané (mardi)

---

## [1.1.7] - 2025-10-18

### 🛡️ Keep Awake Feature

#### Added
- **Keep Awake Hook** (`src/hooks/useTimerKeepAwake.js`)
  - Prevents screen lock during active timer
  - Default: ON (user-configurable)
  - Settings toggle: "Maintenir écran allumé"
  - Battery hint displayed in Settings

#### Changed
- **Version bump**: 1.1.6 → 1.1.7

---

## [1.1.6] - 2025-10-17

### 🎉 iOS APPROVED - RevenueCat Integration Complete

**APPROVED**: 17.10.2025 23:30 by Apple Review Team

#### Status
- ✅ **iOS**: APPROVED and live on App Store (within 24h)
- 🚀 **Android**: Ready for submission (ProGuard configured)

### 🛠️ Fixed - Apple Review Rejection Issues

#### Fixed
- **Audio Background Mode (Guideline 2.5.4)** - Removed unnecessary UIBackgroundModes capability
  - `app.json:18-22`: Suppression de `UIBackgroundModes: ["audio"]` from iOS infoPlist
  - Timer uses local notifications for background alerts (expo-notifications)
  - Audio playback only when app is in foreground (expo-audio)
  - Compliant with Apple Guideline 2.5.4: App does not require persistent audio session
  - Justification: Notifications handle sound playback automatically through iOS notification system

- **IAP Free Trial Button (Guideline 2.1)** - Enhanced error logging for purchase flow debugging
  - `PremiumModal.jsx:37-107`: Added 7 detailed log points throughout purchase flow
  - Log prefix `[IAP]` with emoji indicators for easy console filtering
  - Logged data: offerings status, package details, product ID, price, purchase result
  - Helps Apple reviewers and developers identify exact failure points
  - All logs include structured objects for comprehensive debugging
  - Error cases explicitly logged: network errors, missing offerings, store problems

#### Changed
- **Version bump**: 1.1.5 → 1.1.6
- **Debug capability**: Production-ready logging without affecting user experience

#### Technical
- **Files Modified**: 2 (app.json, PremiumModal.jsx)
- **iOS Configuration**: UIBackgroundModes removed from infoPlist
- **IAP Logging**: 7 checkpoint logs added to purchase flow
  - Start: `[IAP] 🚀 Starting purchase flow...`
  - Fetch: `[IAP] 📡 Fetching offerings from RevenueCat...`
  - Received: `[IAP] 📦 Offerings received:` + structure details
  - Error: `[IAP] ❌ Network error` / `[IAP] ❌ No offerings available`
  - Selected: `[IAP] 📋 Package selected:` + product details
  - Initiated: `[IAP] 💳 Initiating purchase for product:`
  - Result: `[IAP] ✅ Purchase result:` + status details
- **Design Philosophy**: Debug visibility for Apple Review without breaking UX

#### Apple Review Notes
- Audio background removed: Timer now compliant with Guideline 2.5.4
- IAP logging enhanced: Console logs help identify purchase flow issues
- Product ID: `com.irimwebforge.resetpulse.premium_lifetime`
- Free trial: 7 days (Introductory Offer configured in App Store Connect)

## [1.1.5] - 2025-10-15

### 🎯 Fixed - Onboarding Premium UX

#### Fixed
- **Premium content pendant onboarding** - Cliquer sur du contenu premium pendant le guide ouvrait la PremiumModal et interrompait le flow
  - `ActivityCarousel.jsx` + `PaletteCarousel.jsx`: Toast léger à la place de la modal pendant onboarding
  - Toast message: "Terminez le guide pour découvrir les [activités/palettes] premium !"
  - Animation slide-up douce (300ms) avec disparition automatique après 2s
  - Haptic feedback warning préservé
  - Après onboarding: Comportement normal (modal s'affiche)
  - UX non-bloquante: L'utilisateur peut continuer le guide sans interruption

#### Technical
- **Files Modified**: 2 (ActivityCarousel, PaletteCarousel)
- **New State**: `toastMessage` + `toastAnim` pour affichage toast
- **Condition**: `isOnboardingActive = !onboardingCompleted && currentTooltip !== null`
- **Rollback**: Mode démo complet abandonné (problèmes highlight + clics premium non fonctionnels)
- **Design Philosophy**: UX fluide - informer sans bloquer, pas de friction pendant découverte

## [Unreleased] - 2025-10-09

### 🐛 Fixed - Interface Minimaliste & Settings UX

#### Fixed
- **Timer à zéro** - Le bouton play ne peut plus lancer un timer de 0 seconde
  - `useTimer.js:226`: Correction de la condition de démarrage
  - Avant : `if (remaining === 0 && duration === 0)` (permettait le lancement si duration > 0)
  - Après : `if (remaining === 0)` (bloque tout démarrage à zéro)
  - L'utilisateur doit maintenant régler une durée ou utiliser Reset avant de démarrer

- **Enregistrement durée activité** - La durée ne s'enregistre plus à chaque changement mais uniquement au play
  - `TimeTimer.jsx:184`: Suppression de l'enregistrement automatique lors du changement via graduations
  - `useTimer.js:248-252`: L'enregistrement se fait uniquement au premier démarrage (utilisation réelle)
  - Flux corrigé : Changement d'activité → restaure durée sauvegardée → ajustement via graduations (pas de sauvegarde) → play → sauvegarde
  - Évite la pollution des données avec des durées non utilisées
- **Mode zen activités** - Activités encore visibles avec taille réduite en mode minimaliste
  - `ActivityCarousel.jsx`: Retrait des styles hardcodés `opacity: 0.3` et `scale: 0.8` dans container
  - Contrôle désormais géré uniquement par le parent `TimerScreen`
  - Mode zen fonctionne parfaitement : masquage complet quand timer actif

- **Switchs afficher/masquer** - Les toggles "Afficher les palettes" et "Afficher les activités" ne fonctionnaient pas correctement
  - `TimerScreen.jsx`: Correction des valeurs d'opacity (lignes 288, 344)
  - Avant : `opacity: showActivities ? activityAnim : 0` (valeur d'animation fixe)
  - Après : `opacity: showActivities ? 1 : 0` (réactivité immédiate)
  - Les sections disparaissent instantanément lors du toggle dans les settings
  - Animations d'entrée préservées (translateX, translateY, scale au démarrage)

- **Bouton "Relancer le guide"** - Le bouton dans les settings ne relançait pas l'écran de bienvenue
  - `SettingsModal.jsx:900`: Appelle maintenant `resetOnboarding()` au lieu de `startTooltips()`
  - Comportement corrigé: Affiche l'écran de bienvenue complet puis les tooltips
  - Avant: Relançait seulement les tooltips (sans WelcomeScreen)
  - Après: Réinitialise complètement l'onboarding (WelcomeScreen + tooltips)
  - Description mise à jour: "Afficher à nouveau l'écran de bienvenue et les conseils"

#### Changed
- **Réorganisation des settings** - Ordre optimisé : Fonction → Technique → Forme
  - `SettingsModal.jsx`: Architecture repensée avec priorités claires pour UX neuroatypique
  - **Avant** : 5 sections (Expérience Timer, Personnalisation, Activités, Réglages Cadran, À propos)
  - **Après** : 4 sections logiques (Fonction → Technique → Forme)
    - 🪄 **Interface** (Card Primary) : Interface minimaliste + Chrono numérique + Animation Pulse
    - ⚙️ **Timer** (Card) : Son de fin + Mode Cadran + Sens de rotation
    - 🎨 **Apparence** (Card) : Thème + Palettes + Activités favorites
    - ℹ️ **À propos** (Flat) : Version + Relancer le guide
  - Badge "NOUVEAU" retiré (plus pertinent après plusieurs versions)
  - Emoji 🪄 pour Interface : Plus doux et évocateur que la cible 🎯
  - Ordre intuitif : Comment on travaille → Réglages techniques → Personnalisation visuelle
  - Philosophie : L'essentiel (comportement) avant le cosmétique (apparence)

#### Technical
- **Files Modified**: 3 (TimeTimer, useTimer, ActivityCarousel, TimerScreen, SettingsModal)
- **State Management**: Confirmé que `showActivities` et `showPalettes` fonctionnent correctement via `TimerOptionsContext`
- **Design Philosophy**: Séparation des responsabilités - le parent contrôle la visibilité, pas les enfants
- **Timer Logic**: Amélioration de la fiabilité du démarrage et de la persistance des données utilisateur

## [Unreleased] - 2025-10-08

### 🎨 UX/Freemium Improvements

#### Changed
- **Palette par défaut** - App ouvre sur palette "Terre" avec couleur bleue sélectionnée
  - `TimerPaletteContext.jsx`: defaultPalette = 'terre', defaultColorIndex = 1 (bleu)
  - Meilleure cohérence visuelle à l'ouverture

- **Ordre des palettes** - Palettes gratuites en premier pour meilleure discovery
  - `timerPalettes.js`: "terre" repositionnée avant "softLaser"
  - Palettes free d'abord, puis premium

- **Premium Modal trigger** - Modale se déclenche uniquement au tap (pas au scroll)
  - `PaletteCarousel.jsx`: Suppression du trigger dans `handleScrollEnd`
  - Permet de browse les palettes premium sans friction
  - Tap sur couleur ou badge "Débloquer" → modale

- **Badge "Débloquer"** - Affordance claire pour palettes premium
  - Badge semi-transparent noir (rgba(0,0,0,0.7)) centré sur palette
  - Texte: "Débloquer ✨" (call-to-action explicite)
  - Tappable avec haptic feedback
  - Remplace sparkle subtile peu visible

- **Navigation chevrons** - Réparée pour permettre browsing fluide
  - Chevrons permettent de naviguer entre toutes les palettes
  - Auto-switch pour palettes gratuites
  - Scroll uniquement pour premium (preview sans bloquer)

- **Activités gratuites** - Ordre optimisé et favoris par défaut cohérents
  - `activities.js`: "none", puis activités gratuites, puis premium
  - Activité "reading" corrigée en premium (était free par erreur)
  - Favoris par défaut: ['work', 'break', 'breathing'] (uniquement free)

- **Sparkles** - Réduction de l'oppression visuelle (48 cadenas → sparkles)
  - Tous les 🔒 remplacés par ✨ dans ActivityCarousel, PaletteCarousel, SettingsModal
  - Background transparent au lieu de badges colorés
  - Opacity réduite (0.7-0.85) avec text-shadow subtil
  - Overflow: visible sur ActivityCarousel pour éviter coupure

#### Technical
- **Files Modified**: 5 (TimerPaletteContext, timerPalettes, PaletteCarousel, activities, TimerOptionsContext)
- **Design Philosophy**: Freemium non-oppressif - browse premium sans friction, CTA clair au tap

## [1.1.0] - 2025-10-08

### 💰 Monétisation - RevenueCat Integration (MAJOR)

#### Added
- **RevenueCat SDK Integration** - Complete in-app purchase system
  - SDK `react-native-purchases@9.5.3` installed and configured
  - iOS API Key: `appl_NJoSzWzcoJXLiNDMTGKJShISApt`
  - Android API Key: `goog_OemWJnBmzLuWoAGmEfDJKFBEAYc`
  - Product: `com.irimwebforge.resetpulse.premium` (non-consumable)
  - Entitlement: `premium_access`
  - One-time purchase: 4,99€ avec trial 7 jours

- **Freemium Configuration** - Config stricte 2 palettes + 4 activités gratuites
  - Palettes gratuites: `softLaser` (cool), `terre` (warm)
  - Palettes premium: 13 (total 15)
  - Activités gratuites: `none`, `work`, `break`, `breathing`
  - Activités premium: 12 (total 16)
  - Documentation: `docs/decisions/adr-monetization-v11.md`

- **PurchaseContext** - Context API pour gestion premium (`src/contexts/PurchaseContext.jsx`)
  - SDK initialization avec Platform detection (iOS/Android)
  - Real-time listener `addCustomerInfoUpdateListener`
  - Methods: `purchaseProduct()`, `restorePurchases()`, `getOfferings()`
  - State: `isPremium`, `isLoading`, `isPurchasing`, `customerInfo`
  - TEST_MODE override pour développement (désactivé en build)

- **usePremiumStatus Hook** - Migration de `isTestPremium()` (`src/hooks/usePremiumStatus.js`)
  - API: `const { isPremium, isLoading } = usePremiumStatus()`
  - Remplace les appels directs à `testMode.js`
  - Intégré dans 3 composants (ActivityCarousel, PaletteCarousel, SettingsModal)

- **PremiumModal Component** - UI paywall complète (`src/components/PremiumModal.jsx`)
  - Messaging ADR validé: "ResetPulse est gratuit et fonctionnel..."
  - Features box: "15 palettes + 16 activités - 4,99€ - Une fois, pour toujours"
  - Trial badge: "Trial gratuit 7 jours"
  - Boutons: "Commencer l'essai gratuit" / "Peut-être plus tard"
  - "Restaurer mes achats" avec loading states
  - Design cohérent avec SettingsModal (theme tokens, responsive)

- **Edge Cases Handling** - Robustesse production-ready
  - Offline/network errors: Messages user-friendly ("Pas de connexion")
  - Race conditions: Double-purchase prevention via `isPurchasing` lock
  - Restore logic: Force refresh + entitlement verification (`hasPremium`)
  - Store errors: `STORE_PROBLEM_ERROR`, `PAYMENT_PENDING_ERROR` handled
  - Button states: Tous les boutons disabled pendant operations
  - Modal close prevention pendant purchase

#### Changed
- **ActivityCarousel** - Integration PremiumModal
  - Haptic warning sur clic activité premium
  - Modal trigger ligne 113 (remplace TODO)
  - State `showPremiumModal` + props `highlightedFeature="activités premium"`

- **PaletteCarousel** - Integration PremiumModal
  - Haptic warning + modal sur scroll palette premium
  - Scroll-back animation préservée (ligne 88-91)
  - State `showPremiumModal` + props `highlightedFeature="palettes premium"`

- **SettingsModal** - Migration usePremiumStatus
  - Remplace `isTestPremium()` par `usePremiumStatus()` hook
  - Logique premium check préservée

- **App.js** - Provider injection
  - Hiérarchie: ErrorBoundary → Theme → **Purchase** → Onboarding → AppContent
  - PurchaseProvider après ThemeProvider (modal utilise `useTheme()`)

- **testMode.js** - TEST_MODE désactivé pour build dev
  - `TEST_MODE = false` (ligne 10)
  - Permet tests freemium réels avec RevenueCat sandbox

- **timerPalettes.js** - Palette `classique` passée premium
  - `classique.isPremium: true` (ligne 8)
  - Config freemium finale: 2 gratuites (softLaser, terre)

- **activities.js** - Activité `breathing` passée gratuite
  - `breathing.isPremium: false` (ligne 98)
  - Rationale: Ancrage neuroatypique baseline (ADR)

#### Technical
- **Dependencies**: `react-native-purchases@9.5.3`, `expo-dev-client@6.0.13`
- **Architecture**: 5 phases implémentées (Setup, Core, Migration, UI, Edge Cases)
- **Files Created**: 4 (PurchaseContext, usePremiumStatus, PremiumModal, revenuecat.js)
- **Files Modified**: 7 (App.js, ActivityCarousel, PaletteCarousel, SettingsModal, testMode, timerPalettes, activities)
- **Lines Added**: ~650 (Context 120, Modal 354, Hook 25, Config 52, integrations ~100)
- **Documentation**: ADR complet + analyse triangulaire + decisions monetization

#### References
- ADR: `docs/decisions/adr-monetization-v11.md`
- Analysis: `docs/audits/revenuecat-analysis.md`
- Decisions: `docs/decisions/monetization-decisions.md`
- Dashboard RevenueCat: https://app.revenuecat.com/
- Build EAS: Profile `development` configured

## [1.0.5] - 2025-10-08

### 🔔 Android Notifications Fix (CRITICAL - Android 12+)

#### Fixed
- **Android 12+ Notifications** - Notifications programmées ne se déclenchaient pas en production:
  - Added `SCHEDULE_EXACT_ALARM` permission (required for Android 12+ API 31+)
  - Created Android Notification Channel "Timer Notifications" with HIGH importance
  - Configured expo-notifications plugin with sound files
  - Fixed scheduleNotificationAsync to use proper enum type and channelId
  - Notifications now trigger correctly in background and when app is closed
- **Android Resource Naming** - Fixed sound file naming for Android compatibility:
  - Renamed `407342__forthehorde68__fx_bell_short.wav` → `bell_short.wav`
  - Android resources must start with a letter (not digit)
  - Fixes build error: "Resource name must start with a letter"

#### Changed
- **app.json** - Added expo-notifications plugin with configuration
- **AndroidManifest.xml** - Added SCHEDULE_EXACT_ALARM permission (line 4)
- **useNotificationTimer.js** - Created notification channel at module load
- **scheduleNotificationAsync** - Now uses `Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL` enum
- **versionCode** - Incremented from 10 to 11 (Android)
- **versionName** - Updated from "1.0.4" to "1.0.5"

#### Technical
- Sound file copied to `android/app/src/main/res/raw/` (1.5M WAV)
- Channel configured with vibration pattern [0, 250, 250, 250]
- Release signing config restored in build.gradle
- Full documentation in `docs/archive/fixes/NOTIFICATION_FIX_ANDROID_2025.md`

#### References
- Android Exact Alarms: https://developer.android.com/about/versions/12/behavior-changes-12#exact-alarm-permission
- Notification Channels: https://developer.android.com/develop/ui/views/notifications/channels
- Expo Notifications SDK 54: https://docs.expo.dev/versions/v54.0.0/sdk/notifications/

### 🤖 Versioning Automation System

#### Added
- **Automated version bump script** - `scripts/version-bump.js` (250 lines):
  - Automatically updates 6 files: package.json, app.json, build.gradle, SettingsModal.jsx, docs/README.md
  - Auto-increments Android versionCode
  - Supports patch/minor/major/set commands
  - Displays current version and preview of changes
  - 3-second confirmation delay with CTRL+C to cancel
  - Colorized terminal output with clear success/error messages
  - SemVer format validation
- **NPM scripts** - Version management commands:
  - `npm run version:patch` - Increment patch (1.0.5 → 1.0.6)
  - `npm run version:minor` - Increment minor (1.0.5 → 1.1.0)
  - `npm run version:major` - Increment major (1.0.5 → 2.0.0)
  - `npm run version:set X.Y.Z` - Set specific version

#### Documentation
- **[VERSIONING.md](docs/development/VERSIONING.md)** - Complete versioning system guide (300 lines):
  - Semantic Versioning explanation
  - Usage examples and workflows
  - Best practices (when to bump what)
  - Validation checklist
  - Troubleshooting guide
  - Script customization guide

### 📚 Build Documentation Improvements

#### Added
- **[BUILDS_OVERVIEW.md](docs/development/builds/BUILDS_OVERVIEW.md)** - Comprehensive build strategy guide:
  - Dual workflow explanation (Android local, iOS EAS)
  - Platform comparison table (method, rationale, upload process)
  - Quick command reference for both platforms
  - Complete release cycle documentation
  - Pre-build checklists for Android and iOS
  - Troubleshooting common issues
  - Version history tracking table

#### Changed
- **[ANDROID_BUILD_CONFIG.md](docs/development/builds/ANDROID_BUILD_CONFIG.md)** - Clarified local build strategy:
  - Added "🎯 Stratégie : Builds LOCAUX (SANS EAS)" section at top
  - Explained rationale: autonomy, no quotas, full versionCode control
  - Replaced "Alternative: Build avec EAS (Recommandé)" with "Pourquoi pas EAS Build pour Android?"
  - Emphasized proven local workflow (v1.0.4 deployed successfully)
- **[IOS_BUILD_CONFIG.md](docs/development/builds/IOS_BUILD_CONFIG.md)** - Clarified EAS requirement:
  - Added "🎯 Stratégie : Builds avec EAS (OBLIGATOIRE)" section at top
  - Explained why EAS is mandatory for iOS (credentials, no local Xcode)
  - Clear workflow: build → submit → TestFlight

#### Technical
- Build completed successfully: `android/app/build/outputs/bundle/release/app-release.aab` (63 MB)
- versionCode: 11
- Signature verified with jarsigner
- Sound file integrated in raw resources
- **[versioning-automation-setup.md](docs/development/versioning-automation-setup.md)** - Setup report:
  - Before/after comparisons
  - Measured gains (60x faster, 100% consistent)
  - Use case examples
  - Integration in development workflow
- **[scripts/README.md](scripts/README.md)** - Scripts directory documentation

#### Benefits
- ⚡ **60x faster**: 10 minutes → 10 seconds
- ✅ **100% reliable**: No more forgotten files or version mismatches
- 🎯 **Guaranteed consistency**: All 6 files always synchronized
- 📱 **Zero mistakes**: versionCode auto-incremented correctly
- 🔢 **Flexible**: Support for version skipping (e.g., 1.0.5 → 1.2.0)

## [Unreleased] - 2025-10-02

### Added
- **✨ Timer Start Glow Effect** - Subtle visual feedback when timer starts:
  - Arc opacity animates from 85% to 100% over 600ms
  - Smooth "ignition" effect independent of shouldPulse setting
  - Works even when pulse animation is disabled
  - Natural fade-in that signals timer activation clearly
  - Non-invasive and respects app's zen aesthetic
- **🎯 Onboarding System v2.0** - Professional interactive tooltip spotlight
  - Sequential tooltips: Activities → Dial → Palette → Controls (optimized flow)
  - **Fully interactive**: Users can try features while tooltips guide them
  - SVG Mask spotlight with rounded corners (dial: circular, others: theme.borderRadius.xl)
  - Smart tooltip positioning: auto-detects space and positions above/below without hiding elements
  - Precise bounds measurement using `measure()` API with timing optimizations
  - Auto-completion when user starts timer on final tooltip
  - "Skip all" button with persistent completion state
  - Accessible via "Relancer le guide" in Settings modal (dev mode)
  - No entrance animations during first launch for instant onboarding start
  - Consistent highlight padding: horizontal `lg`, vertical `sm` (dial top: `lg` for duration indicator)

### Changed
- **⚙️ Default Values for Production** - Optimized first-launch experience:
  - Default timer duration: 5min → 45min (2700 seconds)
  - Default activity: Basique (none)
  - Default palette: Terre with blue color (index 1)
  - Better initial setup for typical Pomodoro/work sessions
- **🎨 Settings Modal Redesign** - Card-based UI with visual hierarchy (iOS 15+ style):
  - Sections organized in 3 levels: Core Experience → Configuration → Informations
  - Level 1 (Primary Cards): 🎯 Expérience Timer, 🎨 Personnalisation, ⭐ Activités
  - Level 2 (Standard Card): ⚙️ Réglages du Cadran
  - Level 3 (Flat): ℹ️ À propos
  - Card styling: surface background, rounded corners, subtle borders & shadows
  - Logical grouping: Sons + Animation Pulse | Palettes + Thème
  - Level dividers for clear visual separation
  - Improved spacing and visual breathing room
- **🎨 Sound Picker UX Enhancement**:
  - Enlarged tap area for close button in SettingsModal (44x44px iOS minimum)
  - Added iOS-style circular progress loader during sound preview playback
  - Loader animates for exact duration of sound (1-3s depending on sound)
  - Removed static duration text ("Durée: Xs") for cleaner interface
  - Progress loader provides visual feedback replacing text duration
  - Icon size adjusted: PauseIcon reduced to 12px to fit within 24px loader circle
- **Freemium Strategy Refined**: Reorganized activity order and premium tiers
  - Pause activity moved to free tier (completes Pomodoro cycle with Work)
  - Meditation and Breathing moved to premium tier (entire mindfulness vertical now premium)
  - Free activities now: Basique, Travail, Pause, Lecture (4 activities)
  - Premium activities: All mindfulness (Yoga, Méditation, Respiration) + Sport, Étude, etc. (12 activities)
  - Better value proposition: Complete Pomodoro workflow free, desire-creating premium features locked
- **Grid Layout System**: Simplified with Golden Ratio (φ = 1.618)
  - Header: 50px, Activities/Palette: 80px (50 × φ)
  - Grid provides structure, `measure()` provides precision
  - Removed complex manual calculations in favor of dynamic measurement

### Fixed
- **🌓 System Theme Detection Fixed** (Critical):
  - Replaced `useColorScheme()` hook with `Appearance` API for reliable system theme detection
  - `useColorScheme()` was returning 'light' even when device was in dark mode
  - Added `Appearance.addChangeListener()` to track system theme changes in real-time
  - Changed `userInterfaceStyle` from "light" to "automatic" in app.json
  - Auto mode now correctly follows device appearance settings immediately
- **🔧 Haptic Feedback Configuration**:
  - Added `expo-haptics` plugin to app.json for proper native haptic support
  - Fixes potential vibration issues in production builds (iOS/Android)
  - Haptics now properly configured for builds outside Expo Go
- **🐛 Theme System Critical Bugs**:
  - Fixed `toggleTheme()` not respecting "auto" mode (was stuck cycling only between light/dark)
  - Now properly cycles through: light → dark → auto → light
  - Added missing `textLight` color property to both light and dark themes
  - Fixed `theme.colors.primary` reference error in SettingsModal (should be `theme.colors.brand.primary`)
- **🔴 Notification Crash Fix** (Critical):
  - Fixed app crash on timer completion due to missing `ExpoPushTokenManager` native module
  - Added try-catch protection around all notification API calls to prevent total app crashes
  - Configured `expo-notifications` plugin in app.json with proper settings
  - Notifications now fail gracefully if native modules are unavailable
- **Responsive Design**: Settings button now properly adapts to all device sizes
  - Changed from `rs(44)` to `rs(44, 'min')` for width/height/borderRadius
  - Settings icon size now responsive with `rs(24, 'min')`
  - Tooltip positioning made responsive with `rs()` function
- **Onboarding UX Polish**:
  - SVG Mask spotlight with perfect rounded corners (no visual gaps)
  - Render order optimized: overlay with `pointerEvents="none"` allows full interactivity
  - Entrance animations disabled during first launch to prevent measurement errors
  - Highlight widths consistent across all elements (content + padding lg)
  - Tooltip arrow directions: Activities (up), Dial (down), Palette (down), Controls (down)
  - Fade-in animation only on first tooltip, instant transitions between tooltips
- **Timer Visual Hierarchy**: Fixed z-index layering of physical fixation dots
  - Moved center fixation dots to render after dial progress arc
  - Dots now properly visible above dial but below activity emoji
  - Represents physical mounting fixture more accurately
- **Activity Icons**: Replaced dual circles with ⏱️ emoji for "Basique" activity
  - Simplified icon in ActivityCarousel and SettingsModal
  - More consistent and recognizable as a timer
  - Removed dependency on timer.png asset

### Technical
- **Architecture Improvement**: Hybrid Grid + measure() approach
  - `gridLayout.js` simplified to only provide Grid heights
  - Component bounds measured dynamically for accuracy
  - Smart tooltip positioning prevents element occlusion
- **New Components**:
  - `HighlightOverlay.jsx` - SVG-based spotlight with mask
  - `Tooltip.jsx` - Reusable tooltip with arrow directions
  - `OnboardingController.jsx` - Context-based state management
  - `WelcomeScreen.jsx` - First-launch modal

### Documentation
- **DevLog**: Created comprehensive onboarding implementation log (`docs/devlog/2025-10-02-onboarding-highlight-system.md`)
- **ADR**: Created carousel affordance decision record (`docs/decisions/carousel-affordance.md`)
  - Documents approach differences between ActivityCarousel (peek) vs PaletteCarousel (no dots for now)
  - Phase 1/Phase 2 implementation strategy for freemium pagination dots

## [1.0.4] - 2025-09-29

### 🎯 Foundation v1.0.4 - SDK 54 Migration + Audio System Complet

#### SDK 54 & New Architecture ✅
- **Migration complète**: Expo SDK 54 + React Native 0.81.4 + React 19.1.0
- **New Architecture**: Fabric + Turbo Modules activés et fonctionnels
- **Performance**: Build times optimisés de 120s → 10s avec XCFrameworks
- **Dependencies**: Package-lock réduit de 12k → 4k lignes (dépendances optimisées)

#### Audio System (CRITICAL PATH - 100% consensus famille) ✅
- **Mode silencieux**: `playsInSilentMode: true` pour iOS
- **Background audio**: UIBackgroundModes + notifications programmées
- **Sound Picker**: 10 sons configurables avec interface élégante
  - Cloche classique, Cloche mélodique
  - Micro-ondes vintage, Ping micro-ondes
  - Minuteur cuisine, Minuteur mécanique
  - Minuteur à œuf, Grille-pain
  - Ding simple, Timer complet
- **Architecture audio SIMPLIFIÉE** (29 sept. soir):
  - **UN SEUL HOOK**: `useSimpleAudio.js` remplace 5 hooks audio
  - Utilise uniquement expo-audio SDK 54 (pas de conflits d'API)
  - Configuration audio globale (une seule fois)
  - Preview sons fonctionnels sur simulateur et device
  - Code réduit de 70% (plus maintenable)
  - Solution hybride: foreground (expo-audio) + background (notifications)

#### Tests & Qualité ✅
- **Jest SDK 54**: Configuration minimaliste compatible
  - `react-test-renderer` au lieu de `@testing-library/react-native`
  - Tests archivés dans `archive-sdk51/` pour référence
  - Coverage: useTimer 74.57%, useDialOrientation 41.17%
- **Bug fixes**:
  - Bug historique NaN dans useDialOrientation corrigé avec `isFinite()`
  - Timer continue en background avec `setTimeout` (pas RAF)
  - Notifications trigger bug fixé avec `type: 'timeInterval'`

#### Notifications Background ✅
- **Timer background**: Continue même app fermée
- **Screen wake-up**: Écran s'allume automatiquement à la fin
- **Son système**: Notifications jouent le son par défaut iOS
- **Durée limite**: 8h Dynamic Island, 12h Lock Screen

#### UX & Persistence ✅
- **Pattern learning**: Sauvegarde durée par activité
  - Association activité → durée mémorisée
  - Pré-remplissage automatique au prochain usage
  - Optimisation AsyncStorage (écriture conditionnelle)
- **Settings améliorés**:
  - Organisation en 5 sections claires
  - Badge "NOUVEAU" pour Sound Picker
  - Section Sons du Timer en priorité

### Added
- **Migration Documentation**: Comprehensive documentation suite
  - `TODO-NewArchitecture-Testing.md`: Structured testing plan for New Architecture validation
  - `devlogs/2025-09-28_Migration-NewArchitecture-SDK54.md`: Complete migration documentation
  - `.nvmrc`: Node.js version specification (20.19.4 minimum)
- **Timer Refactoring**: Complete modularization of timer dial into separate components
  - DialBase: Static SVG elements (graduations, numbers)
  - DialProgress: Animated arc display
  - DialCenter: Activity emoji and pulse animations
- **Drag Interaction**: Support for adjusting timer when paused
- **UI Constants**: Extracted all magic numbers into organized constant files
- **Clickable Graduations**: Started implementation for tap-to-set time values (rolled back due to UX issues)

### Changed
- **React Native Foundation**: Major architecture migration (SDK 51 → 54)
  - New Architecture enabled: Fabric rendering + Turbo Modules
  - React 18.2.0 → 19.1.0 with React Native 0.74.5 → 0.81.4
  - Node.js requirement updated to 20.19.4+ (using Node 24.9.0)
  - Package lock reduced from 12k+ to 4k lines (optimized dependencies)
- **Audio System**: Complete API modernization (expo-av → expo-audio)
  - `Audio.Sound.createAsync()` → `useAudioPlayer()` hook
  - Removed manual audio mode configuration (automatic system integration)
  - Simplified error handling with silent fallbacks
  - Better iOS silent mode compatibility
- **Timer Architecture**: Replaced monolithic TimerCircle with modular TimerDial system
- **Code Organization**: Better separation of concerns with specialized hooks
  - useDialOrientation: Centralized angle/minute conversion logic
  - useTimer: Enhanced with pause state management
- **UI Improvements**:
  - Applied currentColor from palette to activity buttons and play button
  - Basic activity icon now uses proportional gray circles instead of image
  - Individual animation states for each activity in carousel

### Fixed
- **Critical Bug**: NaN opacity error in animations (using Animated.multiply instead of direct multiplication)
- **Timer Drag**: Now works correctly when timer is paused
- **Arc Alignment**: Perfect alignment between arc progress and graduation marks
- **Carousel Animation**: Each activity now has its own animation state
- **Responsive Layout**: Removed fixed height from color carousel for better responsiveness
- **Version Sync**: Aligned app.json version with Android build.gradle

### Technical Debt Addressed
- Removed code duplication in dial rendering
- Extracted constants for better maintainability
- Improved drag physics with resistance and easing
- Fixed wrap-around prevention at midnight (0↔60 transitions)

## [1.0.3] - 2025-09-26

### Fixed - 2025-09-26 (Critical Android Build Fix)
- **CRITICAL**: Resolved ExpoAsset crash on Android production builds
- Downgraded from Expo SDK 53 to SDK 51 for stability
- Reverted React from 19.0.0 to 18.2.0 to fix compatibility issues
- Disabled New Architecture to prevent runtime crashes
- Fixed keystore configuration for Google Play Store signing

### Changed - 2025-09-26 (Build Configuration)
- Updated all dependencies to SDK 51 compatible versions
- Configured proper Android build with correct keystore credentials
- Incremented versionCode to 9 for Play Store release
- Created comprehensive Android build documentation (ANDROID_BUILD_CONFIG.md)

### Added - 2025-09-26 (Documentation)
- Complete Android build configuration guide with working setup
- Keystore management instructions and SHA1 verification steps
- Troubleshooting guide for common build issues

## [Unreleased]

### Changed - 2025-09-25 (Part 13 - Documentation Organization)
- Reorganized documentation structure with dedicated subdirectories
- Moved all documentation files from root to organized `/docs` folders
- Created specialized folders: `audits/`, `fixes/`, `deployment/`, `legal/`
- Added deployment information document with iOS/Android build details
- Enhanced `.gitignore` with better coverage for sensitive and temporary files

### Fixed - 2025-09-25 (Part 13)
- Root directory clutter with 10+ documentation files
- Missing deployment configuration documentation
- Backup files and sensitive keystore files in repository

### Removed - 2025-09-25 (Part 13)
- `package.json.backup` unnecessary backup file
- Documentation files from root (moved to `/docs`)

## [1.0.2] - 2025-09-25

### Added - 2025-09-25 (Part 12 - Android Platform Fixes & UI Improvements)
- Timer icon (timer.png) for "Basique" activity replacing missing emoji
- Static background disc for activity emojis when animations are disabled (accessibility)
- Improved cross-platform button handling with Pressable component

### Changed - 2025-09-25 (Part 12)
- Activity carousel buttons now use TouchableOpacity for better Android stability
- Removed tintColor from timer icon to preserve original design colors
- Default activity set to "Basique" (none) on app launch
- Pulse animations disabled by default for epilepsy safety compliance

### Fixed - 2025-09-25 (Part 12)
- React.Children.only error on Android with TouchableNativeFeedback
- Square artifacts appearing after selecting activity buttons on Android
- Octagonal shape rendering issue for activity buttons on Android
- Activity carousel proper circular button shapes on all platforms
- Index calculation bug in activity carousel preventing proper default selection

### Added - 2025-09-24 (Part 11 - Freemium Strategy & Final Polish)
- Test mode configuration for unlocking all premium content during testing
- 12 new premium activities (Pause, Sport, Yoga, Marche, Lecture, Étude, Créativité, Cuisine, Jeux, Devoirs, Musique, Ménage)
- Activity lock system with visual indicators in settings
- Smart activity ordering with favorites prioritization in carousel
- Default timer color changed to blue-gray (#4A5568) for better first impression

### Changed - 2025-09-24 (Part 11)
- Restructured freemium model: 4 free activities vs 12 premium (more compelling upgrade incentive)
- "Pause" activity moved to premium tier (creates desire after using "Travail")
- Splash screen background color adjusted to match icon (#F5F5F0)
- PanResponder now recreates on mode change for accurate touch handling
- Activity carousel maintains favorites sorting for personalized experience

### Fixed - 2025-09-24 (Part 11)
- Timer duration selection now accurate in both 60min and 25min modes
- PanResponder stale closure issue when switching between timer modes
- Premium content locks properly respect test mode status
- Activity ordering consistency between carousel and settings

### Fixed - 2025-09-24 (Part 10 - Timer Selection Accuracy)
- Fixed incorrect duration selection in 25min mode where visual positions didn't match selected minutes
- Refactored angleToMinutes calculation to use proper angular distributions per mode
- 60min mode now correctly uses 6° per minute distribution
- 25min mode now correctly uses 14.4° per minute distribution
- Clicking on graduation "15" in 25min mode now correctly selects 15 minutes (was showing 45-50)

### Added - 2025-09-24 (Part 9 - Code Quality & Performance)
- PlatformTouchable utility component for cross-platform touch handling
- Constants directory with centralized design tokens and animation durations
- React.memo optimization on TimerCircle component
- useMemo hooks for expensive calculations (createNumbers, createProgressArc)
- Centralized animation constants (PULSE_ANIMATION, COMPLETION_ANIMATION, etc.)
- Design system constants for SVG dimensions and proportions
- Performance monitoring with optimized re-render prevention

### Changed - 2025-09-24 (Part 9)
- Refactored all hardcoded animation durations to use constants
- Extracted magic numbers to design.js (stroke width, padding, ratios)
- Moved StyleSheet creation outside components for better performance
- Optimized TimerCircle with memoization to prevent unnecessary recalculations
- Replaced duplicated platform touch logic with reusable component

### Fixed - 2025-09-24 (Part 9)
- TimerScreen syntax error from incomplete StyleSheet removal
- Unnecessary re-renders in TimerCircle component
- Performance bottlenecks from recalculating unchanged values

## [1.0.1] - 2025-09-24

### Technical - 2025-09-24 (Part 9)
- Created `/src/utils/PlatformTouchable.jsx` for touch handling abstraction
- Created `/src/constants/animations.js` with all timing constants
- Created `/src/constants/design.js` with design system values
- Applied useMemo to computationally expensive operations
- Implemented proper React.memo comparison for TimerCircle props
- Removed 15% of duplicated code and improved render performance by ~20%

### Fixed - 2025-09-24 (Part 8 - Compliance & Testing)
- **Critical**: Disabled pulsation animation by default (epilepsy compliance)
- **Critical**: Removed excessive Android permissions (only INTERNET and VIBRATE kept)
- Added epilepsy warning modal for pulsation animation toggle
- Added accessibility labels to all interactive components
- Fixed timer not advancing in both 60min and 25min modes
- Fixed graduation tap broken when switching between modes
- Removed all test dependencies and Jest configuration (rollback)

### Changed - 2025-09-24 (Part 8)
- Pulsation animation now opt-in with warning (WCAG 2.1 compliance)
- Android manifest cleaned of unnecessary permissions
- All buttons now have proper accessibilityLabel and accessibilityHint

### Added - 2025-09-23 (Part 7 - Timer Completion Feedback)
- Haptic feedback on timer completion (respects system settings)
- Visual completion animation with 3 gentle pulses
- Color transition to green (#48BB78) on timer completion
- Contextual completion messages based on activity type
- "shouldPulse" toggle in settings to control timer pulsation
- Automatic detection and respect of device silent mode
- Platform-aware haptic patterns (iOS notification success)

### Changed - 2025-09-23 (Part 7)
- Timer completion now provides multi-sensory feedback
- Activity-specific completion messages (e.g., "Méditation terminée")
- Enhanced useTimer hook with completion state management
- TimerCircle component supports completion animations

### Fixed - 2025-09-23 (Part 7)
- Timer completion state properly resets after animation
- Haptic feedback gracefully handles failures
- Completion animation timing synchronized with haptic feedback

### Fixed - 2025-09-23 (Part 6 - 25min Mode Fixes)
- Fixed 25 appearing above 0 in 25min mode timer display
- Corrected angle-to-minutes calculation for 25min mode to match visual distribution
- Limited maximum timer duration to 25 minutes when in 25min mode
- Fixed incorrect minute selection when clicking/dragging in 25min mode
- Aligned number distribution with actual timer functionality in Pomodoro mode

### Added - 2025-09-23 (Part 5 - Gesture Controls & UI Polish)
- Tap on timer graduations to set duration instantly
- Drag gesture on timer dial for continuous duration adjustment
- Double tap on timer for quick play/pause
- Vertical swipe gesture to pause timer during execution (zen mode exit)
- Visual feedback showing duration while dragging
- Activity name display instead of generic "C'est parti!" when starting
- Larger SVG container to prevent graduation numbers from being cut off

### Changed - 2025-09-23 (Part 5)
- Timer dial visibility improved with thicker stroke (4.5px) and darker graduations
- Activity carousel simplified - removed text labels, increased emoji size (28px → 34px)
- Control buttons repositioned to bottom center for better ergonomics
- Palette carousel dots removed for cleaner interface
- Graduation numbers positioned with more spacing from dial (18px)
- Focus mode animation - UI elements fade when timer is running
- Timer size limited to 320px max to maintain golden ratio proportions

### Fixed - 2025-09-23 (Part 5)
- Activity buttons being cut off by container overflow
- Control buttons positioned too high on screen
- Drag and tap gestures not properly blocked during timer execution
- Graduation numbers being cut off at container edges
- Palette dots spacing issues in carousel

### Removed - 2025-09-23 (Part 5)
- Duration preset buttons (replaced by tap/drag gestures)
- Activity text labels in carousel (cleaner emoji-only design)
- Palette scroll indicator dots

### Added - 2025-09-23 (Part 4 - Cross-Platform Adaptive Design)
- Platform-adaptive styling system with `platformStyles.js`
- Adaptive shadow system (iOS shadows vs Android Material elevation)
- Cross-platform haptic feedback module with iOS/Android specific patterns
- Platform-specific animations with Material Design (Android) and iOS HIG timing
- Native touchable components (TouchableOpacity iOS vs TouchableNativeFeedback Android)
- Ripple effects on Android buttons, highlight effects on iOS
- Platform-aware modal styles (vibrancy blur iOS vs overlay Android)
- Switch components with native styling per platform
- Animation library with platform-specific easing curves and spring configs

### Changed - 2025-09-23 (Part 4)
- ThemeProvider enhanced with platform-adaptive tokens and style creators
- SettingsModal refactored with native touchables and haptic feedback
- ActivityCarousel updated with platform-specific touch feedback
- All shadows migrated to adaptive shadow system
- Button interactions now include haptic feedback
- Modal presentations respect platform conventions

### Technical - 2025-09-23 (Part 4)
- Created `/src/styles/platformStyles.js` for conditional styling
- Created `/src/styles/shadows.js` for adaptive elevation/shadows
- Created `/src/utils/haptics.js` for cross-platform haptic feedback
- Created `/src/styles/animations.js` for platform-specific animations
- Safe optional chaining for TouchableNativeFeedback to prevent runtime errors

### Added - 2025-09-23 (Part 3 - Theme Refactoring)
- New simplified theme system with clear separation of concerns
- `src/theme/` directory with modular color and token management
- Light/Dark theme support infrastructure (dark mode ready)
- Dedicated `TimerPaletteContext` for timer color management
- IRIM brand colors: Turquoise (#00A0A0), Bleu foncé (#004466), Orange (#F06424)
- Documentation: `docs/theme-management.md` for theme system guide
- Improved light theme with subtle gray background (#F9FAFB)

### Changed - 2025-09-23 (Part 3)
- Major theme system refactoring from monolithic to modular architecture
- Default palette changed from "laser" to "terre" (more natural colors)
- Activities no longer force color changes - user maintains control
- Activity selection uses current palette color instead of brand color
- Separated UI theme colors from timer palette colors
- Reduced shadow opacity for subtler depth (0.08 from 0.1)
- Overlay colors less aggressive (rgba(248,249,250,0.92) from pure white)

### Fixed - 2025-09-23 (Part 3)
- Activity carousel showing wrong color (turquoise) for selected items
- Import errors from old theme system references
- Layout.js dependency on deleted theme file
- Settings modal using outdated palette imports
- Visual regression where selected activities lost palette harmony

## [1.0.0] - 2025-09-23

### Removed - 2025-09-23 (Part 3)
- Old monolithic `src/styles/theme.js` file
- Obsolete `src/styles/palette.json` file
- Redundant `src/config/palettes.js` file
- Temporary compatibility `src/components/ThemeProvider.jsx`
- 90% of unused code from `src/styles/layout.js`

### Added - 2025-09-23 (Part 2)
- Activity carousel with 8 emoji activities (4 free, 4 premium)
- Favorites system for activity reordering in settings modal
- Premium lock overlays on premium activities and palettes
- Complete responsive design system with rs(), rf(), getLayout() functions
- Activity persistence across app restarts
- Premium palette restrictions (only terre and laser available in free version)
- Lock icons on premium content (activities and palette colors)

### Changed - 2025-09-23 (Part 2)
- Major refactor of layout system from mixed flex/fixed to pure flex-based design
- Replaced all responsiveSize() calls with new rs() responsive system
- Improved component sizing with getComponentSizes() for consistent scaling
- Settings button moved from absolute positioning to header for better accessibility
- Enhanced PaletteCarousel with premium locks on unavailable palettes

### Fixed - 2025-09-23 (Part 2)
- Layout issues with component visibility and overlapping
- Settings button z-index and positioning problems
- Emoji centering in activity buttons
- Height management issues across all screen sizes
- Component imports updated for new responsive system

### Added - 2025-09-23
- Data persistence with AsyncStorage for user preferences
- usePersistedState and usePersistedObject hooks for automatic state persistence
- Palette carousel with horizontal swipe navigation between 8 color palettes
- Animated palette name display when switching palettes
- Visual indicators (dots) showing current palette position
- Automatic color validation when switching palettes
- Premium-ready palette system (infrastructure for future premium features)

### Changed - 2025-09-23
- Enhanced TimeTimer UI with improved layout and controls
- Timer default duration changed from 4 to 5 minutes
- Added increment/decrement buttons (±1 minute) for duration adjustment
- Redesigned preset buttons in 2x2 grid layout (5m, 15m, 30m, 45m)
- Improved ColorSwitch with larger touch targets and better visual feedback
- Enhanced TimerCircle with refined stroke width and gradient center dot
- Color switch container now has background and shadow for better visibility

### Fixed - 2025-09-23
- User preferences now persist across app restarts (palette, color, timer options)
- Color selection resets to default when switching to incompatible palette

### Added - 2025-09-22
- Settings modal with native iOS-style interface
- Palette selector with visual preview (8 palettes: terre, classique, laser, douce, pastel_girly, verts, bleus, canard)
- TimerOptions context for managing timer display settings
- Cadran toggle (60min mode vs Full duration mode)
- Rotation toggle (Clockwise vs Counter-clockwise)
- Settings icon in top-right corner
- PalettePreview component for visual color display
- Clean, minimal main screen layout (timer + color selector at thumb height)

### Changed
- Moved timer options to settings modal for cleaner UI
- Repositioned color selector below timer for better thumb accessibility (bottom: 120px)
- Removed PaletteSelector from main screen (now in settings)
- Simplified TimerScreen layout to focus on core timer functionality

### Added - Initial
- Initial React Native/Expo project setup
- Core timer functionality with useTimer hook (requestAnimationFrame-based for precision)
- TimerCircle component with SVG-based circular progress visualization
- TimeTimer component with preset durations (4m, 20m)
- ThemeProvider with Context API for theming
- Golden ratio-based design system (1.618 proportions)
- Responsive layout utilities for iPhone sizes (SE, 12/13/14, Pro Max)
- Laser color palette (green, cyan, magenta, yellow)
- French timer messages ("C'est parti", "C'est reparti", "C'est fini", "Pause")
- Play/Pause/Reset controls
- Color selector for timer visualization (4 laser colors)
- Dynamic preset button styling (colored background matching selected color)

## [0.1.0] - 2025-09-20

### Technical
- React Native 0.79.5
- Expo SDK 52
- React Native SVG for circular timer graphics
- Folder structure: components, screens, styles, hooks, utils
- Theme system with colors, spacing, borders, shadows
- Responsive sizing based on device width