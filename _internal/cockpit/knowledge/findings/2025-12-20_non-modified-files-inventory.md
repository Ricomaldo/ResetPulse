---
created: '2025-12-20'
updated: '2025-12-20'
status: active
---

# Non-Modified Files Inventory

**Session**: UI/UX Review + Color System Refactor (2025-12-19/2025-12-20)

**Finding**: After major refactoring session, 98 files in `src/` remain unmodified. These are candidates for inspection:
- **Perfect implementations** (well-architected, tested, stable)
- **Dead code** (unused, can be removed)

## 📦 Exports/Indices (8 files)
```
src/components/buttons/index.js
src/components/carousels/activity-items/index.js
src/components/carousels/index.js
src/components/controls/index.js
src/components/dial/index.js
src/components/layout/aside-content/index.js
src/components/layout/index.js
src/components/settings/index.js
```

## 🎨 UI Buttons/Controls (9 files)
```
src/components/buttons/Button.jsx
src/components/controls/CircularToggle.jsx
src/components/controls/DurationPresets.jsx
src/components/controls/FitButton.jsx
src/components/controls/PresetPills.jsx
src/components/pickers/DurationSlider.jsx
src/components/pickers/EmojiPicker.jsx
src/components/pickers/PalettePreview.jsx
src/components/pickers/index.js
```

## 📟 Carousel Components (3 files)
```
src/components/carousels/PaletteCarousel.jsx
src/components/messaging/DotsAnimation.jsx
src/components/messaging/index.js
```

## 🎪 Dial System (4 files)
```
src/components/dial/ActivityBadgeOverlay.jsx
src/components/dial/ActivityLabel.jsx
src/components/dial/dial/DialGraduations.jsx
src/components/dial/dial/DialProgress.jsx
src/components/dial/TimeTimer.jsx
```

## 🎯 Layout/Layout Zones (7 files)
```
src/components/layout/aside-content/FavoriteToolBox.jsx
src/components/layout/AsideZone.jsx
src/components/layout/DialZone.jsx
src/components/layout/Icons.jsx
src/components/layout/SplashScreen.jsx
src/components/messaging/MessageZone.jsx
```

## 🪟 Modals (14 files)
```
src/components/modals/BottomSheet.template.jsx
src/components/modals/CreateActivityModal.jsx
src/components/modals/DiscoveryModal.jsx
src/components/modals/EditActivityModal.jsx
src/components/modals/index.js
src/components/modals/ModalStackRenderer.jsx
src/components/modals/MoreActivitiesModal.jsx
src/components/modals/MoreColorsModal.jsx
src/components/modals/PremiumModal.jsx
src/components/modals/settings/SettingsCarouselBarSection.jsx
src/components/modals/settings/SettingsCommandBarSection.jsx
src/components/modals/settings/SettingsDialSection.jsx
src/components/modals/settings/SettingsGeneralSection.jsx
src/components/modals/settings/SettingsSoundSection.jsx
src/components/modals/settings/SettingsThemeSection.jsx
src/components/modals/TwoTimersModal.jsx
```

## ⚙️ Config (4 files)
```
src/config/revenuecat.js
src/config/snap-settings.js
src/config/sounds-mapping.js
src/config/sounds.js
```

## 🎛️ Contexts (3 files)
```
src/contexts/ModalStackContext.jsx
src/contexts/TimerPaletteContext.jsx
src/contexts/UserPreferencesContext.jsx
```

## 🔧 Dev/Dev FAB (2 files)
```
src/dev/components/DevFab.jsx
src/dev/DevPremiumContext.js
```

## 🪝 Hooks (13 files)
```
src/hooks/useAnalytics.js
src/hooks/useAnimatedDots.js
src/hooks/useCustomActivities.js
src/hooks/useModalNavigation.js
src/hooks/useNotificationTimer.js
src/hooks/usePerformanceTracking.js
src/hooks/usePersistedState.js
src/hooks/usePremiumStatus.js
src/hooks/useReducedMotion.js
src/hooks/useScreenOrientation.js
src/hooks/useSimpleAudio.js
src/hooks/useTimer.js
src/hooks/useTimerKeepAwake.js
src/hooks/useTranslation.js
```

## 🌍 i18n (1 file)
```
src/i18n/index.js
```

## 📋 Onboarding Filters (12 files)
```
src/screens/onboarding/filters/Filter-010-opening.jsx
src/screens/onboarding/filters/Filter-020-needs.jsx
src/screens/onboarding/filters/Filter-030-creation.jsx
src/screens/onboarding/filters/Filter-040-test.jsx
src/screens/onboarding/filters/Filter-050-notifications.jsx
src/screens/onboarding/filters/Filter-060-branch.jsx
src/screens/onboarding/filters/Filter-070-vision-discover.jsx
src/screens/onboarding/filters/Filter-080-sound-personalize.jsx
src/screens/onboarding/filters/Filter-090-paywall-discover.jsx
src/screens/onboarding/filters/Filter-100-interface-personalize.jsx
src/screens/onboarding/filters/index.js
src/screens/onboarding/index.js
src/screens/onboarding/onboardingConstants.js
src/screens/onboarding/OnboardingFlow.jsx
```

## 📊 Analytics/Services (8 files)
```
src/services/analytics.js
src/services/analytics/conversion-events.js
src/services/analytics/custom-activities-events.js
src/services/analytics/index.js
src/services/analytics/onboarding-events.js
src/services/analytics/settings-events.js
src/services/analytics/timer-events.js
```

## 🎨 Styles (6 files)
```
src/styles/animations.js
src/styles/focusStyles.js
src/styles/gridLayout.js
src/styles/layout.js
src/styles/platformStyles.js
src/styles/responsive.js
src/styles/shadows.js
```

## 🧪 Test Utils + Theme (3 files)
```
src/test-utils/timer-helpers.js
src/theme/ThemeProvider.jsx
src/theme/tokens.js
```

## 🛠️ Utilities (3 files)
```
src/utils/haptics.js
src/utils/logger.js
src/utils/PlatformTouchable.jsx
```

---

## 🎯 Inspection Priorities

### High Priority (Core Logic)
1. **Hooks** (13 files) - State management, side effects. Check for unused or redundant hooks.
2. **Analytics** (8 files) - Event tracking. Verify all events are firing correctly post-refactor.
3. **Contexts** (3 files) - State providers. Ensure they're still being consumed correctly.

### Medium Priority (UI Quality)
4. **Modals** (14 files) - Complex interactions. Some may be unused (e.g., old modals).
5. **Onboarding Filters** (12 files) - Sequential flow. Check which filters are actually used.

### Lower Priority (Foundational)
6. **Styles/Theme** (9 files) - Style utilities and theme setup. Should be stable.
7. **Config** (4 files) - Configuration constants. Validate no deprecated configs.

### Suspicious Candidates
- `src/components/layout/aside-content/FavoriteToolBox.jsx` - Possible duplicate of ToolBox?
- `src/styles/focusStyles.js` - Web focus management (unused in mobile)?
- `src/utils/PlatformTouchable.jsx` - Platform abstraction (check if used)

---

## Notes

- Session: Extensive color system refactor, layout hierarchy fixes, acceleration optimization
- Modified: 37 files across components, config, contexts, styles
- Deleted: 2 old settings modal files
- Unmodified: 98 files (perfect candidates for audit)
