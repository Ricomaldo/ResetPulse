import PropTypes from 'prop-types';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { fontWeights } from '../../theme/tokens';
import { rs } from '../../styles/responsive';

/**
 * ActivityLabel - Dynamic header that changes based on timer state
 *
 * States:
 * - REST: emoji + label (no dots)
 * - START/RUNNING/PAUSE: message with animated dots
 * - COMPLETE: end message (no dots)
 */
function ActivityLabel({
  emoji,
  label,
  animatedDots,
  displayMessage,
  isCompleted,
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

  // Determine what to display based on state
  const shouldShowDots = displayMessage && !isCompleted; // Dots for messages, not for completion
  const displayText = displayMessage || (emoji && label ? `${emoji} ${label}` : '');

  return (
    <Animated.View style={styles.container}>
      <Animated.Text style={styles.label}>
        {displayText}
      </Animated.Text>
      {shouldShowDots && (
        <Animated.Text
          style={[
            styles.dots,
            {
              opacity: dotsOpacityRef,
            },
          ]}
        >
          {animatedDots}
        </Animated.Text>
      )}
    </Animated.View>
  );
}

ActivityLabel.propTypes = {
  animatedDots: PropTypes.string.isRequired,
  displayMessage: PropTypes.string,
  emoji: PropTypes.string,
  isCompleted: PropTypes.bool,
  label: PropTypes.string,
};

ActivityLabel.defaultProps = {
  displayMessage: '',
  emoji: '',
  isCompleted: false,
  label: '',
};

export default ActivityLabel;
