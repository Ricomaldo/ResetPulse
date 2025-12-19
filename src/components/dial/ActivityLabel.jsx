import PropTypes from 'prop-types';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { rs } from '../../styles/responsive';

/**
 * ActivityLabel - Dynamic header that changes based on timer state
 *
 * States:
 * - REST: invitation message ("Ready?", "Prêt?")
 * - FLASH (activity select): emoji + label + "flash" feedback (2s)
 * - RUNNING: message with animated dots
 * - COMPLETE: end message (no dots)
 *
 * Layout: Flexbox with balance
 * - Spacer left (invisible, same width as dots)
 * - Message (centered)
 * - Dots right (adjacent to message)
 */
function ActivityLabel({
  label,
  animatedDots,
  displayMessage,
  isCompleted,
  flashActivity,
}) {
  const theme = useTheme();

  // Dots animation
  const dotsOpacityRef = useRef(new Animated.Value(0)).current;
  const dotsScaleRef = useRef(new Animated.Value(0.8)).current;
  const prevDotsLengthRef = useRef(0);

  // Message entry animation
  const messageScaleRef = useRef(new Animated.Value(0.9)).current;
  const messageOpacityRef = useRef(new Animated.Value(0)).current;
  const messageTranslateYRef = useRef(new Animated.Value(12)).current; // Start 12px below
  const prevMessageRef = useRef('');

  // Micro-bounce animation (happens after entry completes)
  const messageBounceScaleRef = useRef(new Animated.Value(1)).current;

  // Animate message with multi-step flow: opacity → translate + scale → micro-bounce
  useEffect(() => {
    const hasMessage = displayMessage && displayMessage.trim().length > 0;
    const hadMessage = prevMessageRef.current && prevMessageRef.current.trim().length > 0;

    if (hasMessage && !hadMessage) {
      // ENTERING RUNNING: Smooth arrival with stagger
      // 1. Opacity fade in immediately (300ms)
      // 2. Translate Y + Scale in parallel (400ms easeOut) - creates "arrival" feel
      // 3. Micro-bounce after arrival (200ms) - gives tactile feedback

      Animated.sequence([
        // Step 1: Opacity + TranslateY + Scale in parallel (staggered entry)
        Animated.parallel([
          Animated.timing(messageOpacityRef, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(messageTranslateYRef, {
            toValue: 0, // Move from 12px down to 0 (arrival)
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(messageScaleRef, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
        ]),
        // Step 2: Micro-bounce (scale pulse) after arrival
        Animated.sequence([
          Animated.timing(messageBounceScaleRef, {
            toValue: 1.05, // Slight scale up
            duration: 150,
            useNativeDriver: true,
          }),
          Animated.timing(messageBounceScaleRef, {
            toValue: 1, // Back to normal
            duration: 150,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    } else if (!hasMessage && hadMessage) {
      // LEAVING RUNNING: Smooth exit (inverse of entry)
      Animated.parallel([
        Animated.timing(messageOpacityRef, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(messageTranslateYRef, {
          toValue: -12, // Move up (opposite of entry)
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(messageScaleRef, {
          toValue: 0.9,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Reset for next message
        messageTranslateYRef.setValue(12);
        messageScaleRef.setValue(0.9);
        messageBounceScaleRef.setValue(1);
      });
    }

    prevMessageRef.current = displayMessage;
  }, [displayMessage, messageScaleRef, messageOpacityRef, messageTranslateYRef, messageBounceScaleRef]);

  // Animate dots opacity + scale when animatedDots string length changes
  useEffect(() => {
    const currentLength = animatedDots.length;

    if (currentLength > 0 && prevDotsLengthRef.current === 0) {
      // Dots appearing: staggered fade in + scale (with 100ms delay after message entry)
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(dotsOpacityRef, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(dotsScaleRef, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start();
      }, 100); // Delay for stagger effect
    } else if (currentLength === 0 && prevDotsLengthRef.current > 0) {
      // Dots disappearing: quick fade out
      Animated.timing(dotsOpacityRef, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start();
    }

    prevDotsLengthRef.current = currentLength;
  }, [animatedDots, dotsOpacityRef, dotsScaleRef]);

  const dotWidth = rs(24);
  const styles = StyleSheet.create({
    container: {
      alignItems: 'center',
      height: rs(32),
      justifyContent: 'center',
      width: '100%',
    },
    dotsContainer: {
      color: theme.colors.text,
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
      color: theme.colors.text,
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

  // Determine what to display based on state (ADR-007 messaging)
  // Priority: displayMessage > label > '' (flashActivity disabled - redundant)
  let displayText = '';
  if (displayMessage) {
    // Running or completed message
    displayText = displayMessage;
  } else {
    // Default: label (REST state)
    displayText = label || '';
  }

  const shouldShowDots = displayMessage && !isCompleted; // Dots for running messages only, not completion

  return (
    <View style={styles.container}>
      <View style={styles.flexContainer}>
        {/* Invisible spacer left (balances dots on right) */}
        <View style={styles.spacerLeft} />

        {/* Message centered with multi-step animation: opacity → translate + scale → bounce */}
        <Animated.Text
          style={[
            styles.message,
            {
              opacity: messageOpacityRef,
              transform: [
                { translateY: messageTranslateYRef },
                { scale: Animated.multiply(messageScaleRef, messageBounceScaleRef) }, // Combined scale: base + bounce
              ],
            },
          ]}
        >
          {displayText}
        </Animated.Text>

        {/* Dots right, adjacent to message (staggered entry with scale) */}
        {shouldShowDots && (
          <Animated.Text
            style={[
              styles.dotsContainer,
              {
                opacity: dotsOpacityRef,
                transform: [{ scale: dotsScaleRef }],
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
  isCompleted: PropTypes.bool,
  label: PropTypes.string,
  flashActivity: PropTypes.shape({
    emoji: PropTypes.string,
    label: PropTypes.string,
  }),
};

ActivityLabel.defaultProps = {
  displayMessage: '',
  isCompleted: false,
  label: '',
  flashActivity: null,
};

export default ActivityLabel;
