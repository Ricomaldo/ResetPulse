// App.js
import React, { useEffect, useRef, useState } from 'react';
import { StatusBar, Animated, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ========== DEV MODE ==========
import { DEV_MODE, DEFAULT_PREMIUM } from './src/config/testMode';
import DevFab from './src/dev/components/DevFab';
import { DevPremiumContext } from './src/dev/DevPremiumContext';
// ==============================
import { ThemeProvider, useTheme } from './src/theme/ThemeProvider';
import { PurchaseProvider } from './src/contexts/PurchaseContext';
import { TimerPaletteProvider } from './src/contexts/TimerPaletteContext';
import TimerScreen from './src/screens/TimerScreen';
import { OnboardingFlow } from './src/screens/onboarding';
import ErrorBoundary from './src/components/ErrorBoundary';
import Analytics from './src/services/analytics';

// Storage key pour onboarding V2
const ONBOARDING_COMPLETED_KEY = 'onboarding_v2_completed';

function AppContent() {
  const theme = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [onboardingCompleted, setOnboardingCompleted] = useState(null); // null = loading
  const [onboardingResult, setOnboardingResult] = useState(null);

  // Charger l'état onboarding depuis AsyncStorage
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
      // Optionnel: sauvegarder la config timer choisie
      if (data.timerConfig) {
        await AsyncStorage.setItem('user_timer_config', JSON.stringify(data.timerConfig));
      }
    } catch (error) {
      console.warn('[App] Failed to save onboarding state:', error);
    }
  };

  // Loading state
  if (onboardingCompleted === null) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.background }} />
    );
  }

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

  // Contenu principal
  const renderContent = () => (
    <ErrorBoundary>
      <ThemeProvider>
        <PurchaseProvider>
          <DevPremiumContext.Provider value={{ devPremiumOverride: isPremiumMode, setDevPremiumOverride: setIsPremiumMode }}>
            <AppContent />
          </DevPremiumContext.Provider>
        </PurchaseProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );

  // En mode dev, afficher le FAB + contenu
  if (DEV_MODE) {
    return (
      <View style={{ flex: 1 }}>
        {renderContent()}
        <DevFab
          isPremiumMode={isPremiumMode}
          onPremiumChange={setIsPremiumMode}
        />
      </View>
    );
  }

  // Production: app normale sans DevFab
  return renderContent();
}
