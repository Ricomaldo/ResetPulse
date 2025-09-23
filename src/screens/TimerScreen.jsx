// src/screens/TimerScreen.jsx
import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../components/ThemeProvider';
import { TimerOptionsProvider } from '../contexts/TimerOptionsContext';
import PaletteCarousel from '../components/PaletteCarousel';
import TimeTimer from '../components/TimeTimer';
import SettingsModal from '../components/SettingsModal';
import { SettingsIcon } from '../components/Icons';
import { responsiveSize } from '../styles/layout';

export default function TimerScreen() {
  const theme = useTheme();
  const [settingsVisible, setSettingsVisible] = useState(false);

  return (
    <TimerOptionsProvider>
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        {/* Settings Button */}
        <TouchableOpacity
          style={[styles.settingsButton, { backgroundColor: theme.colors.surface }]}
          onPress={() => setSettingsVisible(true)}
        >
          <SettingsIcon size={24} color={theme.colors.text} />
        </TouchableOpacity>

        <TimeTimer />

        {/* Palette Carousel positioned for thumb reach */}
        <View style={styles.colorSwitchContainer}>
          <PaletteCarousel />
        </View>

        {/* Settings Modal */}
        <SettingsModal
          visible={settingsVisible}
          onClose={() => setSettingsVisible(false)}
        />
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
  settingsButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  colorSwitchContainer: {
    position: 'absolute',
    bottom: 100, // Positioned for comfortable thumb reach
    alignSelf: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
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
