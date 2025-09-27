// src/components/timer/dial/DialProgress.jsx
import React, { useMemo } from 'react';
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
}) => {
  const theme = useTheme();
  const dial = useDialOrientation(isClockwise, scaleMode);

  // Calculate progress path
  const progressPath = useMemo(() => {
    if (progress <= 0) return '';
    if (progress >= 0.9999) return null; // Full circle

    const progressRadius = radius - strokeWidth / 2;
    return dial.getProgressPath(progress, centerX, centerY, progressRadius);
  }, [progress, dial, centerX, centerY, radius, strokeWidth]);

  // Use provided animated color or default
  const fillColor = animatedColor || color || theme.colors.energy;

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
          opacity={1}
        />
      ) : progressPath ? (
        // Partial arc
        <AnimatedPath
          d={progressPath}
          fill={fillColor}
          opacity={1}
        />
      ) : null}
    </Svg>
  );
}, (prevProps, nextProps) => {
  // Only re-render if progress or orientation changes
  return (
    prevProps.progress === nextProps.progress &&
    prevProps.isClockwise === nextProps.isClockwise &&
    prevProps.scaleMode === nextProps.scaleMode &&
    prevProps.color === nextProps.color
  );
});

DialProgress.displayName = 'DialProgress';

export default DialProgress;