/**
 * @fileoverview Snap interval settings for dial interaction
 * @created 2025-12-17
 * @updated 2025-12-17
 *
 * Snap intervals are applied ONLY on release (not during drag) for subtle precision assistance.
 * These values determine how the timer duration "snaps" to the nearest interval when the user
 * releases the dial after dragging.
 *
 * Tuning guidelines:
 * - Smaller intervals = more precision but can feel "jumpy"
 * - Larger intervals = smoother feel but less granular control
 * - Balance precision with scale: larger scales (60min) can afford larger snap intervals
 */

/**
 * Snap intervals (in seconds) for each scale mode (ADR-004)
 * Applied when user releases drag gesture or taps on graduations
 */
export const SNAP_INTERVALS = {
  '5min': 5,   // 5 seconds
  '15min': 15, // 15 seconds
  '30min': 30, // 30 seconds
  '60min': 60, // 60 seconds
};

/**
 * Snap seconds to nearest interval based on scale mode
 * @param {number} seconds - Raw seconds value from drag
 * @param {string} scaleMode - Current scale mode ('5min', '15min', '30min', '60min')
 * @returns {number} Snapped seconds value
 *
 * @example
 * snapToInterval(127, '30min') // Returns 120 (snapped to 30s interval)
 * snapToInterval(127, '60min') // Returns 120 (snapped to 60s interval)
 */
export function snapToInterval(seconds, scaleMode) {
  const interval = SNAP_INTERVALS[scaleMode] || 1;
  return Math.round(seconds / interval) * interval;
}
