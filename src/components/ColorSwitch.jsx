// src/components/ColorSwitch.jsx
import React, { useRef, useState } from 'react';
import { View, TouchableOpacity, StyleSheet, ScrollView, Text, Animated } from 'react-native';
import { useTheme, usePalette } from './ThemeProvider';
import { useTimerOptions } from '../contexts/TimerOptionsContext';
import { rs } from '../styles/responsive';
import { PALETTE_NAMES } from '../styles/theme';

export default function ColorSwitch() {
  const theme = useTheme();
  const { currentColor, setCurrentColor } = useTimerOptions();
  const { currentPalette, setPalette } = usePalette();
  const scrollViewRef = useRef(null);
  const [showPaletteName, setShowPaletteName] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Available timer colors
  const colors = [
    theme.colors.energy,
    theme.colors.focus,
    theme.colors.calm,
    theme.colors.deep
  ];

  // Get current palette index
  const currentPaletteIndex = PALETTE_NAMES.indexOf(currentPalette);

  // Handle scroll end to detect palette change
  const handleScrollEnd = (event) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const containerWidth = rs(220, 'width'); // Width of color pills container
    const newIndex = Math.round(offsetX / containerWidth);

    if (newIndex !== currentPaletteIndex && newIndex >= 0 && newIndex < PALETTE_NAMES.length) {
      const newPaletteName = PALETTE_NAMES[newIndex];
      setPalette(newPaletteName);

      // Show palette name briefly
      setShowPaletteName(true);
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
      ]).start(() => setShowPaletteName(false));
    }
  };

  // Format palette name for display
  const formatPaletteName = (name) => {
    return name.charAt(0).toUpperCase() + name.slice(1);
  };

  const styles = StyleSheet.create({
    outerContainer: {
      position: 'relative',
      alignItems: 'center',
      marginBottom: theme.spacing.sm,
    },

    scrollView: {
      maxWidth: rs(220, 'width'), // Width to show 4 pills
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
      paddingVertical: theme.spacing.sm,
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
      top: -25,
      backgroundColor: theme.colors.background,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.borderRadius.md,
      ...theme.shadows.sm,
    },

    paletteLabelText: {
      fontSize: rs(12, 'min'),
      fontWeight: '600',
      color: theme.colors.text,
      letterSpacing: 0.5,
    },

    scrollIndicator: {
      position: 'absolute',
      bottom: -5,
      flexDirection: 'row',
      gap: 4,
    },

    dot: {
      width: 4,
      height: 4,
      borderRadius: 2,
      backgroundColor: theme.colors.neutral,
    },

    dotActive: {
      backgroundColor: currentColor,
      width: 12,
    },
  });

  return (
    <View style={styles.outerContainer}>
      {/* Palette name label */}
      {showPaletteName && (
        <Animated.View style={[styles.paletteLabel, { opacity: fadeAnim }]}>
          <Text style={styles.paletteLabelText}>
            {formatPaletteName(currentPalette)}
          </Text>
        </Animated.View>
      )}

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
        contentOffset={{ x: currentPaletteIndex * rs(220, 'width'), y: 0 }}
      >
        {PALETTE_NAMES.map((paletteName, paletteIndex) => {
          // Get colors for this palette
          const paletteColors = [
            theme.timer.palette.energy,
            theme.timer.palette.focus,
            theme.timer.palette.calm,
            theme.timer.palette.deep,
          ];

          // If this is the current palette, use actual colors
          // Otherwise, we'd need to load that palette's colors
          const isCurrentPalette = paletteName === currentPalette;

          return (
            <View key={paletteName} style={styles.paletteContainer}>
              {colors.map((color, colorIndex) => (
                <TouchableOpacity
                  key={`${paletteName}-${colorIndex}`}
                  style={[
                    styles.colorButton,
                    {
                      backgroundColor: isCurrentPalette ? color : theme.colors.neutral,
                      opacity: isCurrentPalette ? 1 : 0.4
                    },
                    isCurrentPalette && currentColor === color && styles.colorButtonActive
                  ]}
                  onPress={() => {
                    if (isCurrentPalette) {
                      setCurrentColor(color);
                    } else {
                      // Scroll to that palette
                      scrollViewRef.current?.scrollTo({
                        x: paletteIndex * rs(220, 'width'),
                        animated: true
                      });
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