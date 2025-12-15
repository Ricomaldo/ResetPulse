/**
 * @fileoverview Palette preview component showing color bars
 * @created 2025-12-14
 * @updated 2025-12-14
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { useTimerPalette } from '../../contexts/TimerPaletteContext';
import { TIMER_PALETTES } from '../../config/timer-palettes';
import { fontWeights } from '../../theme/tokens';

export const PalettePreview = React.memo(({ paletteName }) => {
  const theme = useTheme();
  const { currentPalette, getAvailablePalettes } = useTimerPalette();

  // If paletteName is provided, use it for color preview
  if (paletteName) {
    const paletteColors = TIMER_PALETTES[paletteName]?.colors;
    if (!paletteColors) return null;

    return (
      <View style={styles.colorContainer}>
        {paletteColors.map((color, index) => (
          <View
            key={index}
            style={[styles.colorBar, { backgroundColor: color }]}
          />
        ))}
      </View>
    );
  }

  // Original component behavior when no paletteName provided
  const availablePalettes = getAvailablePalettes();

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: theme.colors.text }]}>
        Palette actuelle: {currentPalette}
      </Text>

      <View style={styles.paletteInfo}>
        <Text style={[styles.info, { color: theme.colors.textSecondary }]}>
          Palettes disponibles: {availablePalettes.join(', ')}
        </Text>
      </View>
    </View>
  );
});

export default PalettePreview;

const styles = StyleSheet.create({
  container: {
    padding: 16,
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: fontWeights.semibold,
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
