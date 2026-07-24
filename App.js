// App.js
import React, { useEffect, useState } from 'react';
import { StatusBar, View, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

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
import { ErrorBoundary } from './src/components/layout';
import Analytics from './src/services/analytics';
import logger from './src/utils/logger';

// Storage key legacy onboarding V2 (nettoyage DevFab uniquement — Première fois au Lot 2)
const ONBOARDING_COMPLETED_KEY = 'onboarding_v2_completed';
// Première fois (Lot 2, C7) — cf. src/hooks/useFirstRun.js
const FIRST_RUN_COMPLETED_KEY = '@ResetPulse:hasSeenFirstRun';

function AppContent() {
  const theme = useTheme();

  useEffect(() => {
    logger.boot.visible();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle={theme.isDark ? 'light-content' : 'dark-content'}
        backgroundColor={theme.colors.background}
      />
      <TimerScreen />
    </View>
  );
}

export default function App() {
  // ========== DEV MODE STATE ==========
  const [resetTrigger, setResetTrigger] = useState(0);

  // Initialize Analytics (M7.5)
  // Note: Apple Search Ads attribution is now handled by RevenueCat in PurchaseContext
  useEffect(() => {
    const initAnalytics = async () => {
      logger.boot.start();
      await Analytics.init();

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

      // Remove Première fois completion flag (Lot 2, C7)
      await AsyncStorage.removeItem(FIRST_RUN_COMPLETED_KEY);

      // Remove unified config (timer, palette, layout)
      await AsyncStorage.removeItem('@ResetPulse:config');

      // Remove onboarding data
      await AsyncStorage.removeItem('onboarding_v2_config');

      setResetTrigger(prev => prev + 1); // Force AppContent remount
      logger.log('DevFab: onboarding reset');
    } catch (error) {
      logger.warn('DevFab: failed to reset onboarding', error.message);
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
          logger.warn('DevFab: failed to parse stored config', e.message);
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

      logger.log('DevFab: timer config reset to dev defaults');
    } catch (error) {
      logger.warn('DevFab: failed to reset timer config', error.message);
    }
  };

  // ========== DEV: Reset Drawer Tooltip ==========
  const handleResetTooltip = async () => {
    try {
      await AsyncStorage.removeItem('@ResetPulse:hasSeenDrawerHint');
      setResetTrigger(prev => prev + 1); // Force remount to show tooltip
      logger.log('DevFab: drawer tooltip reset');
    } catch (error) {
      logger.warn('DevFab: failed to reset tooltip', error.message);
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
        FIRST_RUN_COMPLETED_KEY,

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
      logger.log('DevFab: app reset to vanilla state');
    } catch (error) {
      logger.warn('DevFab: failed to reset to vanilla', error.message);
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
