// src/components/timer/dial/DialProgress.jsx
import React, { useMemo, useRef, useEffect } from 'react';
import { Animated } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { useTheme } from '../../../theme/ThemeProvider';
import { useDialOrientation } from '../../../hooks/useDialOrientation';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedPath = Animated.createAnimatedComponent(Path);

/**
 * DialProgress - Animated progress arc
 * Only this component re-renders during timer operation
 */
const DialProgress = React.memo(({
  svgSize,
  centerX,
  centerY,
  radius,
  strokeWidth,
  progress,
  color,
  isClockwise,
  scaleMode,
  animatedColor,
  isRunning = false,
}) => {
  const theme = useTheme();
  const dial = useDialOrientation(isClockwise, scaleMode);

  // Animation for start glow effect
  const startGlowAnim = useRef(new Animated.Value(0)).current;
  const wasRunningRef = useRef(false);

  // Calculate progress path
  const progressPath = useMemo(() => {
    if (progress <= 0) return '';
    if (progress >= 0.9999) return null; // Full circle

    const progressRadius = radius - strokeWidth / 2;
    return dial.getProgressPath(progress, centerX, centerY, progressRadius);
  }, [progress, dial, centerX, centerY, radius, strokeWidth]);

  // Use provided animated color or default
  const fillColor = animatedColor || color || theme.colors.energy;

  // Trigger glow animation when timer starts
  useEffect(() => {
    // Detect transition from not running to running
    if (isRunning && !wasRunningRef.current) {
      // Timer just started - trigger glow effect
      startGlowAnim.setValue(0);
      Animated.timing(startGlowAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: false, // opacity needs non-native driver
      }).start();
    }
    wasRunningRef.current = isRunning;
  }, [isRunning, startGlowAnim]);

  // Calculate opacity based on glow animation
  const arcOpacity = startGlowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.85, 1.0], // Fade from 85% to 100%
  });

  if (progress <= 0) return null;

  return (
    <Svg
      width={svgSize}
      height={svgSize}
      style={{ position: 'absolute' }}
      pointerEvents="none"
    >
      {progress >= 0.9999 ? (
        // Full circle
        <AnimatedCircle
          cx={centerX}
          cy={centerY}
          r={radius - strokeWidth / 2}
          fill={fillColor}
          opacity={arcOpacity}
        />
      ) : progressPath ? (
        // Partial arc
        <AnimatedPath
          d={progressPath}
          fill={fillColor}
          opacity={arcOpacity}
        />
      ) : null}
    </Svg>
  );
}, (prevProps, nextProps) => {
  // Only re-render if progress, orientation, or running state changes
  return (
    prevProps.progress === nextProps.progress &&
    prevProps.isClockwise === nextProps.isClockwise &&
    prevProps.scaleMode === nextProps.scaleMode &&
    prevProps.color === nextProps.color &&
    prevProps.isRunning === nextProps.isRunning
  );
});

DialProgress.displayName = 'DialProgress';

export default DialProgress;