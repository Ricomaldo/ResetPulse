// App.js
import React, { useEffect, useState } from 'react';
import { StatusBar, View, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// ========== DEV MODE ==========
import { DEV_MODE, SHOW_DEV_FAB } from './src/config/test-mode';
import DevFab from './src/dev/components/DevFab';
import { DevPremiumProvider } from './src/dev/DevPremiumContext';
// ==============================
import { ThemeProvider, useTheme } from './src/theme/ThemeProvider';
import { PurchaseProvider } from './src/contexts/PurchaseContext';
import { TimerConfigProvider } from './src/contexts/TimerConfigContext';
import { CustomActivitiesProvider } from './src/contexts/CustomActivitiesContext';
import { SessionCountProvider } from './src/contexts/SessionCountContext';
import { RitualsProvider } from './src/contexts/RitualsContext';
import { ModalStackProvider } from './src/contexts/ModalStackContext';
import ModalStackRenderer from './src/components/modals/ModalStackRenderer';
import TimerScreen from './src/screens/TimerScreen';
import { ErrorBoundary } from './src/components/layout';
import Analytics from './src/services/analytics';
import logger from './src/utils/logger';

// Storage key legacy onboarding V2 (nettoyage Vanilla uniquement — mort, cf. Première fois Lot 2)
const ONBOARDING_COMPLETED_KEY = 'onboarding_v2_completed';
// Première fois (Lot 2, C7) — cf. src/hooks/useFirstRun.js
const FIRST_RUN_COMPLETED_KEY = '@ResetPulse:hasSeenFirstRun';
// Seuil (ADR-016 §1, 2 écrans chaleureux) — cf. src/hooks/useFirstRun.js
const THRESHOLD_COMPLETED_KEY = '@ResetPulse:hasSeenThreshold';

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

  // ========== DEV: Rejouer la Première fois ==========
  // Seuil (2 écrans) + tips C7 — cf. src/hooks/useFirstRun.js, monté dans
  // TimerScreen (sous AppContent) : le remount recharge le hook depuis un
  // storage vidé, effet immédiat.
  const handleReplayFirstRun = async () => {
    try {
      await AsyncStorage.multiRemove([THRESHOLD_COMPLETED_KEY, FIRST_RUN_COMPLETED_KEY]);
      setResetTrigger(prev => prev + 1); // Force AppContent remount
      logger.log('DevFab: Première fois rejouée');
    } catch (error) {
      logger.warn('DevFab: failed to replay Première fois', error.message);
    }
  };

  // ========== DEV: Rejouer la découverte ==========
  // One-shots (pastille dé, invitation respirer, « garde ce moment ? »,
  // astuces dormantes, indice AsideZone) — tous montés sous AppContent
  // (TimerScreen/AsideZone/useDormantTips), remount = rechargement depuis
  // storage vidé. completedSessions vit dans SessionCountContext, un
  // Provider AU-DESSUS d'AppContent (piège central du mandat) : DevFab
  // appelle resetSessionCount() en plus de ce handler pour l'effet immédiat.
  const handleReplayDiscovery = async () => {
    try {
      await AsyncStorage.multiRemove([
        '@ResetPulse:hasSeenKeepMoment',
        '@ResetPulse:hasSeenBreatheInvitation',
        '@ResetPulse:hasSeenDistractionLabel',
        '@ResetPulse:tipShown.palettes',
        '@ResetPulse:tipShown.focus',
        '@ResetPulse:hasOpenedPalettes',
        '@ResetPulse:hasTriedFocus',
        '@ResetPulse:asideOpenCount',
      ]);
      setResetTrigger(prev => prev + 1); // Force AppContent remount
      logger.log('DevFab: découverte rejouée');
    } catch (error) {
      logger.warn('DevFab: failed to replay découverte', error.message);
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
        THRESHOLD_COMPLETED_KEY,

        // App state
        'has_launched_before',
        '@ResetPulse:hasSeenDrawerHint',
        '@ResetPulse:paywallSkipDate',
        '@ResetPulse:reminderScheduled',
        '@ResetPulse:onboardingCustomActivity',

        // Rituels & activités (ADR-015, contextes partagés — DevFab appelle
        // aussi resetRituals()/resetActivities()/resetSessionCount() pour
        // l'effet immédiat, cf. commentaire dans handleOptionPress)
        '@ResetPulse:rituals',
        '@ResetPulse:customActivities',
        '@ResetPulse:completedSessions',
        '@ResetPulse:lastIncludedPalette',
        '@ResetPulse:lastIncludedSound',

        // Découverte (Lambda C, one-shots) — cf. handleReplayDiscovery
        '@ResetPulse:hasSeenKeepMoment',
        '@ResetPulse:hasSeenBreatheInvitation',
        '@ResetPulse:hasSeenDistractionLabel',
        '@ResetPulse:tipShown.palettes',
        '@ResetPulse:tipShown.focus',
        '@ResetPulse:hasOpenedPalettes',
        '@ResetPulse:hasTriedFocus',
        '@ResetPulse:asideOpenCount',

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
        <CustomActivitiesProvider>
          <SessionCountProvider>
            <RitualsProvider>
              <DevPremiumProvider>
                <GestureHandlerRootView style={styles.container}>
                  {renderContent()}
                  <DevFab
                    onReplayFirstRun={handleReplayFirstRun}
                    onReplayDiscovery={handleReplayDiscovery}
                    onResetToVanilla={handleResetToVanilla}
                  />
                </GestureHandlerRootView>
              </DevPremiumProvider>
            </RitualsProvider>
          </SessionCountProvider>
        </CustomActivitiesProvider>
      </TimerConfigProvider>
    );
  }

  // Production ou dev sans FAB: app normale (pas de DevDragScaleProvider —
  // useDevDragScale retombe sur OFF, comportement actuel)
  return (
    <TimerConfigProvider>
      <CustomActivitiesProvider>
        <SessionCountProvider>
          <RitualsProvider>
            <DevPremiumProvider>
              <GestureHandlerRootView style={styles.container}>
                {renderContent()}
              </GestureHandlerRootView>
            </DevPremiumProvider>
          </RitualsProvider>
        </SessionCountProvider>
      </CustomActivitiesProvider>
    </TimerConfigProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
