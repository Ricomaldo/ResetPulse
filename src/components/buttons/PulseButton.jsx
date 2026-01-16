/**
 * @fileoverview PulseButton - Bouton principal ResetPulse (ADR-007)
 * @description Bouton unifié avec comportement configurable via 2 booléens
 *
 * Configuration simple:
 * - startRequiresLongPress: true/false (tap ou long press pour démarrer)
 * - stopRequiresLongPress: true/false (tap ou long press pour arrêter)
 *
 * États possibles: 'rest' | 'running' | 'complete'
 *
 * Animations:
 * - REST: breathing pulse (optional, controlled by shouldPulse)
 * - RUNNING: halos + rotating second hand (1 rotation/minute)
 * - COMPLETE: bounce effect
 *
 * @created 2025-12-19
 * @updated 2026-01-16 - Added second hand animation for running state
 */
import React, { useRef, useCallback, useEffect } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { TouchableOpacity } from '@gorhom/bottom-sheet';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedProps,
  withTiming,
  withSequence,
  withRepeat,
  cancelAnimation,
  interpolateColor,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import PropTypes from 'prop-types';
import { useTheme } from '../../theme/ThemeProvider';
import { useTimerConfig } from '../../contexts/TimerConfigContext';
import { useTranslation } from '../../hooks/useTranslation';
import { PlayIcon, StopIcon, ResetIcon } from '../layout/Icons';
import { rs } from '../../styles/responsive';
import haptics from '../../utils/haptics';

// Constants
const DEFAULT_LONG_PRESS_DURATION = 2500;
const STROKE_WIDTH = 3;

// Pulse animation constants (subtle breathing)
const PULSE_SCALE_MAX = 1.04;
const PULSE_DURATION = 1500;

// State transition constants
const STATE_TRANSITION_DURATION = 250;

// Halo animation constants (RUNNING state)
const HALO_DURATION = 1200;
const HALO_SCALE_MAX = 1.8;
const HALO_DELAY = 600;

// Second hand animation (RUNNING state)
const SECOND_HAND_DURATION = 60000; // 1 minute for full rotation
const SECOND_HAND_SIZE = 6; // Size of the main dot
const SECOND_HAND_TRAIL_COUNT = 4; // Number of trailing dots (comma effect)
const SECOND_HAND_TRAIL_SPACING = 8; // Degrees between trail dots

// Animated Circle component
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

/**
 * PulseButton - Bouton principal avec comportement configurable
 *
 * Logique simple basée sur état + 2 booléens:
 * - REST: startRequiresLongPress ? long press : tap
 * - RUNNING: stopRequiresLongPress ? long press : tap
 * - COMPLETE: toujours tap (reset)
 */
const PulseButton = React.memo(function PulseButton({
  state = 'rest',
  emoji = null,
  activity = null,
  onTap,
  onLongPressComplete,
  clockwise = false,
  size = 72,
  compact = false,
  stopRequiresLongPress = true,
  startRequiresLongPress = false,
  shouldPulse = false,
}) {
  const theme = useTheme();
  const t = useTranslation();
  const timerConfig = useTimerConfig();
  const longPressConfirmDuration = timerConfig?.longPressConfirmDuration ?? DEFAULT_LONG_PRESS_DURATION;
  const longPressStartDuration = timerConfig?.longPressStartDuration ?? DEFAULT_LONG_PRESS_DURATION;

  // === PULSE ANIMATION (REST state only) ===
  const pulseScale = useSharedValue(1);

  useEffect(() => {
    if (shouldPulse && state === 'rest') {
      const breatheEasing = Easing.bezier(0.37, 0, 0.63, 1);
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(PULSE_SCALE_MAX, { duration: PULSE_DURATION, easing: breatheEasing }),
          withTiming(1, { duration: PULSE_DURATION, easing: breatheEasing })
        ),
        -1,
        false
      );
    } else {
      cancelAnimation(pulseScale);
      pulseScale.value = withTiming(1, { duration: 200, easing: Easing.out(Easing.quad) });
    }
  }, [shouldPulse, state, pulseScale]);

  // === HALO ANIMATION (RUNNING state) ===
  const halo1Scale = useSharedValue(1);
  const halo1Opacity = useSharedValue(0);
  const halo2Scale = useSharedValue(1);
  const halo2Opacity = useSharedValue(0);

  useEffect(() => {
    if (shouldPulse && state === 'running') {
      halo1Scale.value = withRepeat(
        withTiming(HALO_SCALE_MAX, { duration: HALO_DURATION, easing: Easing.out(Easing.quad) }),
        -1,
        false
      );
      halo1Opacity.value = withRepeat(
        withSequence(
          withTiming(0.6, { duration: 100, easing: Easing.out(Easing.quad) }),
          withTiming(0, { duration: HALO_DURATION - 100, easing: Easing.in(Easing.quad) })
        ),
        -1,
        false
      );

      const startHalo2 = () => {
        halo2Scale.value = withRepeat(
          withTiming(HALO_SCALE_MAX, { duration: HALO_DURATION, easing: Easing.out(Easing.quad) }),
          -1,
          false
        );
        halo2Opacity.value = withRepeat(
          withSequence(
            withTiming(0.6, { duration: 100, easing: Easing.out(Easing.quad) }),
            withTiming(0, { duration: HALO_DURATION - 100, easing: Easing.in(Easing.quad) })
          ),
          -1,
          false
        );
      };
      const halo2Timer = setTimeout(startHalo2, HALO_DELAY);
      return () => clearTimeout(halo2Timer);
    } else {
      cancelAnimation(halo1Scale);
      cancelAnimation(halo1Opacity);
      cancelAnimation(halo2Scale);
      cancelAnimation(halo2Opacity);
      halo1Scale.value = 1;
      halo1Opacity.value = 0;
      halo2Scale.value = 1;
      halo2Opacity.value = 0;
    }
  }, [shouldPulse, state, halo1Scale, halo1Opacity, halo2Scale, halo2Opacity]);

  const halo1Style = useAnimatedStyle(() => ({
    opacity: halo1Opacity.value,
    transform: [{ scale: halo1Scale.value }],
  }));

  const halo2Style = useAnimatedStyle(() => ({
    opacity: halo2Opacity.value,
    transform: [{ scale: halo2Scale.value }],
  }));

  // === SECOND HAND ANIMATION (RUNNING state) ===
  const secondHandRotation = useSharedValue(0);

  useEffect(() => {
    if (state === 'running') {
      // Start from current position, rotate continuously
      secondHandRotation.value = withRepeat(
        withTiming(360, {
          duration: SECOND_HAND_DURATION,
          easing: Easing.linear
        }),
        -1, // Infinite repeat
        false // Don't reverse
      );
    } else {
      cancelAnimation(secondHandRotation);
      secondHandRotation.value = 0;
    }
  }, [state, secondHandRotation]);

  // Generate trail styles with decreasing opacity (comma/fade effect)
  // Container rotation only, scale applied to dot itself
  const trail0Style = useAnimatedStyle(() => ({
    transform: [{ rotate: `${secondHandRotation.value}deg` }],
  }));

  const trail1Style = useAnimatedStyle(() => ({
    transform: [{ rotate: `${secondHandRotation.value - SECOND_HAND_TRAIL_SPACING}deg` }],
  }));

  const trail2Style = useAnimatedStyle(() => ({
    transform: [{ rotate: `${secondHandRotation.value - (SECOND_HAND_TRAIL_SPACING * 2)}deg` }],
  }));

  const trail3Style = useAnimatedStyle(() => ({
    transform: [{ rotate: `${secondHandRotation.value - (SECOND_HAND_TRAIL_SPACING * 3)}deg` }],
  }));

  const trailStyles = [
    { containerStyle: trail0Style, opacity: 1.0, scale: 1.0 },
    { containerStyle: trail1Style, opacity: 0.7, scale: 0.8 },
    { containerStyle: trail2Style, opacity: 0.45, scale: 0.6 },
    { containerStyle: trail3Style, opacity: 0.2, scale: 0.4 },
  ];

  // === STATE TRANSITION ANIMATION ===
  const stateProgress = useSharedValue(state === 'running' ? 1 : 0);
  const scaleTransition = useSharedValue(1);
  const prevStateRef = useRef(state);

  useEffect(() => {
    const prevState = prevStateRef.current;
    prevStateRef.current = state;

    stateProgress.value = withTiming(
      state === 'running' ? 1 : 0,
      { duration: STATE_TRANSITION_DURATION, easing: Easing.inOut(Easing.quad) }
    );

    const shouldBounce = state === 'complete' || (prevState === 'running' && state === 'rest');
    if (shouldBounce) {
      scaleTransition.value = withSequence(
        withTiming(0.92, { duration: 80, easing: Easing.out(Easing.quad) }),
        withTiming(1.05, { duration: 120, easing: Easing.out(Easing.quad) }),
        withTiming(1, { duration: 150, easing: Easing.inOut(Easing.quad) })
      );
    }
  }, [state, stateProgress, scaleTransition]);

  // === DIMENSIONS ===
  const buttonSize = compact ? rs(48, 'min') : rs(size, 'min');
  const iconSize = compact ? rs(20, 'min') : rs(28, 'min');
  const emojiSize = compact ? rs(24, 'min') : rs(48, 'min');
  const radius = (buttonSize - STROKE_WIDTH) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = buttonSize / 2;

  // === ANIMATION VALUES FOR LONG PRESS ===
  const progressStop = useSharedValue(0);
  const progressStart = useSharedValue(0);
  const isPressed = useSharedValue(false);
  const completedStopRef = useRef(false);
  const completedStartRef = useRef(false);

  // === CALLBACKS ===
  const handleTap = useCallback(() => {
    haptics.selection().catch(() => {});
    onTap?.();
  }, [onTap]);

  const handleLongPressStop = useCallback(() => {
    if (completedStopRef.current) return;
    completedStopRef.current = true;
    haptics.notification('warning').catch(() => {});
    onLongPressComplete?.();
  }, [onLongPressComplete]);

  const handleLongPressStart = useCallback(() => {
    if (completedStartRef.current) return;
    completedStartRef.current = true;
    haptics.notification('success').catch(() => {});
    onTap?.();
  }, [onTap]);

  const resetStopCompletion = useCallback(() => {
    completedStopRef.current = false;
  }, []);

  const resetStartCompletion = useCallback(() => {
    completedStartRef.current = false;
  }, []);

  // === ANIMATED PROPS ===
  const animatedStopCircleProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - progressStop.value),
  }));

  const animatedStartCircleProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - progressStart.value),
  }));

  // === ANIMATED STYLES ===
  const animatedButtonStyle = useAnimatedStyle(() => {
    const combinedScale = pulseScale.value * scaleTransition.value * (isPressed.value ? 0.95 : 1);
    return { transform: [{ scale: combinedScale }] };
  });

  const animatedColorStyle = useAnimatedStyle(() => {
    const bgColor = interpolateColor(
      stateProgress.value,
      [0, 1],
      [theme.colors.brand.primary + 'D9', theme.colors.brand.secondary + 'D9']
    );
    return { backgroundColor: bgColor };
  });

  // === RENDERING HELPERS ===
  const getButtonColor = () => {
    switch (state) {
      case 'running':
        return theme.colors.brand.secondary + 'D9';
      case 'complete':
        return theme.colors.brand.primary + 'D9';
      default:
        return theme.colors.brand.primary + 'D9';
    }
  };

  const renderContent = () => {
    const displayEmoji = emoji || activity?.emoji;
    if (displayEmoji) {
      return <Text style={[styles.emoji, { fontSize: emojiSize }]}>{displayEmoji}</Text>;
    }

    const iconColor = theme.colors.fixed.white;
    switch (state) {
      case 'running':
        return <StopIcon size={iconSize} color={iconColor} />;
      case 'complete':
        return <ResetIcon size={iconSize} color={iconColor} />;
      default:
        return <PlayIcon size={iconSize} color={iconColor} />;
    }
  };

  const getAccessibilityLabel = () => {
    switch (state) {
      case 'running':
        return t('accessibility.timer.stopTimer');
      case 'complete':
        return t('accessibility.timer.resetTimer');
      default:
        return t('accessibility.timer.startTimer');
    }
  };

  // === STYLES ===
  const styles = StyleSheet.create({
    button: {
      alignItems: 'center',
      backgroundColor: getButtonColor(),
      borderRadius: buttonSize / 2,
      height: buttonSize,
      justifyContent: 'center',
      width: buttonSize,
      ...theme.shadow('md'),
    },
    buttonAnimated: {
      alignItems: 'center',
      borderRadius: buttonSize / 2,
      height: buttonSize,
      justifyContent: 'center',
      width: buttonSize,
      ...theme.shadow('md'),
    },
    container: {
      alignItems: 'center',
      height: buttonSize,
      justifyContent: 'center',
      width: buttonSize,
    },
    emoji: {
      textAlign: 'center',
    },
    halo: {
      backgroundColor: theme.colors.brand.secondary + 'D9',
      borderRadius: buttonSize / 2,
      height: buttonSize,
      position: 'absolute',
      width: buttonSize,
    },
    haloContainer: {
      alignItems: 'center',
      height: buttonSize,
      justifyContent: 'center',
      position: 'absolute',
      width: buttonSize,
    },
    progressOverlay: {
      position: 'absolute',
      transform: [
        { rotate: '-90deg' },
        { scaleY: clockwise ? 1 : -1 }, // Inverse direction (rewind)
      ],
    },
    progressOverlayStart: {
      position: 'absolute',
      transform: [
        { rotate: '-90deg' },
        { scaleY: clockwise ? -1 : 1 }, // Same direction (wind up)
      ],
    },
    secondHandContainer: {
      position: 'absolute',
      width: buttonSize,
      height: buttonSize,
      alignItems: 'center',
      justifyContent: 'flex-start',
    },
    secondHandDot: {
      width: SECOND_HAND_SIZE,
      height: SECOND_HAND_SIZE,
      borderRadius: SECOND_HAND_SIZE / 2,
      backgroundColor: theme.colors.brand.accent, // Accent color (gold)
      marginTop: STROKE_WIDTH + 2, // Position just outside the button edge
      ...theme.shadow('sm'),
    },
    secondHandTrailContainer: {
      position: 'absolute',
      width: buttonSize,
      height: buttonSize,
      alignItems: 'center',
      justifyContent: 'flex-start',
    },
  });

  // === GESTURE HANDLERS ===
  const longPressStartGesture = Gesture.LongPress()
    .minDuration(longPressStartDuration)
    .onBegin(() => {
      'worklet';
      isPressed.value = true;
      runOnJS(resetStartCompletion)();
      progressStart.value = withTiming(1, {
        duration: longPressStartDuration,
        easing: Easing.linear,
      });
    })
    .onStart(() => {
      'worklet';
      runOnJS(handleLongPressStart)();
    })
    .onFinalize(() => {
      'worklet';
      isPressed.value = false;
      cancelAnimation(progressStart);
      progressStart.value = withTiming(0, {
        duration: 150,
        easing: Easing.out(Easing.ease),
      });
    });

  const longPressStopGesture = Gesture.LongPress()
    .minDuration(longPressConfirmDuration)
    .onBegin(() => {
      'worklet';
      isPressed.value = true;
      runOnJS(resetStopCompletion)();
      progressStop.value = withTiming(1, {
        duration: longPressConfirmDuration,
        easing: Easing.linear,
      });
    })
    .onStart(() => {
      'worklet';
      runOnJS(handleLongPressStop)();
    })
    .onFinalize(() => {
      'worklet';
      isPressed.value = false;
      cancelAnimation(progressStop);
      progressStop.value = withTiming(0, {
        duration: 150,
        easing: Easing.out(Easing.ease),
      });
    });

  // === RENDER HELPERS ===
  const renderSimpleButton = () => (
    <View style={styles.container}>
      {/* Halos (only for running state with pulse enabled) */}
      {shouldPulse && state === 'running' && (
        <View style={styles.haloContainer}>
          <Animated.View style={[styles.halo, halo1Style]} />
          <Animated.View style={[styles.halo, halo2Style]} />
        </View>
      )}

      <TouchableOpacity
        style={styles.button}
        onPress={handleTap}
        activeOpacity={0.7}
        accessible
        accessibilityRole="button"
        accessibilityLabel={getAccessibilityLabel()}
      >
        {renderContent()}
      </TouchableOpacity>

      {/* Second hand indicator with trail (only for running state) */}
      {state === 'running' && (
        <View style={styles.secondHandContainer} pointerEvents="none">
          {trailStyles.map((trail, index) => (
            <Animated.View key={index} style={[styles.secondHandTrailContainer, trail.containerStyle]}>
              <View style={[styles.secondHandDot, { opacity: trail.opacity, transform: [{ scale: trail.scale }] }]} />
            </Animated.View>
          ))}
        </View>
      )}
    </View>
  );

  const renderLongPressButton = (gesture, circleProps, isStopMode = false) => (
    <GestureDetector gesture={gesture}>
      <Animated.View style={[styles.container, animatedButtonStyle]}>
        {/* Halos (only for running state with pulse enabled) */}
        {shouldPulse && state === 'running' && (
          <View style={styles.haloContainer}>
            <Animated.View style={[styles.halo, halo1Style]} />
            <Animated.View style={[styles.halo, halo2Style]} />
          </View>
        )}

        <Animated.View style={[styles.buttonAnimated, animatedColorStyle]}>
          {renderContent()}
        </Animated.View>

        {/* Second hand indicator with trail (only for running state) */}
        {state === 'running' && (
          <View style={styles.secondHandContainer} pointerEvents="none">
            {trailStyles.map((trail, index) => (
              <Animated.View key={index} style={[styles.secondHandTrailContainer, trail.containerStyle]}>
                <View style={[styles.secondHandDot, { opacity: trail.opacity, transform: [{ scale: trail.scale }] }]} />
              </Animated.View>
            ))}
          </View>
        )}

        {/* Progress circle overlay */}
        <View style={isStopMode ? styles.progressOverlay : styles.progressOverlayStart}>
          <Svg width={buttonSize} height={buttonSize}>
            <Circle
              cx={center}
              cy={center}
              r={radius}
              stroke={theme.colors.brand.accent + '30'}
              strokeWidth={STROKE_WIDTH}
              fill="transparent"
            />
            <AnimatedCircle
              cx={center}
              cy={center}
              r={radius}
              stroke={theme.colors.brand.accent}
              strokeWidth={STROKE_WIDTH}
              fill="transparent"
              strokeDasharray={circumference}
              animatedProps={circleProps}
              strokeLinecap="round"
            />
          </Svg>
        </View>
      </Animated.View>
    </GestureDetector>
  );

  // ==========================================================
  // RENDER LOGIC: Simple state-based decision
  // ==========================================================

  // REST: tap or long press to start
  if (state === 'rest') {
    return startRequiresLongPress
      ? renderLongPressButton(longPressStartGesture, animatedStartCircleProps, false)
      : renderSimpleButton();
  }

  // RUNNING: tap or long press to stop
  if (state === 'running') {
    return stopRequiresLongPress
      ? renderLongPressButton(longPressStopGesture, animatedStopCircleProps, true)
      : renderSimpleButton();
  }

  // COMPLETE: always simple tap to reset
  return renderSimpleButton();
});

PulseButton.displayName = 'PulseButton';
PulseButton.propTypes = {
  activity: PropTypes.shape({
    emoji: PropTypes.string,
  }),
  clockwise: PropTypes.bool,
  compact: PropTypes.bool,
  emoji: PropTypes.string,
  onLongPressComplete: PropTypes.func,
  onTap: PropTypes.func,
  shouldPulse: PropTypes.bool,
  size: PropTypes.number,
  startRequiresLongPress: PropTypes.bool,
  state: PropTypes.oneOf(['rest', 'running', 'complete']),
  stopRequiresLongPress: PropTypes.bool,
};

export default PulseButton;
