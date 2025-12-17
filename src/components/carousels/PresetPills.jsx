/**
 * @fileoverview Preset scale pills - change dial granularity
 * @description These buttons select which scale (granularity) the dial should use.
 * Duration is completely independent - set by dragging the dial.
 * @created 2025-12-14
 * @updated 2025-12-16
 */
import React from 'react';
import { View, Text, Platform, TouchableOpacity, StyleSheet } from 'react-native';
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
      gap: theme.spacing.sm,
    },
    pill: {
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      flex: 1,
      justifyContent: 'center',
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
    },
    pillActive: {
      backgroundColor: theme.colors.brand.primary,
      borderColor: theme.colors.brand.secondary,
      borderWidth: 2,
      ...(Platform.OS === 'ios' ? theme.shadow('md') : {}),
    },
    pillText: {
      color: theme.colors.textSecondary,
      fontSize: rs(14, 'min'),
      fontWeight: fontWeights.medium,
    },
    pillTextActive: {
      color: theme.colors.background,
      fontWeight: fontWeights.semibold,
    },
    row: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
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
        <Text style={[styles.pillText, isActive && styles.pillTextActive]}>{preset.label}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.row}>{firstRow.map(renderPreset)}</View>
      <View style={styles.row}>{secondRow.map(renderPreset)}</View>
    </View>
  );
}
