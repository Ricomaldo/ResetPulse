// src/components/TimeTimer.jsx
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { useTimerOptions } from '../contexts/TimerOptionsContext';
import { useTimerPalette } from '../contexts/TimerPaletteContext';
import { rs, getComponentSizes } from '../styles/responsive';
import useTimer from '../hooks/useTimer';
import TimerDial from './timer/TimerDial';
import haptics from '../utils/haptics';
import { TIMER, TEXT, getDialMode } from './timer/timerConstants';

export default function TimeTimer({
  onRunningChange,
  onTimerRef,
  onDialRef,
  onDialTap,
}) {
  const theme = useTheme();
  const {
    shouldPulse,
    clockwise,
    scaleMode,
    currentActivity,
    currentDuration,
  } = useTimerOptions();
  const { currentColor } = useTimerPalette();

  // Initialize timer with current duration or default
  const timer = useTimer(currentDuration || TIMER.DEFAULT_DURATION);

  // Refs for onboarding
  const dialWrapperRef = useRef(null);

  // Pass timer ref to parent if needed
  useEffect(() => {
    if (onTimerRef) {
      onTimerRef(timer);
    }
  }, [timer, onTimerRef]);

  // Pass dial ref to parent (pass .current directly)
  useEffect(() => {
    if (onDialRef) {
      // Use a small delay to ensure ref is attached
      const timeout = setTimeout(() => {
        if (dialWrapperRef.current) {
          onDialRef(dialWrapperRef.current);
        }
      }, 50);
      return () => clearTimeout(timeout);
    }
  }, [onDialRef]);

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

  // Get responsive dimensions - zen mode: timer dominates
  const { timerCircle } = getComponentSizes();
  const circleSize = timerCircle; // No max limit - let it breathe

  const styles = StyleSheet.create({
    container: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: rs(20, 'height'),
    },

    timerWrapper: {
      width: circleSize,
      height: circleSize,
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
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
      color: currentColor || theme.colors.brand.primary,
      textAlign: 'center',
      letterSpacing: TEXT.LETTER_SPACING,
    },
  });

  // Handle tap on graduation to set duration
  const handleGraduationTap = (minutes) => {
    if (timer.running) return;

    // Round to nearest 10 seconds for granular control with smooth drag
    const TEN_SECONDS = 10 / 60; // 10 seconds in minutes (~0.1667)
    minutes = Math.round(minutes / TEN_SECONDS) * TEN_SECONDS;

    // Magnetic snap to 0 if very close
    if (minutes <= TIMER.GRADUATION_SNAP_THRESHOLD) {
      minutes = 0;
      haptics.impact('light').catch(() => {}); // Light feedback for snap
    } else {
      haptics.selection().catch(() => {});
    }

    // Convert minutes to seconds and handle 0 specially
    let newDuration;
    if (minutes === 0) {
      // Setting to 0 means reset state
      newDuration = 0;
    } else {
      // Clamp to current scale mode's max
      const maxMinutes = getDialMode(scaleMode).maxMinutes;
      const clampedMinutes = Math.min(maxMinutes, minutes);
      newDuration = clampedMinutes * 60;
    }

    timer.setDuration(newDuration);

    // Duration will be saved when user presses play (useTimer.js handles this)
  };

  return (
    <View style={styles.container}>
      {/* Timer Circle */}
      <View ref={dialWrapperRef} style={styles.timerWrapper}>
        <TimerDial
          progress={timer.progress}
          duration={timer.duration}
          color={currentColor}
          size={circleSize}
          clockwise={clockwise}
          scaleMode={scaleMode}
          activityEmoji={
            currentActivity?.id === 'none' ? null : currentActivity?.emoji
          }
          isRunning={timer.running}
          shouldPulse={shouldPulse}
          onGraduationTap={handleGraduationTap}
          onDialTap={onDialTap}
          isCompleted={timer.isCompleted}
          currentActivity={currentActivity}
          showNumbers={true}
          showGraduations={true}
        />

        {/* Message Overlay */}
        {timer.displayMessage && (
          <View style={styles.messageOverlay}>
            <Text style={styles.messageText}>
              {timer.displayMessage === "C'est parti" && currentActivity?.label
                ? currentActivity.label
                : timer.displayMessage === "C'est reparti" &&
                  currentActivity?.label
                ? currentActivity.label
                : timer.displayMessage === "C'est fini" &&
                  currentActivity?.label
                ? `${currentActivity.label} terminée`
                : timer.displayMessage}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}
