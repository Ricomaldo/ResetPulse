import PropTypes from 'prop-types';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { rs } from '../../styles/responsive';

/**
 * ActivityLabel - Dynamic header that changes based on timer state
 *
 * States:
 * - REST: emoji + label (no dots)
 * - START/RUNNING/PAUSE: message with animated dots
 * - COMPLETE: end message (no dots)
 *
 * Layout: Flexbox with balance
 * - Spacer left (invisible, same width as dots)
 * - Message (centered)
 * - Dots right (adjacent to message)
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

  const dotWidth = rs(24);
  const styles = StyleSheet.create({
    container: {
      height: rs(32),
      left: 0,
      position: 'absolute',
      right: 0,
      top: rs(80),
    },
    dotsContainer: {
      includeFontPadding: false,
      lineHeight: rs(24),
      textAlign: 'left',
      width: dotWidth,
    },
    flexContainer: {
      alignItems: 'center',
      flexDirection: 'row',
      flex: 1,
      justifyContent: 'center',
    },
    message: {
      color: theme.colors.brand.primary,
      fontSize: rs(24),
      fontWeight: '600',
      includeFontPadding: false,
      letterSpacing: 0.5,
      lineHeight: rs(24),
    },
    spacerLeft: {
      width: dotWidth,
    },
  });

  // Determine what to display based on state
  const shouldShowDots = displayMessage && !isCompleted; // Dots for messages, not for completion
  const displayText = displayMessage || (emoji && label ? `${emoji} ${label}` : '');

  return (
    <View style={styles.container}>
      <View style={styles.flexContainer}>
        {/* Invisible spacer left (balances dots on right) */}
        <View style={styles.spacerLeft} />

        {/* Message centered */}
        <Animated.Text style={styles.message}>
          {displayText}
        </Animated.Text>

        {/* Dots right, adjacent to message */}
        {shouldShowDots && (
          <Animated.Text
            style={[
              styles.dotsContainer,
              {
                opacity: dotsOpacityRef,
              },
            ]}
          >
            {animatedDots}
          </Animated.Text>
        )}
      </View>
    </View>
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
