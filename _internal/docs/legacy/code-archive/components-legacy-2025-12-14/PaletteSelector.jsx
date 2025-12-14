/**
 * @fileoverview Palette selector grid for choosing timer palette
 * @created 2025-12-14
 * @updated 2025-12-14
 * @deprecated This component is no longer used - replaced by PaletteCarousel
 */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { useTimerPalette } from '../../contexts/TimerPaletteContext';

export const PaletteSelector = () => {
  const { setPalette, getAvailablePalettes, currentPalette } = useTimerPalette();
  const availablePalettes = getAvailablePalettes();
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: theme.colors.text }]}>
        Choisir une palette
      </Text>
      
      <View style={styles.paletteGrid}>
        {availablePalettes.map((paletteName) => (
          <TouchableOpacity
            key={paletteName}
            style={[
              styles.paletteButton,
              {
                backgroundColor: currentPalette === paletteName
                  ? theme.colors.brand.primary
                  : theme.colors.surface,
                borderColor: theme.colors.border,
                borderRadius: theme.borderRadius.md,
                padding: theme.spacing.sm,
              }
            ]}
            onPress={() => setPalette(paletteName)}
          >
            <Text style={[
              styles.paletteText,
              {
                color: currentPalette === paletteName
                  ? theme.colors.background
                  : theme.colors.text
              }
            ]}>
              {paletteName.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  paletteGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  paletteButton: {
    borderWidth: 1,
    minWidth: 80,
    alignItems: 'center',
  },
  paletteText: {
    fontSize: 12,
    fontWeight: '500',
  },
});

