/**
 * @fileoverview DurationControls - Contrôles +/- pour durée avec accélération progressive
 * @description Version lightweight de DigitalTimer pour forms (sans TimerConfigProvider)
 * @created 2026-01-22
 */
import React, { useRef } from 'react';
import { View, Text, StyleSheet, Platform, TouchableOpacity } from 'react-native';
import PropTypes from 'prop-types';
import { useTheme } from '../../theme/ThemeProvider';
import { rs } from '../../styles/responsive';
import haptics from '../../utils/haptics';
import { fontWeights } from '../../theme/tokens';

/**
 * Format time from seconds to MM:SS
 */
function formatTime(seconds) {
  const totalSeconds = Math.floor(seconds);
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

/**
 * DurationControls - Contrôles +/- avec logique d'accélération avancée
 *
 * @param {number} duration - Durée en secondes
 * @param {number} maxDuration - Durée max en secondes
 * @param {function} onDurationChange - Callback avec (newDuration)
 * @param {boolean} compact - Mode compact
 */
const DurationControls = React.memo(function DurationControls({
  duration = 0,
  maxDuration = 3600,
  onDurationChange,
  compact = false,
}) {
  const theme = useTheme();
  const intervalRef = useRef(null);
  const repeatCountRef = useRef(0);
  const isLongPressingRef = useRef(false);
  const pressStartTimeRef = useRef(null);
  const pressTimeoutRef = useRef(null);
  const currentDurationRef = useRef(duration);
  const isLongPressActiveRef = useRef(false);
  const longPressStartTimeRef = useRef(null);

  // Mettre à jour le ref
  currentDurationRef.current = duration;

  const tapStep = 1; // Tap simple = ±1s pour réglage fin

  // Accélération long-press agressive (copie de DigitalTimer)
  const getAcceleratedStep = () => {
    if (!longPressStartTimeRef.current) {
      return 1;
    }

    const elapsedSeconds = (Date.now() - longPressStartTimeRef.current) / 1000;

    if (elapsedSeconds < 0.5) return 1;
    if (elapsedSeconds < 1.5) return 5;
    if (elapsedSeconds < 3) return 15;
    if (elapsedSeconds < 5) return 30;
    return 60;
  };

  // Accélération de l'intervalle
  const getAcceleratedInterval = () => {
    const r = repeatCountRef.current || 0;
    if (r < 3) return 60;
    if (r < 8) return 40;
    if (r < 15) return 25;
    return 15;
  };

  // Apply a change with clamp
  const applyChange = (deltaSeconds, withHaptic = true) => {
    if (!onDurationChange) return;
    const current = currentDurationRef.current;
    const proposed = current + deltaSeconds;
    const clamped = Math.max(0, Math.min(maxDuration, proposed));
    if (clamped !== current) {
      currentDurationRef.current = clamped;
      onDurationChange(clamped);
      if (withHaptic) {
        haptics.selection();
      }
    }
  };

  const handleIncrement = () => {
    if (!onDurationChange) return;
    applyChange(tapStep, true);
  };

  const handleDecrement = () => {
    if (!onDurationChange) return;
    applyChange(-tapStep, true);
  };

  // Silent variants for long-press
  const handleIncrementSilent = () => {
    const step = getAcceleratedStep();
    applyChange(step, false);
  };

  const handleDecrementSilent = () => {
    const step = getAcceleratedStep();
    applyChange(-step, false);
  };

  const handlePressIn = (action) => {
    pressStartTimeRef.current = Date.now();
    isLongPressingRef.current = false;

    pressTimeoutRef.current = setTimeout(() => {
      isLongPressingRef.current = true;
      pressTimeoutRef.current = null;
      startLongPress(action);
    }, 300);
  };

  const handlePressOut = (tapAction) => {
    const now = Date.now();
    const pressDuration = pressStartTimeRef.current ? now - pressStartTimeRef.current : 0;

    if (pressTimeoutRef.current) {
      clearTimeout(pressTimeoutRef.current);
      pressTimeoutRef.current = null;
    }

    if (!isLongPressingRef.current && pressDuration < 300) {
      tapAction();
    }

    if (isLongPressingRef.current) {
      stopLongPress();
    }

    pressStartTimeRef.current = null;
  };

  const startLongPress = (action) => {
    repeatCountRef.current = 0;
    isLongPressActiveRef.current = true;
    longPressStartTimeRef.current = Date.now();
    action();

    const scheduleNext = () => {
      if (!isLongPressActiveRef.current) return;

      repeatCountRef.current++;
      const interval = getAcceleratedInterval();

      intervalRef.current = setTimeout(() => {
        if (!isLongPressActiveRef.current) return;
        action();
        scheduleNext();
      }, interval);
    };

    scheduleNext();
  };

  const stopLongPress = () => {
    isLongPressActiveRef.current = false;
    longPressStartTimeRef.current = null;
    if (intervalRef.current) {
      clearTimeout(intervalRef.current);
      intervalRef.current = null;
      repeatCountRef.current = 0;
    }
    isLongPressingRef.current = false;
    haptics.selection();
  };

  const fontSize = compact ? rs(24) : rs(36);
  const buttonSize = compact ? rs(40) : rs(48);

  const styles = StyleSheet.create({
    container: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: compact ? rs(6) : rs(8),
      justifyContent: 'center',
    },
    button: {
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.border,
      borderRadius: buttonSize / 2,
      borderWidth: 1,
      height: buttonSize,
      justifyContent: 'center',
      width: buttonSize,
    },
    buttonText: {
      color: theme.colors.text,
      fontSize: rs(24),
      fontWeight: fontWeights.semibold,
    },
    timeText: {
      color: theme.colors.textSecondary,
      fontFamily: Platform.select({
        ios: 'Menlo',
        android: 'monospace',
      }),
      fontSize: fontSize,
      fontVariant: ['tabular-nums'],
      fontWeight: '600',
      minWidth: compact ? rs(80) : rs(115),
      textAlign: 'center',
    },
  });

  const formattedTime = formatTime(duration);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.button}
        onPressIn={() => handlePressIn(handleDecrementSilent)}
        onPressOut={() => handlePressOut(handleDecrement)}
        activeOpacity={0.7}
      >
        <Text style={styles.buttonText}>-</Text>
      </TouchableOpacity>

      <Text style={styles.timeText}>{formattedTime}</Text>

      <TouchableOpacity
        style={styles.button}
        onPressIn={() => handlePressIn(handleIncrementSilent)}
        onPressOut={() => handlePressOut(handleIncrement)}
        activeOpacity={0.7}
      >
        <Text style={styles.buttonText}>+</Text>
      </TouchableOpacity>
    </View>
  );
});

DurationControls.displayName = 'DurationControls';
DurationControls.propTypes = {
  compact: PropTypes.bool,
  duration: PropTypes.number,
  maxDuration: PropTypes.number,
  onDurationChange: PropTypes.func,
};

export default DurationControls;
