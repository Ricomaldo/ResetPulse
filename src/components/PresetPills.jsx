// src/components/PresetPills.jsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { rs } from '../styles/responsive';

const PRESETS = [
  { minutes: 1, label: '1' },
  { minutes: 5, label: '5' },
  { minutes: 10, label: '10' },
  { minutes: 25, label: '25' },
  { minutes: 60, label: '60' },
];

export default function PresetPills({ currentDuration, onSelectPreset }) {
  const theme = useTheme();
  const currentMinutes = Math.round(currentDuration / 60);

  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: rs(12),
      paddingVertical: rs(8),
    },
    pill: {
      paddingHorizontal: rs(14),
      paddingVertical: rs(8),
      borderRadius: rs(20),
      backgroundColor: theme.colors.surface,
      borderWidth: 2,
      borderColor: theme.colors.border,
      minWidth: rs(44),
      alignItems: 'center',
      justifyContent: 'center',
    },
    pillActive: {
      backgroundColor: theme.colors.brand.primary,
      borderColor: theme.colors.brand.primary,
    },
    pillText: {
      fontSize: rs(14),
      fontWeight: '600',
      color: theme.colors.textSecondary,
    },
    pillTextActive: {
      color: theme.colors.background,
    },
  });

  return (
    <View style={styles.container}>
      {PRESETS.map((preset) => {
        const isActive = currentMinutes === preset.minutes;
        return (
          <TouchableOpacity
            key={preset.minutes}
            style={[styles.pill, isActive && styles.pillActive]}
            onPress={() => onSelectPreset(preset.minutes * 60)}
            activeOpacity={0.7}
          >
            <Text style={[styles.pillText, isActive && styles.pillTextActive]}>
              {preset.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
