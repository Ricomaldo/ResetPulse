// src/components/TimerCircle.jsx
import React, { useRef, useEffect, useState, useMemo } from 'react';
import { View, Text, Animated, PanResponder } from 'react-native';
import Svg, { Circle, Path, Line, Text as SvgText } from 'react-native-svg';
import { useTheme } from '../theme/ThemeProvider';
import { rs } from '../styles/responsive';
import { PULSE_ANIMATION, COMPLETION_ANIMATION } from '../constants/animations';
import { TIMER_SVG, TIMER_PROPORTIONS, TIMER_VISUAL, ACTIVITY_DISPLAY, COLORS } from '../constants/design';

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
  
  // Calculate responsive size if not provided
  const circleSize = size || rs(280, 'min');
  const svgSize = circleSize + TIMER_SVG.PADDING; // Extra space for numbers outside with more padding
  const radius = (circleSize / 2) - TIMER_SVG.RADIUS_OFFSET; // Adjusted for new SVG size
  const strokeWidth = TIMER_SVG.STROKE_WIDTH; // Trait plus épais pour meilleure visibilité
  const svgOffset = TIMER_SVG.SVG_OFFSET; // Offset for centering in larger SVG

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
  
  // Progress angle calculation
  // In 60min mode: duration scales to portion of circle (20min = 120°)
  // In 25min mode: always show full 25 minutes scale
  const maxAngle = scaleMode === '60min'
    ? Math.min(360, (duration / 3600) * 360) // duration in seconds: 1200s = 120°, 3600s = 360°
    : Math.min(360, (duration / 1500) * 360); // 25min mode: scale to 25 minutes (1500s)
  const progressAngle = maxAngle * progress;
  
  // Create graduation marks based on scale mode
  const graduationCount = scaleMode === '60min' ? 60 : 25; // 25 marks for 25min mode
  const graduationMarks = Array.from({ length: graduationCount }, (_, i) => {
    const angle = (i * (360 / graduationCount)) - 90; // Distribute evenly, -90 to start at top
    const isHour = scaleMode === '60min' ? (i % 5 === 0) : (i % 5 === 0); // Every 5 minutes in both modes
    const tickLength = isHour ? radius * TIMER_PROPORTIONS.TICK_LONG : radius * TIMER_PROPORTIONS.TICK_SHORT;
    const innerRadius = radius - tickLength;
    
    const x1 = svgSize / 2 + innerRadius * Math.cos((angle * Math.PI) / 180);
    const y1 = svgSize / 2 + innerRadius * Math.sin((angle * Math.PI) / 180);
    const x2 = svgSize / 2 + radius * Math.cos((angle * Math.PI) / 180);
    const y2 = svgSize / 2 + radius * Math.sin((angle * Math.PI) / 180);
    
    return {
      key: i,
      x1,
      y1,
      x2,
      y2,
      strokeWidth: isHour ? TIMER_VISUAL.TICK_WIDTH_MAJOR : TIMER_VISUAL.TICK_WIDTH_MINOR,
      opacity: isHour ? TIMER_VISUAL.TICK_OPACITY_MAJOR : TIMER_VISUAL.TICK_OPACITY_MINOR
    };
  });
  
  // Create numbers based on scale mode
  const createNumbers = () => {
    if (scaleMode === '60min') {
      // Classic 60-minute scale - position changes based on clockwise
      return Array.from({ length: 12 }, (_, i) => {
        const minute = (i * 5) % 60;
        let angle;
        if (clockwise) {
          // Clockwise: 0 at top, 15 at right, 30 at bottom, 45 at left
          angle = (minute * 6) - 90; // 6 degrees per minute
        } else {
          // Anti-clockwise: 0 at top, 15 at left, 30 at bottom, 45 at right
          angle = -(minute * 6) - 90;
        }
        return { index: i, value: minute, angle };
      });
    } else {
      // 25min Pomodoro scale - show 0, 5, 10, 15, 20 distributed like 60min mode
      return Array.from({ length: 5 }, (_, i) => {
        const minute = i * 5;
        let angle;
        if (clockwise) {
          // Clockwise: same formula as 60min but scaled to 25
          angle = (minute * (360/25)) - 90; // 14.4 degrees per minute
        } else {
          // Anti-clockwise: same as 60min but scaled to 25
          angle = -(minute * (360/25)) - 90;
        }
        return { index: i, value: minute, angle };
      });
    }
  };

  // Memoize number creation to avoid recalculation on every render
  const minuteNumbers = useMemo(() => createNumbers().map((num) => {
    const angle = num.angle;
    const numberRadius = radius + TIMER_PROPORTIONS.NUMBER_RADIUS; // More space from the dial

    const x = svgSize / 2 + numberRadius * Math.cos((angle * Math.PI) / 180);
    const y = svgSize / 2 + numberRadius * Math.sin((angle * Math.PI) / 180);

    return {
      key: `num-${num.index}`,
      x,
      y,
      minute: num.value,
      fontSize: Math.max(TIMER_PROPORTIONS.MIN_NUMBER_FONT, circleSize * TIMER_PROPORTIONS.NUMBER_FONT_RATIO)
    };
  }), [scaleMode, clockwise, radius, circleSize]); // Dependencies for memoization
  
  // Create progress arc path
  const createProgressArc = () => {
    if (progress <= 0) return '';
    if (progressAngle >= 359.9) {
      // Full circle
      return null; // Will render as full circle instead
    }
    
    const centerX = svgSize / 2;
    const centerY = svgSize / 2;
    // Use full radius to fill up to the border
    const progressRadius = radius - strokeWidth / 2; // Fill right up to the border
    
    if (clockwise) {
      return `
        M ${centerX} ${centerY}
        L ${centerX} ${centerY - progressRadius}
        A ${progressRadius} ${progressRadius} 0 ${progressAngle > 180 ? 1 : 0} 1
          ${centerX + progressRadius * Math.sin((progressAngle * Math.PI) / 180)}
          ${centerY - progressRadius * Math.cos((progressAngle * Math.PI) / 180)}
        Z
      `;
    } else {
      return `
        M ${centerX} ${centerY}
        L ${centerX} ${centerY - progressRadius}
        A ${progressRadius} ${progressRadius} 0 ${progressAngle > 180 ? 1 : 0} 0
          ${centerX - progressRadius * Math.sin((progressAngle * Math.PI) / 180)}
          ${centerY - progressRadius * Math.cos((progressAngle * Math.PI) / 180)}
        Z
      `;
    }
  };
  
  // Memoize progress arc calculation to avoid recalculation on every render
  const progressPath = useMemo(() => createProgressArc(), [progress, progressAngle, clockwise, svgSize, radius, strokeWidth]);

  // Animated color for completion
  const animatedColor = completionColorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [color || theme.colors.energy, COLORS.COMPLETION_GREEN] // Green color for completion
  });

  const AnimatedCircle = Animated.createAnimatedComponent(Circle);
  const AnimatedPath = Animated.createAnimatedComponent(Path);

  // Calculate minutes from angle
  const angleToMinutes = (locationX, locationY) => {
    const centerX = svgSize / 2;
    const centerY = svgSize / 2;

    // Calculate angle from center
    const dx = locationX - centerX;
    const dy = locationY - centerY;
    const angle = Math.atan2(dy, dx) * (180 / Math.PI) + 90; // +90 to start from top
    const normalizedAngle = angle < 0 ? angle + 360 : angle;

    // Convert angle to minutes based on scale mode with correct angular distribution
    let minutes;

    if (scaleMode === '60min') {
      // 60min mode: 360° = 60 minutes, so 6° per minute
      const degreesPerMinute = 6;

      if (clockwise) {
        minutes = Math.round(normalizedAngle / degreesPerMinute);
      } else {
        minutes = Math.round((360 - normalizedAngle) / degreesPerMinute);
      }

      // Wrap around: 0 should be 60
      if (minutes === 0) minutes = 60;
      // Ensure we stay within 1-60 range
      if (minutes > 60) minutes = 60;

    } else {
      // 25min mode: 360° = 25 minutes, so 14.4° per minute
      const degreesPerMinute = 360 / 25; // 14.4

      if (clockwise) {
        minutes = Math.round(normalizedAngle / degreesPerMinute);
      } else {
        minutes = Math.round((360 - normalizedAngle) / degreesPerMinute);
      }

      // Wrap around: 0 should be 25
      if (minutes === 0) minutes = 25;
      // Ensure we stay within 1-25 range
      if (minutes > 25) minutes = 25;
    }

    return minutes;
  };

  // Pan responder for drag gesture - recreate when scaleMode changes
  const panResponder = useMemo(() =>
    PanResponder.create({
      onStartShouldSetPanResponder: () => !isRunning && !!onGraduationTap,
      onMoveShouldSetPanResponder: () => !isRunning && !!onGraduationTap,

      onPanResponderGrant: (evt) => {
        if (isRunning) return;
        setIsDragging(true);
        const minutes = angleToMinutes(evt.nativeEvent.locationX, evt.nativeEvent.locationY);
        onGraduationTap(minutes);
      },

      onPanResponderMove: (evt) => {
        if (isRunning) return;
        const minutes = angleToMinutes(evt.nativeEvent.locationX, evt.nativeEvent.locationY);
        onGraduationTap(minutes);
      },

      onPanResponderRelease: () => {
        setIsDragging(false);
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
          progressAngle >= 359.9 ? (
            <AnimatedCircle
              cx={svgSize / 2}
              cy={svgSize / 2}
              r={radius - strokeWidth / 2}
              fill={animatedColor}
              opacity={1}
            />
          ) : (
            <AnimatedPath
              d={progressPath}
              fill={animatedColor}
              opacity={1}
            />
          )
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