/**
 * @fileoverview Static dial base with circles, graduations, and numbers
 * @created 2025-12-14
 * @updated 2025-12-14
 */
import PropTypes from 'prop-types';
import React, { useMemo } from 'react';
import Svg, { Circle, Line, Text as SvgText } from 'react-native-svg';
import { useTheme } from '../../../theme/ThemeProvider';

/**
 * Convert hex color to rgba with opacity
 * @param {string} hex - Hex color (e.g., '#c17a71')
 * @param {number} opacity - Opacity value 0-1
 * @returns {string} rgba color string
 */
const hexToRgba = (hex, opacity) => {
  // Remove # if present
  const cleanHex = hex.replace('#', '');
  
  // Parse RGB values
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
  
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

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
const DialBase = React.memo(function DialBase({
  centerX,
  centerY,
  color,
  graduationMarks,
  minuteNumbers,
  radius,
  showGraduations = true,
  showNumbers = true,
  strokeWidth,
  svgSize,
}) {
  const theme = useTheme();

  // Convert color to rgba with 50% opacity for graduations
  const graduationColor = useMemo(() => {
    const baseColor = color || theme.colors.brand.primary;
    return hexToRgba(baseColor, 0.5);
  }, [color, theme.colors.brand.primary]);

  return (
    <Svg
      width={svgSize}
      height={svgSize}
      style={styles.svg}
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
          stroke={graduationColor}
          strokeWidth={mark.strokeWidth}
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
DialBase.propTypes = {
  centerX: PropTypes.number.isRequired,
  centerY: PropTypes.number.isRequired,
  color: PropTypes.string,
  graduationMarks: PropTypes.arrayOf(PropTypes.object).isRequired,
  minuteNumbers: PropTypes.arrayOf(PropTypes.object).isRequired,
  radius: PropTypes.number.isRequired,
  showGraduations: PropTypes.bool,
  showNumbers: PropTypes.bool,
  strokeWidth: PropTypes.number.isRequired,
  svgSize: PropTypes.number.isRequired,
};

const styles = {
  svg: {
    position: 'absolute',
  },
};

export default DialBase;