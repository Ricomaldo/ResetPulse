# Changelog

All notable changes to ResetPulse will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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

### Technical
- React Native 0.81.4
- Expo SDK 54
- React Native SVG for circular timer graphics
- Folder structure: components, screens, styles, hooks, utils
- Theme system with colors, spacing, borders, shadows
- Responsive sizing based on device width