// src/components/pickers/DurationSlider.jsx
// Simple duration picker using buttons instead of native slider
// Avoids adding new dependencies

import PropTypes from 'prop-types';
import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { fontWeights } from '../../theme/tokens';
import { useTheme } from '../../theme/ThemeProvider';
import { useTranslation } from '../../hooks/useTranslation';
import { rs } from '../../styles/responsive';
import haptics from '../../utils/haptics';

// Preset durations in seconds (aligned with 5 active scales)
const DURATION_PRESETS = [
  { minutes: 5, seconds: 300 },
  { minutes: 15, seconds: 900 },
  { minutes: 30, seconds: 1800 },
  { minutes: 45, seconds: 2700 },
  { minutes: 60, seconds: 3600 },
];

const DurationSlider = React.memo(function DurationSlider({
  onValueChange,
  showControls = true,
  style,
  value,
}) {
  const theme = useTheme();
  const t = useTranslation();

  const handlePresetPress = (durationSeconds) => {
    haptics.selection().catch(() => { /* Optional operation - failure is non-critical */ });
    onValueChange(durationSeconds);
  };

  const handleIncrement = () => {
    haptics.selection().catch(() => { /* Optional operation - failure is non-critical */ });
    const currentIndex = DURATION_PRESETS.findIndex((p) => p.seconds === value);
    if (currentIndex < DURATION_PRESETS.length - 1) {
      onValueChange(DURATION_PRESETS[currentIndex + 1].seconds);
    }
  };

  const handleDecrement = () => {
    haptics.selection().catch(() => { /* Optional operation - failure is non-critical */ });
    const currentIndex = DURATION_PRESETS.findIndex((p) => p.seconds === value);
    if (currentIndex > 0) {
      onValueChange(DURATION_PRESETS[currentIndex - 1].seconds);
    }
  };

  const currentMinutes = Math.round(value / 60);
  const currentIndex = DURATION_PRESETS.findIndex((p) => p.seconds === value);
  const canDecrement = currentIndex > 0;
  const canIncrement = currentIndex < DURATION_PRESETS.length - 1;

  const styles = StyleSheet.create({
    container: {
      width: '100%',
    },

    presetButton: {
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.border,
      borderRadius: theme.borderRadius.md,
      borderWidth: 1,
      justifyContent: 'center',
      minHeight: 44,
      minWidth: rs(60, 'min'),
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
    },

    presetButtonActive: {
      backgroundColor: theme.colors.brand.primary + '20',
      borderColor: theme.colors.brand.primary,
    },

    presetText: {
      color: theme.colors.textSecondary,
      fontSize: rs(14, 'min'),
      fontWeight: fontWeights.medium,
    },

    presetTextActive: {
      color: theme.colors.brand.primary,
      fontWeight: fontWeights.semibold,
    },

    presetsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.sm,
      justifyContent: 'center',
    },

    valueButton: {
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.border,
      borderRadius: rs(24, 'min'),
      borderWidth: 1,
      height: rs(48, 'min'),
      justifyContent: 'center',
      minHeight: 44,
      minWidth: 44,
      width: rs(48, 'min'),
    },

    valueButtonDisabled: {
      opacity: 0.4,
    },

    valueButtonText: {
      color: theme.colors.text,
      fontSize: rs(24, 'min'),
      fontWeight: fontWeights.semibold,
    },

    valueContainer: {
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'center',
      marginBottom: theme.spacing.md,
    },

    valueDisplay: {
      alignItems: 'center',
      marginHorizontal: theme.spacing.lg,
    },

    valueText: {
      color: theme.colors.text,
      fontSize: rs(32, 'min'),
      fontWeight: fontWeights.bold,
    },

    valueUnit: {
      color: theme.colors.textSecondary,
      fontSize: rs(14, 'min'),
      marginTop: theme.spacing.xs,
    },
  });

  return (
    <View style={[styles.container, style]}>
      {/* Value display with increment/decrement (optional) */}
      {showControls && (
        <View style={styles.valueContainer}>
          <TouchableOpacity
            style={[
              styles.valueButton,
              !canDecrement && styles.valueButtonDisabled,
            ]}
            onPress={handleDecrement}
            disabled={!canDecrement}
            activeOpacity={0.7}
          >
            <Text style={styles.valueButtonText}>-</Text>
          </TouchableOpacity>

          <View style={styles.valueDisplay}>
            <Text style={styles.valueText}>{currentMinutes}</Text>
            <Text style={styles.valueUnit}>
              {t('customActivities.duration.minutes')}
            </Text>
          </View>

          <TouchableOpacity
            style={[
              styles.valueButton,
              !canIncrement && styles.valueButtonDisabled,
            ]}
            onPress={handleIncrement}
            disabled={!canIncrement}
            activeOpacity={0.7}
          >
            <Text style={styles.valueButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Preset buttons */}
      <View style={styles.presetsContainer}>
        {DURATION_PRESETS.map((preset) => {
          const isActive = value === preset.seconds;
          return (
            <TouchableOpacity
              key={preset.minutes}
              style={[
                styles.presetButton,
                isActive && styles.presetButtonActive,
              ]}
              onPress={() => handlePresetPress(preset.seconds)}
              activeOpacity={0.7}
            >
              <Text
                style={[styles.presetText, isActive && styles.presetTextActive]}
              >
                {preset.minutes}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
});

DurationSlider.displayName = 'DurationSlider';
DurationSlider.propTypes = {
  onValueChange: PropTypes.func.isRequired,
  showControls: PropTypes.bool,
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  value: PropTypes.number.isRequired,
};

export default DurationSlider;

export { DURATION_PRESETS };
