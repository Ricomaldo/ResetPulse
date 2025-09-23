// src/components/TimerCircle.jsx
import React, { useRef, useEffect } from 'react';
import { View, Text, Animated } from 'react-native';
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
  shouldPulse = true
}) {
  const theme = useTheme();
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0.3)).current;
  
  // Calculate responsive size if not provided
  const circleSize = size || rs(280, 'min');
  const radius = (circleSize / 2) - 20;
  const strokeWidth = 4.5; // Trait plus épais pour meilleure visibilité
  const maxMinutes = 60;

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
  
  // Progress angle calculation
  // In 60min mode: 20min duration = 120° (1/3 of circle), progress scales that
  // In full mode: always use full 360°, progress scales that
  const maxAngle = scaleMode === '60min'
    ? Math.min(360, (duration / 3600) * 360) // duration in seconds: 1200s = 120°, 3600s = 360°
    : 360; // Full mode always uses full circle
  const progressAngle = maxAngle * progress;
  
  // Create graduation marks based on scale mode
  const graduationCount = scaleMode === '60min' ? 60 : Math.min(60, duration / 60 * 5);
  const graduationMarks = Array.from({ length: graduationCount }, (_, i) => {
    const angle = (i * (360 / graduationCount)) - 90; // Distribute evenly, -90 to start at top
    const isHour = scaleMode === '60min' ? (i % 5 === 0) : (i % Math.max(1, Math.floor(graduationCount / 12)) === 0);
    const tickLength = isHour ? radius * 0.08 : radius * 0.04;
    const innerRadius = radius - tickLength;
    
    const x1 = circleSize / 2 + innerRadius * Math.cos((angle * Math.PI) / 180);
    const y1 = circleSize / 2 + innerRadius * Math.sin((angle * Math.PI) / 180);
    const x2 = circleSize / 2 + radius * Math.cos((angle * Math.PI) / 180);
    const y2 = circleSize / 2 + radius * Math.sin((angle * Math.PI) / 180);
    
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
      // Full scale based on duration
      const durationMinutes = Math.ceil(duration / 60);
      let numberCount;
      let step;

      if (durationMinutes <= 5) {
        numberCount = durationMinutes + 1;
        step = 1;
      } else if (durationMinutes <= 15) {
        numberCount = Math.ceil(durationMinutes / 2.5) + 1;
        step = Math.ceil(durationMinutes / (numberCount - 1));
      } else if (durationMinutes <= 30) {
        numberCount = Math.ceil(durationMinutes / 5) + 1;
        step = 5;
      } else {
        numberCount = Math.ceil(durationMinutes / 10) + 1;
        step = 10;
      }

      return Array.from({ length: numberCount }, (_, i) => {
        const minute = Math.min(i * step, durationMinutes);
        let angle;
        if (clockwise) {
          angle = (minute / durationMinutes * 360) - 90;
        } else {
          angle = -(minute / durationMinutes * 360) - 90;
        }
        return { index: i, value: minute, angle };
      });
    }
  };

  const minuteNumbers = createNumbers().map((num) => {
    const angle = num.angle;
    const numberRadius = radius + 12;
    
    const x = circleSize / 2 + numberRadius * Math.cos((angle * Math.PI) / 180);
    const y = circleSize / 2 + numberRadius * Math.sin((angle * Math.PI) / 180);

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
    
    const centerX = circleSize / 2;
    const centerY = circleSize / 2;
    // Use a slightly larger radius to ensure complete coverage of the background circle
    const progressRadius = radius + strokeWidth/2;
    
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
  
  return (
    <View style={{ 
      width: circleSize, 
      height: circleSize,
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <Svg width={circleSize} height={circleSize}>
        {/* Background white circle */}
        <Circle
          cx={circleSize / 2}
          cy={circleSize / 2}
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
            <Circle
              cx={circleSize / 2}
              cy={circleSize / 2}
              r={radius + strokeWidth/2}
              fill={color || theme.colors.energy}
              opacity={1}
            />
          ) : (
            <Path
              d={progressPath}
              fill={color || theme.colors.energy}
              opacity={1}
            />
          )
        )}
        
        {/* Outer border */}
        <Circle
          cx={circleSize / 2}
          cy={circleSize / 2}
          r={radius}
          stroke={theme.colors.neutral}
          strokeWidth={strokeWidth}
          fill="none"
        />
        
        {/* Center dot with gradient effect */}
        <Circle
          cx={circleSize / 2}
          cy={circleSize / 2}
          r={radius * 0.12}
          fill={theme.colors.neutral}
          opacity={0.8}
        />
        <Circle
          cx={circleSize / 2}
          cy={circleSize / 2}
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
              transform: [{ scale: pulseAnim }],
            }}
          >
            {/* Glow/Halo effect */}
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
    </View>
  );
}