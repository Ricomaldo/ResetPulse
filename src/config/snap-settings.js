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
 * Snap intervals (in seconds) for each scale mode
 * Applied when user releases drag gesture or taps on graduations
 */
export const SNAP_INTERVALS = {
  '1min': 1, // 1 second for 1min scale (most precise)
  '5min': 5, // 5 seconds for 5min scale
  '10min': 5, // 15 seconds for 10min scale
  '25min': 60, // 20 seconds for 25min scale (Pomodoro)
  '45min': 60, // 30 seconds for 45min scale
  '60min': 60, // 30 seconds for 60min scale
};

/**
 * Snap seconds to nearest interval based on scale mode
 * @param {number} seconds - Raw seconds value from drag
 * @param {string} scaleMode - Current scale mode ('1min', '5min', '10min', '25min', '45min', '60min')
 * @returns {number} Snapped seconds value
 *
 * @example
 * snapToInterval(127, '25min') // Returns 120 (snapped to 20s interval)
 * snapToInterval(127, '60min') // Returns 120 (snapped to 30s interval)
 */
export function snapToInterval(seconds, scaleMode) {
  const interval = SNAP_INTERVALS[scaleMode] || 1;
  return Math.round(seconds / interval) * interval;
}
