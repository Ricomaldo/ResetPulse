// src/components/timer/DigitalTimer.jsx
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Platform } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { rs } from '../../styles/responsive';

/**
 * DigitalTimer - Displays remaining time in MM:SS format
 * Only visible when timer is running and user preference is enabled
 */
export default function DigitalTimer({ remaining, isRunning, color }) {
  const theme = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(20)).current;

  // Animate entrance/exit
  useEffect(() => {
    if (isRunning) {
      // Fade in + slide up
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(translateYAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Fade out
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(translateYAnim, {
          toValue: 20,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
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
          transform: [{ translateY: translateYAnim }],
        },
      ]}
      pointerEvents={isRunning ? 'auto' : 'none'}
    >
      <Text style={styles.timeText}>{formatTime(remaining)}</Text>
    </Animated.View>
  );
}
