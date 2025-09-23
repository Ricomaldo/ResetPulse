// src/screens/TimerScreen.jsx
import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeProvider';
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
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const { isLandscape } = getDeviceInfo();
  const layout = getLayout();

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
      ...theme.shadows.md,
    },

    activitySection: {
      height: rs(65, 'height'),
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 0,
      overflow: 'visible', // Permet le d\u00e9bordement si n\u00e9cessaire
    },

    timerSection: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      marginVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
    },

    paletteSection: {
      height: rs(65, 'height'),
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 0,
      marginBottom: rs(10, 'height'),
    },

    paletteContainer: {
      backgroundColor: theme.isDark ? theme.colors.brand.deep : theme.colors.brand.neutral,
      paddingVertical: rs(8),
      paddingHorizontal: rs(20),
      borderRadius: rs(35),
      borderWidth: 1,
      borderColor: theme.colors.brand.primary,
      ...theme.shadows.lg,
    },
  });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top', 'bottom']}>
      {/* Header with Settings Button */}
      <View style={styles.header}>
        <View style={{ flex: 1 }} />
        <TouchableOpacity
          style={[styles.settingsButton, {
            backgroundColor: theme.colors.brand.neutral,
            borderWidth: 1,
            borderColor: theme.colors.brand.secondary
          }]}
          onPress={() => setSettingsVisible(true)}
          activeOpacity={0.7}
        >
          <SettingsIcon size={24} color={theme.colors.brand.primary} />
        </TouchableOpacity>
      </View>

      {/* Activities Section */}
      <View style={[styles.activitySection, { opacity: isTimerRunning ? 0.2 : 1 }]}>
        <ActivityCarousel isTimerRunning={isTimerRunning} />
      </View>

      {/* Timer Section - Flex to take available space */}
      <View style={styles.timerSection}>
        <TimeTimer onRunningChange={setIsTimerRunning} />
      </View>

      {/* Palette Section */}
      <View style={[styles.paletteSection, {
        opacity: isTimerRunning ? 0 : 1,
        transform: [{ translateY: isTimerRunning ? 50 : 0 }]
      }]}>
        <View style={styles.paletteContainer}>
          <PaletteCarousel isTimerRunning={isTimerRunning} />
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
