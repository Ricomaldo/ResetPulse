// src/components/PalettePreview.jsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme, usePalette } from './ThemeProvider';

export const PalettePreview = () => {
  const { brand, spacing, borderRadius } = useTheme();
  const { currentPalette, availablePalettes } = usePalette();

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: brand.text }]}>
        Palette actuelle: {currentPalette}
      </Text>
      
      <View style={styles.paletteInfo}>
        <Text style={[styles.info, { color: brand.textLight }]}>
          Palettes disponibles: {availablePalettes.join(', ')}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  paletteInfo: {
    marginTop: 8,
  },
  info: {
    fontSize: 12,
    textAlign: 'center',
  },
});
