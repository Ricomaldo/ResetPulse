// src/components/PaletteCarousel.jsx
import React, { useRef, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, StyleSheet, Text, Animated } from 'react-native';
import { useTheme, usePalette } from './ThemeProvider';
import { useTimerOptions } from '../contexts/TimerOptionsContext';
import { rs } from '../styles/responsive';
import { PALETTE_NAMES, TIMER_PALETTES } from '../styles/theme';
import { isPalettePremium } from '../config/palettes';

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
          x: currentPaletteIndex * rs(220, 'width'),
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
    const containerWidth = rs(220, 'width');
    const newIndex = Math.round(offsetX / containerWidth);

    if (newIndex !== currentPaletteIndex && newIndex >= 0 && newIndex < PALETTE_NAMES.length) {
      const newPaletteName = PALETTE_NAMES[newIndex];
      // Only change palette if it's not premium
      if (!isPalettePremium(newPaletteName)) {
        setPalette(newPaletteName);
        showPaletteName();
      } else {
        // Scroll back to current palette if trying to select premium
        scrollViewRef.current?.scrollTo({
          x: currentPaletteIndex * rs(220, 'width'),
          animated: true
        });
      }
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
      justifyContent: 'center',
      height: '100%',
    },

    scrollView: {
      maxWidth: rs(220, 'width'),
    },

    scrollContent: {
      paddingHorizontal: 0,
    },

    paletteContainer: {
      width: rs(220, 'width'),
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: theme.spacing.md,
      paddingVertical: theme.spacing.xs,
    },

    colorButton: {
      width: rs(44, 'min'),
      height: rs(44, 'min'),
      borderRadius: rs(22, 'min'),
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
      fontSize: rs(13, 'min'),
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

    lockOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(255, 255, 255, 0.6)',
      borderRadius: rs(22, 'min'),
    },

    lockIcon: {
      fontSize: rs(20, 'min'),
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
        snapToInterval={rs(220, 'width')}
        decelerationRate="fast"
      >
        {PALETTE_NAMES.map((paletteName, paletteIndex) => {
          // Get colors for this palette
          const paletteColors = TIMER_PALETTES[paletteName];
          const isCurrentPalette = paletteName === currentPalette;
          const isPremium = isPalettePremium(paletteName);

          const colors = [
            paletteColors.energy,
            paletteColors.focus,
            paletteColors.calm,
            paletteColors.deep,
          ];

          return (
            <View key={paletteName} style={styles.paletteContainer}>
              {colors.map((color, colorIndex) => (
                <View key={`${paletteName}-${colorIndex}`} style={{ position: 'relative' }}>
                  <TouchableOpacity
                    style={[
                      styles.colorButton,
                      {
                        backgroundColor: color,
                        opacity: isPremium ? 0.4 : (isCurrentPalette ? 1 : 0.5)
                      },
                      isCurrentPalette && currentColor === color && styles.colorButtonActive
                    ]}
                    onPress={() => {
                      if (!isPremium) {
                        if (isCurrentPalette) {
                          setCurrentColor(color);
                        } else {
                          // Switch to that palette
                          setPalette(paletteName);
                          setCurrentColor(color);
                          showPaletteName();
                        }
                      }
                    }}
                    activeOpacity={isPremium ? 1 : 0.7}
                  />
                  {isPremium && colorIndex === 1 && (
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