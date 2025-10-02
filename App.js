// App.js
import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, StatusBar, Animated } from 'react-native';
import { ThemeProvider, useTheme } from './src/theme/ThemeProvider';
import { TimerPaletteProvider } from './src/contexts/TimerPaletteContext';
import { OnboardingProvider, useOnboarding } from './src/components/onboarding/OnboardingController';
import TimerScreen from './src/screens/TimerScreen';
import WelcomeScreen from './src/components/onboarding/WelcomeScreen';
import ErrorBoundary from './src/components/ErrorBoundary';

function AppContent() {
  const theme = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const { onboardingCompleted, startTooltips, completeOnboarding } = useOnboarding();
  const [showWelcome, setShowWelcome] = useState(!onboardingCompleted);

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
    // Start tooltips BEFORE hiding welcome to avoid flash
    startTooltips();
    // Hide welcome immediately after
    setShowWelcome(false);
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
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <OnboardingProvider>
          <AppContent />
        </OnboardingProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
