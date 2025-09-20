// src/components/PaletteSelector.jsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { usePalette, useTheme } from './ThemeProvider';

export const PaletteSelector = () => {
  const { setPalette, availablePalettes, currentPalette } = usePalette();
  const { brand, spacing, borderRadius } = useTheme();

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: brand.text }]}>
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
                  ? brand.primary 
                  : brand.surface,
                borderColor: brand.border,
                borderRadius: borderRadius.md,
                padding: spacing.sm,
              }
            ]}
            onPress={() => setPalette(paletteName)}
          >
            <Text style={[
              styles.paletteText,
              { 
                color: currentPalette === paletteName 
                  ? brand.background 
                  : brand.text 
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
