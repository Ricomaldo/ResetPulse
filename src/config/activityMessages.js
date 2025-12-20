/**
 * @fileoverview activityMessages - Get message keys for activities from i18n
 * @description Links activity ID directly to timerMessages in locales
 * @created 2025-12-20
 *
 * SOURCE OF TRUTH:
 * - Activity IDs: src/config/activities.js (ACTIVITIES array)
 * - Messages: locales/fr.json, locales/en.json, etc. (timerMessages object)
 *
 * HOW IT WORKS (transparent):
 *   getActivityStartMessage('work', t)
 *   → Builds key: 'timerMessages.work.startMessage'
 *   → Calls: t('timerMessages.work.startMessage')
 *   → Returns: "Focus" (from locales)
 *
 * NO MANUAL MAPPING - keys are generated dynamically from activity ID
 * This ensures consistency: if you add activity 'xyz' in activities.js,
 * it automatically looks for timerMessages.xyz.startMessage in locales.
 */

import { ACTIVITIES } from './activities';

/**
 * Get the start message for an activity
 * Dynamically builds the translation key from activity ID
 *
 * Key pattern: timerMessages.{activityId}.startMessage
 *
 * @param {string} activityId - Activity ID from activities.js
 * @param {function} t - i18n translation function
 * @returns {string} Translated start message
 */
export const getActivityStartMessage = (activityId, t) => {
  // Validate activity exists, fallback to 'none'
  const activity = ACTIVITIES.find((a) => a.id === activityId);
  const id = activity ? activityId : 'none';

  // Build the translation key dynamically
  const key = `timerMessages.${id}.startMessage`;
  return t(key);
};

/**
 * Get the end message for an activity
 * Dynamically builds the translation key from activity ID
 *
 * Key pattern: timerMessages.{activityId}.endMessage
 *
 * @param {string} activityId - Activity ID from activities.js
 * @param {function} t - i18n translation function
 * @returns {string} Translated end message
 */
export const getActivityEndMessage = (activityId, t) => {
  // Validate activity exists, fallback to 'none'
  const activity = ACTIVITIES.find((a) => a.id === activityId);
  const id = activity ? activityId : 'none';

  // Build the translation key dynamically
  const key = `timerMessages.${id}.endMessage`;
  return t(key);
};

/**
 * Get both start and end messages for an activity
 *
 * @param {string} activityId - Activity ID from activities.js
 * @param {function} t - i18n translation function
 * @returns {{start: string, end: string}} Both translated messages
 */
export const getActivityMessages = (activityId, t) => {
  return {
    start: getActivityStartMessage(activityId, t),
    end: getActivityEndMessage(activityId, t),
  };
};
