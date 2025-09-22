// src/components/PalettePreview.jsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme, usePalette } from './ThemeProvider';
import paletteData from '../styles/palette.json';

export const PalettePreview = ({ paletteName }) => {
  const { brand, spacing, borderRadius } = useTheme();
  const { currentPalette, availablePalettes } = usePalette();

  // If paletteName is provided, use it for color preview
  if (paletteName) {
    const colors = paletteData[paletteName];
    if (!colors) return null;

    return (
      <View style={styles.colorContainer}>
        {colors.map((color, index) => (
          <View
            key={index}
            style={[styles.colorBar, { backgroundColor: color }]}
          />
        ))}
      </View>
    );
  }

  // Original component behavior when no paletteName provided
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

export default PalettePreview;

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
  colorContainer: {
    flexDirection: 'row',
    height: 20,
    width: '100%',
    borderRadius: 4,
    overflow: 'hidden',
  },
  colorBar: {
    flex: 1,
  },
});
