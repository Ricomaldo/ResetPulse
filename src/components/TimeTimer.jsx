// src/components/TimeTimer.jsx
import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { useTimerOptions } from '../contexts/TimerOptionsContext';
import { useTimerPalette } from '../contexts/TimerPaletteContext';
import { rs, getComponentSizes } from '../styles/responsive';
import useTimer from '../hooks/useTimer';
import TimerDial from './timer/TimerDial';
import { PlayIcon, PauseIcon, ResetIcon } from './Icons';
import haptics from '../utils/haptics';
import { TIMER, BUTTON, TEXT, TOUCH } from '../constants/uiConstants';

export default function TimeTimer({ onRunningChange, onTimerRef }) {
  const theme = useTheme();
  const { shouldPulse, clockwise, scaleMode, currentActivity, currentDuration } = useTimerOptions();
  const { currentColor } = useTimerPalette();

  // Initialize timer with current duration or default
  const timer = useTimer(currentDuration || TIMER.DEFAULT_DURATION);

  // Pass timer ref to parent if needed
  useEffect(() => {
    if (onTimerRef) {
      onTimerRef(timer);
    }
  }, [timer, onTimerRef]);

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
      letterSpacing: TEXT.LETTER_SPACING,
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
  
  // Handle tap on graduation to set duration
  const handleGraduationTap = (minutes) => {
    if (timer.running) return;

    // Round to nearest minute for perfect alignment with graduations
    minutes = Math.round(minutes);

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
    } else if (scaleMode === '25min') {
      // Mode 25min: limit to Pomodoro duration
      const clampedMinutes = Math.min(TIMER.MODES.POMODORO, minutes);
      newDuration = clampedMinutes * 60;
    } else {
      // Mode 60min: allow up to standard duration
      const clampedMinutes = Math.min(TIMER.MODES.STANDARD, minutes);
      newDuration = clampedMinutes * 60;
    }

    timer.setDuration(newDuration);
  };


  return (
    <View style={styles.container}>
      {/* Timer Circle */}
      <View style={styles.timerWrapper}>
        <TimerDial
          progress={timer.progress}
          duration={timer.duration}
          color={currentColor}
          size={circleSize}
          clockwise={clockwise}
          scaleMode={scaleMode}
          activityEmoji={currentActivity?.id === "none" ? null : currentActivity?.emoji}
          isRunning={timer.running}
          shouldPulse={shouldPulse}
          onGraduationTap={handleGraduationTap}
          isCompleted={timer.isCompleted}
          currentActivity={currentActivity}
        />

        {/* Message Overlay */}
        {timer.displayMessage && (
          <View style={styles.messageOverlay}>
            <Text style={styles.messageText}>
              {timer.displayMessage === "C'est parti" && currentActivity?.label
                ? currentActivity.label
                : timer.displayMessage === "C'est reparti" && currentActivity?.label
                ? currentActivity.label
                : timer.displayMessage === "C'est fini" && currentActivity?.label
                ? `${currentActivity.label} terminée`
                : timer.displayMessage}
            </Text>
          </View>
        )}
      </View>

      {/* Centered Control Buttons */}
      <View style={styles.controlsContainer}>
        {/* Main Control Buttons */}
          <TouchableOpacity
            style={[styles.controlButton, { opacity: timer.running ? BUTTON.RUNNING_OPACITY : BUTTON.IDLE_OPACITY }]}
            onPress={timer.toggleRunning}
            activeOpacity={TOUCH.ACTIVE_OPACITY}
          >
            {timer.running ? <PauseIcon size={24} color="white" /> : <PlayIcon size={24} color="white" />}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.controlButton, { backgroundColor: theme.colors.neutral, transform: [{ scale: BUTTON.RESET_SCALE }] }]}
            onPress={timer.resetTimer}
            activeOpacity={TOUCH.ACTIVE_OPACITY}
          >
            <ResetIcon size={22} color="white" />
          </TouchableOpacity>
      </View>
    </View>
  );
}