// src/components/TimeTimer.jsx
import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { useTimerOptions } from '../contexts/TimerOptionsContext';
import { useTimerPalette } from '../contexts/TimerPaletteContext';
import { rs, getComponentSizes } from '../styles/responsive';
import { getGoldenDimensions } from '../styles/layout';
import useTimer from '../hooks/useTimer';
import TimerCircle from './TimerCircle';
import { PlayIcon, PauseIcon, ResetIcon } from './Icons';
import haptics from '../utils/haptics';

export default function TimeTimer({ onRunningChange }) {
  const theme = useTheme();
  const { clockwise, scaleMode, currentActivity, currentDuration } = useTimerOptions();
  const { currentColor } = useTimerPalette();

  // Initialize timer with current duration or 5 minutes default
  const timer = useTimer(currentDuration || 5 * 60);

  // Update timer duration when currentDuration changes
  useEffect(() => {
    if (currentDuration && currentDuration !== timer.duration) {
      timer.setDuration(currentDuration);
    }
  }, [currentDuration]);

  // Notify parent of running state changes
  useEffect(() => {
    if (onRunningChange) {
      onRunningChange(timer.running);
    }
  }, [timer.running, onRunningChange]);

  // Get responsive dimensions avec proportions dorées
  const { timerCircle } = getComponentSizes();
  const circleSize = Math.min(timerCircle, rs(320, 'min')); // Grand mais avec limite max
  const { width: buttonWidth, height: buttonHeight } = getGoldenDimensions(
    rs(50, 'min'),
    'rectangle'
  );
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 0,
    },

    timerWrapper: {
      width: circleSize,
      height: circleSize,
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      marginBottom: rs(5, 'height'),
      marginTop: -rs(10, 'height'), // Remonter le timer
    },

    messageOverlay: {
      position: 'absolute',
      top: '70%',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.background,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.borderRadius.md,
    },

    messageText: {
      fontSize: rs(18, 'min'),
      fontWeight: '700',
      color: theme.colors.brand.primary,
      textAlign: 'center',
      letterSpacing: 0.5,
    },
    
    controlsContainer: {
      position: 'absolute',
      bottom: rs(40, 'height'),
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: theme.spacing.lg,
      width: '100%',
    },

    presetsGrid: {
      width: rs(110, 'min'),
    },

    presetsRow: {
      flexDirection: 'row',
      gap: theme.spacing.xs,
    },

    controlsButtons: {
      flexDirection: 'row',
      gap: theme.spacing.md,
    },

    presetButton: {
      backgroundColor: theme.colors.surface,
      paddingVertical: theme.spacing.xs,
      paddingHorizontal: theme.spacing.md,
      borderRadius: theme.borderRadius.lg,
      minWidth: rs(50, 'min'),
      height: rs(38, 'min'),
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: theme.colors.border,
      ...theme.shadow('sm'),
    },

    presetButtonActive: {
      backgroundColor: theme.colors.brand.primary,
      borderColor: theme.colors.brand.secondary,
      transform: [{ scale: 1.05 }],
      ...theme.shadows.md,
    },

    presetButtonText: {
      color: theme.colors.text,
      fontSize: rs(13, 'min'),
      fontWeight: '600',
    },

    presetButtonTextActive: {
      color: theme.colors.background,
      fontWeight: '700',
    },

    controlButton: {
      backgroundColor: theme.colors.brand.primary,
      width: rs(60, 'min'),
      height: rs(60, 'min'),
      borderRadius: rs(30, 'min'),
      alignItems: 'center',
      justifyContent: 'center',
      marginHorizontal: theme.spacing.sm,
      ...theme.shadow('lg'),
    },
  });
  
  // Helper function to increment/decrement duration
  const adjustDuration = (minutes) => {
    haptics.selection().catch(() => {});
    const newDuration = Math.max(60, Math.min(3600, timer.duration + (minutes * 60)));
    timer.setDuration(newDuration);
  };

  return (
    <View style={styles.container}>
      {/* Timer Circle */}
      <View style={styles.timerWrapper}>
        <TimerCircle
          progress={timer.progress}
          color={currentColor}
          size={circleSize}
          clockwise={clockwise}
          scaleMode={scaleMode}
          duration={timer.duration}
          activityEmoji={currentActivity?.id === "none" ? null : currentActivity?.emoji}
          isRunning={timer.running}
          shouldPulse={true}
        />

        {/* Message Overlay */}
        {timer.displayMessage && (
          <View style={styles.messageOverlay}>
            <Text style={styles.messageText}>
              {timer.displayMessage}
            </Text>
          </View>
        )}
      </View>

      {/* Centered Control Buttons */}
      <View style={styles.controlsContainer}>
        {/* Main Control Buttons */}
          <TouchableOpacity
            style={[styles.controlButton, { opacity: timer.running ? 1 : 0.9 }]}
            onPress={timer.toggleRunning}
            activeOpacity={0.7}
          >
            {timer.running ? <PauseIcon size={24} color="white" /> : <PlayIcon size={24} color="white" />}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.controlButton, { backgroundColor: theme.colors.neutral, transform: [{ scale: 0.9 }] }]}
            onPress={timer.resetTimer}
            activeOpacity={0.7}
          >
            <ResetIcon size={22} color="white" />
          </TouchableOpacity>
      </View>
    </View>
  );
}