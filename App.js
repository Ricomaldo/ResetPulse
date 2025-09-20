// App.js
import React from 'react';
import { StyleSheet, StatusBar } from 'react-native';
import { ThemeProvider } from './src/components/ThemeProvider';
import TimerScreen from './src/screens/TimerScreen';

export default function App() {
  return (
    <ThemeProvider>
      <StatusBar barStyle="dark-content" backgroundColor="#FEFEFE" />
      <TimerScreen />
    </ThemeProvider>
  );
}
