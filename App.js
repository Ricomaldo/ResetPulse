// App.js
import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, StatusBar, Animated } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
