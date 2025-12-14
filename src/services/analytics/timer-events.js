// src/services/analytics/timer-events.js
/**
 * Timer Usage Analytics Events
 * Core timer tracking - started, completed, abandoned
 *
 * Methods: 3
 * - Timer Started
 * - Timer Completed
 * - Timer Abandoned
 *
 * @module timer-events
 */

export const timerEvents = {
  /**
   * Event: Timer Started
   * Trigger: useTimer - when user starts a timer
   * KPI: Core engagement metric
   *
   * @param {number} duration - Duration in seconds
   * @param {Object} activity - Activity object with id, emoji, label
   * @param {string} color - Hex color selected
   * @param {string} palette - Palette name
   */
  trackTimerStarted(duration, activity, color, palette) {
    this.track('timer_started', {
      duration_seconds: duration,
      duration_minutes: Math.round(duration / 60),
      activity_id: activity?.id || 'none',
      activity_emoji: activity?.emoji || '⏱️',
      color_hex: color,
      palette_name: palette,
    });
  },

  /**
   * Event: Timer Completed
   * Trigger: useTimer - when timer reaches 0 and completes normally
   * KPI: Completion rate, core value delivery
   *
   * @param {number} duration - Original duration in seconds
   * @param {Object} activity - Activity object
   * @param {number} completionRate - Percentage completed (should be ~100)
   */
  trackTimerCompleted(duration, activity, completionRate = 100) {
    this.track('timer_completed', {
      duration_seconds: duration,
      duration_minutes: Math.round(duration / 60),
      activity_id: activity?.id || 'none',
      completion_rate: completionRate,
    });
  },

  /**
   * Event: Timer Abandoned
   * Trigger: useTimer - when user pauses, resets, or closes app before completion
   * KPI: Abandonment points, friction detection
   *
   * @param {number} duration - Original duration in seconds
   * @param {number} elapsedSeconds - Time elapsed before abandon
   * @param {string} reason - Reason for abandonment ('paused', 'reset', 'app_background')
   * @param {Object} activity - Activity object
   */
  trackTimerAbandoned(duration, elapsedSeconds, reason = 'unknown', activity = null) {
    const completionRate = Math.round((elapsedSeconds / duration) * 100);

    this.track('timer_abandoned', {
      duration_seconds: duration,
      elapsed_seconds: elapsedSeconds,
      completion_rate: completionRate,
      reason: reason,
      activity_id: activity?.id || 'none',
    });
  },
};
