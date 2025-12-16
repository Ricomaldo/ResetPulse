import React, { useRef, useEffect } from 'react';
import { Animated } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { fontWeights } from '../../theme/tokens';
import { rs } from '../../styles/responsive';
import useAnimatedDots from '../../hooks/useAnimatedDots';

export default function AnimatedDots({ opacity }) {
  const theme = useTheme();
  const dots = useAnimatedDots();

  return (
    <Animated.Text
      style={{
        fontSize: rs(16),
        fontWeight: fontWeights.medium,
        color: theme.colors.textSecondary,
        letterSpacing: 0.5,
        marginTop: rs(4),
        opacity,
      }}
    >
      {dots}
    </Animated.Text>
  );
}
