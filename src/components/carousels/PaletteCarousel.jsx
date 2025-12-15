/**
 * @fileoverview Palette carousel for selecting timer colors
 * @created 2025-12-14
 * @updated 2025-12-14
 */
import React, { useRef, useEffect, useState } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Text,
  Animated,
} from "react-native";
import { useTheme } from "../../theme/ThemeProvider";
import { useTimerPalette } from "../../contexts/TimerPaletteContext";
import { useTranslation } from "../../hooks/useTranslation";
import { rs } from "../../styles/responsive";
import { TIMER_PALETTES, getFreePalettes } from '../../config/timer-palettes";
import { usePremiumStatus } from "../../hooks/usePremiumStatus";
import haptics from "../../utils/haptics";
import { PremiumModal, MoreColorsModal } from "../modals";
import { fontWeights } from "../../theme/tokens";

export default function PaletteCarousel({ isTimerRunning = false }) {
  const theme = useTheme();
  const t = useTranslation();
  const {
    currentPalette,
    setPalette,
    paletteColors,
    currentColor,
    selectedColorIndex,
    setColorIndex,
    getAvailablePalettes,
  } = useTimerPalette();
  const scrollViewRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const toastAnim = useRef(new Animated.Value(0)).current;
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [showColorsModal, setShowColorsModal] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const { isPremium: isPremiumUser } = usePremiumStatus();

  // En freemium : seulement les palettes gratuites + bouton "+"
  // En premium : toutes les palettes
  const FREE_PALETTE_NAMES = getFreePalettes();
  const ALL_PALETTE_NAMES = Object.keys(TIMER_PALETTES);
  const DISPLAY_PALETTES = isPremiumUser ? ALL_PALETTE_NAMES : FREE_PALETTE_NAMES;

  const currentPaletteIndex = DISPLAY_PALETTES.indexOf(currentPalette);
  const effectiveIndex = currentPaletteIndex >= 0 ? currentPaletteIndex : 0;

  const [viewedPaletteIndex, setViewedPaletteIndex] = useState(effectiveIndex);

  // Scroll to current palette on mount and sync viewed index when currentPalette changes
  useEffect(() => {
    if (scrollViewRef.current && effectiveIndex >= 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({
          x: effectiveIndex * rs(280, "width"),
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

  // Show toast message for onboarding
  const showToast = (message) => {
    setToastMessage(message);
    Animated.sequence([
      Animated.timing(toastAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.delay(2000),
      Animated.timing(toastAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => setToastMessage(''));
  };

  // Calcul de la largeur totale (palettes + bouton "+" en freemium)
  const totalSlides = isPremiumUser ? DISPLAY_PALETTES.length : DISPLAY_PALETTES.length + 1;

  // Handle scroll end to show palette name (no color change)
  const handleScrollEnd = (event) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const containerWidth = rs(280, "width");
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
    outerContainer: {
      position: "relative",
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
    },

    chevronButton: {
      width: rs(32, "min"),
      height: rs(32, "min"),
      minWidth: 44,
      minHeight: 44,
      borderRadius: rs(16, "min"),
      backgroundColor: theme.colors.surface,
      alignItems: "center",
      justifyContent: "center",
      marginHorizontal: theme.spacing.xs,
      ...theme.shadows.sm,
    },

    chevronDisabled: {
      opacity: 0.3,
    },

    chevronText: {
      fontSize: rs(18, "min"),
      color: theme.colors.text,
      fontWeight: fontWeights.semibold,
    },

    scrollView: {
      maxWidth: rs(280, "width"),
    },

    scrollContent: {
      paddingHorizontal: 0,
    },

    paletteContainer: {
      width: rs(280, "width"),
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      gap: theme.spacing.md,
      paddingVertical: theme.spacing.xs,
      paddingHorizontal: rs(6, "width"),
    },

    colorButton: {
      width: rs(50, "min"),
      height: rs(50, "min"),
      minWidth: 44,
      minHeight: 44,
      borderRadius: rs(25, "min"),
      borderWidth: 2,
      padding: rs(4, "min"),
      backgroundColor: theme.colors.background,
      ...theme.shadows.md,
    },

    colorButtonInner: {
      flex: 1,
      borderRadius: rs(18, "min"),
    },

    colorButtonActive: {
      transform: [{ scale: 1.1 }],
      ...theme.shadows.lg,
      elevation: 5,
    },

    paletteLabel: {
      position: "absolute",
      top: -30,
      backgroundColor: theme.colors.background,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.borderRadius.lg,
      ...theme.shadows.md,
    },

    paletteLabelText: {
      fontSize: rs(13, "min"),
      fontWeight: fontWeights.semibold,
      color: theme.colors.text,
      letterSpacing: 0.5,
    },

    // Bouton "+" pour découvrir plus de palettes
    moreButtonContainer: {
      width: rs(280, "width"),
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      paddingVertical: theme.spacing.xs,
      paddingHorizontal: rs(6, "width"),
    },

    moreButton: {
      width: rs(44, "min"),
      height: rs(44, "min"),
      minWidth: 44,
      minHeight: 44,
      borderRadius: rs(22, "min"),
      backgroundColor: theme.colors.surface,
      borderWidth: 2,
      borderColor: theme.colors.border,
      borderStyle: "dashed",
      alignItems: "center",
      justifyContent: "center",
      ...theme.shadows.sm,
    },

    moreButtonText: {
      fontSize: rs(24, "min"),
      color: theme.colors.textSecondary,
      fontWeight: fontWeights.light,
    },

    onboardingToast: {
      position: 'absolute',
      bottom: rs(50, 'height'),
      alignSelf: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.85)',
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      borderRadius: theme.borderRadius.lg,
      maxWidth: '80%',
      ...theme.shadows.lg,
      zIndex: 100,
    },

    onboardingToastText: {
      fontSize: rs(13, 'min'),
      fontWeight: fontWeights.semibold,
      color: theme.colors.fixed.white,
      textAlign: 'center',
    },
  });

  // Navigation functions
  const scrollToPrevious = () => {
    if (viewedPaletteIndex > 0) {
      const newIndex = viewedPaletteIndex - 1;

      scrollViewRef.current?.scrollTo({
        x: newIndex * rs(280, "width"),
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
        x: newIndex * rs(280, "width"),
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
      {/* Left chevron - hidden at start */}
      {!isAtStart && (
        <TouchableOpacity
          style={styles.chevronButton}
          onPress={scrollToPrevious}
          activeOpacity={0.7}
        >
          <Text style={styles.chevronText}>‹</Text>
        </TouchableOpacity>
      )}
      {isAtStart && <View style={[styles.chevronButton, { opacity: 0 }]} />}

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
        snapToInterval={rs(280, "width")}
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

        {/* Bouton "+" en freemium pour découvrir plus de palettes */}
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
              <Text style={styles.moreButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
      </View>

      {/* Right chevron - hidden at end */}
      {!isAtEnd && (
        <TouchableOpacity
          style={styles.chevronButton}
          onPress={scrollToNext}
          activeOpacity={0.7}
        >
          <Text style={styles.chevronText}>›</Text>
        </TouchableOpacity>
      )}
      {isAtEnd && <View style={[styles.chevronButton, { opacity: 0 }]} />}

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

      {/* Onboarding Toast */}
      {toastMessage !== '' && (
        <Animated.View
          style={[
            styles.onboardingToast,
            {
              opacity: toastAnim,
              transform: [{
                translateY: toastAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0]
                })
              }]
            }
          ]}
          pointerEvents="none"
        >
          <Text style={styles.onboardingToastText}>{toastMessage}</Text>
        </Animated.View>
      )}
    </View>
  );
}
