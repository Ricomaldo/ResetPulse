/**
 * @fileoverview Palette carousel for selecting timer colors
 * @created 2025-12-14
 * @updated 2025-12-16
 */
import React, { useRef, useEffect, useState, useMemo, forwardRef } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { TouchableOpacity } from '@gorhom/bottom-sheet';
import { useTheme } from '../../theme/ThemeProvider';
import { useTimerConfig } from '../../contexts/TimerConfigContext';
import { useTranslation } from '../../hooks/useTranslation';
import { rs } from '../../styles/responsive';
import { harmonizedSizes } from '../../styles/harmonized-sizes';
import { TIMER_PALETTES, getFreePalettes } from '../../config/timer-palettes';
import { usePremiumStatus } from '../../hooks/usePremiumStatus';
import { useModalStack } from '../../contexts/ModalStackContext';
import haptics from '../../utils/haptics';
import { IconButton } from '../buttons';
import analytics from '../../services/analytics';
import { fontWeights } from '../../theme/tokens';

const PaletteCarousel = forwardRef(function PaletteCarousel(props, ref) {
  const theme = useTheme();
  const t = useTranslation();
  const {
    palette: { currentPalette, currentColor },
    favorites: { favoritePalettes = [] },
    setPalette,
    setColorIndex,
  } = useTimerConfig();
  const scrollViewRef = ref || useRef(null);
  const modalStack = useModalStack();

  const { isPremium: isPremiumUser } = usePremiumStatus();

  // En freemium : seulement les palettes gratuites + bouton "+"
  // En premium : toutes les palettes (triées par favoris)
  const FREE_PALETTE_NAMES = getFreePalettes();
  const ALL_PALETTE_NAMES = useMemo(() => Object.keys(TIMER_PALETTES), []);

  // Base palettes (without clones)
  const BASE_PALETTES = useMemo(() => {
    const basePalettes = isPremiumUser ? ALL_PALETTE_NAMES : FREE_PALETTE_NAMES;

    // Trier par favoris (favoris en premier)
    return [...basePalettes].sort((a, b) => {
      const aIsFavorite = favoritePalettes.includes(a);
      const bIsFavorite = favoritePalettes.includes(b);
      if (aIsFavorite && !bIsFavorite) {
        return -1;
      }
      if (!aIsFavorite && bIsFavorite) {
        return 1;
      }
      if (aIsFavorite && bIsFavorite) {
        return favoritePalettes.indexOf(a) - favoritePalettes.indexOf(b);
      }
      return 0;
    });
  }, [isPremiumUser, ALL_PALETTE_NAMES, FREE_PALETTE_NAMES, favoritePalettes]);

  // Infinite carousel: clone first and last items (only in premium)
  // Freemium has a "+" button at the end, so no infinite loop needed
  // [CLONE_LAST, ...BASE_PALETTES, CLONE_FIRST] (premium)
  // [...BASE_PALETTES] (freemium)
  const DISPLAY_PALETTES = useMemo(() => {
    if (BASE_PALETTES.length === 0) {
      return [];
    }
    if (BASE_PALETTES.length === 1) {
      return BASE_PALETTES;
    } // No cloning for single item

    // Only use infinite carousel in premium (no "+" button)
    if (isPremiumUser) {
      const lastPalette = BASE_PALETTES[BASE_PALETTES.length - 1];
      const firstPalette = BASE_PALETTES[0];
      return [lastPalette, ...BASE_PALETTES, firstPalette];
    }

    // Freemium: no cloning (has "+" button instead)
    return BASE_PALETTES;
  }, [BASE_PALETTES, isPremiumUser]);

  const currentPaletteIndex = useMemo(() => {
    // Find the index of current palette
    const baseIndex = BASE_PALETTES.indexOf(currentPalette);
    if (baseIndex < 0) {
      return isPremiumUser && BASE_PALETTES.length > 1 ? 1 : 0;
    }

    // Premium: offset by 1 because we added a clone at the start
    // Freemium: no offset
    if (isPremiumUser && BASE_PALETTES.length > 1) {
      return baseIndex + 1;
    }

    return baseIndex;
  }, [BASE_PALETTES, currentPalette, isPremiumUser]);

  const effectiveIndex = currentPaletteIndex;

  // Scroll to current palette on mount and when palette changes externally
  useEffect(() => {
    if (scrollViewRef.current && effectiveIndex >= 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({
          x: effectiveIndex * rs(280, 'width'),
          animated: false,
        });
      }, 100);
    }
  }, [effectiveIndex]);

  // Handle scroll end to handle infinite loop (premium only)
  // Note: Palette change happens only on tap, not on scroll
  const handleScrollEnd = (event) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const containerWidth = rs(280, 'width');
    const newIndex = Math.round(offsetX / containerWidth);

    // Handle infinite carousel clones (premium only)
    if (isPremiumUser && BASE_PALETTES.length > 1) {
      // If we're at the cloned last item (index 0), teleport to real last item
      if (newIndex === 0) {
        const realLastIndex = DISPLAY_PALETTES.length - 2; // length-2 = last real item
        scrollViewRef.current?.scrollTo({
          x: realLastIndex * containerWidth,
          animated: false, // Instant teleport
        });
        return;
      }

      // If we're at the cloned first item (last index), teleport to real first item
      if (newIndex === DISPLAY_PALETTES.length - 1) {
        scrollViewRef.current?.scrollTo({
          x: 1 * containerWidth, // Index 1 = first real item
          animated: false, // Instant teleport
        });
        return;
      }
    }

    // Palette selection removed: colors are now selected only via tap
  };

  const styles = StyleSheet.create({
    carouselContainer: {
      maxWidth: rs(280, 'width'),
    },
    colorButton: {
      backgroundColor: theme.colors.fixed.transparent,
      borderRadius: theme.borderRadius.round,
      borderWidth: 2,
      height: harmonizedSizes.colorButton.size,
      minHeight: 44,
      minWidth: 44,
      padding: harmonizedSizes.colorButton.padding,
      width: harmonizedSizes.colorButton.size,
    },
    colorButtonActive: {
      elevation: 5,
      transform: [{ scale: 1.1 }],
      ...theme.shadows.lg,
    },
    colorButtonInner: {
      borderRadius: theme.borderRadius.round,
      flex: 1,
    },
    moreButtonContainer: {
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'center',
      paddingHorizontal: harmonizedSizes.carouselSpacing.containerPadding.horizontal,
      paddingVertical: harmonizedSizes.carouselSpacing.containerPadding.vertical,
      width: rs(280, 'width'),
    },
    outerContainer: {
      alignItems: 'center',
      flexDirection: 'column',
      gap: harmonizedSizes.carouselSpacing.stackGap,
      justifyContent: 'center',
    },
    paletteContainer: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: harmonizedSizes.carouselSpacing.itemGap,
      justifyContent: 'center',
      paddingHorizontal: harmonizedSizes.carouselSpacing.containerPadding.horizontal,
      paddingVertical: harmonizedSizes.carouselSpacing.containerPadding.vertical,
      width: rs(280, 'width'),
    },
    scrollContent: {
      paddingHorizontal: 0,
    },
    scrollView: {
      flexGrow: 0,
      height: harmonizedSizes.scrollView.height,
    },
  });

  const handleMorePress = () => {
    haptics.selection().catch(() => {
      /* Optional operation - failure is non-critical */
    });
    analytics.trackDiscoveryModalShown('colors');

    // Get premium palettes
    const premiumPalettes = Object.entries(TIMER_PALETTES)
      .filter(([_, palette]) => palette.isPremium)
      .map(([key, palette]) => ({
        key,
        name: palette.name,
        colors: palette.colors,
      }));

    // Create palette grid
    const paletteGrid = (
      <View style={{
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: theme.spacing.md,
        justifyContent: 'center',
        paddingHorizontal: theme.spacing.xs,
      }}>
        {premiumPalettes.map((palette) => (
          <View
            key={palette.key}
            style={{
              alignItems: 'center',
              marginBottom: theme.spacing.sm,
              width: '28%',
            }}
            accessible={true}
            accessibilityRole="text"
            accessibilityLabel={t('accessibility.paletteItem', { name: palette.name })}
          >
            <View style={{ flexDirection: 'row', gap: 4, marginBottom: theme.spacing.xs }}>
              {palette.colors.map((color, index) => (
                <View
                  key={index}
                  style={{
                    borderRadius: rs(8, 'min'),
                    height: rs(16, 'min'),
                    width: rs(16, 'min'),
                    backgroundColor: color,
                    ...theme.shadow('sm'),
                  }}
                  accessible={false}
                />
              ))}
            </View>
            <Text style={{
              color: theme.colors.textSecondary,
              fontSize: rs(10, 'min'),
              fontWeight: fontWeights.medium,
              textAlign: 'center',
            }} numberOfLines={1}>
              {palette.name}
            </Text>
          </View>
        ))}
      </View>
    );

    modalStack.push('discovery', {
      title: t('discovery.moreColors.title'),
      subtitle: t('discovery.moreColors.subtitle'),
      tagline: t('discovery.moreColors.tagline'),
      highlightedFeature: 'colors',
      children: paletteGrid,
      onClose: () => analytics.trackDiscoveryModalDismissed('colors'),
    });
  };

  return (
    <View style={styles.outerContainer}>
      {/* Palette carousel */}
      <View style={styles.carouselContainer}>
        {/* Scrollable color pills */}
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          scrollEventThrottle={16}
          onMomentumScrollEnd={handleScrollEnd}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          snapToInterval={rs(280, 'width')}
          decelerationRate="fast"
          scrollEnabled={true}
          activeOffsetX={[-5, 5]} // Capture gesture only if horizontal swipe > 5px
          failOffsetY={[-5, 5]} // Fail gesture if vertical swipe > 5px (let BottomSheet handle)
        >
          {DISPLAY_PALETTES.map((paletteName, _paletteIndex) => {
            const paletteInfo = TIMER_PALETTES[paletteName];
            const colors = paletteInfo.colors;
            const isCurrentPalette = paletteName === currentPalette;

            return (
              <View key={`palette-${_paletteIndex}-${paletteName}`} style={styles.paletteContainer}>
                {colors.map((color, colorIndex) => (
                  <TouchableOpacity
                    key={`${paletteName}-${colorIndex}`}
                    accessible={true}
                    accessibilityLabel={t('accessibility.colorNumber', { number: colorIndex + 1 })}
                    accessibilityRole="button"
                    accessibilityState={{
                      selected: isCurrentPalette && currentColor === color,
                    }}
                    style={[
                      styles.colorButton,
                      { borderColor: color },
                      isCurrentPalette && currentColor === color && styles.colorButtonActive,
                    ]}
                    onPress={() => {
                      if (isCurrentPalette) {
                        setColorIndex(colorIndex);
                      } else {
                        // Change palette + color
                        setPalette(paletteName);
                        setColorIndex(colorIndex);
                      }
                    }}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.colorButtonInner, { backgroundColor: color }]} />
                  </TouchableOpacity>
                ))}
              </View>
            );
          })}

          {/* Bouton "Discover Colors" en freemium */}
          {!isPremiumUser && (
            <View style={styles.moreButtonContainer}>
              <IconButton
                icon="premium"
                label={t('discovery.moreColors.title')}
                labelPosition="right"
                variant="secondary"
                size="medium"
                shape="rounded"
                onPress={handleMorePress}
                accessibilityLabel={t('accessibility.discoverMorePalettes')}
              />
            </View>
          )}
        </ScrollView>
      </View>
    </View>
  );
});

export default PaletteCarousel;
