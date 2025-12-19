// src/hooks/useDialOrientation.js
import { useMemo, useCallback } from 'react';
import { getDialMode } from '../components/dial/timerConstants';

/**
 * Hook centralisant toute la logique d'orientation et de calcul du cadran
 * @param {boolean} isClockwise - Direction de rotation
 * @param {string} scaleMode - Mode '5min', '15min', '30min' ou '60min' (ADR-004)
 * @returns {Object} Fonctions de calcul et de rendu
 */
export function useDialOrientation(isClockwise, scaleMode) {
  // Configuration based on scale mode
  const config = useMemo(() => {
    const modeConfig = getDialMode(scaleMode);
    const maxMinutes = modeConfig.maxMinutes;
    const degreesPerMinute = 360 / maxMinutes;

    return {
      maxMinutes,
      degreesPerMinute,
      // Graduation marks configuration from mode
      majorTickInterval: modeConfig.majorTickInterval,
      numberInterval: modeConfig.numberInterval,
      totalMarks: maxMinutes,
      useSeconds: modeConfig.useSeconds || false,
    };
  }, [scaleMode]);

  /**
   * Convert angle to minutes based on orientation
   * @param {number} angle - Angle in degrees (0 = top)
   * @returns {number} Minutes (0 to maxMinutes)
   */
  const angleToMinutes = useCallback((angle) => {
    // Handle invalid inputs - protect against NaN
    const numAngle = Number(angle);
    if (!isFinite(numAngle)) {return 0;}

    let minutes;

    // Normalize angle to 0-360 range
    const normalizedAngle = ((numAngle + 360) % 360);

    if (isClockwise) {
      minutes = normalizedAngle / config.degreesPerMinute;
    } else {
      minutes = (360 - normalizedAngle) / config.degreesPerMinute;
    }

    // IMPORTANT:
    // Do NOT round here. Keep fractional minutes during drag for smooth motion.
    // Rounding/snap is applied on release in TimeTimer via snap-settings.js.

    // Clamp to valid range [0, maxMinutes]
    return Math.max(0, Math.min(config.maxMinutes, minutes));
  }, [isClockwise, config]);

  /**
   * Convert minutes to angle based on orientation
   * @param {number} minutes - Minutes value
   * @returns {number} Angle in degrees (0 = top)
   */
  const minutesToAngle = useCallback((minutes) => {
    // Handle invalid inputs - protect against NaN
    const numMinutes = Number(minutes);
    if (!isFinite(numMinutes)) {
      // Special case for Infinity: clamp to max
      if (numMinutes === Infinity) {return isClockwise ? 360 : 0;}
      if (numMinutes === -Infinity) {return isClockwise ? 0 : 360;}
      return 0; // For NaN and other invalid values
    }

    // Clamp minutes to valid range
    const clampedMinutes = Math.max(0, Math.min(config.maxMinutes, numMinutes));
    const baseAngle = clampedMinutes * config.degreesPerMinute;

    if (isClockwise) {
      return baseAngle;
    } else {
      return 360 - baseAngle;
    }
  }, [isClockwise, config]);

  /**
   * Convert x,y coordinates to minutes
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @param {number} centerX - Center X of the dial
   * @param {number} centerY - Center Y of the dial
   * @returns {number} Minutes
   */
  const coordinatesToMinutes = useCallback((x, y, centerX, centerY) => {
    const dx = x - centerX;
    const dy = y - centerY;

    // Calculate angle from center (0° = top)
    const angle = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
    const normalizedAngle = angle < 0 ? angle + 360 : angle;

    return angleToMinutes(normalizedAngle);
  }, [angleToMinutes]);

  /**
   * Get progress arc path for SVG
   * @param {number} progress - Progress value (0 to 1)
   * @param {number} centerX - Center X coordinate
   * @param {number} centerY - Center Y coordinate
   * @param {number} radius - Radius of the arc
   * @returns {string} SVG path string
   */
  const getProgressPath = useCallback((progress, centerX, centerY, radius) => {
    if (progress <= 0) {return '';}
    if (progress >= 0.9999) {return null;} // Full circle

    const progressAngle = progress * 360;
    const progressRadius = radius;

    if (isClockwise) {
      const endX = centerX + progressRadius * Math.sin((progressAngle * Math.PI) / 180);
      const endY = centerY - progressRadius * Math.cos((progressAngle * Math.PI) / 180);

      return `
        M ${centerX} ${centerY}
        L ${centerX} ${centerY - progressRadius}
        A ${progressRadius} ${progressRadius} 0 ${progressAngle > 180 ? 1 : 0} 1
          ${endX} ${endY}
        Z
      `;
    } else {
      const endX = centerX - progressRadius * Math.sin((progressAngle * Math.PI) / 180);
      const endY = centerY - progressRadius * Math.cos((progressAngle * Math.PI) / 180);

      return `
        M ${centerX} ${centerY}
        L ${centerX} ${centerY - progressRadius}
        A ${progressRadius} ${progressRadius} 0 ${progressAngle > 180 ? 1 : 0} 0
          ${endX} ${endY}
        Z
      `;
    }
  }, [isClockwise]);

  /**
   * Get positions for number labels around the dial
   * @param {number} radius - Radius for number placement
   * @param {number} centerX - Center X
   * @param {number} centerY - Center Y
   * @returns {Array} Array of {value, x, y} for each number
   */
  const getNumberPositions = useCallback((radius, centerX, centerY) => {
    const numbers = [];
    const interval = config.numberInterval;
    const count = Math.floor(config.maxMinutes / interval) + 1;

    for (let i = 0; i < count; i++) {
      const minute = i * interval;
      if (minute > config.maxMinutes) {break;}

      const angle = minutesToAngle(minute) - 90; // -90 to start from top
      const x = centerX + radius * Math.cos((angle * Math.PI) / 180);
      const y = centerY + radius * Math.sin((angle * Math.PI) / 180);

      // Display value (no useSeconds mode in ADR-004)
      const displayValue = config.useSeconds ? minute * 60 : minute;
      numbers.push({ value: displayValue, x, y });
    }

    return numbers;
  }, [config.maxMinutes, config.numberInterval, config.useSeconds, minutesToAngle]);

  /**
   * Get graduation marks for the dial
   * @param {number} radius - Outer radius
   * @param {number} centerX - Center X
   * @param {number} centerY - Center Y
   * @returns {Array} Array of line coordinates for graduations
   */
  const getGraduationMarks = useCallback((radius, centerX, centerY) => {
    const marks = [];
    const totalMarks = config.totalMarks;

    for (let i = 0; i < totalMarks; i++) {
      const isMajor = i % config.majorTickInterval === 0;
      const angle = (i * (360 / totalMarks)) - 90; // -90 to start at top

      const tickLength = isMajor ? radius * 0.08 : radius * 0.04;
      const innerRadius = radius - tickLength;

      const x1 = centerX + innerRadius * Math.cos((angle * Math.PI) / 180);
      const y1 = centerY + innerRadius * Math.sin((angle * Math.PI) / 180);
      const x2 = centerX + radius * Math.cos((angle * Math.PI) / 180);
      const y2 = centerY + radius * Math.sin((angle * Math.PI) / 180);

      marks.push({
        key: `mark-${i}`,
        x1, y1, x2, y2,
        isMajor
      });
    }

    return marks;
  }, [config.totalMarks, config.majorTickInterval]);

  return {
    // Configuration
    config,
    maxMinutes: config.maxMinutes,

    // Core conversion functions
    angleToMinutes,
    minutesToAngle,
    coordinatesToMinutes,

    // SVG rendering helpers
    getProgressPath,
    getNumberPositions,
    getGraduationMarks,
  };
}