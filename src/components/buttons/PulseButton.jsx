/**
 * @fileoverview PulseButton - Bouton principal ResetPulse (ADR-007)
 * @description Bouton unifié avec deux modes: simple (tap) ou sophisticated (long press stop)
 *
 * @created 2025-12-19
 * @updated 2025-12-19
 */
import React, { useRef, useCallback, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
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
import { PlayIcon, StopIcon, ResetIcon } from '../layout/Icons';
import { rs } from '../../styles/responsive';
import haptics from '../../utils/haptics';

// Constants
const DEFAULT_LONG_PRESS_DURATION = 2500;
const STROKE_WIDTH = 3;

// Pulse animation constants (Apple-friendly: subtle, slow, non-distracting)
const PULSE_SCALE_MAX = 1.04; // Very subtle scale increase
const PULSE_DURATION = 1500; // 1.5s per half-cycle = 3s full cycle

// State transition constants
const STATE_TRANSITION_DURATION = 250;

// Halo animation constants (RUNNING state elaborate pulse)
const HALO_DURATION = 1200; // Duration for one halo expansion
const HALO_SCALE_MAX = 1.8; // Max scale (expands to 1.8x button size)
const HALO_DELAY = 600; // Delay between halos (stagger)

// Animated Circle component
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

/**
 * PulseButton - Bouton principal avec deux modes
 *
 * Mode simple (ControlBar):
 *   - REST: tap → start
 *   - RUNNING: tap → stop
 *   - COMPLETE: tap → reset
 *
 * Mode sophisticated (DialCenter):
 *   - REST: tap → start
 *   - RUNNING: tap ignoré, long press 2.5s avec animation → stop
 *   - COMPLETE: tap → reset
 *
 * Si activity.emoji est fourni, affiche l'emoji de l'activité à la place des icônes
 * (play, stop, reset) tout en gardant le même fonctionnement
 */
const PulseButton = React.memo(function PulseButton({
  state = 'rest', // 'rest' | 'running' | 'complete'
  emoji = null,
  activity = null,
  onTap,
  onLongPressComplete,
  clockwise = false,
  size = 72,
  compact = false,
  // Mode simple = tap partout, pas d'animation
  // Mode sophisticated = long press pour stop/start avec animation
  stopRequiresLongPress = true,
  startRequiresLongPress = false, // New: deliberate start mode
  // Pulse animation (from settings)
  shouldPulse = false,
}) {
  const theme = useTheme();
  const timerConfig = useTimerConfig();
  // Ensure defaults even if context values are undefined during initial load
  const longPressConfirmDuration = timerConfig?.longPressConfirmDuration ?? DEFAULT_LONG_PRESS_DURATION;
  const longPressStartDuration = timerConfig?.longPressStartDuration ?? DEFAULT_LONG_PRESS_DURATION;

  // === PULSE ANIMATION (REST state only, when enabled) ===
  const pulseScale = useSharedValue(1);

  useEffect(() => {
    if (shouldPulse && state === 'rest') {
      // Start subtle breathing animation (sine-like curve via bezier)
      const breatheEasing = Easing.bezier(0.37, 0, 0.63, 1); // Smooth sine-like curve
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(PULSE_SCALE_MAX, { duration: PULSE_DURATION, easing: breatheEasing }),
          withTiming(1, { duration: PULSE_DURATION, easing: breatheEasing })
        ),
        -1, // Infinite repeat
        false // No reverse (we handle it in sequence)
      );
    } else {
      // Stop pulse and return to normal
      cancelAnimation(pulseScale);
      pulseScale.value = withTiming(1, { duration: 200, easing: Easing.out(Easing.quad) });
    }
  }, [shouldPulse, state]);

  // === HALO ANIMATION (RUNNING state, when enabled) ===
  // Two halos with staggered timing for continuous ripple effect
  const halo1Scale = useSharedValue(1);
  const halo1Opacity = useSharedValue(0);
  const halo2Scale = useSharedValue(1);
  const halo2Opacity = useSharedValue(0);

  useEffect(() => {
    if (shouldPulse && state === 'running') {
      // Start halo 1 animation (repeating)
      halo1Scale.value = withRepeat(
        withTiming(HALO_SCALE_MAX, { duration: HALO_DURATION, easing: Easing.out(Easing.quad) }),
        -1,
        false
      );
      halo1Opacity.value = withRepeat(
        withSequence(
          withTiming(0.6, { duration: 100, easing: Easing.out(Easing.quad) }), // Quick fade in
          withTiming(0, { duration: HALO_DURATION - 100, easing: Easing.in(Easing.quad) }) // Slow fade out
        ),
        -1,
        false
      );

      // Start halo 2 animation (staggered by HALO_DELAY)
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
      // Stop halo animations
      cancelAnimation(halo1Scale);
      cancelAnimation(halo1Opacity);
      cancelAnimation(halo2Scale);
      cancelAnimation(halo2Opacity);
      halo1Scale.value = 1;
      halo1Opacity.value = 0;
      halo2Scale.value = 1;
      halo2Opacity.value = 0;
    }
  }, [shouldPulse, state]);

  // Animated styles for halos
  const halo1Style = useAnimatedStyle(() => ({
    opacity: halo1Opacity.value,
    transform: [{ scale: halo1Scale.value }],
  }));

  const halo2Style = useAnimatedStyle(() => ({
    opacity: halo2Opacity.value,
    transform: [{ scale: halo2Scale.value }],
  }));

  // === STATE TRANSITION ANIMATION ===
  const stateProgress = useSharedValue(state === 'running' ? 1 : 0);
  const scaleTransition = useSharedValue(1);
  const prevStateRef = useRef(state);

  useEffect(() => {
    const prevState = prevStateRef.current;
    prevStateRef.current = state;

    // Animate color transition
    stateProgress.value = withTiming(
      state === 'running' ? 1 : 0,
      { duration: STATE_TRANSITION_DURATION, easing: Easing.inOut(Easing.quad) }
    );

    // Bounce only on complete state (celebration) or when stopping
    // Skip bounce for rest→running to avoid visual glitch when starting timer
    const shouldBounce = state === 'complete' || (prevState === 'running' && state === 'rest');
    if (shouldBounce) {
      scaleTransition.value = withSequence(
        withTiming(0.92, { duration: 80, easing: Easing.out(Easing.quad) }),
        withTiming(1.05, { duration: 120, easing: Easing.out(Easing.quad) }),
        withTiming(1, { duration: 150, easing: Easing.inOut(Easing.quad) })
      );
    }
  }, [state]);

  // Dimensions
  const buttonSize = compact ? rs(48, 'min') : rs(size, 'min');
  const iconSize = compact ? rs(20, 'min') : rs(28, 'min');
  const emojiSize = compact ? rs(24, 'min') : rs(48, 'min');
  const radius = (buttonSize - STROKE_WIDTH) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = buttonSize / 2;

  // Animation values (pour tous les modes)
  const progressStop = useSharedValue(0); // For stop long press
  const progressStart = useSharedValue(0); // For start long press
  const isPressed = useSharedValue(false);
  const completedStopRef = useRef(false);
  const completedStartRef = useRef(false);

  // === CALLBACKS ===

  const handleTap = useCallback(() => {
    haptics.selection().catch(() => {});
    onTap?.();
  }, [onTap]);

  // Animated props for long press progress circles (always created, used conditionally)
  const animatedStopCircleProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - progressStop.value),
  }));

  const animatedStartCircleProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - progressStart.value),
  }));

  // Long press stop callback
  const handleLongPressStop = useCallback(() => {
    if (completedStopRef.current) {
      return;
    }
    completedStopRef.current = true;
    haptics.notification('warning').catch(() => {});
    onLongPressComplete?.();
  }, [onLongPressComplete]);

  // Long press start callback
  const handleLongPressStart = useCallback(() => {
    if (completedStartRef.current) {
      return;
    }
    completedStartRef.current = true;
    haptics.notification('success').catch(() => {});
    onTap?.(); // Start uses same callback as tap
  }, [onTap]);

  const resetStopCompletion = useCallback(() => {
    completedStopRef.current = false;
  }, []);

  const resetStartCompletion = useCallback(() => {
    completedStartRef.current = false;
  }, []);

  // === ANIMATED STYLES ===

  // Combined scale animation (pulse + transition + press)
  const animatedButtonStyle = useAnimatedStyle(() => {
    const combinedScale = pulseScale.value * scaleTransition.value * (isPressed.value ? 0.95 : 1);
    return {
      transform: [{ scale: combinedScale }],
    };
  });

  // Animated background color (smooth transition between states)
  const animatedColorStyle = useAnimatedStyle(() => {
    const bgColor = interpolateColor(
      stateProgress.value,
      [0, 1],
      [theme.colors.brand.primary + 'D9', theme.colors.brand.secondary + 'D9']
    );
    return {
      backgroundColor: bgColor,
    };
  });

  // === COULEUR & CONTENU ===

  // Static color for non-animated modes (simple mode)
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
    // Priorité: emoji prop > activity.emoji > icons
    const displayEmoji = emoji || activity?.emoji;

    if (displayEmoji) {
      return (
        <Text style={[styles.emoji, { fontSize: emojiSize }]}>
          {displayEmoji}
        </Text>
      );
    }

    // Fallback: afficher les icônes standard (play, stop, reset)
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
      return 'Stop timer';
    case 'complete':
      return 'Reset timer';
    default:
      return 'Start timer';
    }
  };

  // === STYLES ===

  const styles = StyleSheet.create({
    // Base button style (for static color mode)
    button: {
      alignItems: 'center',
      backgroundColor: getButtonColor(),
      borderRadius: buttonSize / 2,
      height: buttonSize,
      justifyContent: 'center',
      width: buttonSize,
      ...theme.shadow('md'),
    },
    // Animated button style (without backgroundColor - applied via animatedColorStyle)
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
    progressOverlay: {
      position: 'absolute',
      // STOP: Inverse direction of timer (rewind effect)
      // When clockwise=true, timer goes CW, so STOP should go CCW (scaleY=1 = CCW due to stroke direction)
      transform: [
        { rotate: '-90deg' },
        { scaleY: clockwise ? 1 : -1 },
      ],
    },
    progressOverlayStart: {
      position: 'absolute',
      // START: Same direction as timer (winding up effect)
      // When clockwise=true, timer goes CW, so START should go CW (scaleY=-1 = CW due to stroke direction)
      transform: [
        { rotate: '-90deg' },
        { scaleY: clockwise ? -1 : 1 },
      ],
    },
    // Halo styles (expanding rings from center)
    haloContainer: {
      alignItems: 'center',
      height: buttonSize,
      justifyContent: 'center',
      position: 'absolute',
      width: buttonSize,
    },
    halo: {
      backgroundColor: theme.colors.brand.secondary + 'D9',
      borderRadius: buttonSize / 2,
      height: buttonSize,
      position: 'absolute',
      width: buttonSize,
    },
  });

  // ==========================================================
  // MODE SIMPLE: Tap pour tout (ControlBar)
  // ==========================================================
  if (!stopRequiresLongPress) {
    return (
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
    );
  }

  // ==========================================================
  // MODE SOPHISTICATED: Long press pour stop/start (DialCenter)
  // ==========================================================

  // Tap gesture for REST (when startRequiresLongPress=false) and COMPLETE states
  const tapGesture = Gesture.Tap()
    .onBegin(() => {
      'worklet';
      isPressed.value = true;
    })
    .onEnd(() => {
      'worklet';
      runOnJS(handleTap)();
    })
    .onFinalize(() => {
      'worklet';
      isPressed.value = false;
    });

  // Long press gesture for START (when startRequiresLongPress=true)
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

  // Long press gesture for STOP
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

  // --- REST: Tap or Long Press depending on startRequiresLongPress ---
  if (state === 'rest') {
    if (startRequiresLongPress) {
      // Deliberate start mode: long press to start
      return (
        <GestureDetector gesture={longPressStartGesture}>
          <Animated.View style={[styles.container, animatedButtonStyle]}>
            <Animated.View style={[styles.buttonAnimated, animatedColorStyle]}>
              {renderContent()}
            </Animated.View>

            {/* Progress circle for start (follows timer direction) */}
            <View style={styles.progressOverlayStart}>
              <Svg width={buttonSize} height={buttonSize}>
                <Circle
                  cx={center}
                  cy={center}
                  r={radius}
                  stroke={theme.colors.fixed.white + '30'}
                  strokeWidth={STROKE_WIDTH}
                  fill="transparent"
                />
                <AnimatedCircle
                  cx={center}
                  cy={center}
                  r={radius}
                  stroke={theme.colors.fixed.white}
                  strokeWidth={STROKE_WIDTH}
                  fill="transparent"
                  strokeDasharray={circumference}
                  animatedProps={animatedStartCircleProps}
                  strokeLinecap="round"
                />
              </Svg>
            </View>
          </Animated.View>
        </GestureDetector>
      );
    }

    // Quick start mode: simple tap
    return (
      <GestureDetector gesture={tapGesture}>
        <Animated.View
          style={[styles.container, animatedButtonStyle]}
          accessible
          accessibilityRole="button"
          accessibilityLabel={getAccessibilityLabel()}
        >
          <Animated.View style={[styles.buttonAnimated, animatedColorStyle]}>
            {renderContent()}
          </Animated.View>
        </Animated.View>
      </GestureDetector>
    );
  }

  // --- COMPLETE: Tap with transition animation ---
  if (state === 'complete') {
    return (
      <GestureDetector gesture={tapGesture}>
        <Animated.View
          style={[styles.container, animatedButtonStyle]}
          accessible
          accessibilityRole="button"
          accessibilityLabel={getAccessibilityLabel()}
        >
          <Animated.View style={[styles.buttonAnimated, animatedColorStyle]}>
            {renderContent()}
          </Animated.View>
        </Animated.View>
      </GestureDetector>
    );
  }

  // --- RUNNING: Long press avec animation cercle (inverse rotation) ---
  return (
    <GestureDetector gesture={longPressStopGesture}>
      <Animated.View style={[styles.container, animatedButtonStyle]}>
        {/* Halos (expanding rings behind button - only when shouldPulse) */}
        {shouldPulse && (
          <View style={styles.haloContainer}>
            <Animated.View style={[styles.halo, halo1Style]} />
            <Animated.View style={[styles.halo, halo2Style]} />
          </View>
        )}

        <Animated.View style={[styles.buttonAnimated, animatedColorStyle]}>
          {renderContent()}
        </Animated.View>

        {/* Progress circle for stop (inverse rotation = rewind effect) */}
        <View style={styles.progressOverlay}>
          <Svg width={buttonSize} height={buttonSize}>
            <Circle
              cx={center}
              cy={center}
              r={radius}
              stroke={theme.colors.fixed.white + '30'}
              strokeWidth={STROKE_WIDTH}
              fill="transparent"
            />
            <AnimatedCircle
              cx={center}
              cy={center}
              r={radius}
              stroke={theme.colors.fixed.white}
              strokeWidth={STROKE_WIDTH}
              fill="transparent"
              strokeDasharray={circumference}
              animatedProps={animatedStopCircleProps}
              strokeLinecap="round"
            />
          </Svg>
        </View>
      </Animated.View>
    </GestureDetector>
  );
});

PulseButton.displayName = 'PulseButton';
PulseButton.propTypes = {
  state: PropTypes.oneOf(['rest', 'running', 'complete']),
  emoji: PropTypes.string,
  activity: PropTypes.shape({
    emoji: PropTypes.string,
  }),
  onTap: PropTypes.func,
  onLongPressComplete: PropTypes.func,
  clockwise: PropTypes.bool,
  size: PropTypes.number,
  compact: PropTypes.bool,
  stopRequiresLongPress: PropTypes.bool,
  startRequiresLongPress: PropTypes.bool,
  shouldPulse: PropTypes.bool,
};

export default PulseButton;
