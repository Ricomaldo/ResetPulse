/**
 * @fileoverview CarouselBar - Zone de carrousels configurables (bas du TimerScreen)
 * @description Affiche les carrousels selon carouselBarConfig (activities, palettes)
 * @created 2025-12-17
 */
import React from 'react';
import PropTypes from 'prop-types';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { rs } from '../../styles/responsive';
import { fontWeights } from '../../theme/tokens';
import { ActivityCarousel, PaletteCarousel } from '../carousels';

/**
 * CarouselBar - Affiche UN carousel selon configuration (max 1 carousel à la fois)
 * @param {Array<string>} carouselBarConfig - Config des carrousels à afficher
 * @param {boolean} isTimerRunning - État du timer
 * @param {boolean} drawerVisible - État du drawer (pour reset scroll ActivityCarousel)
 */
const CarouselBar = React.memo(function CarouselBar({
  carouselBarConfig = [],
  isTimerRunning = false,
  drawerVisible = false,
}) {
  const theme = useTheme();

  // Si config vide, ne rien afficher
  if (!carouselBarConfig || carouselBarConfig.length === 0) {
    return null;
  }

  // Enforce max 1 carousel rule
  if (carouselBarConfig.length > 1) {
    console.warn(
      `[CarouselBar] Multiple carousels detected (${carouselBarConfig.join(', ')}). ` +
        `Only the first carousel ('${carouselBarConfig[0]}') will be displayed.`
    );
  }

  // Only use the first carousel in config
  const activeCarousel = carouselBarConfig[0];

  const styles = StyleSheet.create({
    container: {
      alignItems: 'center',
      gap: theme.spacing.lg,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.md,
      width: '100%', // Full width container
    },
    section: {
      alignItems: 'center',
      width: '100%',
    },
    sectionLabel: {
      color: theme.colors.textSecondary,
      fontSize: rs(13, 'min'),
      fontWeight: fontWeights.medium,
      marginBottom: theme.spacing.sm,
    },
  });

  const renderActivities = () => {
    if (activeCarousel !== 'activities') {
      return null;
    }

    return (
      <View key="activities" style={styles.section}>
        <ActivityCarousel isTimerRunning={isTimerRunning} drawerVisible={drawerVisible} />
      </View>
    );
  };

  const renderPalettes = () => {
    if (activeCarousel !== 'palettes') {
      return null;
    }

    return (
      <View key="palettes" style={styles.section}>
        <Text style={styles.sectionLabel}>Couleur</Text>
        <PaletteCarousel />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {renderActivities()}
      {renderPalettes()}
    </View>
  );
});

CarouselBar.propTypes = {
  carouselBarConfig: PropTypes.arrayOf(PropTypes.string),
  isTimerRunning: PropTypes.bool,
  drawerVisible: PropTypes.bool,
};

export default CarouselBar;
