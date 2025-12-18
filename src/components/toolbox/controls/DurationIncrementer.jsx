// src/components/toolbox/controls/DurationIncrementer.jsx
/**
 * @fileoverview DurationIncrementer - Incrémenter/Décrémenter durée (ADR-004)
 * @description Contrôle précis de la durée du timer (−/+ avec long press)
 * @created 2025-12-19
 * @architecture ADR-004 (Séparation Durée/Cadran)
 */

import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import { useTheme } from '../../../theme/ThemeProvider';
import { rs } from '../../../styles/responsive';
import haptics from '../../../utils/haptics';

/**
 * Format duration from seconds to MM:SS
 * @param {number} seconds - Duration in seconds
 * @returns {string} Formatted duration
 */
function formatDuration(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * DurationIncrementer - Incrémenter/Décrémenter durée avec +/−
 * @param {number} duration - Durée actuelle en secondes
 * @param {number} maxDuration - Durée max (échelle cadran) en secondes
 * @param {function} onDurationChange - Callback avec (newDuration)
 */
export default function DurationIncrementer({ duration, maxDuration, onDurationChange }) {
  const theme = useTheme();
  const intervalRef = useRef(null);
  const repeatCountRef = useRef(0);

  // Increment: +1 min si ≤ 10min, +5 min sinon (ADR-004)
  const increment = duration <= 600 ? 60 : 300;

  const handleIncrement = () => {
    const newDuration = Math.min(duration + increment, maxDuration);
    if (newDuration !== duration) {
      onDurationChange(newDuration);
      haptics.selection();
    }
  };

  const handleDecrement = () => {
    const newDuration = Math.max(duration - increment, 60); // Min 1 minute
    if (newDuration !== duration) {
      onDurationChange(newDuration);
      haptics.selection();
    }
  };

  const handleSyncToMax = () => {
    if (duration !== maxDuration) {
      onDurationChange(maxDuration); // Sync to scale (dial plein)
      haptics.impact('medium');
      // TODO: Add scale animation (200ms)
    }
  };

  // Long press logic: acceleration after 3 repeats
  const startLongPress = (action) => {
    repeatCountRef.current = 0;
    action(); // First execution immediately

    intervalRef.current = setInterval(() => {
      repeatCountRef.current++;
      const interval = repeatCountRef.current > 3 ? 50 : 100; // Acceleration
      action();

      // Re-schedule with new interval if accelerating
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

  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: rs(16),
    },
    button: {
      width: rs(48),
      height: rs(48),
      borderRadius: rs(24),
      backgroundColor: theme.colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
      ...theme.shadow('sm'),
    },
    buttonText: {
      fontSize: rs(24),
      fontWeight: '600',
      color: theme.colors.textSecondary,
    },
    durationContainer: {
      paddingHorizontal: rs(20),
      paddingVertical: rs(12),
      borderRadius: theme.borderRadius.md,
      backgroundColor: theme.colors.surface,
      ...theme.shadow('sm'),
    },
    durationText: {
      fontSize: rs(24),
      fontWeight: '700',
      color: theme.colors.text,
      fontVariant: ['tabular-nums'],
    },
  });

  return (
    <View style={styles.container}>
      {/* Decrement Button */}
      <TouchableOpacity
        style={styles.button}
        onPress={handleDecrement}
        onLongPress={() => startLongPress(handleDecrement)}
        onPressOut={stopLongPress}
        activeOpacity={0.7}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel="Diminuer la durée"
      >
        <Text style={styles.buttonText}>−</Text>
      </TouchableOpacity>

      {/* Duration Display (tap to sync) */}
      <TouchableOpacity
        style={styles.durationContainer}
        onPress={handleSyncToMax}
        activeOpacity={0.7}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={`Durée: ${formatDuration(duration)}. Appuyer pour synchroniser avec l'échelle`}
        accessibilityHint="Synchronise la durée avec l'échelle du cadran"
      >
        <Text style={styles.durationText}>{formatDuration(duration)}</Text>
      </TouchableOpacity>

      {/* Increment Button */}
      <TouchableOpacity
        style={styles.button}
        onPress={handleIncrement}
        onLongPress={() => startLongPress(handleIncrement)}
        onPressOut={stopLongPress}
        activeOpacity={0.7}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel="Augmenter la durée"
      >
        <Text style={styles.buttonText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

DurationIncrementer.propTypes = {
  duration: PropTypes.number.isRequired,
  maxDuration: PropTypes.number.isRequired,
  onDurationChange: PropTypes.func.isRequired,
};
