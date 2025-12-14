---
created: '2025-12-14'
updated: '2025-12-14'
status: active
priority: P0-CRITICAL
---

# Handoff: UX/Conversion Remediation (P0 Critical)

> 4 blockers de conversion a corriger en priorite

## Context

Audit #5 revele **4 P0 critiques** qui bloquent le funnel de conversion. L'app perd des utilisateurs a chaque etape critique.

**Metrics actuelles**:
- Onboarding completion: 40% (target: 60%)
- Two Timers milestone: 18% (target: 40%)
- Install-to-Trial: ~3% (target: 6%)

---

## Task 1: Add Onboarding Progress Indicator (P0)

**Effort**: 2-4h | **Impact**: +15% OB completion

### Problem

8 screens with no visual progress indicator. Users abandon because they don't know how many screens remain.

### Solution: Create StepIndicator Component

**Create**: `src/components/onboarding/StepIndicator.jsx`

```javascript
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';

const StepIndicator = ({ current, total }) => {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      {Array.from({ length: total }, (_, i) => (
        <View
          key={i}
          style={[
            styles.dot,
            {
              backgroundColor: i < current
                ? theme.colors.brand.primary
                : i === current
                  ? theme.colors.brand.primary
                  : theme.colors.ui.border,
              opacity: i === current ? 1 : i < current ? 0.6 : 0.3,
              transform: [{ scale: i === current ? 1.2 : 1 }],
            },
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});

export default StepIndicator;
```

### Integrate in OnboardingFlow

**Edit**: `src/screens/onboarding/OnboardingFlow.jsx`

```javascript
import StepIndicator from '../../components/onboarding/StepIndicator';

// In render, at top of each filter screen:
<StepIndicator current={currentFilterIndex} total={totalFilters} />
```

### Verification

- [ ] Progress dots visible at top of each onboarding screen
- [ ] Current step highlighted (larger, full opacity)
- [ ] Completed steps visible but dimmed
- [ ] Works on both branches (discover: 8, personalize: 8)

---

## Task 2: Fix Modal Stacking (P0)

**Effort**: 2-3 days | **Impact**: Prevents UX deadlocks

### Problem

Modal chain creates loops:
```
ActivityCarousel → PremiumModal → MoreActivitiesModal → PremiumModal (loop!)
```

No back button, race conditions on dismissal.

### Solution: Single PremiumModal with Source Prop

**Step 1: Add source prop to PremiumModal**

**Edit**: `src/components/modals/PremiumModal.jsx`

```javascript
const PremiumModal = ({
  visible,
  onClose,
  source = 'default', // 'activity_carousel', 'palette_carousel', 'settings', 'two_timers'
  highlightedFeature = null,
}) => {
  // Track source for analytics
  useEffect(() => {
    if (visible) {
      analytics.trackPaywallViewed({ source, highlightedFeature });
    }
  }, [visible, source]);

  // Customize content based on source
  const getHeaderText = () => {
    switch (source) {
      case 'activity_carousel':
        return t('premium.unlockActivities');
      case 'palette_carousel':
        return t('premium.unlockPalettes');
      case 'two_timers':
        return t('premium.congratulations');
      default:
        return t('premium.title');
    }
  };

  // ...rest of component
};
```

**Step 2: Remove MoreActivitiesModal and MoreColorsModal from PremiumModal**

**Edit**: `src/components/modals/PremiumModal.jsx`

Remove all `MoreActivitiesModal` and `MoreColorsModal` rendering. These should be standalone discovery modals, not nested.

**Step 3: Update Carousel to Use Single Modal**

**Edit**: `src/components/ActivityCarousel.jsx`

```javascript
// Instead of opening PremiumModal which opens MoreActivitiesModal
const handlePlusPress = () => {
  // Option A: Open discovery modal directly
  setShowMoreActivitiesModal(true);

  // OR Option B: Open premium modal with source
  // setPremiumModalVisible(true);
  // setPremiumSource('activity_carousel');
};
```

**Step 4: Add Modal Navigation State**

**Create**: `src/hooks/useModalNavigation.js`

```javascript
import { useState, useCallback } from 'react';

export const useModalNavigation = () => {
  const [modalStack, setModalStack] = useState([]);

  const openModal = useCallback((modalId, props = {}) => {
    setModalStack(prev => [...prev, { id: modalId, props }]);
  }, []);

  const closeModal = useCallback(() => {
    setModalStack(prev => prev.slice(0, -1));
  }, []);

  const closeAllModals = useCallback(() => {
    setModalStack([]);
  }, []);

  const currentModal = modalStack[modalStack.length - 1] || null;
  const canGoBack = modalStack.length > 1;

  return {
    currentModal,
    canGoBack,
    openModal,
    closeModal,
    closeAllModals,
    modalStack,
  };
};
```

### Verification

- [ ] No more than 1 modal visible at a time
- [ ] Back button works when modals chained
- [ ] No race conditions on rapid dismiss
- [ ] Analytics tracks `source` for each paywall view

---

## Task 3: Add Purchase Error Recovery (P0)

**Effort**: 2-3h | **Impact**: Capture lost revenue

### Problem

Error scenarios close modal without recovery path:
- Network error → OK → Modal closes → User must re-navigate
- Store problem → Generic message → No guidance
- Payment pending → No status check

### Solution: Add Retry and Support Options

**Edit**: `src/contexts/PurchaseContext.jsx`

```javascript
const handleNetworkError = () => {
  Alert.alert(
    t('purchase.networkErrorTitle'),
    t('purchase.networkErrorMessage'),
    [
      {
        text: t('common.cancel'),
        style: 'cancel',
      },
      {
        text: t('purchase.retry'),
        onPress: () => handlePurchase(), // Retry same purchase
      },
    ]
  );
};

const handleStoreError = () => {
  Alert.alert(
    t('purchase.storeErrorTitle'),
    t('purchase.storeErrorMessage'),
    [
      {
        text: t('common.ok'),
        style: 'cancel',
      },
      {
        text: t('purchase.contactSupport'),
        onPress: () => Linking.openURL('mailto:support@resetpulse.app'),
      },
    ]
  );
};

const handlePendingPurchase = () => {
  Alert.alert(
    t('purchase.pendingTitle'),
    t('purchase.pendingMessage'),
    [
      {
        text: t('common.ok'),
      },
      {
        text: t('purchase.checkStatus'),
        onPress: () => restorePurchases(), // Check if purchase completed
      },
    ]
  );
};
```

### Add Pending Status UI in Settings

**Edit**: `src/components/modals/SettingsModal.jsx`

```javascript
// Add section for pending purchases
{hasPendingPurchase && (
  <SettingsRow
    icon="clock"
    label={t('settings.pendingPurchase')}
    onPress={checkPendingPurchase}
    rightElement={<ActivityIndicator size="small" />}
  />
)}
```

### Add i18n Keys

**Edit**: `src/i18n/locales/en.json`

```json
{
  "purchase": {
    "networkErrorTitle": "Connection Issue",
    "networkErrorMessage": "Unable to connect to the store. Please check your internet connection.",
    "retry": "Retry",
    "storeErrorTitle": "Store Unavailable",
    "storeErrorMessage": "The app store is temporarily unavailable. Please try again later.",
    "contactSupport": "Contact Support",
    "pendingTitle": "Purchase Pending",
    "pendingMessage": "Your purchase is being processed. We'll notify you when it's complete.",
    "checkStatus": "Check Status"
  }
}
```

### Verification

- [ ] Network error shows Retry button
- [ ] Store error shows Contact Support option
- [ ] Pending purchase shows Check Status option
- [ ] Settings shows pending purchase status
- [ ] i18n keys added for all supported languages

---

## Task 4: Fix AsyncStorage App Launch Blocking (P0)

**Effort**: 4-6h | **Impact**: Better first impression

### Problem

```javascript
// App.js lines 38-47
const [onboardingCompleted, setOnboardingCompleted] = useState(null);
// null blocks render → blank screen 500-1000ms
```

### Solution: Optimistic Loading with Splash

**Step 1: Add Splash Component**

**Create**: `src/components/SplashScreen.jsx`

```javascript
import React from 'react';
import { View, Image, StyleSheet, ActivityIndicator } from 'react-native';

const SplashScreen = () => {
  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/icon.png')}
        style={styles.logo}
        resizeMode="contain"
      />
      <ActivityIndicator
        size="small"
        color="#e5a8a3"
        style={styles.loader}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ebe8e3', // Brand cream background
  },
  logo: {
    width: 120,
    height: 120,
  },
  loader: {
    marginTop: 24,
  },
});

export default SplashScreen;
```

**Step 2: Update App.js Loading Logic**

**Edit**: `App.js`

```javascript
import SplashScreen from './src/components/SplashScreen';

const App = () => {
  // Default to false (show onboarding) as optimistic value
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadState = async () => {
      try {
        // Parallelize AsyncStorage reads
        const [completed, theme, options] = await Promise.all([
          AsyncStorage.getItem(ONBOARDING_COMPLETED_KEY),
          AsyncStorage.getItem(THEME_KEY),
          AsyncStorage.getItem(OPTIONS_KEY),
        ]);

        setOnboardingCompleted(completed === 'true');
        // Apply other state...
      } catch (error) {
        console.warn('Failed to load state:', error);
        setOnboardingCompleted(false);
      } finally {
        setIsLoading(false);
      }
    };

    loadState();
  }, []);

  // Show branded splash instead of blank screen
  if (isLoading) {
    return <SplashScreen />;
  }

  // Rest of app render...
};
```

**Step 3: Move analytics to after render**

```javascript
// Fire app_opened after UI is ready, not before
useEffect(() => {
  if (!isLoading) {
    analytics.trackAppOpened();
  }
}, [isLoading]);
```

### Verification

- [ ] Branded splash screen appears immediately on launch
- [ ] No blank white screen
- [ ] App loads in <500ms on slow devices
- [ ] `app_opened` fires after UI renders
- [ ] State loads correctly after splash

---

## P1 Quick Win: Fix Two Timers Modal Trigger

**Effort**: 30min | **Impact**: +17% milestone reach

### Problem

```javascript
// TimerScreen.jsx line 169
if (newCount === 2 && !hasSeenTwoTimersModal) {
  // Exact match on 2 is fragile
}
```

### Solution: Range Check with Fallback

```javascript
// More robust trigger
if (newCount >= 2 && newCount <= 3 && !hasSeenTwoTimersModal) {
  analytics.trackTwoTimersMilestone();
  setTwoTimersModalVisible(true);
  setHasSeenTwoTimersModal(true);
}

// Fallback at timer #5 if modal never shown
if (newCount === 5 && !hasSeenTwoTimersModal) {
  analytics.trackTwoTimersMilestone({ fallback: true });
  setTwoTimersModalVisible(true);
  setHasSeenTwoTimersModal(true);
}
```

### Verification

- [ ] Modal shows at timer #2 or #3
- [ ] Fallback at timer #5 if missed
- [ ] Analytics tracks `fallback: true` when fallback used
- [ ] Modal only shows once per install

---

## Testing Checklist

### Onboarding Flow
- [ ] Progress indicator visible on all 8 screens
- [ ] Both branches (discover/personalize) work
- [ ] Skip button still works

### Modal Navigation
- [ ] No modal stacking (max 1 modal at a time)
- [ ] Back button navigates correctly
- [ ] No race conditions

### Purchase Flow
- [ ] Network error → Retry works
- [ ] Store error → Support link works
- [ ] Pending purchase → Check status works

### App Launch
- [ ] Splash shows immediately
- [ ] No blank screen
- [ ] State loads correctly
- [ ] Analytics fires after UI ready

---

## Priority Order

1. **Task 4** (AsyncStorage) — First impression critical
2. **Task 1** (Progress Indicator) — Quick win, high impact
3. **Task 3** (Error Recovery) — Capture lost revenue
4. **P1 Quick Win** (Two Timers) — 30 min, +17% potential
5. **Task 2** (Modal Stacking) — Larger refactor, schedule later

---

## References

- [UX/Conversion Report](../reports/ux-conversion.md)
- [ADR-003 Conversion Strategy](../legacy/decisions-adr-003-strateie-conversion.md)
- Audit: `_internal/cockpit/knowledge/findings/2025-12-14_05-ux-conversion.md`

---

**Total P0 Effort**: ~12-16h (including P1 quick win)
**Target**: Onboarding 40%→55%, Two Timers 18%→35%, Install→Trial 3%→6%
