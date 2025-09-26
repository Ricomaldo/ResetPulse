// src/hooks/useDialOrientation.js
import { useMemo, useCallback } from 'react';

/**
 * Hook centralisant toute la logique d'orientation et de calcul du cadran
 * @param {boolean} isClockwise - Direction de rotation
 * @param {string} scaleMode - Mode '25min' ou '60min'
 * @returns {Object} Fonctions de calcul et de rendu
 */
export function useDialOrientation(isClockwise, scaleMode) {
  // Configuration based on scale mode
  const config = useMemo(() => {
    const maxMinutes = scaleMode === '25min' ? 25 : 60;
    const degreesPerMinute = 360 / maxMinutes;

    return {
      maxMinutes,
      degreesPerMinute,
      // Graduation marks configuration
      majorTickInterval: 5, // Every 5 minutes
      totalMarks: maxMinutes,
    };
  }, [scaleMode]);

  /**
   * Convert angle to minutes based on orientation
   * @param {number} angle - Angle in degrees (0 = top)
   * @returns {number} Minutes (0 to maxMinutes)
   */
  const angleToMinutes = useCallback((angle) => {
    let minutes;

    // Normalize angle to 0-360 range
    const normalizedAngle = ((angle + 360) % 360);

    if (isClockwise) {
      minutes = Math.round(normalizedAngle / config.degreesPerMinute);
    } else {
      minutes = Math.round((360 - normalizedAngle) / config.degreesPerMinute);
    }

    // Clamp to valid range [0, maxMinutes]
    return Math.max(0, Math.min(config.maxMinutes, minutes));
  }, [isClockwise, config]);

  /**
   * Convert minutes to angle based on orientation
   * @param {number} minutes - Minutes value
   * @returns {number} Angle in degrees (0 = top)
   */
  const minutesToAngle = useCallback((minutes) => {
    const baseAngle = minutes * config.degreesPerMinute;

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
    if (progress <= 0) return '';
    if (progress >= 0.9999) return null; // Full circle

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
    const count = scaleMode === '25min' ? 5 : 12; // 0,5,10,15,20,25 or 0,5,10...55
    const interval = 5;

    for (let i = 0; i < count; i++) { // Changed to < instead of <= to avoid 60
      const minute = i * interval;
      if (minute >= config.maxMinutes) break; // >= instead of > to stop at 60

      const angle = minutesToAngle(minute) - 90; // -90 to start from top
      const x = centerX + radius * Math.cos((angle * Math.PI) / 180);
      const y = centerY + radius * Math.sin((angle * Math.PI) / 180);

      numbers.push({ value: minute, x, y });
    }

    return numbers;
  }, [scaleMode, config.maxMinutes, minutesToAngle]);

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
      const isHour = i % 5 === 0; // Major mark every 5 minutes
      const angle = (i * (360 / totalMarks)) - 90; // -90 to start at top

      const tickLength = isHour ? radius * 0.08 : radius * 0.04;
      const innerRadius = radius - tickLength;

      const x1 = centerX + innerRadius * Math.cos((angle * Math.PI) / 180);
      const y1 = centerY + innerRadius * Math.sin((angle * Math.PI) / 180);
      const x2 = centerX + radius * Math.cos((angle * Math.PI) / 180);
      const y2 = centerY + radius * Math.sin((angle * Math.PI) / 180);

      marks.push({
        key: `mark-${i}`,
        x1, y1, x2, y2,
        isMajor: isHour
      });
    }

    return marks;
  }, [config.totalMarks]);

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