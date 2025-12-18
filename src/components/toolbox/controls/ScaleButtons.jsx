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
 */
export default function ScaleButtons({ currentScale, onSelectScale }) {
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
    container: {
      flexDirection: 'row',
      gap: rs(8),
      justifyContent: 'center',
    },
    scaleButton: {
      paddingHorizontal: rs(13),
      paddingVertical: rs(8),
      borderRadius: theme.borderRadius.lg,
      backgroundColor: theme.colors.surface,
      borderWidth: 2,
      borderColor: 'transparent',
      minWidth: rs(48),
      alignItems: 'center',
      justifyContent: 'center',
      ...theme.shadow('sm'),
    },
    activeButton: {
      backgroundColor: theme.colors.brand.primary,
      borderColor: theme.colors.brand.secondary,
    },
    scaleText: {
      fontSize: rs(15),
      fontWeight: '600',
      color: theme.colors.textSecondary,
    },
    activeScaleText: {
      color: theme.colors.fixed.white,
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
  currentScale: PropTypes.oneOf([5, 15, 30, 60]).isRequired,
  onSelectScale: PropTypes.func.isRequired,
};
