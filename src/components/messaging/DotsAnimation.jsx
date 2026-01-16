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
 * DotsAnimation - Sequential dots animation
 *
 * Animation: Dots appear sequentially with 1s interval
 * Sequence: 0 → 1 → 1+2 → 1+2+3 → reset (4s total cycle)
 * Result: Progressive appearance effect that shows time passing
 *
 * @param {boolean} isVisible - Controls if dots should be animated (true = RUNNING, false = hidden)
 */
function DotsAnimation({ isVisible = false }) {
  const theme = useTheme();

  // Create 3 animated values for sequential appearance
  const dot1OpacityRef = useRef(new Animated.Value(0)).current;
  const dot2OpacityRef = useRef(new Animated.Value(0)).current;
  const dot3OpacityRef = useRef(new Animated.Value(0)).current;

  // Start animation loop when isVisible changes
  React.useEffect(() => {
    if (!isVisible) return;

    // Sequential animation: 0 → 1 → 1+2 → 1+2+3 → reset
    const animation = Animated.loop(
      Animated.sequence([
        // State 0: all hidden (0s)
        Animated.delay(0),

        // State 1: dot 1 appears (1s)
        Animated.timing(dot1OpacityRef, {
          toValue: 1,
          duration: 200, // Quick fade in
          useNativeDriver: true,
        }),
        Animated.delay(800), // Hold for rest of 1s

        // State 2: dot 2 appears (2s)
        Animated.timing(dot2OpacityRef, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.delay(800),

        // State 3: dot 3 appears (3s)
        Animated.timing(dot3OpacityRef, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.delay(800), // Hold state 3 for 1s total

        // Hold state 1+2+3 visible for an extra beat
        Animated.delay(500),

        // Fade out all dots (quick)
        Animated.parallel([
          Animated.timing(dot1OpacityRef, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(dot2OpacityRef, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(dot3OpacityRef, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
        ]),

        // Stay at "aucun" state for 1 second
        Animated.delay(1000),
      ])
    );

    animation.start();

    // Cleanup
    return () => {
      animation.stop();
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
      backgroundColor: theme.colors.brand.neutral,
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
