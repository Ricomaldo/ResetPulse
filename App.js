// App.js
import React, { useEffect, useState } from 'react';
import { StatusBar, View, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as Notifications from 'expo-notifications';

// ========== DEV MODE ==========
import { DEV_MODE, SHOW_DEV_FAB, DEV_DEFAULT_TIMER_CONFIG } from './src/config/test-mode';
import DevFab from './src/dev/components/DevFab';
import { DevPremiumProvider } from './src/dev/DevPremiumContext';
import { getActivityById } from './src/config/activities';
// ==============================
import { ThemeProvider, useTheme } from './src/theme/ThemeProvider';
import { PurchaseProvider } from './src/contexts/PurchaseContext';
import { TimerConfigProvider } from './src/contexts/TimerConfigContext';
import { ModalStackProvider } from './src/contexts/ModalStackContext';
import ModalStackRenderer from './src/components/modals/ModalStackRenderer';
import TimerScreen from './src/screens/TimerScreen';
import { OnboardingFlow } from './src/screens/onboarding';
import { ErrorBoundary } from './src/components/layout';
import Analytics from './src/services/analytics';

// Storage key pour onboarding V2
const ONBOARDING_COMPLETED_KEY = 'onboarding_v2_completed';

function AppContent() {
  const theme = useTheme();
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load onboarding state asynchronously
  useEffect(() => {
    const loadOnboardingState = async () => {
      try {
        const completed = await AsyncStorage.getItem(ONBOARDING_COMPLETED_KEY);
        console.log('[AppContent] Onboarding state loaded:', completed);
        setOnboardingCompleted(completed === 'true');
      } catch (error) {
        console.warn('[App] Failed to load onboarding state:', error);
        setOnboardingCompleted(false);
      } finally {
        setIsLoading(false);
      }
    };
    loadOnboardingState();
  }, []);

  // Handler for notification taps (post-skip reminders)
  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data;

      if (data.type === 'reminder_day_3') {
        // Day 3 reminder: User tapped notification
        Analytics.track('reminder_day_3_tapped', { activityId: data.activityId });
        // TODO: Navigate to TimerScreen with pre-selected activity (Phase 6)
      }

      if (data.type === 'reminder_day_7') {
        // Day 7 reminder: Open paywall
        Analytics.track('reminder_day_7_tapped');
        // TODO: Open PremiumModal via ModalStack (Phase 6)
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  // Callback quand l'onboarding V2 est terminé
  const handleOnboardingComplete = async (data) => {
    setOnboardingCompleted(true);

    // Persister les données onboarding v2.1
    try {
      await AsyncStorage.setItem(ONBOARDING_COMPLETED_KEY, 'true');

      // Map flowData to expected storage keys
      const onboardingConfig = {
        favoriteToolMode: data.favoriteToolMode || 'commands',
        customActivity: data.customActivity || null,
        persona: data.persona || null,
        selectedSoundId: data.selectedSoundId || 'bell_classic',
        notificationPermission: data.notificationPermission || false,
        purchaseResult: data.purchaseResult || 'skipped',
      };

      // Persist all onboarding data
      await AsyncStorage.setItem('onboarding_v2_config', JSON.stringify(onboardingConfig));

      console.log('[App] Onboarding v2.1 config saved:', onboardingConfig);
    } catch (error) {
      console.warn('[App] Failed to save onboarding state:', error);
    }
  };

  // Show loading while checking onboarding state
  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <StatusBar
          barStyle={theme.isDark ? 'light-content' : 'dark-content'}
          backgroundColor={theme.colors.background}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle={theme.isDark ? 'light-content' : 'dark-content'}
        backgroundColor={theme.colors.background}
      />

      {/* Onboarding V2 pour premier lancement */}
      {!onboardingCompleted ? (
        <OnboardingFlow onComplete={handleOnboardingComplete} />
      ) : (
        <TimerScreen />
      )}
    </View>
  );
}

export default function App() {
  // ========== DEV MODE STATE ==========
  const [resetTrigger, setResetTrigger] = useState(0);

  // Initialize Mixpanel Analytics (M7.5)
  useEffect(() => {
    const initAnalytics = async () => {
      await Analytics.init();

      // Track app_opened event
      const hasLaunched = await AsyncStorage.getItem('has_launched_before');
      Analytics.trackAppOpened(!hasLaunched);

      if (!hasLaunched) {
        await AsyncStorage.setItem('has_launched_before', 'true');
      }
    };

    initAnalytics();
  }, []);

  // ========== DEV: Reset Onboarding ==========
  const handleResetOnboarding = async () => {
    try {
      // Remove onboarding completion flag
      await AsyncStorage.removeItem(ONBOARDING_COMPLETED_KEY);

      // Remove unified config (timer, palette, layout)
      await AsyncStorage.removeItem('@ResetPulse:config');

      // Remove onboarding data
      await AsyncStorage.removeItem('onboarding_v2_config');

      setResetTrigger(prev => prev + 1); // Force AppContent remount
      console.log('[DevFab] Onboarding reset - unified config cleared');
    } catch (error) {
      console.warn('[DevFab] Failed to reset onboarding:', error);
    }
  };

  // ========== DEV: Go to App ==========
  const handleGoToApp = async () => {
    try {
      // Simulate onboarding completion with default data
      await AsyncStorage.setItem(ONBOARDING_COMPLETED_KEY, 'true');

      // Create default onboarding config (so TimerConfigContext can load it)
      const defaultOnboardingConfig = {
        favoriteToolMode: 'commands',
        customActivity: null, // Will use default activity from ACTIVITIES
        persona: null,
        selectedSoundId: 'bell_classic',
        notificationPermission: false,
        purchaseResult: 'skipped',
      };

      await AsyncStorage.setItem('onboarding_v2_config', JSON.stringify(defaultOnboardingConfig));

      setResetTrigger(prev => prev + 1); // Force AppContent remount
      console.log('[DevFab] Skipped to app with default config');
    } catch (error) {
      console.warn('[DevFab] Failed to skip to app:', error);
    }
  };

  // ========== DEV: Reset Timer Config ==========
  const handleResetTimerConfig = async () => {
    try {
      // Load current unified config
      const storedConfig = await AsyncStorage.getItem('@ResetPulse:config');
      let config = {};

      if (storedConfig) {
        try {
          config = JSON.parse(storedConfig);
        } catch (e) {
          console.warn('[DevFab] Failed to parse stored config:', e);
        }
      }

      // Force dev timer settings (preserve other sections: palette, layout, onboarding)
      const devActivity = getActivityById(DEV_DEFAULT_TIMER_CONFIG.activity);
      config.timer = {
        currentActivity: devActivity,
        currentDuration: DEV_DEFAULT_TIMER_CONFIG.duration,
        scaleMode: DEV_DEFAULT_TIMER_CONFIG.scaleMode,
      };

      // Save back to unified config
      await AsyncStorage.setItem('@ResetPulse:config', JSON.stringify(config));

      // Force remount to reload context with new values
      setResetTrigger(prev => prev + 1);

      console.log('[DevFab] Timer config reset to dev defaults (20min meditation)');
    } catch (error) {
      console.warn('[DevFab] Failed to reset timer config:', error);
    }
  };

  // ========== DEV: Reset Drawer Tooltip ==========
  const handleResetTooltip = async () => {
    try {
      await AsyncStorage.removeItem('@ResetPulse:hasSeenDrawerHint');
      setResetTrigger(prev => prev + 1); // Force remount to show tooltip
      console.log('[DevFab] Drawer tooltip reset - will show on next app view');
    } catch (error) {
      console.warn('[DevFab] Failed to reset tooltip:', error);
    }
  };

  // ========== DEV: Reset to Vanilla (Full Reset) ==========
  const handleResetToVanilla = async () => {
    try {
      // Remove ALL app-related AsyncStorage keys to restore vanilla state
      await AsyncStorage.multiRemove([
        // === NEW UNIFIED ARCHITECTURE (Dec 2024) ===
        // Unified config (timer + palette + layout + onboarding)
        '@ResetPulse:config',

        // Onboarding
        ONBOARDING_COMPLETED_KEY,
        'onboarding_v2_config',

        // App state
        'has_launched_before',
        '@ResetPulse:hasSeenDrawerHint',
        '@ResetPulse:paywallSkipDate',
        '@ResetPulse:reminderScheduled',
        '@ResetPulse:onboardingCustomActivity',

        // === LEGACY KEYS (for cleanup after migration) ===
        // Old onboarding (pre-v2.1)
        '@ResetPulse:onboardingStep',
        '@ResetPulse:onboardingData',
        'user_timer_config',
        'user_sound_config',
        'user_interface_config',

        // Old timer/palette keys (pre-unified)
        '@ResetPulse:timerOptions',
        '@ResetPulse:timerPalette',
        '@ResetPulse:selectedColor',
        '@ResetPulse:favoriteToolMode',

        // Old UI state
        '@ResetPulse:themeMode',

        // === PRESERVE (optional) ===
        // RevenueCat cache - uncomment to preserve premium status
        // 'revenuecat_customer_info',
      ]);
      setResetTrigger(prev => prev + 1); // Force AppContent remount
      console.log('[DevFab] App reset to vanilla state - all settings cleared');
    } catch (error) {
      console.warn('[DevFab] Failed to reset to vanilla:', error);
    }
  };

  // Contenu principal
  const renderContent = () => (
    <ErrorBoundary>
      <ThemeProvider>
        <PurchaseProvider>
          <ModalStackProvider>
            <AppContent key={resetTrigger} />
            <ModalStackRenderer />
          </ModalStackProvider>
        </PurchaseProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );

  // En mode dev avec FAB activé, afficher le FAB + contenu
  if (DEV_MODE && SHOW_DEV_FAB) {
    return (
      <TimerConfigProvider>
        <DevPremiumProvider>
          <GestureHandlerRootView style={styles.container}>
            {renderContent()}
            <DevFab
              onResetOnboarding={handleResetOnboarding}
              onGoToApp={handleGoToApp}
              onResetTimerConfig={handleResetTimerConfig}
              onResetTooltip={handleResetTooltip}
              onResetToVanilla={handleResetToVanilla}
            />
          </GestureHandlerRootView>
        </DevPremiumProvider>
      </TimerConfigProvider>
    );
  }

  // Production ou dev sans FAB: app normale
  return (
    <TimerConfigProvider>
      <DevPremiumProvider>
        <GestureHandlerRootView style={styles.container}>
          {renderContent()}
        </GestureHandlerRootView>
      </DevPremiumProvider>
    </TimerConfigProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
