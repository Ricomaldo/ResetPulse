// src/components/timer/TimerDial.jsx
import React, { useMemo, useRef, useState } from 'react';
import { View, Animated, PanResponder, Text } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { useDialOrientation } from '../../hooks/useDialOrientation';
import { rs } from '../../styles/responsive';
import { TIMER_SVG, TIMER_PROPORTIONS, TIMER_VISUAL } from '../../constants/design';
import { DIAL_INTERACTION } from '../../constants/dialModes';
import { COLORS } from '../../constants/design';

// Import modular components
import DialBase from './dial/DialBase';
import DialProgress from './dial/DialProgress';
import DialCenter from './dial/DialCenter';

/**
 * TimerDial - Main timer dial component
 * Orchestrates all dial sub-components
 */
function TimerDial({
  progress = 1,
  duration = 0,
  color,
  size = null,
  clockwise = false,
  scaleMode = '60min',
  activityEmoji = null,
  isRunning = false,
  shouldPulse = true,
  onGraduationTap = null,
  isCompleted = false,
  currentActivity = null,
}) {
  const theme = useTheme();
  const [isDragging, setIsDragging] = useState(false);
  const completionColorAnim = useRef(new Animated.Value(0)).current;

  // Use centralized dial orientation logic
  const dial = useDialOrientation(clockwise, scaleMode);

  // Calculate responsive sizes
  const circleSize = size || rs(280, 'min');
  const svgSize = circleSize + TIMER_SVG.PADDING;
  const radius = (circleSize / 2) - TIMER_SVG.RADIUS_OFFSET;
  const strokeWidth = TIMER_SVG.STROKE_WIDTH;
  const centerX = svgSize / 2;
  const centerY = svgSize / 2;

  // Track previous minutes for wrap-around prevention
  const lastMinutesRef = useRef(null);

  // Get graduation marks and numbers from centralized logic
  const graduationMarks = useMemo(() => {
    const marks = dial.getGraduationMarks(radius, centerX, centerY);
    return marks.map(mark => ({
      ...mark,
      strokeWidth: mark.isMajor ? TIMER_VISUAL.TICK_WIDTH_MAJOR : TIMER_VISUAL.TICK_WIDTH_MINOR,
      opacity: mark.isMajor ? TIMER_VISUAL.TICK_OPACITY_MAJOR : TIMER_VISUAL.TICK_OPACITY_MINOR,
    }));
  }, [dial, radius, centerX, centerY]);

  const minuteNumbers = useMemo(() => {
    const numberRadius = radius + TIMER_PROPORTIONS.NUMBER_RADIUS;
    const positions = dial.getNumberPositions(numberRadius, centerX, centerY);
    return positions.map((pos, index) => ({
      key: `num-${index}`,
      x: pos.x,
      y: pos.y,
      minute: pos.value,
      fontSize: Math.max(TIMER_PROPORTIONS.MIN_NUMBER_FONT, circleSize * TIMER_PROPORTIONS.NUMBER_FONT_RATIO),
    }));
  }, [dial, radius, centerX, centerY, circleSize]);

  // Pan responder for drag interaction
  const panResponder = useMemo(() =>
    PanResponder.create({
      onStartShouldSetPanResponder: () => !isRunning && !!onGraduationTap,
      onMoveShouldSetPanResponder: () => !isRunning && !!onGraduationTap,

      onPanResponderGrant: (evt) => {
        if (isRunning) return;
        setIsDragging(true);
        const minutes = dial.coordinatesToMinutes(
          evt.nativeEvent.locationX,
          evt.nativeEvent.locationY,
          centerX,
          centerY
        );
        lastMinutesRef.current = minutes;
        onGraduationTap(minutes);
      },

      onPanResponderMove: (evt) => {
        if (isRunning) return;
        const newMinutes = dial.coordinatesToMinutes(
          evt.nativeEvent.locationX,
          evt.nativeEvent.locationY,
          centerX,
          centerY
        );

        // Prevent wrap-around
        if (lastMinutesRef.current !== null) {
          const delta = newMinutes - lastMinutesRef.current;
          const maxMinutes = dial.maxMinutes;

          if (Math.abs(delta) > maxMinutes * DIAL_INTERACTION.WRAP_THRESHOLD) {
            if (delta > 0) {
              onGraduationTap(0);
              lastMinutesRef.current = 0;
            } else {
              onGraduationTap(maxMinutes);
              lastMinutesRef.current = maxMinutes;
            }
          } else {
            onGraduationTap(newMinutes);
            lastMinutesRef.current = newMinutes;
          }
        } else {
          onGraduationTap(newMinutes);
          lastMinutesRef.current = newMinutes;
        }
      },

      onPanResponderRelease: () => {
        setIsDragging(false);
        lastMinutesRef.current = null;
      },
    }),
    [dial, isRunning, onGraduationTap, centerX, centerY]
  );

  // Animated color for completion
  const animatedColor = completionColorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [color || theme.colors.energy, COLORS.COMPLETION_GREEN],
  });

  return (
    <View
      {...(!isRunning && onGraduationTap ? panResponder.panHandlers : {})}
      style={{
        width: svgSize,
        height: svgSize,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Base layer: static elements */}
      <DialBase
        svgSize={svgSize}
        centerX={centerX}
        centerY={centerY}
        radius={radius}
        strokeWidth={strokeWidth}
        graduationMarks={graduationMarks}
        minuteNumbers={minuteNumbers}
      />

      {/* Progress layer: animated arc */}
      <DialProgress
        svgSize={svgSize}
        centerX={centerX}
        centerY={centerY}
        radius={radius}
        strokeWidth={strokeWidth}
        progress={progress}
        color={color}
        isClockwise={clockwise}
        scaleMode={scaleMode}
        animatedColor={animatedColor}
      />

      {/* Center layer: emoji and pulse */}
      <DialCenter
        circleSize={circleSize}
        activityEmoji={activityEmoji}
        isRunning={isRunning}
        shouldPulse={shouldPulse}
        color={color}
      />

      {/* Dragging indicator */}
      {isDragging && (
        <View
          style={{
            position: 'absolute',
            top: 10,
            backgroundColor: theme.colors.background,
            paddingHorizontal: theme.spacing.md,
            paddingVertical: theme.spacing.xs,
            borderRadius: theme.borderRadius.md,
            ...theme.shadow('md'),
          }}
        >
          <Text
            style={{
              fontSize: 16,
              fontWeight: '600',
              color: theme.colors.text,
            }}
          >
            {Math.floor(duration / 60)} min
          </Text>
        </View>
      )}
    </View>
  );
}

// Export memoized version
export default React.memo(TimerDial, (prevProps, nextProps) => {
  // Only re-render if these specific props change
  return (
    prevProps.progress === nextProps.progress &&
    prevProps.duration === nextProps.duration &&
    prevProps.color === nextProps.color &&
    prevProps.size === nextProps.size &&
    prevProps.clockwise === nextProps.clockwise &&
    prevProps.scaleMode === nextProps.scaleMode &&
    prevProps.activityEmoji === nextProps.activityEmoji &&
    prevProps.isRunning === nextProps.isRunning &&
    prevProps.shouldPulse === nextProps.shouldPulse &&
    prevProps.isCompleted === nextProps.isCompleted &&
    prevProps.currentActivity === nextProps.currentActivity
  );
});