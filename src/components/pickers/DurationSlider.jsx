// src/components/pickers/DurationSlider.jsx
// Duration picker with DigitalTimer controls and preset buttons

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
import { DURATION_PRESETS, MAX_DURATION } from '../../config/durations';
import DurationControls from '../controls/DurationControls';

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

  const styles = StyleSheet.create({
    container: {
      width: '100%',
    },

    digitalTimerContainer: {
      alignItems: 'center',
      marginBottom: theme.spacing.md,
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
  });

  return (
    <View style={[styles.container, style]}>
      {/* Duration controls with increment/decrement (optional) */}
      {showControls && (
        <View style={styles.digitalTimerContainer}>
          <DurationControls
            duration={value}
            maxDuration={MAX_DURATION}
            onDurationChange={onValueChange}
            compact={false}
          />
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
