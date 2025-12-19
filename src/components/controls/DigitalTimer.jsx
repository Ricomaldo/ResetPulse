/**
 * @fileoverview DigitalTimer - Affichage temps unifié (ADR-004 révisé)
 * @description Deux modes: duration (ControlBar) ou remaining (Dial zone)
 * @created 2025-12-19
 * @updated 2025-12-19
 */
import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import PropTypes from 'prop-types';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTheme } from '../../theme/ThemeProvider';
import { rs } from '../../styles/responsive';
import haptics from '../../utils/haptics';
import Icons from '../layout/Icons';

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
 * DigitalTimer - Affichage temps avec contrôles optionnels
 *
 * Deux modes:
 * 1. Duration mode (ControlBar): affiche durée configurée avec +/-
 * 2. Remaining mode (Dial zone): affiche temps restant, display only
 *
 * @param {number} duration - Durée configurée en secondes (mode duration)
 * @param {number} remaining - Temps restant en secondes (mode remaining, prioritaire)
 * @param {number} maxDuration - Durée max (échelle cadran) en secondes
 * @param {boolean} showControls - Afficher les boutons +/- (default: true sauf si remaining)
 * @param {function} onDurationChange - Callback avec (newDuration)
 * @param {function} onScaleUpgrade - Callback pour upgrade cadran quand durée = max
 * @param {boolean} isRunning - Timer en cours (pour style)
 * @param {boolean} isCollapsed - Afficher icône au lieu du temps (mode remaining)
 * @param {boolean} compact - Mode compact
 */
const DigitalTimer = React.memo(function DigitalTimer({
  duration = 0,
  remaining,
  maxDuration = 3600,
  showControls,
  onDurationChange,
  onScaleUpgrade,
  isRunning = false,
  isCollapsed = false,
  compact = false,
}) {
  const theme = useTheme();
  const intervalRef = useRef(null);
  const repeatCountRef = useRef(0);

  // Determine mode: remaining (display only) or duration (with controls)
  const isRemainingMode = remaining !== undefined;
  const displayValue = isRemainingMode ? remaining : duration;
  const shouldShowControls = showControls ?? !isRemainingMode;

  // Increment: +1 min si ≤ 10min, +5 min sinon (ADR-004)
  const increment = duration <= 600 ? 60 : 300;

  const handleIncrement = () => {
    if (!onDurationChange) return;

    if (duration >= maxDuration && onScaleUpgrade) {
      const upgraded = onScaleUpgrade();
      if (upgraded) {
        onDurationChange(duration + increment);
        haptics.selection();
      }
      return;
    }

    const newDuration = Math.min(duration + increment, maxDuration);
    if (newDuration !== duration) {
      onDurationChange(newDuration);
      haptics.selection();
    }
  };

  const handleDecrement = () => {
    if (!onDurationChange) return;

    const newDuration = Math.max(duration - increment, 60);
    if (newDuration !== duration) {
      onDurationChange(newDuration);
      haptics.selection();
    }
  };

  const startLongPress = (action) => {
    repeatCountRef.current = 0;
    action();
    intervalRef.current = setInterval(() => {
      repeatCountRef.current++;
      action();
      if (repeatCountRef.current === 3) {
        clearInterval(intervalRef.current);
        intervalRef.current = setInterval(action, 50);
      }
    }, 100);
  };

  const stopLongPress = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      repeatCountRef.current = 0;
    }
  };

  // Sizes
  const buttonSize = compact ? rs(32) : rs(40);
  const fontSize = compact ? rs(20) : rs(26);
  const iconSize = compact ? rs(18) : rs(22);
  const gap = compact ? rs(8) : rs(12);
  const pillHeight = isCollapsed ? rs(40) : rs(44);

  const styles = StyleSheet.create({
    button: {
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.border,
      borderRadius: buttonSize / 2,
      borderWidth: 1.5,
      height: buttonSize,
      justifyContent: 'center',
      width: buttonSize,
    },
    collapsedContainer: {
      alignItems: 'center',
      backgroundColor: theme.colors.background,
      height: pillHeight,
      justifyContent: 'center',
      paddingHorizontal: rs(12),
    },
    container: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: gap,
      justifyContent: 'center',
    },
    icon: {
      color: theme.colors.brand.secondary,
    },
    timeText: {
      color: isRemainingMode ? theme.colors.brand.secondary : theme.colors.text,
      fontFamily: Platform.select({
        ios: 'Menlo',
        android: 'monospace',
      }),
      fontSize: fontSize,
      fontVariant: ['tabular-nums'],
      fontWeight: '600',
      minWidth: compact ? rs(70) : rs(90),
      opacity: isRunning ? 1 : 0.8,
      textAlign: 'center',
    },
  });

  const formattedTime = formatTime(displayValue);

  // Collapsed mode (icon only) - for remaining mode
  if (isCollapsed) {
    return (
      <View style={styles.collapsedContainer} accessible accessibilityRole="timer">
        <Ionicons name="time-outline" size={rs(24)} style={styles.icon} />
      </View>
    );
  }

  // Display-only mode (no controls) - remaining mode or explicit
  if (!shouldShowControls) {
    return (
      <View
        style={styles.container}
        accessible
        accessibilityRole="timer"
        accessibilityLabel={`Temps: ${formattedTime}`}
      >
        <Text style={styles.timeText}>{formattedTime}</Text>
      </View>
    );
  }

  // Full mode with controls - duration mode
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.button}
        onPress={handleDecrement}
        onLongPress={() => startLongPress(handleDecrement)}
        onPressOut={stopLongPress}
        activeOpacity={0.7}
        accessible
        accessibilityRole="button"
        accessibilityLabel="Diminuer la durée"
      >
        <Icons name="minus" size={iconSize} color={theme.colors.textSecondary} />
      </TouchableOpacity>

      <Text
        style={styles.timeText}
        accessible
        accessibilityRole="timer"
        accessibilityLabel={`Durée: ${formattedTime}`}
      >
        {formattedTime}
      </Text>

      <TouchableOpacity
        style={styles.button}
        onPress={handleIncrement}
        onLongPress={() => startLongPress(handleIncrement)}
        onPressOut={stopLongPress}
        activeOpacity={0.7}
        accessible
        accessibilityRole="button"
        accessibilityLabel="Augmenter la durée"
      >
        <Icons name="plus" size={iconSize} color={theme.colors.textSecondary} />
      </TouchableOpacity>
    </View>
  );
});

DigitalTimer.displayName = 'DigitalTimer';
DigitalTimer.propTypes = {
  compact: PropTypes.bool,
  duration: PropTypes.number,
  isCollapsed: PropTypes.bool,
  isRunning: PropTypes.bool,
  maxDuration: PropTypes.number,
  onDurationChange: PropTypes.func,
  onScaleUpgrade: PropTypes.func,
  remaining: PropTypes.number,
  showControls: PropTypes.bool,
};

export default DigitalTimer;
