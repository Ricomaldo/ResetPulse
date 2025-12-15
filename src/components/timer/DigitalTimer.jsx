/**
 * @fileoverview Digital timer display showing MM:SS format
 * @created 2025-12-14
 * @updated 2025-12-14
 */
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Platform } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { useTranslation } from '../../hooks/useTranslation';
import { rs } from '../../styles/responsive';
import { fontWeights } from '../../theme/tokens';

/**
 * DigitalTimer - Displays remaining time in MM:SS format
 * Features subtle pulse animation when running
 * Fully accessible with live region announcements
 * @param {number} remaining - Remaining time in seconds
 * @param {boolean} isRunning - Whether timer is running
 * @param {string} color - Text color
 * @param {boolean} mini - Whether to use mini display mode
 */
const DigitalTimer = React.memo(function DigitalTimer({ remaining, isRunning, color, mini = false }) {
  const theme = useTheme();
  const t = useTranslation();
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
    const totalSeconds = Math.floor(seconds); // Ensure integer
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
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
      fontWeight: fontWeights.semibold,
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

  // Format time for display
  const formattedTime = formatTime(remaining);

  // Build accessibility label with time and status
  const timerStatus = isRunning
    ? t('accessibility.timer.timerRunning')
    : t('accessibility.timer.timerPaused');

  const accessibilityLabel = t('accessibility.timer.timeRemaining', { time: formattedTime }) + ', ' + timerStatus;

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
      accessible={true}
      accessibilityRole="timer"
      accessibilityLabel={accessibilityLabel}
      accessibilityLiveRegion="polite"
      accessibilityValue={{
        min: 0,
        max: remaining,
        now: remaining,
        text: formattedTime
      }}
    >
      <Text style={[styles.timeText, { opacity: isRunning ? 1 : 0.7 }]}>
        {formattedTime}
      </Text>
    </Animated.View>
  );
});

export default DigitalTimer;
