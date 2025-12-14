// src/services/analytics/settings-events.js
/**
 * Settings Analytics Events
 * Tracks user preference changes across the app
 *
 * Methods: 1
 * - Setting Changed
 *
 * @module settings-events
 */

export const settingsEvents = {
  /**
   * Event: Setting Changed
   * Trigger: User changes any setting in app
   * KPI: Measure feature usage and preferences
   *
   * @param {string} settingName - Name of setting changed
   * @param {any} newValue - New value
   * @param {any} oldValue - Previous value (optional)
   */
  trackSettingChanged(settingName, newValue, oldValue = null) {
    this.track('setting_changed', {
      setting_name: settingName,
      new_value: newValue,
      old_value: oldValue,
    });
  },
};
