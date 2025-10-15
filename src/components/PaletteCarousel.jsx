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
import { rs } from "../styles/responsive";
import { TIMER_PALETTES } from "../config/timerPalettes";
import { usePremiumStatus } from "../hooks/usePremiumStatus";
import haptics from "../utils/haptics";
import PremiumModal from "./PremiumModal";

export default function PaletteCarousel({ isTimerRunning = false }) {
  const theme = useTheme();
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
  const [showPremiumModal, setShowPremiumModal] = useState(false);

  const { isPremium: isPremiumUser } = usePremiumStatus(); // Check premium status
  const PALETTE_NAMES = Object.keys(TIMER_PALETTES);
  const currentPaletteIndex = PALETTE_NAMES.indexOf(currentPalette);

  // Scroll to current palette on mount
  useEffect(() => {
    if (scrollViewRef.current && currentPaletteIndex >= 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({
          x: currentPaletteIndex * rs(232, "width"),
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

  // Handle scroll end to detect palette change
  const handleScrollEnd = (event) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const containerWidth = rs(232, "width");
    const newIndex = Math.round(offsetX / containerWidth);

    if (
      newIndex !== currentPaletteIndex &&
      newIndex >= 0 &&
      newIndex < PALETTE_NAMES.length
    ) {
      const newPaletteName = PALETTE_NAMES[newIndex];
      const paletteInfo = TIMER_PALETTES[newPaletteName];
      // Only change palette if it's not premium or user is premium
      // Allow scrolling through premium palettes (don't block or trigger modal)
      if (!paletteInfo.isPremium || isPremiumUser) {
        setPalette(newPaletteName);
        showPaletteName();
      }
      // No action for premium palettes - user can browse but not select
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

    unlockBadge: {
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: [{ translateX: -45 }, { translateY: -12 }],
      backgroundColor: "rgba(0, 0, 0, 0.7)",
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.borderRadius.md,
      zIndex: 20,
    },

    unlockText: {
      fontSize: rs(11, "min"),
      fontWeight: "600",
      color: "#FFFFFF",
      letterSpacing: 0.3,
    },
  });

  // Navigation functions
  const scrollToPrevious = () => {
    if (currentPaletteIndex > 0) {
      const newIndex = currentPaletteIndex - 1;
      const newPaletteName = PALETTE_NAMES[newIndex];
      const paletteInfo = TIMER_PALETTES[newPaletteName];

      scrollViewRef.current?.scrollTo({
        x: newIndex * rs(232, "width"),
        animated: true,
      });

      // Change palette if it's free, just scroll if premium (user must tap to unlock)
      if (!paletteInfo.isPremium || isPremiumUser) {
        setPalette(newPaletteName);
        showPaletteName();
      }
    }
  };

  const scrollToNext = () => {
    if (currentPaletteIndex < PALETTE_NAMES.length - 1) {
      const newIndex = currentPaletteIndex + 1;
      const newPaletteName = PALETTE_NAMES[newIndex];
      const paletteInfo = TIMER_PALETTES[newPaletteName];

      scrollViewRef.current?.scrollTo({
        x: newIndex * rs(232, "width"),
        animated: true,
      });

      // Change palette if it's free, just scroll if premium (user must tap to unlock)
      if (!paletteInfo.isPremium || isPremiumUser) {
        setPalette(newPaletteName);
        showPaletteName();
      }
    }
  };

  return (
    <View style={styles.outerContainer}>
      {/* Left chevron */}
      <TouchableOpacity
        style={[
          styles.chevronButton,
          currentPaletteIndex === 0 && styles.chevronDisabled,
        ]}
        onPress={scrollToPrevious}
        disabled={currentPaletteIndex === 0}
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
        {PALETTE_NAMES.map((paletteName, paletteIndex) => {
          // Get colors for this palette
          const paletteInfo = TIMER_PALETTES[paletteName];
          const colors = paletteInfo.colors;
          const isCurrentPalette = paletteName === currentPalette;
          const isLocked = paletteInfo.isPremium && !isPremiumUser;

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
                      opacity: isLocked ? 0.4 : isCurrentPalette ? 1 : 0.5,
                    },
                    isCurrentPalette &&
                      currentColor === color &&
                      styles.colorButtonActive,
                  ]}
                  onPress={() => {
                    if (isLocked) {
                      // Trigger premium modal on tap
                      haptics.warning().catch(() => {});
                      setShowPremiumModal(true);
                    } else {
                      if (isCurrentPalette) {
                        setColorIndex(colorIndex);
                      } else {
                        // Switch to that palette
                        setPalette(paletteName);
                        setColorIndex(colorIndex);
                        showPaletteName();
                      }
                    }
                  }}
                  activeOpacity={0.7}
                />
              ))}

              {/* Premium unlock badge */}
              {isLocked && (
                <TouchableOpacity
                  style={styles.unlockBadge}
                  onPress={() => {
                    haptics.warning().catch(() => {});
                    setShowPremiumModal(true);
                  }}
                  activeOpacity={0.8}
                  accessible={true}
                  accessibilityLabel="Débloquer cette palette premium"
                  accessibilityRole="button"
                >
                  <Text style={styles.unlockText}>Débloquer ✨</Text>
                </TouchableOpacity>
              )}
            </View>
          );
        })}
      </ScrollView>
      </View>

      {/* Right chevron */}
      <TouchableOpacity
        style={[
          styles.chevronButton,
          currentPaletteIndex === PALETTE_NAMES.length - 1 &&
            styles.chevronDisabled,
        ]}
        onPress={scrollToNext}
        disabled={currentPaletteIndex === PALETTE_NAMES.length - 1}
        activeOpacity={0.7}
      >
        <Text style={styles.chevronText}>›</Text>
      </TouchableOpacity>

      {/* Premium Modal */}
      <PremiumModal
        visible={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
        highlightedFeature="palettes premium"
      />
    </View>
  );
}
