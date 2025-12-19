/**
 * @fileoverview Static dial base with circles, graduations, and numbers
 * @created 2025-12-14
 * @updated 2025-12-14
 */
import PropTypes from 'prop-types';
import React from 'react';
import Svg, { Circle, Line, Text as SvgText } from 'react-native-svg';
import { useTheme } from '../../../theme/ThemeProvider';

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
const DialBase = React.memo(
  function DialBase({
    centerX,
    centerY,
    color,
    minuteNumbers,
    radius,
    showNumbers = true,
    strokeWidth,
    svgSize,
  }) {
    const theme = useTheme();

    return (
      <Svg
        width={svgSize}
        height={svgSize}
        style={styles.svg}
        accessible={false}
        importantForAccessibility="no"
      >
        {/* Background circle with border */}
        <Circle
          cx={centerX}
          cy={centerY}
          r={radius}
          stroke={theme.colors.brand.neutral}
          strokeWidth={strokeWidth}
          fill={theme.colors.surface}
        />

        {/* Minute numbers (masquer le 0) */}
        {showNumbers &&
          minuteNumbers
            .filter((num) => num.minute !== 0)
            .map((num) => (
              <SvgText
                key={num.key}
                x={num.x}
                y={num.y + num.fontSize * 0.35}
                textAnchor="middle"
                dominantBaseline="auto"
                fill={theme.colors.brand.neutral}
                fontSize={num.fontSize}
                fontWeight="500"
                fontFamily="System"
                opacity={0.9}
              >
                {num.minute}
              </SvgText>
            ))}
      </Svg>
    );
  },
  (prevProps, nextProps) => {
    // Only re-render if these specific props change
    return (
      prevProps.svgSize === nextProps.svgSize &&
      prevProps.radius === nextProps.radius &&
      prevProps.minuteNumbers === nextProps.minuteNumbers &&
      prevProps.color === nextProps.color
    );
  }
);

DialBase.displayName = 'DialBase';
DialBase.propTypes = {
  centerX: PropTypes.number.isRequired,
  centerY: PropTypes.number.isRequired,
  color: PropTypes.string,
  minuteNumbers: PropTypes.arrayOf(PropTypes.object).isRequired,
  radius: PropTypes.number.isRequired,
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
