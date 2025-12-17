/**
 * @fileoverview Palette carousel for selecting timer colors
 * @created 2025-12-14
 * @updated 2025-12-16
 */
import React, { useRef, useEffect, useState, useMemo } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Text,
} from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { useTimerPalette } from '../../contexts/TimerPaletteContext';
import { useTimerOptions } from '../../contexts/TimerOptionsContext';
import { useTranslation } from '../../hooks/useTranslation';
import { rs } from '../../styles/responsive';
import { TIMER_PALETTES, getFreePalettes } from '../../config/timer-palettes';
import { usePremiumStatus } from '../../hooks/usePremiumStatus';
import haptics from '../../utils/haptics';
import { PremiumModal, MoreColorsModal } from '../modals';
import { fontWeights } from '../../theme/tokens';

export default function PaletteCarousel() {
  const theme = useTheme();
  const t = useTranslation();
  const {
    currentPalette,
    setPalette,
    currentColor,
    setColorIndex,
  } = useTimerPalette();
  const { favoritePalettes = [] } = useTimerOptions();
  const scrollViewRef = useRef(null);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [showColorsModal, setShowColorsModal] = useState(false);

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
      if (aIsFavorite && !bIsFavorite) {return -1;}
      if (!aIsFavorite && bIsFavorite) {return 1;}
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
    if (BASE_PALETTES.length === 0) {return [];}
    if (BASE_PALETTES.length === 1) {return BASE_PALETTES;} // No cloning for single item

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
    if (baseIndex < 0) {return isPremiumUser && BASE_PALETTES.length > 1 ? 1 : 0;}

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

  // Handle scroll end to sync palette state and handle infinite loop (premium only)
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

    // Update palette if changed
    if (newIndex >= 0 && newIndex < DISPLAY_PALETTES.length) {
      const newPalette = DISPLAY_PALETTES[newIndex];
      if (newPalette !== currentPalette) {
        setPalette(newPalette);
        setColorIndex(0); // Reset to first color of new palette
      }
    }
  };

  const styles = StyleSheet.create({
    chevronButton: {
      alignItems: 'center',
      backgroundColor: theme.colors.background,
      borderRadius: rs(16, 'min'),
      height: rs(32, 'min'),
      justifyContent: 'center',
      marginHorizontal: theme.spacing.xs,
      minHeight: 44,
      minWidth: 44,
      width: rs(32, 'min'),
      ...theme.shadows.sm,
    },
    chevronText: {
      color: theme.colors.textSecondary,
      fontSize: rs(18, 'min'),
      fontWeight: fontWeights.semibold,
    },
    colorButton: {
      backgroundColor: theme.colors.background,
      borderRadius: theme.borderRadius.round,
      borderWidth: 2,
      height: rs(50, 'min'),
      minHeight: 44,
      minWidth: 44,
      padding: rs(4, 'min'),
      width: rs(50, 'min'),
      ...theme.shadows.md,
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
    moreButton: {
      alignItems: 'center',
      backgroundColor: theme.colors.brand.primary,
      borderRadius: theme.borderRadius.lg,
      flex: 1,
      flexDirection: 'row',
      gap: theme.spacing.xs,
      justifyContent: 'center',
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.sm,
      ...theme.shadows.md,
    },
    moreButtonContainer: {
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'center',
      paddingHorizontal: rs(6, 'width'),
      paddingVertical: theme.spacing.xs,
      width: rs(280, 'width'),
    },
    moreButtonIcon: {
      fontSize: rs(20, 'min'),
    },
    moreButtonText: {
      color: theme.colors.fixed.white,
      fontSize: rs(14, 'min'),
      fontWeight: fontWeights.semibold,
    },
    outerContainer: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: theme.spacing.xs, // Match ActivityCarousel spacing
      justifyContent: 'center',
    },
    paletteContainer: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: theme.spacing.md,
      justifyContent: 'center',
      paddingHorizontal: rs(6, 'width'),
      paddingVertical: theme.spacing.xs,
      width: rs(280, 'width'),
    },
    scrollContent: {
      paddingHorizontal: 0,
    },
    scrollView: {
      maxWidth: rs(280, 'width'),
    },
  });

  // Navigation functions with infinite carousel behavior
  const scrollToPrevious = () => {
    const currentIndex = effectiveIndex;

    // Simply go to previous index - handleScrollEnd will handle wrap
    const newIndex = currentIndex - 1;

    // Scroll with animation
    scrollViewRef.current?.scrollTo({
      x: newIndex * rs(280, 'width'),
      animated: true,
    });

    haptics.selection().catch(() => { /* Optional operation - failure is non-critical */ });
  };

  const scrollToNext = () => {
    const currentIndex = effectiveIndex;

    // Simply go to next index - handleScrollEnd will handle wrap
    const newIndex = currentIndex + 1;

    // Scroll with animation
    scrollViewRef.current?.scrollTo({
      x: newIndex * rs(280, 'width'),
      animated: true,
    });

    haptics.selection().catch(() => { /* Optional operation - failure is non-critical */ });
  };

  const handleMorePress = () => {
    haptics.selection().catch(() => { /* Optional operation - failure is non-critical */ });
    setShowColorsModal(true);
  };

  return (
    <View style={styles.outerContainer}>
      {/* Left chevron - always enabled for circular navigation */}
      <TouchableOpacity
        style={styles.chevronButton}
        onPress={scrollToPrevious}
        activeOpacity={0.7}
      >
        <Text style={styles.chevronText}>‹</Text>
      </TouchableOpacity>

      {/* Palette carousel */}
      <View>
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
          scrollEnabled={false} // Disable manual scrolling, only chevrons control navigation
        >
          {DISPLAY_PALETTES.map((paletteName, _paletteIndex) => {
            const paletteInfo = TIMER_PALETTES[paletteName];
            const colors = paletteInfo.colors;
            const isCurrentPalette = paletteName === currentPalette;

            return (
              <View key={paletteName} style={styles.paletteContainer}>
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
                      isCurrentPalette &&
                      currentColor === color &&
                      styles.colorButtonActive,
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
                    <View
                      style={[
                        styles.colorButtonInner,
                        { backgroundColor: color },
                      ]}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            );
          })}

          {/* Bouton "Discover Colors" en freemium */}
          {!isPremiumUser && (
            <View style={styles.moreButtonContainer}>
              <TouchableOpacity
                style={styles.moreButton}
                onPress={handleMorePress}
                activeOpacity={0.7}
                accessible={true}
                accessibilityLabel={t('accessibility.discoverMorePalettes')}
                accessibilityRole="button"
              >
                <Text style={styles.moreButtonIcon}>💎</Text>
                <Text style={styles.moreButtonText}>{t('discovery.moreColors.title')}</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </View>

      {/* Right chevron - always enabled for circular navigation */}
      <TouchableOpacity
        style={styles.chevronButton}
        onPress={scrollToNext}
        activeOpacity={0.7}
      >
        <Text style={styles.chevronText}>›</Text>
      </TouchableOpacity>

      {/* Premium Modal (pour achat direct) */}
      <PremiumModal
        visible={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
        highlightedFeature={t('discovery.colors')}
      />

      {/* More Colors Modal (découverte) */}
      <MoreColorsModal
        visible={showColorsModal}
        onClose={() => setShowColorsModal(false)}
        onOpenPaywall={() => setShowPremiumModal(true)}
      />

    </View>
  );
}
