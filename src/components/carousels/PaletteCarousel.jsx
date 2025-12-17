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
  Animated,
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
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [showColorsModal, setShowColorsModal] = useState(false);

  const { isPremium: isPremiumUser } = usePremiumStatus();

  // En freemium : seulement les palettes gratuites + bouton "+"
  // En premium : toutes les palettes (triées par favoris)
  const FREE_PALETTE_NAMES = getFreePalettes();
  const ALL_PALETTE_NAMES = useMemo(() => Object.keys(TIMER_PALETTES), []);
  const DISPLAY_PALETTES = useMemo(() => {
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

  const currentPaletteIndex = useMemo(() =>
    DISPLAY_PALETTES.indexOf(currentPalette),
  [DISPLAY_PALETTES, currentPalette]
  );
  const effectiveIndex = currentPaletteIndex >= 0 ? currentPaletteIndex : 0;

  const [viewedPaletteIndex, setViewedPaletteIndex] = useState(effectiveIndex);

  // Scroll to current palette on mount and sync viewed index when currentPalette changes
  useEffect(() => {
    if (scrollViewRef.current && effectiveIndex >= 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({
          x: effectiveIndex * rs(280, 'width'),
          animated: false,
        });
        setViewedPaletteIndex(effectiveIndex);
      }, 100);
    }
  }, [effectiveIndex]);

  // Show palette name with animation
  const showPaletteName = () => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.delay(1500),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };


  // Handle scroll end to show palette name (no color change)
  const handleScrollEnd = (event) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const containerWidth = rs(280, 'width');
    const newIndex = Math.round(offsetX / containerWidth);

    // Si on est sur le bouton "+" (dernière slide en freemium), ne rien faire
    if (!isPremiumUser && newIndex >= DISPLAY_PALETTES.length) {
      return;
    }

    if (
      newIndex >= 0 &&
      newIndex < DISPLAY_PALETTES.length
    ) {
      // Update viewed palette index and show name
      setViewedPaletteIndex(newIndex);
      showPaletteName();
    }
  };

  // Format palette name for display
  const formatPaletteName = (name) => {
    return TIMER_PALETTES[name]?.name || name;
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
    chevronDisabled: {
      opacity: 0.3,
      pointerEvents: 'none',
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
      paddingHorizontal: theme.spacing.md,
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
      justifyContent: 'center',
      position: 'relative',
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
    paletteLabel: {
      alignSelf: 'center',
      backgroundColor: theme.colors.background,
      borderRadius: theme.borderRadius.lg,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.xs,
      position: 'absolute',
      top: -30,
      ...theme.shadows.md,
    },
    paletteLabelText: {
      color: theme.colors.text,
      fontSize: rs(13, 'min'),
      fontWeight: fontWeights.semibold,
      letterSpacing: 0.5,
    },
    scrollContent: {
      paddingHorizontal: 0,
    },
    scrollView: {
      maxWidth: rs(280, 'width'),
    },
  });

  // Navigation functions
  const scrollToPrevious = () => {
    if (viewedPaletteIndex > 0) {
      const newIndex = viewedPaletteIndex - 1;

      scrollViewRef.current?.scrollTo({
        x: newIndex * rs(280, 'width'),
        animated: true,
      });

      // Update viewed palette and show name
      setViewedPaletteIndex(newIndex);
      showPaletteName();
    }
  };

  const scrollToNext = () => {
    // Permettre de scroller vers le bouton "+" en freemium
    const maxIndex = isPremiumUser ? DISPLAY_PALETTES.length - 1 : DISPLAY_PALETTES.length;

    if (viewedPaletteIndex < maxIndex) {
      const newIndex = viewedPaletteIndex + 1;

      scrollViewRef.current?.scrollTo({
        x: newIndex * rs(280, 'width'),
        animated: true,
      });

      // Si on arrive sur une vraie palette, update viewed index et afficher le nom
      if (newIndex < DISPLAY_PALETTES.length) {
        setViewedPaletteIndex(newIndex);
        showPaletteName();
      }
    }
  };

  const handleMorePress = () => {
    haptics.selection().catch(() => { /* Optional operation - failure is non-critical */ });
    setShowColorsModal(true);
  };

  const maxIndex = isPremiumUser ? DISPLAY_PALETTES.length - 1 : DISPLAY_PALETTES.length;
  const isAtStart = viewedPaletteIndex === 0;
  const isAtEnd = viewedPaletteIndex >= maxIndex;

  return (
    <View style={styles.outerContainer}>
      {/* Left chevron */}
      <TouchableOpacity
        style={[styles.chevronButton, isAtStart && styles.chevronDisabled]}
        onPress={scrollToPrevious}
        activeOpacity={0.7}
        disabled={isAtStart}
      >
        <Text style={styles.chevronText}>‹</Text>
      </TouchableOpacity>

      {/* Palette carousel */}
      <View>
        {/* Palette name label */}
        <Animated.View
          style={[
            styles.paletteLabel,
            {
              opacity: fadeAnim,
              transform: [
                {
                  translateY: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [5, 0],
                  }),
                },
              ],
            },
          ]}
          pointerEvents="none"
        >
          <Text style={styles.paletteLabelText}>
            {formatPaletteName(DISPLAY_PALETTES[viewedPaletteIndex])}
          </Text>
        </Animated.View>

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
        >
          {DISPLAY_PALETTES.map((paletteName, paletteIndex) => {
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
                      // Change palette + color, and sync viewed index
                        setPalette(paletteName);
                        setColorIndex(colorIndex);
                        setViewedPaletteIndex(paletteIndex);
                        showPaletteName();
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
                <Text style={styles.moreButtonText}>{t('moreColors.title')}</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </View>

      {/* Right chevron */}
      <TouchableOpacity
        style={[styles.chevronButton, isAtEnd && styles.chevronDisabled]}
        onPress={scrollToNext}
        activeOpacity={0.7}
        disabled={isAtEnd}
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
