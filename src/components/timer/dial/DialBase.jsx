/**
 * @fileoverview Static dial base with circles, graduations, and numbers
 * @created 2025-12-14
 * @updated 2025-12-14
 */
import React from 'react';
import Svg, { Circle, Line, Text as SvgText } from 'react-native-svg';
import { useTheme } from '../../../theme/ThemeProvider';
import { TIMER_VISUAL } from '../timerConstants';

/**
 * DialBase - Static SVG elements (circles, graduations, numbers)
 * Heavily memoized as these don't change during timer operation
 * @param {number} svgSize - Total SVG container size
 * @param {number} centerX - Center X coordinate
 * @param {number} centerY - Center Y coordinate
 * @param {number} radius - Dial radius
 * @param {number} strokeWidth - Stroke width for dial
 * @param {Array} graduationMarks - Array of graduation mark configurations
 * @param {Array} minuteNumbers - Array of number label configurations
 * @param {boolean} showNumbers - Whether to show numbers
 * @param {boolean} showGraduations - Whether to show graduations
 * @param {string} color - Primary color for the dial
 */
const DialBase = React.memo(({
  svgSize,
  centerX,
  centerY,
  radius,
  strokeWidth,
  graduationMarks,
  minuteNumbers,
  showNumbers = true,
  showGraduations = true,
  color,
}) => {
  const theme = useTheme();

  return (
    <Svg
      width={svgSize}
      height={svgSize}
      style={{ position: 'absolute' }}
      accessible={false}
      importantForAccessibility="no"
    >
      {/* Background circle */}
      <Circle
        cx={centerX}
        cy={centerY}
        r={radius}
        stroke={color || theme.colors.brand.primary}
        strokeWidth={strokeWidth}
        fill={theme.colors.background}
      />

      {/* Graduation marks */}
      {showGraduations && graduationMarks.map(mark => (
        <Line
          key={mark.key}
          x1={mark.x1}
          y1={mark.y1}
          x2={mark.x2}
          y2={mark.y2}
          stroke={color || theme.colors.brand.primary}
          strokeWidth={mark.strokeWidth}
          opacity={mark.opacity}
        />
      ))}

      {/* Minute numbers (masquer le 0) */}
      {showNumbers && minuteNumbers
        .filter(num => num.minute !== 0)
        .map(num => (
          <SvgText
            key={num.key}
            x={num.x}
            y={num.y + (num.fontSize * 0.35)}
            textAnchor="middle"
            dominantBaseline="auto"
            fill={theme.colors.textSecondary}
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
        stroke={color || theme.colors.brand.primary}
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
    prevProps.minuteNumbers === nextProps.minuteNumbers &&
    prevProps.color === nextProps.color
  );
});

DialBase.displayName = 'DialBase';

export default DialBase;