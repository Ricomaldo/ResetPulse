# Changelog

All notable changes to ResetPulse will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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