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
import Icons from '../../layout/Icons';

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
 * @param {function} onScaleUpgrade - Callback pour upgrade cadran quand durée = max
 * @param {function} onScaleAdaptToDuration - Callback pour adapter cadran à la durée (tap sur affichage)
 * @param {boolean} compact - Compact mode for AsideZone
 */
export default function DurationIncrementer({ duration, maxDuration, onDurationChange, onScaleUpgrade, onScaleAdaptToDuration, compact = false }) {
  const theme = useTheme();
  const intervalRef = useRef(null);
  const repeatCountRef = useRef(0);

  // Increment: +1 min si ≤ 10min, +5 min sinon (ADR-004)
  const increment = duration <= 600 ? 60 : 300;

  const handleIncrement = () => {
    // Si déjà au max et qu'on a un callback d'upgrade
    if (duration >= maxDuration && onScaleUpgrade) {
      const upgraded = onScaleUpgrade(); // Upgrade cadran
      if (upgraded) {
        // Le cadran a été upgradé, on peut incrémenter
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
    const newDuration = Math.max(duration - increment, 60); // Min 1 minute
    if (newDuration !== duration) {
      onDurationChange(newDuration);
      haptics.selection();
    }
  };

  const handleSyncToMax = () => {
    // Adapter le cadran à la durée actuelle
    if (onScaleAdaptToDuration) {
      const adapted = onScaleAdaptToDuration(duration);
      if (adapted) {
        haptics.impact('medium');
        // TODO: Add scale animation (200ms)
      }
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
    button: {
      alignItems: 'center',
      backgroundColor: 'transparent',
      borderColor: theme.colors.brand.neutral,
      borderRadius: compact ? rs(18) : rs(24), // Smaller in compact
      borderWidth: 2,
      height: compact ? rs(36) : rs(48), // Smaller in compact
      justifyContent: 'center',
      width: compact ? rs(36) : rs(48), // Smaller in compact
    },
    buttonText: {
      color: theme.colors.textSecondary,
      fontSize: compact ? rs(20) : rs(24), // Smaller in compact
      fontWeight: '600',
    },
    container: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: compact ? rs(10) : rs(16), // Smaller gap in compact
      justifyContent: 'center',
    },
    durationContainer: {
      backgroundColor: 'transparent',
      borderColor: theme.colors.brand.neutral,
      borderRadius: theme.borderRadius.md,
      borderWidth: 2,
      paddingHorizontal: compact ? rs(14) : rs(20), // Smaller in compact
      paddingVertical: compact ? rs(8) : rs(12), // Smaller in compact
    },
    durationText: {
      color: theme.colors.text,
      fontSize: compact ? rs(20) : rs(24), // Smaller in compact
      fontVariant: ['tabular-nums'],
      fontWeight: '700',
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
        <Icons name="minus" size={compact ? rs(20) : rs(24)} color={theme.colors.brand.neutral} />
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
        <Icons name="plus" size={compact ? rs(20) : rs(24)} color={theme.colors.brand.neutral} />
      </TouchableOpacity>
    </View>
  );
}

DurationIncrementer.propTypes = {
  compact: PropTypes.bool,
  duration: PropTypes.number.isRequired,
  maxDuration: PropTypes.number.isRequired,
  onDurationChange: PropTypes.func.isRequired,
  onScaleAdaptToDuration: PropTypes.func,
  onScaleUpgrade: PropTypes.func,
};
