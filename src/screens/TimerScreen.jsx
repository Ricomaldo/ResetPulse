// src/screens/TimerScreen.jsx
import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../components/ThemeProvider';
import { TimerOptionsProvider } from '../contexts/TimerOptionsContext';
import ActivityCarousel from '../components/ActivityCarousel';
import PaletteCarousel from '../components/PaletteCarousel';
import TimeTimer from '../components/TimeTimer';
import SettingsModal from '../components/SettingsModal';
import { SettingsIcon } from '../components/Icons';
import { rs, getLayout, getDeviceInfo } from '../styles/responsive';

function TimerScreenContent() {
  const theme = useTheme();
  const [settingsVisible, setSettingsVisible] = useState(false);
  const { isLandscape } = getDeviceInfo();
  const layout = getLayout();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top', 'bottom']}>
      {/* Header with Settings Button */}
      <View style={styles.header}>
        <View style={{ flex: 1 }} />
        <TouchableOpacity
          style={[styles.settingsButton, { backgroundColor: theme.colors.surface }]}
          onPress={() => setSettingsVisible(true)}
          activeOpacity={0.7}
        >
          <SettingsIcon size={24} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      {/* Activities Section */}
      <View style={styles.activitySection}>
        <ActivityCarousel />
      </View>

      {/* Timer Section - Flex to take available space */}
      <View style={styles.timerSection}>
        <TimeTimer />
      </View>

      {/* Palette Section */}
      <View style={styles.paletteSection}>
        <View style={styles.paletteContainer}>
          <PaletteCarousel />
        </View>
      </View>

      {/* Settings Modal */}
      <SettingsModal
        visible={settingsVisible}
        onClose={() => setSettingsVisible(false)}
      />
    </SafeAreaView>
  );
}

export default function TimerScreen() {
  return (
    <SafeAreaProvider>
      <TimerOptionsProvider>
        <TimerScreenContent />
      </TimerOptionsProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: rs(20),
  },

  header: {
    height: rs(50, 'height'),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: rs(10),
    zIndex: 100,
  },

  settingsButton: {
    width: rs(44),
    height: rs(44),
    borderRadius: rs(22),
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  activitySection: {
    height: rs(80, 'height'),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: rs(10, 'height'),
  },

  timerSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: rs(10, 'height'),
  },

  paletteSection: {
    height: rs(80, 'height'),
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: rs(10, 'height'),
    marginBottom: rs(20, 'height'),
  },

  paletteContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingVertical: rs(8),
    paddingHorizontal: rs(20),
    borderRadius: rs(35),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 6,
  },
});
