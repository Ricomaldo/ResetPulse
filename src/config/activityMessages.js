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
 *   getActivityStartMessage(activity, t)
 *   → Extracts activity ID or intentionId for custom activities
 *   → Builds key: 'timerMessages.work.startMessage'
 *   → Returns: "Focus" (from locales)
 *
 * CUSTOM ACTIVITIES:
 *   Custom activities created during onboarding have an intentionId that maps
 *   to built-in activity messages:
 *   - relax → meditation ("Respire")
 *   - work → work ("Focus")
 *   - create → creativity ("Crée")
 *   - learn → study ("Apprends")
 *   - move → sport ("Bouge")
 *   - other → custom ("C'est parti")
 */

import { ACTIVITIES } from './activities';

// Map intention IDs to activity IDs for timerMessages
const INTENTION_TO_MESSAGE_ID = {
  relax: 'meditation',
  work: 'work',
  create: 'creativity',
  learn: 'study',
  move: 'sport',
  other: 'custom',
};

/**
 * Get the message ID for an activity (handles custom activities with intentionId)
 * @param {Object|string} activityOrId - Activity object or activity ID string
 * @returns {string} The message ID to use for timerMessages lookup
 */
const getMessageId = (activityOrId) => {
  // Handle string ID (backward compatibility)
  if (typeof activityOrId === 'string') {
    if (activityOrId.startsWith('custom_')) {
      return 'custom'; // Fallback for string-only custom IDs
    }
    const builtIn = ACTIVITIES.find((a) => a.id === activityOrId);
    return builtIn ? activityOrId : 'none';
  }

  // Handle activity object
  if (!activityOrId) return 'none';

  const { id, intentionId, isCustom } = activityOrId;

  // Custom activity: use intentionId mapping
  if (isCustom || (id && id.startsWith('custom_'))) {
    if (intentionId && INTENTION_TO_MESSAGE_ID[intentionId]) {
      return INTENTION_TO_MESSAGE_ID[intentionId];
    }
    return 'custom'; // Fallback
  }

  // Built-in activity
  const builtIn = ACTIVITIES.find((a) => a.id === id);
  return builtIn ? id : 'none';
};

/**
 * Get the start message for an activity
 * Dynamically builds the translation key from activity ID
 *
 * Key pattern: timerMessages.{activityId}.startMessage
 *
 * @param {Object|string} activityOrId - Activity object or activity ID string
 * @param {function} t - i18n translation function
 * @returns {string} Translated start message
 */
export const getActivityStartMessage = (activityOrId, t) => {
  const messageId = getMessageId(activityOrId);
  return t(`timerMessages.${messageId}.startMessage`);
};

/**
 * Get the end message for an activity
 * Dynamically builds the translation key from activity ID
 *
 * Key pattern: timerMessages.{activityId}.endMessage
 *
 * @param {Object|string} activityOrId - Activity object or activity ID string
 * @param {function} t - i18n translation function
 * @returns {string} Translated end message
 */
export const getActivityEndMessage = (activityOrId, t) => {
  const messageId = getMessageId(activityOrId);
  return t(`timerMessages.${messageId}.endMessage`);
};

/**
 * Get both start and end messages for an activity
 *
 * @param {Object|string} activityOrId - Activity object or activity ID string
 * @param {function} t - i18n translation function
 * @returns {{start: string, end: string}} Both translated messages
 */
export const getActivityMessages = (activityOrId, t) => {
  return {
    start: getActivityStartMessage(activityOrId, t),
    end: getActivityEndMessage(activityOrId, t),
  };
};
