// src/components/timer/dial/DialBase.jsx
import React from 'react';
import Svg, { Circle, Line, Text as SvgText } from 'react-native-svg';
import { useTheme } from '../../../theme/ThemeProvider';
import { TIMER_VISUAL } from '../timerConstants';

/**
 * DialBase - Static SVG elements (circles, graduations, numbers)
 * Heavily memoized as these don't change during timer operation
 */
const DialBase = React.memo(({
  svgSize,
  centerX,
  centerY,
  radius,
  strokeWidth,
  graduationMarks,
  minuteNumbers,
}) => {
  const theme = useTheme();

  return (
    <Svg width={svgSize} height={svgSize} style={{ position: 'absolute' }}>
      {/* Background white circle */}
      <Circle
        cx={centerX}
        cy={centerY}
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

      {/* Outer border */}
      <Circle
        cx={centerX}
        cy={centerY}
        r={radius}
        stroke={theme.colors.neutral}
        strokeWidth={strokeWidth}
        fill="none"
      />
    </Svg>
  );
}, (prevProps, nextProps) => {
  // Only re-render if these specific props change
  return (
    prevProps.svgSize === nextProps.svgSize &&
    prevProps.radius === nextProps.radius &&
    prevProps.graduationMarks === nextProps.graduationMarks &&
    prevProps.minuteNumbers === nextProps.minuteNumbers
  );
});

DialBase.displayName = 'DialBase';

export default DialBase;