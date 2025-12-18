/**
 * @fileoverview Options drawer content - 3 core sections in logical order
 * 1. Activité (primary choice: what are you doing?)
 * 2. Couleur (cosmetic: visual style)
 * 3. Cadran (technical config: dial granularity)
 * @created 2025-12-14
 * @updated 2025-12-17
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { rs } from '../../styles/responsive';
import { ActivityCarousel, PaletteCarousel } from '../carousels';
import { PresetPills } from '../controls';
import { fontWeights } from '../../theme/tokens';

export default function OptionsDrawerContent({ onSelectPreset, drawerVisible = false }) {
  const theme = useTheme();

  const styles = StyleSheet.create({
    carouselWrapper: {
      marginBottom: theme.spacing.lg, // 21px (Golden Ratio) - proper section separation
      overflow: 'visible',
    },
    container: {
      flex: 1,
      paddingBottom: theme.spacing.md, // 13px - reduced from 20px
      paddingHorizontal: theme.spacing.lg, // 21px (Golden Ratio)
      paddingTop: theme.spacing.sm, // 8px - reduced from 16px
    },
    section: {
      marginBottom: theme.spacing.sm, // 8px - reduced from 16px
    },
    // sectionLabel: {
    //   color: theme.colors.textSecondary,
    //   fontSize: rs(13),
    //   fontWeight: fontWeights.medium,
    //   marginBottom: theme.spacing.sm, // 8px (consistent with section spacing)
    // },
  });

  return (
    <View style={styles.container}>
      {/* 1. Activité - Primary choice */}

      <View style={styles.carouselWrapper}>
        <ActivityCarousel isTimerRunning={false} drawerVisible={drawerVisible} />
      </View>

      {/* 3. Couleur (Palettes) - Cosmetic */}

      <View style={styles.carouselWrapper}>
        <PaletteCarousel isTimerRunning={false} />
      </View>
      {/* 3. Cadran (Scale) - Technical config */}
      {/* Temporarily hidden - testing drawer height optimization */}
      {/* <View style={styles.section}>
        <PresetPills onSelectPreset={onSelectPreset} />
      </View> */}
    </View>
  );
}
