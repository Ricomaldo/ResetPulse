/**
 * @fileoverview Animated progress arc that displays remaining time
 * @created 2025-12-14
 * @updated 2025-12-14
 */
import PropTypes from 'prop-types';
import React, { useEffect, useMemo, useRef } from 'react';
import { Animated } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { useDialOrientation } from '../../../hooks/useDialOrientation';
import { useTheme } from '../../../theme/ThemeProvider';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedPath = Animated.createAnimatedComponent(Path);

/**
 * DialProgress - Animated progress arc
 * Only this component re-renders during timer operation
 * @param {number} svgSize - SVG container size
 * @param {number} centerX - Center X coordinate
 * @param {number} centerY - Center Y coordinate
 * @param {number} radius - Arc radius
 * @param {number} strokeWidth - Stroke width
 * @param {number} progress - Progress value 0-1
 * @param {string} color - Arc color
 * @param {boolean} isClockwise - Direction of progress
 * @param {string} scaleMode - Scale mode (1min, 5min, etc.)
 * @param {Animated.Value} animatedColor - Animated color for completion
 * @param {boolean} isRunning - Whether timer is running
 */
const DialProgress = React.memo(function DialProgress({
  animatedColor,
  centerX,
  centerY,
  color,
  isClockwise,
  isRunning = false,
  progress,
  radius,
  scaleMode,
  strokeWidth,
  svgSize,
}) {
  const theme = useTheme();
  const dial = useDialOrientation(isClockwise, scaleMode);

  // Animation for start glow effect
  const startGlowAnim = useRef(new Animated.Value(0)).current;
  const wasRunningRef = useRef(false);

  // Calculate progress path
  const progressPath = useMemo(() => {
    if (progress <= 0) {return '';}
    if (progress >= 0.9999) {return null;} // Full circle

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

  if (progress <= 0) {return null;}

  return (
    <Svg
      width={svgSize}
      height={svgSize}
      style={styles.svg}
      pointerEvents="none"
      accessible={false}
      importantForAccessibility="no"
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
DialProgress.propTypes = {
  animatedColor: PropTypes.any,
  centerX: PropTypes.number.isRequired,
  centerY: PropTypes.number.isRequired,
  color: PropTypes.string,
  isClockwise: PropTypes.bool.isRequired,
  isRunning: PropTypes.bool,
  progress: PropTypes.number.isRequired,
  radius: PropTypes.number.isRequired,
  scaleMode: PropTypes.string.isRequired,
  strokeWidth: PropTypes.number.isRequired,
  svgSize: PropTypes.number.isRequired,
};

const styles = {
  svg: {
    position: 'absolute',
  },
};

export default DialProgress;