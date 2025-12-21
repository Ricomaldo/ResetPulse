/**
 * @fileoverview Graduation marks overlay - rendered above progress arc
 * @created 2025-12-14
 * @updated 2025-12-14
 */
import PropTypes from 'prop-types';
import React from 'react';
import Svg, { Line } from 'react-native-svg';
import { useTheme } from '../../../theme/ThemeProvider';
import { TIMER_VISUAL } from '../timerConstants';

/**
 * DialGraduations - Graduation marks rendered above progress arc
 * @param {number} svgSize - Total SVG container size
 * @param {Array} graduationMarks - Array of graduation mark configurations
 * @param {boolean} showGraduations - Whether to show graduations
 */
const DialGraduations = React.memo(
  function DialGraduations({
    graduationMarks,
    showGraduations = true,
    svgSize,
  }) {
    const theme = useTheme();

    // Graduations use neutral color (infrastructure, not user content)
    const graduationColor = theme.colors.brand.neutral;

    if (!showGraduations) {
      return null;
    }

    return (
      <Svg
        width={svgSize}
        height={svgSize}
        style={styles.svg}
        pointerEvents="none"
        accessible={false}
        importantForAccessibility="no"
      >
        {/* Graduation marks */}
        {graduationMarks.map((mark) => (
          <Line
            key={mark.key}
            x1={mark.x1}
            y1={mark.y1}
            x2={mark.x2}
            y2={mark.y2}
            stroke={graduationColor}
            strokeWidth={mark.strokeWidth || (mark.isMajor ? TIMER_VISUAL.TICK_WIDTH_MAJOR : TIMER_VISUAL.TICK_WIDTH_MINOR)}
            opacity={mark.opacity || (mark.isMajor ? TIMER_VISUAL.TICK_OPACITY_MAJOR : TIMER_VISUAL.TICK_OPACITY_MINOR)}
          />
        ))}
      </Svg>
    );
  },
  (prevProps, nextProps) => {
    // Only re-render if these specific props change
    return (
      prevProps.svgSize === nextProps.svgSize &&
      prevProps.graduationMarks === nextProps.graduationMarks &&
      prevProps.showGraduations === nextProps.showGraduations
    );
  }
);

DialGraduations.displayName = 'DialGraduations';
DialGraduations.propTypes = {
  graduationMarks: PropTypes.arrayOf(PropTypes.object).isRequired,
  showGraduations: PropTypes.bool,
  svgSize: PropTypes.number.isRequired,
};

const styles = {
  svg: {
    position: 'absolute',
  },
};

export default DialGraduations;




