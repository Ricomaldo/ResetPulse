// src/components/PaletteCarousel.jsx
import React, { useRef, useEffect, useState } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Text,
  Animated,
} from "react-native";
import { useTheme } from "../theme/ThemeProvider";
import { useTimerPalette } from "../contexts/TimerPaletteContext";
import { useTranslation } from "../hooks/useTranslation";
import { rs } from "../styles/responsive";
import { TIMER_PALETTES, getFreePalettes } from "../config/timerPalettes";
import { usePremiumStatus } from "../hooks/usePremiumStatus";
import haptics from "../utils/haptics";
import { PremiumModal, MoreColorsModal } from "./modals";

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

  // Scroll to current palette on mount
  useEffect(() => {
    if (scrollViewRef.current && effectiveIndex >= 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({
          x: effectiveIndex * rs(232, "width"),
          animated: false,
        });
      }, 100);
    }
  }, []);

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

  // Handle scroll end to detect palette change
  const handleScrollEnd = (event) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const containerWidth = rs(232, "width");
    const newIndex = Math.round(offsetX / containerWidth);

    // Si on est sur le bouton "+" (dernière slide en freemium), ne rien faire
    if (!isPremiumUser && newIndex >= DISPLAY_PALETTES.length) {
      return;
    }

    if (
      newIndex !== effectiveIndex &&
      newIndex >= 0 &&
      newIndex < DISPLAY_PALETTES.length
    ) {
      const newPaletteName = DISPLAY_PALETTES[newIndex];
      setPalette(newPaletteName);
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
      fontWeight: "600",
    },

    scrollView: {
      maxWidth: rs(232, "width"),
    },

    scrollContent: {
      paddingHorizontal: 0,
    },

    paletteContainer: {
      width: rs(232, "width"),
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      gap: theme.spacing.md,
      paddingVertical: theme.spacing.xs,
      paddingHorizontal: rs(6, "width"),
    },

    colorButton: {
      width: rs(44, "min"),
      height: rs(44, "min"),
      borderRadius: rs(22, "min"),
      borderWidth: 3,
      borderColor: "transparent",
      ...theme.shadows.md,
    },

    colorButtonActive: {
      borderColor: theme.colors.background,
      transform: [{ scale: 1.2 }],
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
      fontWeight: "600",
      color: theme.colors.text,
      letterSpacing: 0.5,
    },

    // Bouton "+" pour découvrir plus de palettes
    moreButtonContainer: {
      width: rs(232, "width"),
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      paddingVertical: theme.spacing.xs,
      paddingHorizontal: rs(6, "width"),
    },

    moreButton: {
      width: rs(44, "min"),
      height: rs(44, "min"),
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
      fontWeight: "300",
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
      fontWeight: '600',
      color: '#FFFFFF',
      textAlign: 'center',
    },
  });

  // Navigation functions
  const scrollToPrevious = () => {
    if (effectiveIndex > 0) {
      const newIndex = effectiveIndex - 1;
      const newPaletteName = DISPLAY_PALETTES[newIndex];

      scrollViewRef.current?.scrollTo({
        x: newIndex * rs(232, "width"),
        animated: true,
      });

      setPalette(newPaletteName);
      showPaletteName();
    }
  };

  const scrollToNext = () => {
    // Permettre de scroller vers le bouton "+" en freemium
    const maxIndex = isPremiumUser ? DISPLAY_PALETTES.length - 1 : DISPLAY_PALETTES.length;

    if (effectiveIndex < maxIndex) {
      const newIndex = effectiveIndex + 1;

      scrollViewRef.current?.scrollTo({
        x: newIndex * rs(232, "width"),
        animated: true,
      });

      // Si on arrive sur une vraie palette, la sélectionner
      if (newIndex < DISPLAY_PALETTES.length) {
        const newPaletteName = DISPLAY_PALETTES[newIndex];
        setPalette(newPaletteName);
        showPaletteName();
      }
    }
  };

  const handleMorePress = () => {
    haptics.selection().catch(() => {});
    setShowColorsModal(true);
  };

  return (
    <View style={styles.outerContainer}>
      {/* Left chevron */}
      <TouchableOpacity
        style={[
          styles.chevronButton,
          effectiveIndex === 0 && styles.chevronDisabled,
        ]}
        onPress={scrollToPrevious}
        disabled={effectiveIndex === 0}
        activeOpacity={0.7}
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
          {formatPaletteName(currentPalette)}
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
        snapToInterval={rs(232, "width")}
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
                  accessibilityLabel={`Couleur ${
                    colorIndex + 1
                  } de la palette ${paletteInfo.name}`}
                  accessibilityRole="button"
                  accessibilityState={{
                    selected: isCurrentPalette && currentColor === color,
                  }}
                  style={[
                    styles.colorButton,
                    {
                      backgroundColor: color,
                      opacity: isCurrentPalette ? 1 : 0.5,
                    },
                    isCurrentPalette &&
                      currentColor === color &&
                      styles.colorButtonActive,
                  ]}
                  onPress={() => {
                    if (isCurrentPalette) {
                      setColorIndex(colorIndex);
                    } else {
                      setPalette(paletteName);
                      setColorIndex(colorIndex);
                      showPaletteName();
                    }
                  }}
                  activeOpacity={0.7}
                />
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
              accessibilityLabel="Découvrir plus de palettes"
              accessibilityRole="button"
            >
              <Text style={styles.moreButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
      </View>

      {/* Right chevron */}
      <TouchableOpacity
        style={[
          styles.chevronButton,
          effectiveIndex >= totalSlides - 1 && styles.chevronDisabled,
        ]}
        onPress={scrollToNext}
        disabled={effectiveIndex >= totalSlides - 1}
        activeOpacity={0.7}
      >
        <Text style={styles.chevronText}>›</Text>
      </TouchableOpacity>

      {/* Premium Modal (pour achat direct) */}
      <PremiumModal
        visible={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
        highlightedFeature="palettes premium"
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
