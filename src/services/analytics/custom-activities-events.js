// src/services/analytics/custom-activities-events.js
/**
 * Custom Activities Analytics Events
 * Premium feature tracking - CRUD operations on custom activities
 *
 * Methods: 6
 * - Custom Activity Created
 * - Custom Activity Edited
 * - Custom Activity Deleted
 * - Custom Activity Used
 * - Custom Activity Create Attempt (Free User)
 * - Custom Activities Exported
 *
 * @module custom-activities-events
 */

export const customActivitiesEvents = {
  /**
   * Event: Custom Activity Created
   * Trigger: User creates a new custom activity (premium only)
   * KPI: Feature adoption, customization engagement
   *
   * @param {string} emoji - Emoji selected for the activity
   * @param {number} nameLength - Length of activity name
   * @param {number} durationSeconds - Default duration in seconds
   */
  trackCustomActivityCreated(emoji, nameLength, durationSeconds) {
    this.track('custom_activity_created', {
      emoji,
      name_length: nameLength,
      duration_seconds: durationSeconds,
      duration_minutes: Math.round(durationSeconds / 60),
    });
  },

  /**
   * Event: Custom Activity Edited
   * Trigger: User modifies an existing custom activity
   * KPI: Feature engagement, user refinement
   *
   * @param {string} activityId - ID of the edited activity
   */
  trackCustomActivityEdited(activityId) {
    this.track('custom_activity_edited', {
      activity_id: activityId,
    });
  },

  /**
   * Event: Custom Activity Deleted
   * Trigger: User deletes a custom activity
   * KPI: Churn indicator, feature satisfaction
   *
   * @param {string} activityId - ID of the deleted activity
   * @param {number} timesUsed - How many times the activity was used before deletion
   */
  trackCustomActivityDeleted(activityId, timesUsed) {
    this.track('custom_activity_deleted', {
      activity_id: activityId,
      times_used: timesUsed,
    });
  },

  /**
   * Event: Custom Activity Used
   * Trigger: User starts a timer with a custom activity
   * KPI: Feature value, custom activity engagement
   *
   * @param {string} activityId - ID of the custom activity
   * @param {number} timesUsed - Updated usage count
   */
  trackCustomActivityUsed(activityId, timesUsed) {
    this.track('custom_activity_used', {
      activity_id: activityId,
      times_used: timesUsed,
    });
  },

  /**
   * Event: Custom Activity Create Attempt by Free User
   * Trigger: Free user tries to create a custom activity (premium gate)
   * KPI: Upsell opportunity, premium interest
   */
  trackCustomActivityCreateAttemptFreeUser() {
    this.track('custom_activity_create_attempt_free', {});
  },

  /**
   * Event: Custom Activities Exported
   * Trigger: User exports their custom activities (optional feature)
   * KPI: Data portability usage
   *
   * @param {number} count - Number of activities exported
   */
  trackCustomActivitiesExported(count) {
    this.track('custom_activities_exported', {
      activities_count: count,
    });
  },
};
