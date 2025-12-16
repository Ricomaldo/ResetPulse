import React from 'react';
import { View, Animated } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { rs } from '../../styles/responsive';
import useAnimatedDots from '../../hooks/useAnimatedDots';

export default function AnimatedDots({ opacity, color }) {
  const theme = useTheme();
  const dotStates = useAnimatedDots();

  // Get color from theme based on color prop, fallback to textSecondary
  const dotColor = color ? theme.colors[color] : theme.colors.textSecondary;

  return (
    <Animated.View
      style={{
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: rs(4),
        opacity,
      }}
    >
      {[0, 1, 2, 3].map((index) => (
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
