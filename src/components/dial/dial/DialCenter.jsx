/**
 * @fileoverview Center display with activity emoji, pulse animations, or play/pause button
 * @created 2025-12-14
 * @updated 2025-12-16
 */
import PropTypes from 'prop-types';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { PULSE_ANIMATION, ACTIVITY_DISPLAY } from '../timerConstants';
import PlayPauseButton from '../PlayPauseButton';
import { useTheme } from '../../../theme/ThemeProvider';

/**
 * DialCenter - Activity emoji, pulse animations, or play/pause button
 * Handles center display with priority: emoji > pulse > play/pause button
 * @param {number} circleSize - Size of the dial
 * @param {string} activityEmoji - Emoji to display
 * @param {boolean} isRunning - Whether timer is running
 * @param {boolean} shouldPulse - Whether to show pulse animation
 * @param {boolean} showActivityEmoji - Whether to show the emoji
 * @param {string} color - Color for pulse effects
 * @param {number} pulseDuration - Duration of pulse animation
 * @param {boolean} isCompleted - Whether timer has completed
 * @param {boolean} isPaused - Whether timer is paused
 * @param {Function} onPress - Callback when play/pause button is pressed
 */
const DialCenter = React.memo(function DialCenter({
  activityEmoji,
  circleSize,
  color,
  isCompleted = false,
  isPaused = false,
  isRunning,
  onLongPress,
  onPress,
  pulseDuration = PULSE_ANIMATION.DURATION,
  shouldPulse,
  showActivityEmoji = true,
}) {
  const theme = useTheme();
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0.3)).current;

  // Pulse animation effect with contextual duration
  useEffect(() => {
    if (isRunning && shouldPulse) {
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: PULSE_ANIMATION.SCALE_MAX,
            duration: pulseDuration,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: PULSE_ANIMATION.SCALE_MIN,
            duration: pulseDuration,
            useNativeDriver: true,
          }),
        ])
      );

      const glowAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: PULSE_ANIMATION.GLOW_MAX,
            duration: pulseDuration,
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: PULSE_ANIMATION.GLOW_MIN,
            duration: pulseDuration,
            useNativeDriver: true,
          }),
        ])
      );

      pulseAnimation.start();
      glowAnimation.start();

      return () => {
        pulseAnimation.stop();
        glowAnimation.stop();
        pulseAnim.setValue(1);
        glowAnim.setValue(0.3);
      };
    }
  }, [isRunning, shouldPulse, pulseAnim, glowAnim, pulseDuration]);

  // Show emoji if provided and enabled in settings
  if (activityEmoji && showActivityEmoji) {
    return (
      <View
        style={styles.container}
        pointerEvents="none"
        accessible={false}
        importantForAccessibility="no-hide-descendants"
      >
        <Animated.View
          style={[
            styles.animatedContainer,
            {
              transform: isRunning && shouldPulse ? [{ scale: pulseAnim }] : [{ scale: 1 }],
            },
          ]}
        >
          {/* Background disc */}
          {isRunning && shouldPulse ? (
            <Animated.View
              style={[
                styles.glow,
                {
                  width: circleSize * ACTIVITY_DISPLAY.GLOW_SIZE_RATIO,
                  height: circleSize * ACTIVITY_DISPLAY.GLOW_SIZE_RATIO,
                  borderRadius: (circleSize * ACTIVITY_DISPLAY.GLOW_SIZE_RATIO) / 2,
                  backgroundColor: theme.colors.brand.primary,
                  opacity: glowAnim,
                },
              ]}
            />
          ) : (
            <View
              style={[
                styles.glow,
                {
                  width: circleSize * ACTIVITY_DISPLAY.GLOW_SIZE_RATIO * 0.8,
                  height: circleSize * ACTIVITY_DISPLAY.GLOW_SIZE_RATIO * 0.8,
                  borderRadius: (circleSize * ACTIVITY_DISPLAY.GLOW_SIZE_RATIO * 0.8) / 2,
                  backgroundColor: theme.colors.brand.primary,
                },
              ]}
              opacity={0.2}
            />
          )}

          {/* Emoji */}
          <Text
            style={[
              styles.emoji,
              {
                fontSize: circleSize * ACTIVITY_DISPLAY.EMOJI_SIZE_RATIO,
              },
            ]}
          >
            {activityEmoji}
          </Text>
        </Animated.View>
      </View>
    );
  }

  // Show pulse effect ONLY when running with pulse enabled and emoji disabled
  if (!showActivityEmoji && isRunning && shouldPulse) {
    return (
      <View
        style={styles.container}
        pointerEvents="none"
        accessible={false}
        importantForAccessibility="no-hide-descendants"
      >
        <Animated.View
          style={[
            styles.animatedContainer,
            {
              transform: [{ scale: pulseAnim }],
            },
          ]}
        >
          <Animated.View
            style={[
              styles.pulseCircle1,
              {
                width: circleSize * 0.35,
                height: circleSize * 0.35,
                borderRadius: (circleSize * 0.35) / 2,
                backgroundColor: color || theme.colors.brand.primary,
                opacity: Animated.multiply(glowAnim, 0.8),
              },
            ]}
          />
          <Animated.View
            style={[
              styles.pulseCircle2,
              {
                width: circleSize * 0.2,
                height: circleSize * 0.2,
                borderRadius: (circleSize * 0.2) / 2,
                backgroundColor: color || theme.colors.brand.primary,
                opacity: Animated.multiply(glowAnim, 1.2),
              },
            ]}
          />
        </Animated.View>
      </View>
    );
  }

  // Fallback: Show play/pause button when emoji is disabled (regardless of pulse setting)
  // This covers: at rest, paused, completed - basically when not running
  if (!showActivityEmoji && !isRunning) {
    return (
      <View
        style={styles.container}
      >
        <PlayPauseButton
          isRunning={isRunning}
          isCompleted={isCompleted}
          isPaused={isPaused}
          onPress={onPress}
          onLongPress={onLongPress}
        />
      </View>
    );
  }

  return null;
});

DialCenter.displayName = 'DialCenter';
DialCenter.propTypes = {
  activityEmoji: PropTypes.string,
  circleSize: PropTypes.number.isRequired,
  color: PropTypes.string,
  isCompleted: PropTypes.bool,
  isPaused: PropTypes.bool,
  isRunning: PropTypes.bool.isRequired,
  onLongPress: PropTypes.func,
  onPress: PropTypes.func,
  pulseDuration: PropTypes.number,
  shouldPulse: PropTypes.bool.isRequired,
  showActivityEmoji: PropTypes.bool,
};

const styles = StyleSheet.create({
  animatedContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    alignItems: 'center',
    bottom: 0,
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  emoji: {
    opacity: ACTIVITY_DISPLAY.EMOJI_OPACITY,
    textAlign: 'center',
  },
  glow: {
    position: 'absolute',
  },
  pulseCircle1: {
    position: 'absolute',
  },
  pulseCircle2: {
    position: 'absolute',
  },
});

export default DialCenter;