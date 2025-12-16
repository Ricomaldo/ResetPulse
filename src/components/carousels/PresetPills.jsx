/**
 * @fileoverview Preset scale pills - change dial granularity
 * @description These buttons select which scale (granularity) the dial should use.
 * Duration is completely independent - set by dragging the dial.
 * @created 2025-12-14
 * @updated 2025-12-16
 */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { useTimerOptions } from '../../contexts/TimerOptionsContext';
import { rs } from '../../styles/responsive';
import { fontWeights } from '../../theme/tokens';

const PRESETS = [
  { minutes: 1, scaleMode: '1min', label: '1' },
  { minutes: 5, scaleMode: '5min', label: '5' },
  { minutes: 10, scaleMode: '10min', label: '10' },
  { minutes: 25, scaleMode: '25min', label: '25' },
  { minutes: 45, scaleMode: '45min', label: '45' },
  { minutes: 60, scaleMode: '60min', label: '60' },
];

export default function PresetPills({ onSelectPreset }) {
  const theme = useTheme();
  const { scaleMode, setScaleMode } = useTimerOptions();

  const handlePresetSelect = (preset) => {
    // Scale buttons only change the dial's granularity
    setScaleMode(preset.scaleMode);

    // Notify parent of the scale change
    onSelectPreset({
      scalePresetMinutes: preset.minutes,
      newScaleMode: preset.scaleMode,
    });
  };

  const styles = StyleSheet.create({
    container: {
      gap: rs(theme.spacing.sm),
    },
    row: {
      flexDirection: 'row',
      gap: rs(theme.spacing.sm),
    },
    pill: {
      flex: 1,
      paddingHorizontal: rs(theme.spacing.lg),
      paddingVertical: rs(theme.spacing.md),
      borderRadius: theme.borderRadius.lg,
      backgroundColor: theme.colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
    },
    pillActive: {
      backgroundColor: theme.colors.brand.primary,
    },
    pillText: {
      fontSize: rs(15),
      fontWeight: fontWeights.medium,
      color: theme.colors.textSecondary,
    },
    pillTextActive: {
      color: theme.colors.background,
      fontWeight: fontWeights.semibold,
    },
  });

  // Split presets into 2 rows of 3
  const firstRow = PRESETS.slice(0, 3);
  const secondRow = PRESETS.slice(3, 6);

  const renderPreset = (preset) => {
    // Button is active when its scale mode matches the current scale mode
    const isActive = scaleMode === preset.scaleMode;
    return (
      <TouchableOpacity
        key={preset.minutes}
        style={[styles.pill, isActive && styles.pillActive]}
        onPress={() => handlePresetSelect(preset)}
        activeOpacity={0.7}
      >
        <Text style={[styles.pillText, isActive && styles.pillTextActive]}>
          {preset.label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {firstRow.map(renderPreset)}
      </View>
      <View style={styles.row}>
        {secondRow.map(renderPreset)}
      </View>
    </View>
  );
}
