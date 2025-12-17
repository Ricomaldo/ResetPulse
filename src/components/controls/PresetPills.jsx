/**
 * @fileoverview Preset scale pills - change dial granularity
 * @description These buttons select which scale (granularity) the dial should use.
 * Duration is completely independent - set by dragging the dial.
 * @created 2025-12-14
 * @updated 2025-12-16
 */
import React from 'react';
import PropTypes from 'prop-types';
import { View, Text, Platform, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { useTimerOptions } from '../../contexts/TimerOptionsContext';
import { rs } from '../../styles/responsive';
import { fontWeights } from '../../theme/tokens';

const PRESETS = [
  { minutes: 60, scaleMode: '60min', label: '60' },
  { minutes: 45, scaleMode: '45min', label: '45' },
  { minutes: 25, scaleMode: '25min', label: '25' },
  { minutes: 10, scaleMode: '10min', label: '10' },
  { minutes: 5, scaleMode: '5min', label: '5' },
  { minutes: 1, scaleMode: '1min', label: '1' },
];

export default function PresetPills({ onSelectPreset, compact = false }) {
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
    compactContainer: {
      gap: theme.spacing.xs, // 4px - gap between rows
    },
    compactPill: {
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.sm,
      justifyContent: 'center',
      minHeight: rs(32, 'min'), // Compact but touchable height
      minWidth: rs(40, 'min'), // Minimum touch target width
      paddingHorizontal: theme.spacing.sm, // 8px - comfortable padding
      paddingVertical: theme.spacing.xs, // 4px - minimal vertical padding
    },
    compactPillText: {
      color: theme.colors.textSecondary,
      fontSize: rs(11, 'min'), // Plus petit pour mode compact
      fontWeight: fontWeights.medium,
    },
    compactRow: {
      flexDirection: 'row',
      gap: theme.spacing.xs, // 4px - gap between pills
    },
    container: {
      gap: theme.spacing.xs, // 4px - tighter vertical spacing between rows
    },
    pill: {
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      flex: 1,
      justifyContent: 'center',
      paddingHorizontal: theme.spacing.md, // 13px - reduced from 21px
      paddingVertical: theme.spacing.sm, // 8px - reduced from 13px
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
    const pillStyle = compact ? styles.compactPill : styles.pill;
    const textStyle = compact ? styles.compactPillText : styles.pillText;

    return (
      <TouchableOpacity
        key={preset.minutes}
        style={[pillStyle, isActive && styles.pillActive]}
        onPress={() => handlePresetSelect(preset)}
        activeOpacity={0.7}
      >
        <Text style={[textStyle, isActive && styles.pillTextActive]}>{preset.label}</Text>
      </TouchableOpacity>
    );
  };

  // Compact mode: 2 rows of 3 presets
  if (compact) {
    const compactFirstRow = PRESETS.slice(0, 3); // 60, 45, 25
    const compactSecondRow = PRESETS.slice(3, 6); // 10, 5, 1

    return (
      <View style={styles.compactContainer}>
        <View style={styles.compactRow}>{compactFirstRow.map(renderPreset)}</View>
        <View style={styles.compactRow}>{compactSecondRow.map(renderPreset)}</View>
      </View>
    );
  }

  // Normal mode: 2 rows of 3 presets
  return (
    <View style={styles.container}>
      <View style={styles.row}>{firstRow.map(renderPreset)}</View>
      <View style={styles.row}>{secondRow.map(renderPreset)}</View>
    </View>
  );
}

PresetPills.propTypes = {
  onSelectPreset: PropTypes.func.isRequired,
  compact: PropTypes.bool,
};
