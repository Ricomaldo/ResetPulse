// src/components/timer/DigitalTimer.jsx
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Platform } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { rs } from '../../styles/responsive';

/**
 * DigitalTimer - Displays remaining time in MM:SS format
 * Always visible when enabled in settings, updates dynamically during dial adjustment
 */
export default function DigitalTimer({ remaining, isRunning, color, mini = false }) {
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
      backgroundColor: theme.colors.dialFill,
      paddingVertical: mini ? rs(4) : rs(8),
      paddingHorizontal: mini ? rs(12) : rs(20),
      borderRadius: mini ? rs(12) : rs(35),
      borderWidth: mini ? 2 : 1,
      borderColor: theme.colors.brand.neutral,
      minHeight: mini ? rs(12) : undefined,
      minWidth: mini ? rs(32) : undefined,
    },
    timeText: {
      fontSize: mini ? rs(1) : rs(32, 'min'),
      fontWeight: '600',
      color: color || theme.colors.brand.primary,
      letterSpacing: 2,
      fontFamily: Platform.select({
        ios: 'Menlo', // SF Mono alternative
        android: 'monospace',
      }),
      opacity: mini ? 0 : 1,
      textAlign: 'center',
      includeFontPadding: false,
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
