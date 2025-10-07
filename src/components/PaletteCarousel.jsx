// src/components/PaletteCarousel.jsx
import React, { useRef, useEffect } from "react";
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
import { isTestPremium } from "../config/testMode";

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

  const isPremiumUser = isTestPremium(); // Check premium status
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
      if (!paletteInfo.isPremium || isPremiumUser) {
        setPalette(newPaletteName);
        showPaletteName();
      } else {
        // Scroll back to current palette if trying to select premium
        scrollViewRef.current?.scrollTo({
          x: currentPaletteIndex * rs(232, "width"),
          animated: true,
        });
      }
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

    lockOverlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "rgba(255, 255, 255, 0.6)",
      borderRadius: rs(22, "min"),
    },

    lockIcon: {
      fontSize: rs(20, "min"),
    },
  });

  // Navigation functions
  const scrollToPrevious = () => {
    if (currentPaletteIndex > 0) {
      const newIndex = currentPaletteIndex - 1;
      scrollViewRef.current?.scrollTo({
        x: newIndex * rs(232, "width"),
        animated: true,
      });
      const newPaletteName = PALETTE_NAMES[newIndex];
      const paletteInfo = TIMER_PALETTES[newPaletteName];
      if (!paletteInfo.isPremium || isPremiumUser) {
        setPalette(newPaletteName);
        showPaletteName();
      }
    }
  };

  const scrollToNext = () => {
    if (currentPaletteIndex < PALETTE_NAMES.length - 1) {
      const newIndex = currentPaletteIndex + 1;
      scrollViewRef.current?.scrollTo({
        x: newIndex * rs(232, "width"),
        animated: true,
      });
      const newPaletteName = PALETTE_NAMES[newIndex];
      const paletteInfo = TIMER_PALETTES[newPaletteName];
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
                <View
                  key={`${paletteName}-${colorIndex}`}
                  style={{ position: "relative" }}
                >
                  <TouchableOpacity
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
                      if (!isLocked) {
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
                    activeOpacity={isLocked ? 1 : 0.7}
                  />
                  {isLocked && colorIndex === 1 && (
                    <View style={styles.lockOverlay} pointerEvents="none">
                      <Text style={styles.lockIcon}>🔒</Text>
                    </View>
                  )}
                </View>
              ))}
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
    </View>
  );
}
