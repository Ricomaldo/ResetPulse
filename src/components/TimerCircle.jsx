// src/components/TimerCircle.jsx
import React, { useRef, useEffect, useState } from 'react';
import { View, Text, Animated, TouchableOpacity, PanResponder } from 'react-native';
import Svg, { Circle, Path, Line, Text as SvgText } from 'react-native-svg';
import { useTheme } from '../theme/ThemeProvider';
import { rs } from '../styles/responsive';

export default function TimerCircle({
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
  const svgSize = circleSize + 50; // Extra space for numbers outside with more padding
  const radius = (circleSize / 2) - 25; // Adjusted for new SVG size
  const strokeWidth = 4.5; // Trait plus épais pour meilleure visibilité
  const maxMinutes = 60;
  const svgOffset = 25; // Offset for centering in larger SVG

  // Pulse animation for activity emoji or pulse effect
  useEffect(() => {
    if (isRunning && shouldPulse) {
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.15,
            duration: 800, // ~72 bpm
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      );

      const glowAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 0.6,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0.3,
            duration: 800,
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
  }, [isRunning, shouldPulse]);

  // Completion animation
  useEffect(() => {
    if (isCompleted) {
      // Animate color transition to green
      Animated.timing(completionColorAnim, {
        toValue: 1,
        duration: 300,
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
    const tickLength = isHour ? radius * 0.08 : radius * 0.04;
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
      strokeWidth: isHour ? 2.5 : 1.5,
      opacity: isHour ? 0.9 : 0.5
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

  const minuteNumbers = createNumbers().map((num) => {
    const angle = num.angle;
    const numberRadius = radius + 18; // More space from the dial

    const x = svgSize / 2 + numberRadius * Math.cos((angle * Math.PI) / 180);
    const y = svgSize / 2 + numberRadius * Math.sin((angle * Math.PI) / 180);

    return {
      key: `num-${num.index}`,
      x,
      y,
      minute: num.value,
      fontSize: Math.max(13, circleSize * 0.045)
    };
  });
  
  // Create progress arc path
  const createProgressArc = () => {
    if (progress <= 0) return '';
    if (progressAngle >= 359.9) {
      // Full circle
      return null; // Will render as full circle instead
    }
    
    const centerX = svgSize / 2;
    const centerY = svgSize / 2;
    // Use inner radius to keep progress inside the circle border
    const progressRadius = radius - strokeWidth * 2;
    
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
  
  const progressPath = createProgressArc();

  // Animated color for completion
  const animatedColor = completionColorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [color || theme.colors.energy, '#48BB78'] // Green color for completion
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

    // Convert angle to minutes based on scale mode
    let minutes;
    if (scaleMode === '60min') {
      if (clockwise) {
        minutes = Math.round((normalizedAngle / 360) * 60) % 60;
      } else {
        minutes = Math.round(((360 - normalizedAngle) / 360) * 60) % 60;
      }
      // Ensure at least 1 minute
      if (minutes === 0) minutes = 60;
    } else {
      // 25min mode - simple calculation like 60min but with 25 as max
      if (clockwise) {
        minutes = Math.round((normalizedAngle / 360) * 25);
      } else {
        minutes = Math.round(((360 - normalizedAngle) / 360) * 25);
      }
      // Ensure at least 1 minute, max 25
      if (minutes === 0) minutes = 25;
      minutes = Math.min(25, minutes);
    }

    return minutes;
  };

  // Pan responder for drag gesture
  const panResponder = useRef(
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
    })
  ).current;

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
        
        {/* Graduation marks */}
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
        
        {/* Minute numbers */}
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
        
        {/* Progress arc */}
        {progress > 0 && (
          progressAngle >= 359.9 ? (
            <AnimatedCircle
              cx={svgSize / 2}
              cy={svgSize / 2}
              r={radius - strokeWidth * 2}
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
          r={radius * 0.12}
          fill={theme.colors.neutral}
          opacity={0.8}
        />
        <Circle
          cx={svgSize / 2}
          cy={svgSize / 2}
          r={radius * 0.08}
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
            {/* Glow/Halo effect - only show when running and pulse enabled */}
            {isRunning && shouldPulse && (
              <Animated.View
                style={{
                  position: 'absolute',
                  width: circleSize * 0.35,
                  height: circleSize * 0.35,
                  borderRadius: (circleSize * 0.35) / 2,
                  backgroundColor: theme.colors.brand.primary,
                  opacity: glowAnim,
                }}
              />
            )}
            <Text
              style={{
                fontSize: circleSize * 0.2,
                opacity: 0.9,
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