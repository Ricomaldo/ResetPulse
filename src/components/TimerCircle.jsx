// src/components/TimerCircle.jsx
import React from 'react';
import { View } from 'react-native';
import Svg, { Circle, Path, Line, Text as SvgText } from 'react-native-svg';
import { useTheme } from '../components/ThemeProvider';
import { responsiveSize } from '../styles/layout';

export default function TimerCircle({ 
  progress = 1, 
  color, 
  size = null,
  clockwise = false 
}) {
  const { theme } = useTheme();
  
  // Calculate responsive size if not provided
  const circleSize = size || responsiveSize(280);
  const radius = (circleSize / 2) - 20;
  const strokeWidth = 3;
  const maxMinutes = 60;
  
  // Progress angle calculation
  const progressAngle = progress * 360;
  
  // Create graduation marks for minutes
  const graduationMarks = Array.from({ length: 60 }, (_, i) => {
    const angle = (i * 6) - 90; // 6 degrees per minute, -90 to start at top
    const isHour = i % 5 === 0; // Longer marks every 5 minutes
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
      strokeWidth: isHour ? 1.5 : 0.8,
      opacity: isHour ? 0.8 : 0.4
    };
  });
  
  // Create minute numbers (every 5 minutes)
  const minuteNumbers = Array.from({ length: 12 }, (_, i) => {
    let minute;
    if (clockwise) {
      // Clockwise: 0, 55, 50, 45...
      minute = i === 0 ? 0 : 60 - (i * 5);
    } else {
      // Counter-clockwise: 0, 5, 10, 15...
      minute = (i * 5) % 60;
    }
    
    const angle = (i * 30) - 90; // 30 degrees between each number
    const numberRadius = radius + 12;
    
    const x = circleSize / 2 + numberRadius * Math.cos((angle * Math.PI) / 180);
    const y = circleSize / 2 + numberRadius * Math.sin((angle * Math.PI) / 180);
    
    return {
      key: `num-${i}`,
      x,
      y,
      minute,
      fontSize: Math.max(9, circleSize * 0.035)
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
    
    if (clockwise) {
      return `
        M ${centerX} ${centerY}
        L ${centerX} ${centerY - radius}
        A ${radius} ${radius} 0 ${progressAngle > 180 ? 1 : 0} 0
          ${centerX - radius * Math.sin((progressAngle * Math.PI) / 180)}
          ${centerY - radius * Math.cos((progressAngle * Math.PI) / 180)}
        Z
      `;
    } else {
      return `
        M ${centerX} ${centerY}
        L ${centerX} ${centerY - radius}
        A ${radius} ${radius} 0 ${progressAngle > 180 ? 1 : 0} 1
          ${centerX + radius * Math.sin((progressAngle * Math.PI) / 180)}
          ${centerY - radius * Math.cos((progressAngle * Math.PI) / 180)}
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
              r={radius}
              fill={color || theme.colors.energy}
              opacity={0.9}
            />
          ) : (
            <Path
              d={progressPath}
              fill={color || theme.colors.energy}
              opacity={0.9}
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
        
        {/* Center dot */}
        <Circle
          cx={circleSize / 2}
          cy={circleSize / 2}
          r={radius * 0.15}
          fill={theme.colors.neutral}
        />
      </Svg>
    </View>
  );
}