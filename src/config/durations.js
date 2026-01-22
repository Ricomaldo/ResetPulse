/**
 * @fileoverview Duration configuration
 * @description Shared duration presets and utilities
 * @created 2026-01-22
 */

/**
 * Standard duration presets (aligned with 5 timer scales)
 * Used across:
 * - DurationSlider (full mode)
 * - CustomizeStep (onboarding mode)
 * - CreateActivityForm
 */
export const DURATION_PRESETS = [
  { minutes: 5, seconds: 300 },
  { minutes: 15, seconds: 900 },
  { minutes: 30, seconds: 1800 },
  { minutes: 45, seconds: 2700 },
  { minutes: 60, seconds: 3600 },
];

/**
 * Default duration for new activities
 */
export const DEFAULT_DURATION = 1800; // 30 minutes

/**
 * Duration range limits
 */
export const MIN_DURATION = 60; // 1 minute (in seconds)
export const MAX_DURATION = 3600; // 60 minutes (in seconds)

/**
 * Step increment for custom duration input (in seconds)
 */
export const DURATION_STEP = 300; // 5 minutes

/**
 * Utility: Find closest preset to a given duration
 * @param {number} durationSeconds - Duration in seconds
 * @returns {Object} Closest preset { minutes, seconds }
 */
export function findClosestPreset(durationSeconds) {
  return DURATION_PRESETS.reduce((closest, preset) => {
    const diff = Math.abs(preset.seconds - durationSeconds);
    const closestDiff = Math.abs(closest.seconds - durationSeconds);
    return diff < closestDiff ? preset : closest;
  });
}

/**
 * Utility: Format duration in seconds to "Xm" or "Xh Ym" format
 * @param {number} seconds - Duration in seconds
 * @returns {string} Formatted duration
 */
export function formatDuration(seconds) {
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
}
