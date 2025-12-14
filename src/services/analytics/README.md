# Analytics Service - Modular Architecture

## Overview

The analytics service has been refactored from a 640-line monolithic file into a modular architecture with feature-specific event modules.

## Structure

```
src/services/analytics/
├── index.js                      (11 lines)  - Central export hub
├── onboarding-events.js          (179 lines) - 12 onboarding tracking methods
├── timer-events.js               (75 lines)  - 3 core timer tracking methods
├── conversion-events.js          (154 lines) - 8 conversion/discovery methods
├── settings-events.js            (29 lines)  - 1 settings tracking method
└── custom-activities-events.js   (100 lines) - 6 CRUD event methods

src/services/analytics.js         (189 lines) - Core singleton + init
```

**Total**: 737 lines (modular) vs 640 lines (monolithic)
**Main file**: 189 lines (70% reduction from 640)

## Benefits

1. **Maintainability**: Feature-specific modules are easier to understand and modify
2. **Scalability**: New features can add their own event modules without bloating core
3. **Discoverability**: Module names clearly indicate which events they contain
4. **Testing**: Each module can be tested independently
5. **Backward Compatible**: All existing imports and method calls work unchanged

## Usage

### Importing (unchanged)

```javascript
import analytics from '../services/analytics';
```

### Calling Methods (unchanged)

```javascript
// Onboarding events
analytics.trackOnboardingStarted();
analytics.trackOnboardingStepViewed(0, 'opening');
analytics.trackOnboardingCompleted('trial_started', ['work'], 'discover');

// Timer events
analytics.trackTimerStarted(1500, activity, '#FF6B6B', 'terre');
analytics.trackTimerCompleted(1500, activity, 100);

// Conversion events
analytics.trackTwoTimersMilestone();
analytics.trackDiscoveryModalShown('colors');

// Settings events
analytics.trackSettingChanged('theme', 'dark', 'light');

// Custom activities events
analytics.trackCustomActivityCreated('🎯', 15, 1800);
```

## Architecture Pattern

### Module Exports

Each module exports an object with bound methods:

```javascript
// onboarding-events.js
export const onboardingEvents = {
  trackOnboardingStarted() {
    this.track('onboarding_started', {});
  },
  // ... more methods
};
```

### Core Binding

The main `analytics.js` binds all module methods to the singleton instance:

```javascript
_bindModules() {
  const modules = [
    onboardingEvents,
    timerEvents,
    conversionEvents,
    settingsEvents,
    customActivitiesEvents,
  ];

  modules.forEach((module) => {
    Object.keys(module).forEach((methodName) => {
      this[methodName] = module[methodName].bind(this);
    });
  });
}
```

This ensures:
- All methods have access to `this.track()`, `this.mixpanel`, etc.
- Single analytics instance manages all tracking
- Methods callable as `analytics.trackXxx()`

## Event Inventory

### Onboarding Events (12)
- `trackOnboardingStarted()`
- `trackOnboardingStepViewed(step, stepName)`
- `trackOnboardingStepCompleted(step, stepName, data)`
- `trackOnboardingAbandoned(step, stepName)`
- `trackOnboardingCompleted(result, needs, branch)`
- `trackTimerConfigSaved(config)`
- `trackOnboardingNotifRequested()`
- `trackOnboardingNotifGranted()`
- `trackOnboardingNotifSkipped()`
- `trackOnboardingBranchSelected(branch)`
- `trackOnboardingSoundSelected(soundId)`
- `trackOnboardingInterfaceConfigured(theme, minimal, digital)`

### Timer Events (3)
- `trackTimerStarted(duration, activity, color, palette)`
- `trackTimerCompleted(duration, activity, completionRate)`
- `trackTimerAbandoned(duration, elapsed, reason, activity)`

### Conversion Events (8)
- `trackPaywallViewed(source)`
- `trackTrialStarted(packageId)`
- `trackPurchaseCompleted(packageId, price, transactionId)`
- `trackPurchaseFailed(errorCode, errorMessage, packageId)`
- `trackTwoTimersMilestone()`
- `trackTwoTimersModalShown()`
- `trackTwoTimersModalExploreClicked()`
- `trackTwoTimersModalDismissed()`
- `trackDiscoveryModalShown(type)`
- `trackDiscoveryModalUnlockClicked(type)`
- `trackDiscoveryModalDismissed(type)`

### Settings Events (1)
- `trackSettingChanged(settingName, newValue, oldValue)`

### Custom Activities Events (6)
- `trackCustomActivityCreated(emoji, nameLength, durationSeconds)`
- `trackCustomActivityEdited(activityId)`
- `trackCustomActivityDeleted(activityId, timesUsed)`
- `trackCustomActivityUsed(activityId, timesUsed)`
- `trackCustomActivityCreateAttemptFreeUser()`
- `trackCustomActivitiesExported(count)`

## Testing

All existing tests pass without modification:
- 135/135 tests passing
- 9/9 test suites passing
- No breaking changes to public API

## Migration Notes

**No migration required** - This refactoring is fully backward compatible. All existing:
- Component imports work unchanged
- Method calls work unchanged
- Tests pass without modification
- Analytics tracking behavior is identical

## Future Additions

To add new event modules:

1. Create new module file in `src/services/analytics/`
2. Export object with tracking methods
3. Import and add to `modules` array in `_bindModules()`
4. Export from `index.js`

Example:

```javascript
// src/services/analytics/feature-events.js
export const featureEvents = {
  trackFeatureUsed(featureName) {
    this.track('feature_used', { feature_name: featureName });
  },
};

// src/services/analytics/index.js
export { featureEvents } from './feature-events';

// src/services/analytics.js
import { ..., featureEvents } from './analytics/index';

_bindModules() {
  const modules = [..., featureEvents];
  // ...
}
```
