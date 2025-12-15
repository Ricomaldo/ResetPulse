// src/components/pickers/DurationSlider.jsx
// Simple duration picker using buttons instead of native slider
// Avoids adding new dependencies

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { useTranslation } from '../../hooks/useTranslation';
import { rs } from '../../styles/responsive';
import haptics from '../../utils/haptics';
import { fontWeights } from '../../theme/tokens';

// Preset durations in seconds
const DURATION_PRESETS = [
  { minutes: 5, seconds: 300 },
  { minutes: 10, seconds: 600 },
  { minutes: 15, seconds: 900 },
  { minutes: 20, seconds: 1200 },
  { minutes: 25, seconds: 1500 },
  { minutes: 30, seconds: 1800 },
  { minutes: 45, seconds: 2700 },
  { minutes: 60, seconds: 3600 },
];

const DurationSlider = React.memo(function DurationSlider({
  value,
  onValueChange,
  style,
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

    valueContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: theme.spacing.md,
    },

    valueButton: {
      width: rs(48, 'min'),
      height: rs(48, 'min'),
      minWidth: 44,
      minHeight: 44,
      borderRadius: rs(24, 'min'),
      backgroundColor: theme.colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: theme.colors.border,
    },

    valueButtonDisabled: {
      opacity: 0.4,
    },

    valueButtonText: {
      fontSize: rs(24, 'min'),
      fontWeight: fontWeights.semibold,
      color: theme.colors.text,
    },

    valueDisplay: {
      marginHorizontal: theme.spacing.lg,
      alignItems: 'center',
    },

    valueText: {
      fontSize: rs(32, 'min'),
      fontWeight: fontWeights.bold,
      color: theme.colors.text,
    },

    valueUnit: {
      fontSize: rs(14, 'min'),
      color: theme.colors.textSecondary,
      marginTop: theme.spacing.xs,
    },

    presetsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      gap: theme.spacing.sm,
    },

    presetButton: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.borderRadius.md,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      minWidth: rs(60, 'min'),
      minHeight: 44,
      alignItems: 'center',
      justifyContent: 'center',
    },

    presetButtonActive: {
      backgroundColor: theme.colors.brand.primary + '20',
      borderColor: theme.colors.brand.primary,
    },

    presetText: {
      fontSize: rs(14, 'min'),
      fontWeight: fontWeights.medium,
      color: theme.colors.textSecondary,
    },

    presetTextActive: {
      color: theme.colors.brand.primary,
      fontWeight: fontWeights.semibold,
    },
  });

  return (
    <View style={[styles.container, style]}>
      {/* Value display with increment/decrement */}
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

export default DurationSlider;

export { DURATION_PRESETS };
