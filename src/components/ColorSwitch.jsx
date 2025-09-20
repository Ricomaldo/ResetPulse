// src/components/ColorSwitch.jsx
import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from './ThemeProvider';
import { useTimerOptions } from '../contexts/TimerOptionsContext';
import { responsiveSize } from '../styles/layout';

export default function ColorSwitch() {
  const theme = useTheme();
  const { currentColor, setCurrentColor } = useTimerOptions();

  // Available timer colors
  const colors = [
    theme.colors.energy,
    theme.colors.focus,
    theme.colors.calm,
    theme.colors.deep
  ];

  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      marginBottom: theme.spacing.sm,
    },

    colorButton: {
      width: responsiveSize(40),
      height: responsiveSize(40),
      borderRadius: responsiveSize(20),
      borderWidth: 3,
      borderColor: 'transparent',
      ...theme.shadows.sm,
    },

    colorButtonActive: {
      borderColor: theme.colors.text,
      transform: [{ scale: 1.15 }],
      ...theme.shadows.md,
    },
  });

  return (
    <View style={styles.container}>
      {colors.map((color, index) => (
        <TouchableOpacity
          key={index}
          style={[
            styles.colorButton,
            { backgroundColor: color },
            currentColor === color && styles.colorButtonActive
          ]}
          onPress={() => setCurrentColor(color)}
        />
      ))}
    </View>
  );
}