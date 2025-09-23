// src/components/ColorSelector.jsx
// Sélecteur de couleurs pour la palette active du timer

import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { useTimerPalette } from '../contexts/TimerPaletteContext';
import { rs } from '../styles/responsive';

export default function ColorSelector() {
  const theme = useTheme();
  const { paletteColors, selectedColorIndex, setColorIndex } = useTimerPalette();

  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
    },

    colorButton: {
      width: rs(44, 'min'),
      height: rs(44, 'min'),
      borderRadius: rs(22, 'min'),
      alignItems: 'center',
      justifyContent: 'center',
      ...theme.shadows.sm,
    },

    colorInner: {
      width: rs(36, 'min'),
      height: rs(36, 'min'),
      borderRadius: rs(18, 'min'),
    },

    selected: {
      borderWidth: 3,
      borderColor: theme.colors.brand.secondary,
      transform: [{ scale: 1.1 }],
      ...theme.shadows.md,
    },
  });

  return (
    <View style={styles.container}>
      {paletteColors.map((color, index) => (
        <TouchableOpacity
          key={`color-${index}`}
          style={[
            styles.colorButton,
            { backgroundColor: color },
            selectedColorIndex === index && styles.selected,
          ]}
          onPress={() => setColorIndex(index)}
          activeOpacity={0.7}
        >
          <View
            style={[
              styles.colorInner,
              { backgroundColor: color },
            ]}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
}