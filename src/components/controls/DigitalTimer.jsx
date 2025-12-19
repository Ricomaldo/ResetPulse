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
import { SNAP_INTERVALS, snapToInterval } from '../../config/snap-settings';

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
  scaleMode = '60min',
}) {
  const theme = useTheme();
  const intervalRef = useRef(null);
  const repeatCountRef = useRef(0);
  const tapSnapTimeoutRef = useRef(null);

  // Determine mode: remaining (display only) or duration (with controls)
  const isRemainingMode = remaining !== undefined;
  const displayValue = isRemainingMode ? remaining : duration;
  const shouldShowControls = showControls ?? !isRemainingMode;

  // Steps
  const tapStep = 1; // Tap simple = ±1s pour réglage fin
  const minorStep = SNAP_INTERVALS[scaleMode] ?? 60; // Long-press base step (accéléré ensuite)

  // Accélération long-press: augmente la taille du pas avec la durée du maintien
  const getAcceleratedStep = () => {
    const r = repeatCountRef.current || 0;
    if (r < 10) {
      return 1;
    } // ~première seconde: pas fin
    if (r < 30) {
      return 5;
    } // ensuite 5s
    if (r < 60) {
      return 15;
    } // puis 15s
    return 60; // maintien long: minutes entières
  };

  // Apply a change with clamp and optional haptic
  const applyChange = (deltaSeconds, withHaptic = true) => {
    if (!onDurationChange) {
      return;
    }
    const proposed = duration + deltaSeconds;
    const clamped = Math.max(0, Math.min(maxDuration, proposed));
    if (clamped !== duration) {
      onDurationChange(clamped);
      if (withHaptic) {
        haptics.selection();
      }
    }
  };

  // Schedule a snap to nearest interval after a short idle (groups taps)
  const scheduleDeferredSnap = () => {
    if (tapSnapTimeoutRef.current) {
      clearTimeout(tapSnapTimeoutRef.current);
    }
    tapSnapTimeoutRef.current = setTimeout(() => {
      tapSnapTimeoutRef.current = null;
      if (!onDurationChange) {
        return;
      }
      const snapped = snapToInterval(duration, scaleMode);
      if (snapped !== duration) {
        onDurationChange(snapped);
        // Haptique unique à la fin de la séquence
        haptics.selection();
      }
    }, 250);
  };

  // Finalize any ongoing repeat and snap once
  const finalizeSnap = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      repeatCountRef.current = 0;
    }
    if (tapSnapTimeoutRef.current) {
      clearTimeout(tapSnapTimeoutRef.current);
      tapSnapTimeoutRef.current = null;
    }
    if (!onDurationChange) {
      return;
    }
    const snapped = snapToInterval(duration, scaleMode);
    if (snapped !== duration) {
      onDurationChange(snapped);
      haptics.selection();
    }
  };

  const handleIncrement = () => {
    if (!onDurationChange) {
      return;
    }

    if (duration >= maxDuration && onScaleUpgrade) {
      const upgraded = onScaleUpgrade();
      if (upgraded) {
        onDurationChange(duration + tapStep);
        haptics.selection();
      }
      return;
    }

    applyChange(tapStep, true);
    scheduleDeferredSnap();
  };

  const handleDecrement = () => {
    if (!onDurationChange) {
      return;
    }

    applyChange(-tapStep, true);
    scheduleDeferredSnap();
  };

  // Silent variants for long-press auto repeat (haptics at finalize only)
  const handleIncrementSilent = () => applyChange(getAcceleratedStep(), false);
  const handleDecrementSilent = () => applyChange(-getAcceleratedStep(), false);

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
    finalizeSnap();
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
      backgroundColor: theme.colors.secondary, // Same as parent (BottomSheet)
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
      flex: !shouldShowControls ? 1 : undefined, // Flex to center properly when buttons hidden
    },
    icon: {
      color: theme.colors.brand.secondary,
    },
    timeText: {
      color: isRunning
        ? theme.colors.brand.accent
        : isRemainingMode
        ? theme.colors.brand.secondary
        : theme.colors.text,
      fontFamily: Platform.select({
        ios: 'Menlo',
        android: 'monospace',
      }),
      fontSize: fontSize,
      fontVariant: ['tabular-nums'],
      fontWeight: '600',
      minWidth: compact ? rs(70) : rs(90),
      opacity: 1,
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

  // Full mode with controls - always rendered to prevent layout shift
  // When showControls=false, buttons are invisible and non-interactive
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.button, !shouldShowControls && { opacity: 0 }]}
        onPress={handleDecrement}
        onLongPress={() => startLongPress(handleDecrementSilent)}
        onPressOut={stopLongPress}
        activeOpacity={0.7}
        pointerEvents={shouldShowControls ? 'auto' : 'none'}
        accessible={shouldShowControls}
        accessibilityRole="button"
        accessibilityLabel="Diminuer la durée"
      >
        <Icons name="minus" size={iconSize} color={theme.colors.text} />
      </TouchableOpacity>

      <Text
        style={styles.timeText}
        accessible
        accessibilityRole="timer"
        accessibilityLabel={isRemainingMode ? `Temps: ${formattedTime}` : `Durée: ${formattedTime}`}
      >
        {formattedTime}
      </Text>

      <TouchableOpacity
        style={[styles.button, !shouldShowControls && { opacity: 0 }]}
        onPress={handleIncrement}
        onLongPress={() => startLongPress(handleIncrementSilent)}
        onPressOut={stopLongPress}
        activeOpacity={0.7}
        pointerEvents={shouldShowControls ? 'auto' : 'none'}
        accessible={shouldShowControls}
        accessibilityRole="button"
        accessibilityLabel="Augmenter la durée"
      >
        <Icons name="plus" size={iconSize} color={theme.colors.text} />
      </TouchableOpacity>
    </View>
  );
});

DigitalTimer.displayName = 'DigitalTimer';
DigitalTimer.propTypes = {
  scaleMode: PropTypes.string,
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
