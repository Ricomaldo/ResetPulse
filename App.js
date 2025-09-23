// App.js
import React from 'react';
import { StyleSheet, StatusBar } from 'react-native';
import { ThemeProvider, useTheme } from './src/theme/ThemeProvider';
import { TimerPaletteProvider } from './src/contexts/TimerPaletteContext';
import TimerScreen from './src/screens/TimerScreen';

function AppContent() {
  const theme = useTheme();

  return (
    <TimerPaletteProvider>
      <StatusBar
        barStyle={theme.isDark ? "light-content" : "dark-content"}
        backgroundColor={theme.colors.background}
      />
      <TimerScreen />
    </TimerPaletteProvider>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
