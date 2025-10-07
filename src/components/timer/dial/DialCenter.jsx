// src/components/timer/dial/DialCenter.jsx
import React, { useRef, useEffect } from 'react';
import { View, Text, Animated } from 'react-native';
import { useTheme } from '../../../theme/ThemeProvider';
import { PULSE_ANIMATION } from '../../../constants/animations';
import { ACTIVITY_DISPLAY } from '../../../constants/design';

/**
 * DialCenter - Activity emoji and pulse animations
 * Handles center display and pulsing effects
 */
const DialCenter = React.memo(({
  circleSize,
  activityEmoji,
  isRunning,
  shouldPulse,
  color,
  pulseDuration = PULSE_ANIMATION.DURATION, // Default from constants
}) => {
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

  // Show emoji if provided
  if (activityEmoji) {
    return (
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          alignItems: 'center',
          justifyContent: 'center',
        }}
        pointerEvents="none"
      >
        <Animated.View
          style={{
            alignItems: 'center',
            justifyContent: 'center',
            transform: isRunning && shouldPulse ? [{ scale: pulseAnim }] : [{ scale: 1 }],
          }}
        >
          {/* Background disc */}
          {isRunning && shouldPulse ? (
            <Animated.View
              style={{
                position: 'absolute',
                width: circleSize * ACTIVITY_DISPLAY.GLOW_SIZE_RATIO,
                height: circleSize * ACTIVITY_DISPLAY.GLOW_SIZE_RATIO,
                borderRadius: (circleSize * ACTIVITY_DISPLAY.GLOW_SIZE_RATIO) / 2,
                backgroundColor: theme.colors.brand.primary,
                opacity: glowAnim,
              }}
            />
          ) : (
            <View
              style={{
                position: 'absolute',
                width: circleSize * ACTIVITY_DISPLAY.GLOW_SIZE_RATIO * 0.8,
                height: circleSize * ACTIVITY_DISPLAY.GLOW_SIZE_RATIO * 0.8,
                borderRadius: (circleSize * ACTIVITY_DISPLAY.GLOW_SIZE_RATIO * 0.8) / 2,
                backgroundColor: theme.colors.brand.primary,
                opacity: 0.2,
              }}
            />
          )}

          {/* Emoji */}
          <Text
            style={{
              fontSize: circleSize * ACTIVITY_DISPLAY.EMOJI_SIZE_RATIO,
              opacity: ACTIVITY_DISPLAY.EMOJI_OPACITY,
              textAlign: 'center',
            }}
          >
            {activityEmoji}
          </Text>
        </Animated.View>
      </View>
    );
  }

  // Show pulse effect for "none" activity
  if (!activityEmoji && isRunning && shouldPulse) {
    return (
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          alignItems: 'center',
          justifyContent: 'center',
        }}
        pointerEvents="none"
      >
        <Animated.View
          style={{
            alignItems: 'center',
            justifyContent: 'center',
            transform: [{ scale: pulseAnim }],
          }}
        >
          <Animated.View
            style={{
              position: 'absolute',
              width: circleSize * 0.35,
              height: circleSize * 0.35,
              borderRadius: (circleSize * 0.35) / 2,
              backgroundColor: color || theme.colors.brand.primary,
              opacity: Animated.multiply(glowAnim, 0.8),
            }}
          />
          <Animated.View
            style={{
              position: 'absolute',
              width: circleSize * 0.2,
              height: circleSize * 0.2,
              borderRadius: (circleSize * 0.2) / 2,
              backgroundColor: color || theme.colors.brand.primary,
              opacity: Animated.multiply(glowAnim, 1.2),
            }}
          />
        </Animated.View>
      </View>
    );
  }

  return null;
});

DialCenter.displayName = 'DialCenter';

export default DialCenter;