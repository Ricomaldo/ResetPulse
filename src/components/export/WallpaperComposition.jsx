/**
 * @fileoverview WallpaperComposition — cadrage 3c Q3 (export fond d'écran)
 * PAS une capture d'écran de l'app (chrome, heure, encoche) : une
 * composition DÉDIÉE — le disque plein dans la couleur du rituel courant +
 * l'emoji au centre, sur fond crème, aux dimensions du device (portrait).
 * Un objet-souvenir de la signature, pas un screenshot.
 *
 * Rendu HORS ÉCRAN : monté par l'appelant (AsideZone) en position absolue
 * loin du viewport, jamais affiché à l'user — seulement capturé via
 * `react-native-view-shot` (captureRef) au geste « garder en fond d'écran ».
 * `collapsable={false}` sur la vue racine : requis Android, sinon le
 * flattening natif peut faire disparaître la vue de la hiérarchie que
 * view-shot cherche à capturer.
 */
import React, { forwardRef } from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import PropTypes from 'prop-types';
import { useTheme } from '../../theme/ThemeProvider';

const WallpaperComposition = forwardRef(function WallpaperComposition(
  { color, emoji },
  ref
) {
  const theme = useTheme();
  const { width, height } = useWindowDimensions();
  const diskSize = Math.min(width, height) * 0.72;

  const styles = StyleSheet.create({
    container: {
      alignItems: 'center',
      backgroundColor: theme.colors.background,
      height,
      justifyContent: 'center',
      width,
    },
    disk: {
      alignItems: 'center',
      backgroundColor: color || theme.colors.brand.primary,
      borderRadius: diskSize / 2,
      height: diskSize,
      justifyContent: 'center',
      width: diskSize,
    },
    emoji: {
      fontSize: diskSize * 0.32,
    },
  });

  return (
    <View ref={ref} style={styles.container} collapsable={false}>
      <View style={styles.disk}>
        {emoji ? <Text style={styles.emoji}>{emoji}</Text> : null}
      </View>
    </View>
  );
});

WallpaperComposition.propTypes = {
  color: PropTypes.string,
  emoji: PropTypes.string,
};

export default WallpaperComposition;
