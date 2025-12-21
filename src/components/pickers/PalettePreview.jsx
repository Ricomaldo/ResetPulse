/**
 * @fileoverview Palette preview component showing color bars
 * @created 2025-12-14
 * @updated 2025-12-14
 */
import PropTypes from 'prop-types';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { TIMER_PALETTES } from '../../config/timer-palettes';
import { useTimerPalette } from '../../contexts/TimerConfigContext';
import { useTheme } from '../../theme/ThemeProvider';
import { fontWeights } from '../../theme/tokens';

export const PalettePreview = React.memo(function PalettePreview({ paletteName }) {
  const theme = useTheme();
  const { currentPalette, getAvailablePalettes } = useTimerPalette();

  // If paletteName is provided, use it for color preview
  if (paletteName) {
    const paletteColors = TIMER_PALETTES[paletteName]?.colors;
    if (!paletteColors) {return null;}

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

PalettePreview.displayName = 'PalettePreview';
PalettePreview.propTypes = {
  paletteName: PropTypes.string,
};

export default PalettePreview;

const styles = StyleSheet.create({
  colorBar: {
    flex: 1,
  },
  colorContainer: {
    borderRadius: 4,
    flexDirection: 'row',
    height: 20,
    overflow: 'hidden',
    width: '100%',
  },
  container: {
    alignItems: 'center',
    padding: 16,
  },
  info: {
    fontSize: 12,
    textAlign: 'center',
  },
  paletteInfo: {
    marginTop: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: fontWeights.semibold,
    marginBottom: 8,
  },
});
