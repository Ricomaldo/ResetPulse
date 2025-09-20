// src/screens/TimerScreen.jsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../components/ThemeProvider';
import { TimerOptionsProvider } from '../contexts/TimerOptionsContext';
import ColorSwitch from '../components/ColorSwitch';
import TimeTimer from '../components/TimeTimer';
import TimerOptions from '../components/TimerOptions';

export default function TimerScreen() {
  const theme = useTheme();

  return (
    <TimerOptionsProvider>
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ColorSwitch />
        <TimeTimer />
        <TimerOptions />
      </View>
    </TimerOptionsProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
});
