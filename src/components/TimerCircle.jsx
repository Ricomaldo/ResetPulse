// src/components/TimerCircle.jsx
import React, { useRef, useEffect, useState, useMemo } from 'react';
import { View, Text, Animated, PanResponder } from 'react-native';
import Svg, { Circle, Path, Line, Text as SvgText } from 'react-native-svg';
import { useTheme } from '../theme/ThemeProvider';
import { rs } from '../styles/responsive';
import { useDialOrientation } from '../hooks/useDialOrientation';
import { PULSE_ANIMATION, COMPLETION_ANIMATION } from '../constants/animations';
import { TIMER_SVG, TIMER_PROPORTIONS, TIMER_VISUAL, ACTIVITY_DISPLAY, COLORS } from '../constants/design';
import { DIAL_INTERACTION } from '../constants/dialModes';

function TimerCircle({
  progress = 1,
  color,
  size = null,
  clockwise = false,
  scaleMode = '60min',
  duration = 240,
  activityEmoji = null,
  isRunning = false,
  shouldPulse = true,
  onGraduationTap = null,
  isCompleted = false,
  currentActivity = null
}) {
  const theme = useTheme();
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0.3)).current;
  const completionAnim = useRef(new Animated.Value(1)).current;
  const completionColorAnim = useRef(new Animated.Value(0)).current;
  const [isDragging, setIsDragging] = useState(false);

  // Use centralized dial orientation logic
  const dial = useDialOrientation(clockwise, scaleMode);

  // Calculate responsive size if not provided
  const circleSize = size || rs(280, 'min');
  const svgSize = circleSize + TIMER_SVG.PADDING; // Extra space for numbers outside with more padding
  const radius = (circleSize / 2) - TIMER_SVG.RADIUS_OFFSET; // Adjusted for new SVG size
  const strokeWidth = TIMER_SVG.STROKE_WIDTH; // Trait plus épais pour meilleure visibilité
  const svgOffset = TIMER_SVG.SVG_OFFSET; // Offset for centering in larger SVG
  const centerX = svgSize / 2;
  const centerY = svgSize / 2;

  // Pulse animation for activity emoji or pulse effect
  useEffect(() => {
    if (isRunning && shouldPulse) {
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: PULSE_ANIMATION.SCALE_MAX,
            duration: PULSE_ANIMATION.DURATION, // ~72 bpm
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: PULSE_ANIMATION.SCALE_MIN,
            duration: PULSE_ANIMATION.DURATION,
            useNativeDriver: true,
          }),
        ])
      );

      const glowAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: PULSE_ANIMATION.GLOW_MAX,
            duration: PULSE_ANIMATION.DURATION,
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: PULSE_ANIMATION.GLOW_MIN,
            duration: PULSE_ANIMATION.DURATION,
            useNativeDriver: true,
          }),
        ])
      );

      pulseAnimation.start();
      glowAnimation.start();

      return () => {
        pulseAnimation.stop();
        glowAnimation.stop();
        pulseAnim.setValue(PULSE_ANIMATION.SCALE_MIN);
        glowAnim.setValue(PULSE_ANIMATION.GLOW_MIN);
      };
    }
  }, [isRunning, shouldPulse]);

  // Completion animation
  useEffect(() => {
    if (isCompleted) {
      // Animate color transition to green
      Animated.timing(completionColorAnim, {
        toValue: 1,
        duration: COMPLETION_ANIMATION.COLOR_DURATION,
        useNativeDriver: false, // Can't use native driver for color interpolation
      }).start();

      // Three gentle pulses
      Animated.sequence([
        Animated.timing(completionAnim, {
          toValue: 1.1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(completionAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(completionAnim, {
          toValue: 1.08,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(completionAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(completionAnim, {
          toValue: 1.05,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(completionAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Reset color after animation
        setTimeout(() => {
          Animated.timing(completionColorAnim, {
            toValue: 0,
            duration: 500,
            useNativeDriver: false,
          }).start();
        }, 500);
      });
    }
  }, [isCompleted]);
  
  // Get graduation marks from centralized logic
  const graduationMarks = useMemo(() => {
    const marks = dial.getGraduationMarks(radius, centerX, centerY);
    return marks.map(mark => ({
      ...mark,
      strokeWidth: mark.isMajor ? TIMER_VISUAL.TICK_WIDTH_MAJOR : TIMER_VISUAL.TICK_WIDTH_MINOR,
      opacity: mark.isMajor ? TIMER_VISUAL.TICK_OPACITY_MAJOR : TIMER_VISUAL.TICK_OPACITY_MINOR
    }));
  }, [dial, radius, centerX, centerY]);

  // Get number positions from centralized logic
  const minuteNumbers = useMemo(() => {
    const numberRadius = radius + TIMER_PROPORTIONS.NUMBER_RADIUS;
    const positions = dial.getNumberPositions(numberRadius, centerX, centerY);

    return positions.map((pos, index) => ({
      key: `num-${index}`,
      x: pos.x,
      y: pos.y,
      minute: pos.value,
      fontSize: Math.max(TIMER_PROPORTIONS.MIN_NUMBER_FONT, circleSize * TIMER_PROPORTIONS.NUMBER_FONT_RATIO)
    }));
  }, [dial, radius, centerX, centerY, circleSize]);

  // Get progress path from centralized logic
  const progressPath = useMemo(() => {
    if (progress <= 0) return '';
    if (progress >= 0.9999) return null; // Full circle

    const progressRadius = radius - strokeWidth / 2;
    return dial.getProgressPath(progress, centerX, centerY, progressRadius);
  }, [progress, dial, centerX, centerY, radius, strokeWidth]);

  // Animated color for completion
  const animatedColor = completionColorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [color || theme.colors.energy, COLORS.COMPLETION_GREEN] // Green color for completion
  });

  const AnimatedCircle = Animated.createAnimatedComponent(Circle);
  const AnimatedPath = Animated.createAnimatedComponent(Path);

  // Use centralized angle to minutes conversion
  const angleToMinutes = (locationX, locationY) => {
    return dial.coordinatesToMinutes(locationX, locationY, centerX, centerY);
  };

  // Track previous angle to prevent unwanted wrap-around
  const lastAngleRef = useRef(null);
  const lastMinutesRef = useRef(null);

  // Pan responder for drag gesture - recreate when scaleMode changes
  const panResponder = useMemo(() =>
    PanResponder.create({
      onStartShouldSetPanResponder: () => !isRunning && !!onGraduationTap,
      onMoveShouldSetPanResponder: () => !isRunning && !!onGraduationTap,

      onPanResponderGrant: (evt) => {
        if (isRunning) return;
        setIsDragging(true);
        const minutes = angleToMinutes(evt.nativeEvent.locationX, evt.nativeEvent.locationY);
        lastMinutesRef.current = minutes;
        onGraduationTap(minutes);
      },

      onPanResponderMove: (evt) => {
        if (isRunning) return;
        const newMinutes = angleToMinutes(evt.nativeEvent.locationX, evt.nativeEvent.locationY);

        // Prevent wrap-around: if we're near 0 and try to go negative, stay at 0
        // If we're near max and try to go over, stay at max
        if (lastMinutesRef.current !== null) {
          const delta = newMinutes - lastMinutesRef.current;
          const maxMinutes = dial.maxMinutes;

          // Detect wrap-around attempt (large jump in value)
          if (Math.abs(delta) > maxMinutes * DIAL_INTERACTION.WRAP_THRESHOLD) {
            // Trying to wrap around - prevent it
            if (delta > 0) {
              // Trying to wrap from near 0 to max - keep at 0
              onGraduationTap(0);
              lastMinutesRef.current = 0;
            } else {
              // Trying to wrap from near max to 0 - keep at max
              onGraduationTap(maxMinutes);
              lastMinutesRef.current = maxMinutes;
            }
          } else {
            // Normal drag
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
    [scaleMode, clockwise, isRunning, onGraduationTap] // Recreate when these change
  );

  return (
    <Animated.View
      {...(!isRunning && onGraduationTap ? panResponder.panHandlers : {})}
      style={[{
        width: svgSize,
        height: svgSize,
        alignItems: 'center',
        justifyContent: 'center'
      },
      { transform: [{ scale: completionAnim }] }
      ]}
    >
      <Svg width={svgSize} height={svgSize} style={{ position: 'absolute' }}>
        {/* Background white circle */}
        <Circle
          cx={svgSize / 2}
          cy={svgSize / 2}
          r={radius}
          stroke={theme.colors.neutral}
          strokeWidth={strokeWidth}
          fill="white"
        />
        
        {/* Progress arc - BEFORE graduations so they appear on top */}
        {progress > 0 && (
          progress >= 0.9999 ? (
            <AnimatedCircle
              cx={svgSize / 2}
              cy={svgSize / 2}
              r={radius - strokeWidth / 2}
              fill={animatedColor}
              opacity={1}
            />
          ) : progressPath ? (
            <AnimatedPath
              d={progressPath}
              fill={animatedColor}
              opacity={1}
            />
          ) : null
        )}

        {/* Graduation marks - AFTER progress so they appear on top */}
        {graduationMarks.map(mark => (
          <Line
            key={mark.key}
            x1={mark.x1}
            y1={mark.y1}
            x2={mark.x2}
            y2={mark.y2}
            stroke={theme.colors.neutral}
            strokeWidth={mark.strokeWidth}
            opacity={mark.opacity}
          />
        ))}

        {/* Minute numbers - AFTER progress so they appear on top */}
        {minuteNumbers.map(num => (
          <SvgText
            key={num.key}
            x={num.x}
            y={num.y}
            textAnchor="middle"
            dominantBaseline="middle"
            fill={theme.colors.neutral}
            fontSize={num.fontSize}
            fontWeight="500"
            fontFamily="System"
            opacity={0.9}
          >
            {num.minute}
          </SvgText>
        ))}

        {/* Outer border */}
        <Circle
          cx={svgSize / 2}
          cy={svgSize / 2}
          r={radius}
          stroke={theme.colors.neutral}
          strokeWidth={strokeWidth}
          fill="none"
        />
        
        {/* Center dot with gradient effect */}
        <Circle
          cx={svgSize / 2}
          cy={svgSize / 2}
          r={radius * TIMER_PROPORTIONS.CENTER_DOT_OUTER}
          fill={theme.colors.neutral}
          opacity={0.8}
        />
        <Circle
          cx={svgSize / 2}
          cy={svgSize / 2}
          r={radius * TIMER_PROPORTIONS.CENTER_DOT_INNER}
          fill={theme.colors.text}
          opacity={0.4}
        />
      </Svg>

      {/* Activity Emoji Display - Perfectly Centered */}
      {activityEmoji && (
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
        >
          <Animated.View
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              transform: isRunning && shouldPulse ? [{ scale: pulseAnim }] : [{ scale: 1 }],
            }}
          >
            {/* Background disc - always visible when animations are off, animated when on */}
            {isRunning && shouldPulse ? (
              // Animated glow when pulse is enabled
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
              // Static background disc when pulse is disabled
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
      )}

      {/* Pulse effect for "none" activity when running */}
      {!activityEmoji && isRunning && shouldPulse && (
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
        >
          <Animated.View
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              transform: [{ scale: pulseAnim }],
            }}
          >
            {/* More visible glow/pulse effect for basic timer */}
            <Animated.View
              style={{
                position: 'absolute',
                width: circleSize * 0.35,
                height: circleSize * 0.35,
                borderRadius: (circleSize * 0.35) / 2,
                backgroundColor: color || theme.colors.brand.primary,
                opacity: glowAnim * 0.8, // More visible opacity
              }}
            />
            {/* Additional inner pulse circle */}
            <Animated.View
              style={{
                position: 'absolute',
                width: circleSize * 0.2,
                height: circleSize * 0.2,
                borderRadius: (circleSize * 0.2) / 2,
                backgroundColor: color || theme.colors.brand.primary,
                opacity: glowAnim * 1.2, // Even more visible for the center
              }}
            />
          </Animated.View>
        </View>
      )}

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
          <Text style={{
            fontSize: 16,
            fontWeight: '600',
            color: theme.colors.text,
          }}>
            {Math.floor(duration / 60)} min
          </Text>
        </View>
      )}
    </Animated.View>
  );
}

// Memoized version to prevent unnecessary re-renders
export default React.memo(TimerCircle, (prevProps, nextProps) => {
  // Only re-render if these specific props change
  return (
    prevProps.progress === nextProps.progress &&
    prevProps.color === nextProps.color &&
    prevProps.size === nextProps.size &&
    prevProps.clockwise === nextProps.clockwise &&
    prevProps.scaleMode === nextProps.scaleMode &&
    prevProps.duration === nextProps.duration &&
    prevProps.activityEmoji === nextProps.activityEmoji &&
    prevProps.isRunning === nextProps.isRunning &&
    prevProps.shouldPulse === nextProps.shouldPulse &&
    prevProps.isCompleted === nextProps.isCompleted &&
    prevProps.currentActivity === nextProps.currentActivity
  );
});