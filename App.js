// App.js
import React, { useEffect, useRef, useState } from 'react';
import { StatusBar, Animated, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ========== DEV MODE ==========
import { DEV_MODE, SHOW_DEV_FAB, DEFAULT_PREMIUM } from './src/config/test-mode';
import DevFab from './src/dev/components/DevFab';
import { DevPremiumContext } from './src/dev/DevPremiumContext';
// ==============================
import { ThemeProvider, useTheme } from './src/theme/ThemeProvider';
import { PurchaseProvider } from './src/contexts/PurchaseContext';
import { TimerPaletteProvider } from './src/contexts/TimerPaletteContext';
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
  const fadeAnim = useRef(new Animated.Value(0)).current;
  // Use optimistic value (false = show onboarding) to avoid blocking render
  // AsyncStorage load happens in background and updates state if needed
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);

  // Load onboarding state asynchronously without blocking initial render
  useEffect(() => {
    const loadOnboardingState = async () => {
      try {
        const completed = await AsyncStorage.getItem(ONBOARDING_COMPLETED_KEY);
        setOnboardingCompleted(completed === 'true');
      } catch (error) {
        console.warn('[App] Failed to load onboarding state:', error);
        setOnboardingCompleted(false);
      }
    };
    loadOnboardingState();
  }, []);

  // Animation fade in
  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Callback quand l'onboarding V2 est terminé
  const handleOnboardingComplete = async (data) => {
    setOnboardingResult(data);
    setOnboardingCompleted(true);

    // Persister
    try {
      await AsyncStorage.setItem(ONBOARDING_COMPLETED_KEY, 'true');
      // Sauvegarder la config timer choisie (Filter2Creation)
      if (data.timerConfig) {
        await AsyncStorage.setItem('user_timer_config', JSON.stringify(data.timerConfig));
      }
      // Sauvegarder la config son choisie (Filter5bSound)
      if (data.soundConfig) {
        await AsyncStorage.setItem('user_sound_config', JSON.stringify(data.soundConfig));
      }
      // Sauvegarder la config interface choisie (Filter5cInterface)
      if (data.interfaceConfig) {
        await AsyncStorage.setItem('user_interface_config', JSON.stringify(data.interfaceConfig));
      }
    } catch (error) {
      console.warn('[App] Failed to save onboarding state:', error);
    }
  };

  return (
    <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
      <TimerPaletteProvider>
        <StatusBar
          barStyle={theme.isDark ? "light-content" : "dark-content"}
          backgroundColor={theme.colors.background}
        />

        {/* Onboarding V2 pour premier lancement */}
        {!onboardingCompleted ? (
          <OnboardingFlow onComplete={handleOnboardingComplete} />
        ) : (
          <TimerScreen />
        )}
      </TimerPaletteProvider>
    </Animated.View>
  );
}

export default function App() {
  // ========== DEV MODE STATE ==========
  const [isPremiumMode, setIsPremiumMode] = useState(DEFAULT_PREMIUM);
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
      await AsyncStorage.removeItem(ONBOARDING_COMPLETED_KEY);
      await AsyncStorage.removeItem('user_timer_config');
      await AsyncStorage.removeItem('user_sound_config');
      await AsyncStorage.removeItem('user_interface_config');
      setResetTrigger(prev => prev + 1); // Force AppContent remount
      console.log('[DevFab] Onboarding reset');
    } catch (error) {
      console.warn('[DevFab] Failed to reset onboarding:', error);
    }
  };

  // ========== DEV: Go to App ==========
  const handleGoToApp = async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_COMPLETED_KEY, 'true');
      setResetTrigger(prev => prev + 1); // Force AppContent remount
      console.log('[DevFab] Jumped to app');
    } catch (error) {
      console.warn('[DevFab] Failed to skip to app:', error);
    }
  };

  // Contenu principal
  const renderContent = () => (
    <ErrorBoundary>
      <ThemeProvider>
        <PurchaseProvider>
          <ModalStackProvider>
            <DevPremiumContext.Provider value={{ devPremiumOverride: isPremiumMode, setDevPremiumOverride: setIsPremiumMode }}>
              <AppContent key={resetTrigger} />
              <ModalStackRenderer />
            </DevPremiumContext.Provider>
          </ModalStackProvider>
        </PurchaseProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );

  // En mode dev avec FAB activé, afficher le FAB + contenu
  if (DEV_MODE && SHOW_DEV_FAB) {
    return (
      <View style={{ flex: 1 }}>
        {renderContent()}
        <DevFab
          isPremiumMode={isPremiumMode}
          onPremiumChange={setIsPremiumMode}
          onResetOnboarding={handleResetOnboarding}
          onGoToApp={handleGoToApp}
        />
      </View>
    );
  }

  // Production ou dev sans FAB: app normale
  return renderContent();
}
