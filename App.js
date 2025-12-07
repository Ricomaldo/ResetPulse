// App.js
import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, StatusBar, Animated, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ========== DEV MODE ==========
import { DEV_MODE, DEFAULT_PREMIUM, DEFAULT_SCREEN } from './src/config/testMode';
import OnboardingV2Prototype from './src/prototypes/OnboardingV2Prototype';
import DevFab from './src/dev/components/DevFab';
import { DevPremiumContext } from './src/dev/DevPremiumContext';
// ==============================
import { ThemeProvider, useTheme } from './src/theme/ThemeProvider';
import { PurchaseProvider } from './src/contexts/PurchaseContext';
import { TimerPaletteProvider } from './src/contexts/TimerPaletteContext';
import { OnboardingProvider, useOnboarding } from './src/components/onboarding/OnboardingController';
import TimerScreen from './src/screens/TimerScreen';
import WelcomeScreen from './src/components/onboarding/WelcomeScreen';
import ErrorBoundary from './src/components/ErrorBoundary';
import Analytics from './src/services/analytics';

function AppContent() {
  const theme = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const { onboardingCompleted, isLoadingOnboarding, startTooltips, completeOnboarding } = useOnboarding();
  const [showWelcome, setShowWelcome] = useState(false);

  // Update showWelcome only after onboardingCompleted has loaded from AsyncStorage
  useEffect(() => {
    // Wait for onboarding state to load from AsyncStorage
    if (!isLoadingOnboarding) {
      // Only show welcome if onboarding was never completed
      setShowWelcome(!onboardingCompleted);
    }
  }, [onboardingCompleted, isLoadingOnboarding]);

  useEffect(() => {
    // Start fade in animation after a brief delay
    const timer = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const handleDiscover = () => {
    // Hide welcome first
    setShowWelcome(false);
    // Wait for layout to stabilize after welcome disappears, then start tooltips
    setTimeout(() => {
      startTooltips();
    }, 300);
  };

  const handleSkipWelcome = () => {
    setShowWelcome(false);
    completeOnboarding();
  };

  return (
    <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
      <TimerPaletteProvider>
        <StatusBar
          barStyle={theme.isDark ? "light-content" : "dark-content"}
          backgroundColor={theme.colors.background}
        />

        {/* Welcome Screen for first launch */}
        {showWelcome && (
          <WelcomeScreen
            visible={showWelcome}
            onDiscover={handleDiscover}
            onSkip={handleSkipWelcome}
          />
        )}

        <TimerScreen />
      </TimerPaletteProvider>
    </Animated.View>
  );
}

export default function App() {
  // ========== DEV MODE STATE ==========
  const [currentScreen, setCurrentScreen] = useState(DEFAULT_SCREEN); // 'app' | 'onboarding'
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

  // Contenu principal avec DevFab
  const renderContent = () => {
    if (currentScreen === 'onboarding') {
      return (
        <ThemeProvider>
          <DevPremiumContext.Provider value={{ devPremiumOverride: isPremiumMode, setDevPremiumOverride: setIsPremiumMode }}>
            <TimerPaletteProvider>
              <OnboardingV2Prototype />
            </TimerPaletteProvider>
          </DevPremiumContext.Provider>
        </ThemeProvider>
      );
    }

    return (
      <ErrorBoundary>
        <ThemeProvider>
          <PurchaseProvider>
            <OnboardingProvider>
              <DevPremiumContext.Provider value={{ devPremiumOverride: isPremiumMode, setDevPremiumOverride: setIsPremiumMode }}>
                <AppContent />
              </DevPremiumContext.Provider>
            </OnboardingProvider>
          </PurchaseProvider>
        </ThemeProvider>
      </ErrorBoundary>
    );
  };

  // En mode dev, afficher le FAB + contenu
  if (DEV_MODE) {
    return (
      <View style={{ flex: 1 }}>
        {renderContent()}
        <DevFab
          currentScreen={currentScreen}
          onScreenChange={setCurrentScreen}
          isPremiumMode={isPremiumMode}
          onPremiumChange={setIsPremiumMode}
        />
      </View>
    );
  }

  // Production: app normale sans DevFab
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <PurchaseProvider>
          <OnboardingProvider>
            <AppContent />
          </OnboardingProvider>
        </PurchaseProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
