// src/components/TimeTimer.jsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from './ThemeProvider';
import { useTimerOptions } from '../contexts/TimerOptionsContext';
import { rs, getComponentSizes } from '../styles/responsive';
import { getGoldenDimensions } from '../styles/layout';
import useTimer from '../hooks/useTimer';
import TimerCircle from './TimerCircle';
import { PlayIcon, PauseIcon, ResetIcon } from './Icons';

export default function TimeTimer() {
  const theme = useTheme();
  const { currentColor, clockwise, scaleMode, currentActivity } = useTimerOptions();

  // Initialize timer with 5 minutes default
  const timer = useTimer(5 * 60);

  // Get responsive dimensions
  const { timerCircle } = getComponentSizes();
  const circleSize = timerCircle;
  const { width: buttonWidth, height: buttonHeight } = getGoldenDimensions(
    rs(50, 'min'),
    'rectangle'
  );
  
  const styles = StyleSheet.create({
    container: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.xl,
      padding: rs(20, 'min'),
      alignItems: 'center',
      justifyContent: 'center',
      ...theme.shadows.lg,
    },

    timerWrapper: {
      width: circleSize,
      height: circleSize,
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      marginBottom: theme.spacing.md,
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
      color: currentColor,
      textAlign: 'center',
      letterSpacing: 0.5,
    },
    
    controlsContainer: {
      flexDirection: 'row',
      width: '100%',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: theme.spacing.md,
      paddingHorizontal: theme.spacing.xs,
    },

    presetsGrid: {
      width: rs(110, 'min'),
    },

    presetsRow: {
      flexDirection: 'row',
      gap: theme.spacing.xs,
      marginBottom: theme.spacing.xs,
    },

    controlsButtons: {
      flexDirection: 'row',
      gap: theme.spacing.md,
    },

    presetButton: {
      backgroundColor: theme.colors.surface,
      paddingVertical: theme.spacing.xs,
      paddingHorizontal: theme.spacing.sm,
      borderRadius: theme.borderRadius.md,
      width: rs(48, 'min'),
      height: rs(36, 'min'),
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: theme.colors.border,
    },

    presetButtonActive: {
      backgroundColor: currentColor,
      borderColor: currentColor,
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
      backgroundColor: currentColor,
      width: rs(56, 'min'),
      height: rs(56, 'min'),
      borderRadius: rs(28, 'min'),
      alignItems: 'center',
      justifyContent: 'center',
      ...theme.shadows.md,
    },

    incrementControls: {
      position: 'absolute',
      bottom: 15,
      left: '50%',
      transform: [{ translateX: -40 }],
      flexDirection: 'row',
      gap: theme.spacing.sm,
    },

    incrementButton: {
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      width: 34,
      height: 34,
      borderRadius: 17,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: theme.colors.border,
      ...theme.shadows.sm,
    },

    incrementButtonText: {
      fontSize: rs(20, 'min'),
      fontWeight: '700',
      color: theme.colors.text,
      lineHeight: rs(20, 'min'),
    },
  });
  
  // Helper function to increment/decrement duration
  const adjustDuration = (minutes) => {
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
          activityEmoji={currentActivity?.emoji}
          isRunning={timer.running}
        />

        {/* Message Overlay */}
        {timer.displayMessage && (
          <View style={styles.messageOverlay}>
            <Text style={styles.messageText}>
              {timer.displayMessage}
            </Text>
          </View>
        )}

        {/* Increment/Decrement Controls at the bottom of the circle */}
        <View style={styles.incrementControls}>
          <TouchableOpacity
            style={styles.incrementButton}
            onPress={() => adjustDuration(-1)}
            activeOpacity={0.6}
          >
            <Text style={styles.incrementButtonText}>−</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.incrementButton}
            onPress={() => adjustDuration(1)}
            activeOpacity={0.6}
          >
            <Text style={styles.incrementButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Controls Container with Presets on left, Play/Reset on right */}
      <View style={styles.controlsContainer}>
        {/* Preset Buttons in 2x2 Grid */}
        <View style={styles.presetsGrid}>
          <View style={styles.presetsRow}>
            <TouchableOpacity
              style={[
                styles.presetButton,
                timer.duration === 300 && styles.presetButtonActive
              ]}
              onPress={() => timer.setPresetDuration(5)}
            activeOpacity={0.7}
            >
              <Text style={[
                styles.presetButtonText,
                timer.duration === 300 && styles.presetButtonTextActive
              ]}>
                5m
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.presetButton,
                timer.duration === 900 && styles.presetButtonActive
              ]}
              onPress={() => timer.setPresetDuration(15)}
            activeOpacity={0.7}
            >
              <Text style={[
                styles.presetButtonText,
                timer.duration === 900 && styles.presetButtonTextActive
              ]}>
                15m
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.presetsRow}>
            <TouchableOpacity
              style={[
                styles.presetButton,
                timer.duration === 1800 && styles.presetButtonActive
              ]}
              onPress={() => timer.setPresetDuration(30)}
            activeOpacity={0.7}
            >
              <Text style={[
                styles.presetButtonText,
                timer.duration === 1800 && styles.presetButtonTextActive
              ]}>
                30m
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.presetButton,
                timer.duration === 2700 && styles.presetButtonActive
              ]}
              onPress={() => timer.setPresetDuration(45)}
            activeOpacity={0.7}
            >
              <Text style={[
                styles.presetButtonText,
                timer.duration === 2700 && styles.presetButtonTextActive
              ]}>
                45m
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Control Buttons */}
        <View style={styles.controlsButtons}>
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
    </View>
  );
}