// src/components/TimerOptions.jsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from './ThemeProvider';
import { useTimerOptions } from '../contexts/TimerOptionsContext';
import { rs } from '../styles/responsive';

export default function TimerOptions() {
  const theme = useTheme();
  const {
    clockwise,
    scaleMode,
    setClockwise,
    setScaleMode
  } = useTimerOptions();

  const styles = StyleSheet.create({
    container: {
      width: '100%',
      alignItems: 'center',
      paddingVertical: theme.spacing.md,
    },

    section: {
      width: '100%',
      marginBottom: theme.spacing.sm,
    },

    optionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: theme.spacing.xs,
      marginBottom: theme.spacing.xs,
    },

    optionButton: {
      backgroundColor: theme.colors.surface,
      paddingVertical: theme.spacing.xs / 2,
      paddingHorizontal: theme.spacing.sm,
      borderRadius: theme.borderRadius.sm,
      borderWidth: 1,
      borderColor: theme.colors.border,
      minWidth: rs(90, 'min'),
      alignItems: 'center',
    },

    optionButtonActive: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },

    optionText: {
      fontSize: rs(11, 'min'),
      color: theme.colors.text,
      fontWeight: '500',
    },

    optionTextActive: {
      color: theme.colors.background,
      fontWeight: '600',
    },
  });

  return (
    <View style={styles.container}>
      {/* Scale Mode Option */}
      <View style={styles.section}>
        <View style={styles.optionRow}>
          <TouchableOpacity
            style={[
              styles.optionButton,
              scaleMode === '60min' && styles.optionButtonActive
            ]}
            onPress={() => setScaleMode('60min')}
          >
            <Text style={[
              styles.optionText,
              scaleMode === '60min' && styles.optionTextActive
            ]}>
              Cadran 60min
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.optionButton,
              scaleMode === 'full' && styles.optionButtonActive
            ]}
            onPress={() => setScaleMode('full')}
          >
            <Text style={[
              styles.optionText,
              scaleMode === 'full' && styles.optionTextActive
            ]}>
              Cadran Full
            </Text>
          </TouchableOpacity>
        </View>

        {/* Direction Option */}
        <View style={styles.optionRow}>
          <TouchableOpacity
            style={[
              styles.optionButton,
              !clockwise && styles.optionButtonActive
            ]}
            onPress={() => setClockwise(false)}
          >
            <Text style={[
              styles.optionText,
              !clockwise && styles.optionTextActive
            ]}>
              Anti-horaire
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.optionButton,
              clockwise && styles.optionButtonActive
            ]}
            onPress={() => setClockwise(true)}
          >
            <Text style={[
              styles.optionText,
              clockwise && styles.optionTextActive
            ]}>
              Horaire
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}