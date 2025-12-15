/**
 * @fileoverview Preset duration pills for quick timer selection
 * @created 2025-12-14
 * @updated 2025-12-14
 */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { useTimerOptions } from '../../contexts/TimerOptionsContext';
import { rs } from '../../styles/responsive';
import { fontWeights } from '../../theme/tokens';

const PRESETS = [
  { minutes: 1, label: '1' },
  { minutes: 5, label: '5' },
  { minutes: 10, label: '10' },
  { minutes: 25, label: '25' },
  { minutes: 45, label: '45' },
  { minutes: 60, label: '60' },
];

/**
 * Détermine le scale mode optimal selon la durée
 * @param {number} minutes - Durée en minutes
 * @returns {string} Scale mode ('1min', '5min', '10min', '25min', '45min', ou '60min')
 */
function getScaleModeForDuration(minutes) {
  if (minutes <= 1) return '1min';
  if (minutes <= 5) return '5min';
  if (minutes <= 10) return '10min';
  if (minutes <= 25) return '25min';
  if (minutes <= 45) return '45min';
  return '60min';
}

export default function PresetPills({ currentDuration, onSelectPreset }) {
  const theme = useTheme();
  const { setScaleMode } = useTimerOptions();
  const currentMinutes = Math.round(currentDuration / 60);

  const handlePresetSelect = (minutes) => {
    const seconds = minutes * 60;

    // Mettre à jour le scale mode selon la durée
    const newScaleMode = getScaleModeForDuration(minutes);
    setScaleMode(newScaleMode);

    // Appeler le callback parent
    onSelectPreset(seconds);
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
    const isActive = currentMinutes === preset.minutes;
    return (
      <TouchableOpacity
        key={preset.minutes}
        style={[styles.pill, isActive && styles.pillActive]}
        onPress={() => handlePresetSelect(preset.minutes)}
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
