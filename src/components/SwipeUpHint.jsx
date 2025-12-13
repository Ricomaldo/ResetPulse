// src/components/SwipeUpHint.jsx
import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { rs } from '../styles/responsive';

/**
 * SwipeUpHint - Hint animé pour indiquer qu'on peut swiper vers le haut
 * Affiche une flèche qui bounce doucement et un message
 */
export default function SwipeUpHint({ message = 'Glissez vers le haut' }) {
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
    container: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: rs(12),
    },
    arrow: {
      fontSize: rs(24),
      color: theme.colors.textSecondary,
      opacity: 0.5,
    },
    message: {
      fontSize: rs(12),
      color: theme.colors.textSecondary,
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
}
