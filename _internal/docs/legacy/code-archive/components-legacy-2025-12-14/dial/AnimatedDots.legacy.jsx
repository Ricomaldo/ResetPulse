import PropTypes from 'prop-types';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { rs } from '../../styles/responsive';
import useAnimatedDots from '../../hooks/useAnimatedDots';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: rs(4),
  },
  dot: {
    fontSize: rs(24),
    marginHorizontal: rs(6),
  },
});

function AnimatedDots({ opacity, color, pulseDuration }) {
  const theme = useTheme();
  const dotStates = useAnimatedDots(pulseDuration);
  const dotOpacities = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;

  // Animate dots with fade in/out effect
  useEffect(() => {
    dotOpacities.forEach((anim, index) => {
      if (dotStates[index] === 1) {
        // Fade in
        Animated.timing(anim, {
          duration: Math.max(50, pulseDuration / 8),
          toValue: 1,
          useNativeDriver: true,
        }).start();
      } else {
        // Fade out
        Animated.timing(anim, {
          duration: Math.max(50, pulseDuration / 8),
          toValue: 0,
          useNativeDriver: true,
        }).start();
      }
    });
  }, [dotOpacities, dotStates, pulseDuration]);

  // Use color directly (it's already the hex value from currentColor)
  const dotColor = color || theme.colors.textSecondary;

  return (
    <Animated.View style={[styles.container, { opacity }]}>
      {[0, 1, 2].map((index) => (
        <Animated.Text
          key={index}
          style={[
            styles.dot,
            {
              color: dotColor,
              opacity: dotOpacities[index],
            },
          ]}
        >
          •
        </Animated.Text>
      ))}
    </Animated.View>
  );
}

AnimatedDots.propTypes = {
  color: PropTypes.string,
  opacity: PropTypes.oneOfType([PropTypes.number, PropTypes.object]).isRequired,
  pulseDuration: PropTypes.number,
};

AnimatedDots.defaultProps = {
  color: undefined,
  pulseDuration: 800,
};

export default AnimatedDots;


