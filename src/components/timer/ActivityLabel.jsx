import PropTypes from 'prop-types';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { fontWeights } from '../../theme/tokens';
import { rs } from '../../styles/responsive';

/**
 * ActivityLabel - Displays emoji + label with animated dots
 * Layout: Fixed label + variable dots (no reflow of label)
 */
function ActivityLabel({
  emoji,
  label,
  animatedDots,
  isRunning,
}) {
  const theme = useTheme();
  const dotsOpacityRef = useRef(new Animated.Value(0)).current;
  const prevDotsLengthRef = useRef(0);

  // Animate dots opacity when animatedDots string length changes
  useEffect(() => {
    const currentLength = animatedDots.length;

    if (currentLength > 0 && prevDotsLengthRef.current === 0) {
      // Dots appearing: fade in
      Animated.timing(dotsOpacityRef, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }).start();
    } else if (currentLength === 0 && prevDotsLengthRef.current > 0) {
      // Dots disappearing: fade out
      Animated.timing(dotsOpacityRef, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }).start();
    }

    prevDotsLengthRef.current = currentLength;
  }, [animatedDots, dotsOpacityRef]);

  const styles = StyleSheet.create({
    container: {
      left: 0,
      position: 'absolute',
      right: 0,
      top: rs(80),
    },
    dots: {
      color: theme.colors.textSecondary,
      fontSize: rs(16),
      fontWeight: fontWeights.medium,
      left: '50%',
      letterSpacing: 0.5,
      marginLeft: rs(38), // Position dots closer to label
      position: 'absolute',
      width: rs(24),
    },
    label: {
      color: theme.colors.textSecondary,
      fontSize: rs(16),
      fontWeight: fontWeights.medium,
      left: 0,
      letterSpacing: 0.5,
      position: 'absolute',
      right: 0,
      textAlign: 'center',
    },
  });

  return (
    <Animated.View style={styles.container}>
      <Animated.Text style={styles.label}>
        {emoji && label ? `${emoji} ${label}` : ''}
      </Animated.Text>
      <Animated.Text
        style={[
          styles.dots,
          {
            opacity: dotsOpacityRef,
          },
        ]}
      >
        {isRunning ? animatedDots : ''}
      </Animated.Text>
    </Animated.View>
  );
}

ActivityLabel.propTypes = {
  animatedDots: PropTypes.string.isRequired,
  emoji: PropTypes.string,
  isRunning: PropTypes.bool.isRequired,
  label: PropTypes.string,
};

ActivityLabel.defaultProps = {
  emoji: '',
  label: '',
};

export default ActivityLabel;
