// src/components/PaletteCarousel.jsx
import React, { useRef, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, StyleSheet, Text, Animated } from 'react-native';
import { useTheme, usePalette } from './ThemeProvider';
import { useTimerOptions } from '../contexts/TimerOptionsContext';
import { responsiveSize } from '../styles/layout';
import { PALETTE_NAMES, TIMER_PALETTES } from '../styles/theme';

export default function PaletteCarousel() {
  const theme = useTheme();
  const { currentColor, setCurrentColor } = useTimerOptions();
  const { currentPalette, setPalette } = usePalette();
  const scrollViewRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Get current palette index
  const currentPaletteIndex = PALETTE_NAMES.indexOf(currentPalette);

  // Scroll to current palette on mount
  useEffect(() => {
    if (scrollViewRef.current && currentPaletteIndex >= 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({
          x: currentPaletteIndex * responsiveSize(220),
          animated: false
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
    const containerWidth = responsiveSize(220);
    const newIndex = Math.round(offsetX / containerWidth);

    if (newIndex !== currentPaletteIndex && newIndex >= 0 && newIndex < PALETTE_NAMES.length) {
      const newPaletteName = PALETTE_NAMES[newIndex];
      setPalette(newPaletteName);
      showPaletteName();
    }
  };

  // Format palette name for display
  const formatPaletteName = (name) => {
    const nameMap = {
      'classique': 'Classique',
      'laser': 'Laser',
      'tropical': 'Tropical',
      'zen': 'Zen',
      'forêt': 'Forêt',
      'océan': 'Océan',
      'aurore': 'Aurore',
      'crépuscule': 'Crépuscule'
    };
    return nameMap[name] || name;
  };

  const styles = StyleSheet.create({
    outerContainer: {
      position: 'relative',
      alignItems: 'center',
      marginBottom: theme.spacing.sm,
    },

    scrollView: {
      maxWidth: responsiveSize(220),
    },

    scrollContent: {
      paddingHorizontal: 0,
    },

    paletteContainer: {
      width: responsiveSize(220),
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
    },

    colorButton: {
      width: responsiveSize(44),
      height: responsiveSize(44),
      borderRadius: responsiveSize(22),
      borderWidth: 3,
      borderColor: 'transparent',
      ...theme.shadows.md,
    },

    colorButtonActive: {
      borderColor: theme.colors.background,
      transform: [{ scale: 1.2 }],
      ...theme.shadows.lg,
      elevation: 5,
    },

    paletteLabel: {
      position: 'absolute',
      top: -30,
      backgroundColor: theme.colors.background,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.borderRadius.lg,
      ...theme.shadows.md,
    },

    paletteLabelText: {
      fontSize: responsiveSize(13),
      fontWeight: '600',
      color: theme.colors.text,
      letterSpacing: 0.5,
    },

    scrollIndicator: {
      position: 'absolute',
      bottom: -10,
      flexDirection: 'row',
      gap: 5,
    },

    dot: {
      width: 5,
      height: 5,
      borderRadius: 2.5,
      backgroundColor: theme.colors.neutral,
      opacity: 0.3,
    },

    dotActive: {
      backgroundColor: currentColor,
      opacity: 1,
      width: 15,
    },
  });

  return (
    <View style={styles.outerContainer}>
      {/* Palette name label */}
      <Animated.View
        style={[
          styles.paletteLabel,
          {
            opacity: fadeAnim,
            transform: [{
              translateY: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [5, 0]
              })
            }]
          }
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
        snapToInterval={responsiveSize(220)}
        decelerationRate="fast"
      >
        {PALETTE_NAMES.map((paletteName, paletteIndex) => {
          // Get colors for this palette
          const paletteColors = TIMER_PALETTES[paletteName];
          const isCurrentPalette = paletteName === currentPalette;

          const colors = [
            paletteColors.energy,
            paletteColors.focus,
            paletteColors.calm,
            paletteColors.deep,
          ];

          return (
            <View key={paletteName} style={styles.paletteContainer}>
              {colors.map((color, colorIndex) => (
                <TouchableOpacity
                  key={`${paletteName}-${colorIndex}`}
                  style={[
                    styles.colorButton,
                    {
                      backgroundColor: color,
                      opacity: isCurrentPalette ? 1 : 0.5
                    },
                    isCurrentPalette && currentColor === color && styles.colorButtonActive
                  ]}
                  onPress={() => {
                    if (isCurrentPalette) {
                      setCurrentColor(color);
                    } else {
                      // Switch to that palette
                      setPalette(paletteName);
                      setCurrentColor(color);
                      showPaletteName();
                    }
                  }}
                  activeOpacity={0.7}
                />
              ))}
            </View>
          );
        })}
      </ScrollView>

      {/* Scroll indicators */}
      <View style={styles.scrollIndicator}>
        {PALETTE_NAMES.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              index === currentPaletteIndex && styles.dotActive
            ]}
          />
        ))}
      </View>
    </View>
  );
}