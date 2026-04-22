// src/components/toolbox/controls/ScaleButtons.jsx
/**
 * @fileoverview ScaleButtons - 4 scale presets (ADR-004)
 * @description Remplace les 6 presets legacy par 4 échelles de cadran
 * @created 2025-12-19
 * @architecture ADR-004 (Séparation Durée/Cadran)
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import { useTheme } from '../../../theme/ThemeProvider';
import { useTimerOptions } from '../../../contexts/TimerOptionsContext';
import { rs } from '../../../styles/responsive';
import haptics from '../../../utils/haptics';

const SCALES = [5, 15, 30, 60]; // minutes

/**
 * ScaleButtons - 4 échelles de cadran (5, 15, 30, 60 minutes)
 * @param {number} currentScale - Scale actuelle en minutes
 * @param {function} onSelectScale - Callback avec (scaleMinutes)
 * @param {boolean} compact - Compact mode for AsideZone
 */
export default function ScaleButtons({ currentScale, onSelectScale, compact = false }) {
  const theme = useTheme();
  const { currentDuration, setCurrentDuration } = useTimerOptions();

  const handleScalePress = (scaleMinutes) => {
    const maxSeconds = scaleMinutes * 60;

    // Cap duration if exceeds new scale (ADR-004)
    if (currentDuration > maxSeconds) {
      setCurrentDuration(maxSeconds);
    }

    onSelectScale(scaleMinutes);
    haptics.selection();
  };

  const styles = StyleSheet.create({
    activeButton: {
      backgroundColor: theme.colors.brand.accent + '20',
      borderColor: theme.colors.brand.accent,
    },
    activeScaleText: {
      color: theme.colors.brand.accent,
      fontWeight: '700',
    },
    container: {
      flexDirection: 'row',
      gap: compact ? rs(6) : rs(8), // Smaller gap in compact
      justifyContent: 'center',
    },
    scaleButton: {
      alignItems: 'center',
      backgroundColor: 'transparent',
      borderColor: theme.colors.brand.neutral,
      borderRadius: theme.borderRadius.lg,
      borderWidth: 2,
      justifyContent: 'center',
      minWidth: compact ? rs(40) : rs(48), // Smaller in compact
      paddingHorizontal: compact ? rs(10) : rs(13), // Smaller in compact
      paddingVertical: compact ? rs(6) : rs(8), // Smaller in compact
    },
    scaleText: {
      color: theme.colors.brand.neutral,
      fontSize: compact ? rs(13) : rs(15), // Smaller in compact
      fontWeight: '600',
    },
  });

  return (
    <View style={styles.container}>
      {SCALES.map(scale => (
        <TouchableOpacity
          key={scale}
          style={[styles.scaleButton, currentScale === scale && styles.activeButton]}
          onPress={() => handleScalePress(scale)}
          activeOpacity={0.7}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel={`Échelle ${scale} minutes`}
          accessibilityState={{ selected: currentScale === scale }}
        >
          <Text style={[styles.scaleText, currentScale === scale && styles.activeScaleText]}>
            {scale}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

ScaleButtons.propTypes = {
  compact: PropTypes.bool,
  currentScale: PropTypes.oneOf([5, 15, 30, 60]).isRequired,
  onSelectScale: PropTypes.func.isRequired,
};
