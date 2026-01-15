/**
 * @fileoverview Scale mode helper functions
 * @description Utilities for calculating optimal scale modes and conversions
 * @created 2026-01-15
 *
 * Scale modes available: 5, 15, 30, 45, 60 minutes
 * (Simplified from original 8 modes: removed 1, 10, 25 for better UX)
 */

/**
 * Calculate optimal scale mode for a given duration
 * Returns the smallest scale that can accommodate the duration
 *
 * @param {number} durationMinutes - Duration in minutes
 * @returns {number} - Optimal scale in minutes (5, 15, 30, 45, 60)
 *
 * @example
 * getOptimalScale(3)  // => 5
 * getOptimalScale(12) // => 15
 * getOptimalScale(25) // => 30
 * getOptimalScale(42) // => 45
 * getOptimalScale(58) // => 60
 */
export const getOptimalScale = (durationMinutes) => {
  if (durationMinutes <= 5) return 5;
  if (durationMinutes <= 15) return 15;
  if (durationMinutes <= 30) return 30;
  if (durationMinutes <= 45) return 45;
  return 60;
};

/**
 * Convert scale number to scaleMode string format
 *
 * @param {number} scale - Scale in minutes
 * @returns {string} - ScaleMode format ('5min', '15min', etc.)
 *
 * @example
 * scaleToMode(30) // => '30min'
 */
export const scaleToMode = (scale) => `${scale}min`;

/**
 * Convert scaleMode string to number
 *
 * @param {string} scaleMode - ScaleMode format ('25min')
 * @returns {number} - Scale in minutes
 *
 * @example
 * modeToScale('30min') // => 30
 * modeToScale(null)    // => 60 (default)
 */
export const modeToScale = (scaleMode) => {
  return parseInt(scaleMode?.replace('min', '') || '60', 10);
};

/**
 * Check if a given scaleMode is one of the supported 5 scales
 *
 * @param {string} scaleMode - ScaleMode to check ('25min')
 * @returns {boolean} - True if scale is supported
 *
 * @example
 * isSupportedScale('30min') // => true
 * isSupportedScale('25min') // => false
 */
export const isSupportedScale = (scaleMode) => {
  const supportedScales = ['5min', '15min', '30min', '45min', '60min'];
  return supportedScales.includes(scaleMode);
};
