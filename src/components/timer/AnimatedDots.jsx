import React from 'react';
import { View, Animated } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { rs } from '../../styles/responsive';
import useAnimatedDots from '../../hooks/useAnimatedDots';

export default function AnimatedDots({ opacity, color, pulseDuration = 800 }) {
  const theme = useTheme();
  const dotStates = useAnimatedDots(pulseDuration);

  // Use color directly (it's already the hex value from currentColor)
  const dotColor = color || theme.colors.textSecondary;

  return (
    <Animated.View
      style={{
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: rs(4),
        opacity,
      }}
    >
      {[0, 1, 2].map((index) => (
        <Animated.Text
          key={index}
          style={{
            fontSize: rs(16),
            color: dotColor,
            opacity: dotStates[index],
            marginHorizontal: rs(2),
          }}
        >
          ·
        </Animated.Text>
      ))}
    </Animated.View>
  );
}
