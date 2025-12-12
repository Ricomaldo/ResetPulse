// src/components/timer/DigitalTimer.jsx
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Platform } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { rs } from '../../styles/responsive';

/**
 * DigitalTimer - Displays remaining time in MM:SS format
 * Always visible when enabled in settings, updates dynamically during dial adjustment
 */
export default function DigitalTimer({ remaining, isRunning, color }) {
  const theme = useTheme();
  const fadeAnim = useRef(new Animated.Value(1)).current; // Start at 1 (visible)
  const translateYAnim = useRef(new Animated.Value(0)).current; // Start at 0 (no offset)
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Subtle pulse animation when timer is running
  useEffect(() => {
    if (isRunning) {
      // Subtle scale pulse every second
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.02,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      );
      pulseAnimation.start();
      return () => pulseAnimation.stop();
    } else {
      // Reset scale when not running
      scaleAnim.setValue(1);
    }
  }, [isRunning]);

  // Format time as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const styles = StyleSheet.create({
    container: {
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.isDark ? theme.colors.brand.deep : theme.colors.brand.neutral,
      paddingVertical: rs(8),
      paddingHorizontal: rs(20),
      borderRadius: rs(35),
      borderWidth: 1,
      borderColor: theme.colors.neutral,
      ...Platform.select({
        ios: {
          ...theme.shadow('lg'),
        },
        android: {
          elevation: 4,
        },
      }),
    },
    timeText: {
      fontSize: rs(32, 'min'),
      fontWeight: '600',
      color: color ? `${color}CC` : theme.colors.text + 'CC', // 80% opacity
      letterSpacing: 2,
      fontFamily: Platform.select({
        ios: 'Menlo', // SF Mono alternative
        android: 'monospace',
      }),
    },
  });

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [
            { translateY: translateYAnim },
            { scale: scaleAnim }
          ],
        },
      ]}
    >
      <Text style={[styles.timeText, { opacity: isRunning ? 1 : 0.7 }]}>
        {formatTime(remaining)}
      </Text>
    </Animated.View>
  );
}
