// App.js
import React, { useEffect, useRef } from 'react';
import { StyleSheet, StatusBar, Animated } from 'react-native';
import { ThemeProvider, useTheme } from './src/theme/ThemeProvider';
import { TimerPaletteProvider } from './src/contexts/TimerPaletteContext';
import TimerScreen from './src/screens/TimerScreen';

function AppContent() {
  const theme = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;

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

  return (
    <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
      <TimerPaletteProvider>
        <StatusBar
          barStyle={theme.isDark ? "light-content" : "dark-content"}
          backgroundColor={theme.colors.background}
        />
        <TimerScreen />
      </TimerPaletteProvider>
    </Animated.View>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
