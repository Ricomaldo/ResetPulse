/**
 * @fileoverview Animated swipe up hint with bouncing arrow
 * @created 2025-12-14
 * @updated 2025-12-14
 */
import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { rs } from '../../styles/responsive';

/**
 * SwipeUpHint - Animated hint indicating swipe gesture
 * @param {string} message - Text to display below the arrow
 */
const SwipeUpHint = React.memo(function SwipeUpHint({ message = 'Glissez vers le haut' }) {
  const theme = useTheme();
  const bounceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animation de bounce continu
    const bounce = Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: -10,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    bounce.start();

    return () => bounce.stop();
  }, []);

  const styles = StyleSheet.create({
    arrow: {
      color: theme.colors.textSecondary,
      fontSize: rs(24),
      opacity: 0.5,
    },
    container: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: rs(12),
    },
    message: {
      color: theme.colors.textSecondary,
      fontSize: rs(12),
      marginTop: rs(4),
      opacity: 0.6,
    },
  });

  return (
    <View style={styles.container}>
      <Animated.Text
        style={[
          styles.arrow,
          {
            transform: [{ translateY: bounceAnim }],
          },
        ]}
      >
        ↑
      </Animated.Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
});

export default SwipeUpHint;
