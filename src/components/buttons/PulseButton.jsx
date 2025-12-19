/**
 * @fileoverview PulseButton - Bouton principal ResetPulse (ADR-007)
 * @description Bouton unifié avec deux modes: simple (tap) ou sophisticated (long press stop)
 *
 * @created 2025-12-19
 * @updated 2025-12-19
 */
import React, { useRef, useCallback } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedProps,
  withTiming,
  cancelAnimation,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import PropTypes from 'prop-types';
import { useTheme } from '../../theme/ThemeProvider';
import { useTimerOptions } from '../../contexts/TimerOptionsContext';
import { PlayIcon, StopIcon, ResetIcon } from '../layout/Icons';
import { rs } from '../../styles/responsive';
import haptics from '../../utils/haptics';

// Constants
const DEFAULT_LONG_PRESS_DURATION = 2500;
const STROKE_WIDTH = 3;

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
 */
const PulseButton = React.memo(function PulseButton({
  state = 'rest', // 'rest' | 'running' | 'complete'
  emoji = null,
  onTap,
  onLongPressComplete,
  clockwise = false,
  size = 72,
  compact = false,
  // Mode simple = tap partout, pas d'animation
  // Mode sophisticated = long press pour stop avec animation
  stopRequiresLongPress = true,
}) {
  const theme = useTheme();
  const { longPressConfirmDuration = DEFAULT_LONG_PRESS_DURATION } = useTimerOptions();

  // Dimensions
  const buttonSize = compact ? rs(48, 'min') : rs(size, 'min');
  const iconSize = compact ? rs(20, 'min') : rs(28, 'min');
  const emojiSize = compact ? rs(24, 'min') : rs(32, 'min');
  const radius = (buttonSize - STROKE_WIDTH) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = buttonSize / 2;

  // Animation values (seulement pour mode sophisticated)
  const progress = useSharedValue(0);
  const isPressed = useSharedValue(false);
  const completedRef = useRef(false);

  // === CALLBACKS ===

  const handleTap = useCallback(() => {
    haptics.selection().catch(() => {});
    onTap?.();
  }, [onTap]);

  const handleLongPressComplete = useCallback(() => {
    if (completedRef.current) {
      return;
    }
    completedRef.current = true;
    haptics.notification('warning').catch(() => {});
    onLongPressComplete?.();
  }, [onLongPressComplete]);

  const resetCompletion = useCallback(() => {
    completedRef.current = false;
  }, []);

  // === COULEUR & CONTENU ===

  const getButtonColor = () => {
    switch (state) {
    case 'running':
      return theme.colors.brand.secondary;
    case 'complete':
      return theme.colors.brand.primary;
    default:
      return theme.colors.brand.primary;
    }
  };

  const renderContent = () => {
    if (emoji) {
      return (
        <Text style={[styles.emoji, { fontSize: emojiSize }]}>
          {emoji}
        </Text>
      );
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
      return 'Stop timer';
    case 'complete':
      return 'Reset timer';
    default:
      return 'Start timer';
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
      transform: [{ rotate: clockwise ? '90deg' : '-90deg' }],
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
  // MODE SOPHISTICATED: Long press pour stop (DialCenter)
  // ==========================================================

  // Animated props
  const animatedCircleProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - progress.value),
  }));

  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: isPressed.value ? 0.95 : 1 }],
  }));

  // --- REST: Tap simple ---
  if (state === 'rest') {
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

  // --- COMPLETE: Tap simple ---
  if (state === 'complete') {
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

  // --- RUNNING: Long press avec animation cercle ---
  const longPressGesture = Gesture.LongPress()
    .minDuration(longPressConfirmDuration) // Gesture recognized after full duration
    .onBegin(() => {
      'worklet';
      // Visual feedback starts immediately
      isPressed.value = true;
      runOnJS(resetCompletion)();

      // Animation synced with minDuration
      progress.value = withTiming(1, {
        duration: longPressConfirmDuration,
        easing: Easing.linear,
      });
    })
    .onStart(() => {
      'worklet';
      // Gesture recognized (minDuration passed) → trigger action
      runOnJS(handleLongPressComplete)();
    })
    .onFinalize(() => {
      'worklet';
      // Reset visual state
      isPressed.value = false;
      cancelAnimation(progress);
      progress.value = withTiming(0, {
        duration: 150,
        easing: Easing.out(Easing.ease),
      });
    });

  return (
    <GestureDetector gesture={longPressGesture}>
      <Animated.View style={[styles.container, animatedButtonStyle]}>
        <View style={styles.button}>
          {renderContent()}
        </View>

        {/* Cercle animation rembobinage */}
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
              animatedProps={animatedCircleProps}
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
  onTap: PropTypes.func,
  onLongPressComplete: PropTypes.func,
  clockwise: PropTypes.bool,
  size: PropTypes.number,
  compact: PropTypes.bool,
  stopRequiresLongPress: PropTypes.bool,
};

export default PulseButton;
