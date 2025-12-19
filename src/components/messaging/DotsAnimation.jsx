/**
 * @fileoverview DotsAnimation - 3 animated dots with staggered wave effect
 * Used during RUNNING state to show time passing
 * @created 2025-12-19
 */

import React, { useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { rs } from '../../styles/responsive';

/**
 * DotsAnimation - Wave of 3 dots with staggered opacity animation
 *
 * Animation: Each dot cycles opacity 0.3 → 1 → 0.3 in 800ms, staggered by 150ms
 * Result: Breathing wave effect that suggests time passing
 *
 * @param {boolean} isVisible - Controls if dots should be animated (true = RUNNING, false = hidden)
 */
function DotsAnimation({ isVisible = false }) {
  const theme = useTheme();

  // Create 3 animated values for staggered wave
  const dot1OpacityRef = useRef(new Animated.Value(0.3)).current;
  const dot2OpacityRef = useRef(new Animated.Value(0.3)).current;
  const dot3OpacityRef = useRef(new Animated.Value(0.3)).current;

  // Start animation loop when isVisible changes
  React.useEffect(() => {
    if (!isVisible) return;

    // Helper to create loop animation for one dot
    const createDotAnimation = (opacityRef, delay) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay), // Stagger delay
          Animated.timing(opacityRef, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(opacityRef, {
            toValue: 0.3,
            duration: 400,
            useNativeDriver: true,
          }),
        ])
      );
    };

    // Start all 3 animations with staggered delays
    const anim1 = createDotAnimation(dot1OpacityRef, 0); // 0ms delay
    const anim2 = createDotAnimation(dot2OpacityRef, 150); // 150ms delay
    const anim3 = createDotAnimation(dot3OpacityRef, 300); // 300ms delay

    anim1.start();
    anim2.start();
    anim3.start();

    // Cleanup
    return () => {
      anim1.stop();
      anim2.stop();
      anim3.stop();
    };
  }, [isVisible, dot1OpacityRef, dot2OpacityRef, dot3OpacityRef]);

  const dotSize = rs(8);
  const spacing = rs(6);

  const styles = StyleSheet.create({
    container: {
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'center',
    },
    dot: {
      width: dotSize,
      height: dotSize,
      borderRadius: dotSize / 2,
      backgroundColor: theme.colors.text,
      marginHorizontal: spacing / 2,
    },
  });

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.dot,
          {
            opacity: dot1OpacityRef,
          },
        ]}
      />
      <Animated.View
        style={[
          styles.dot,
          {
            opacity: dot2OpacityRef,
          },
        ]}
      />
      <Animated.View
        style={[
          styles.dot,
          {
            opacity: dot3OpacityRef,
          },
        ]}
      />
    </View>
  );
}

export default DotsAnimation;
