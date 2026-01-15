/**
 * @fileoverview Activity Intentions for Onboarding
 * @description Defines 6 pre-configured intentions for simplified onboarding flow
 * @created 2025-12-22
 */

/**
 * Activity Intentions - Pre-configured choices for onboarding
 * Each intention auto-populates emoji, name, and duration
 */
export const ACTIVITY_INTENTIONS = [
  {
    id: 'relax',
    emoji: '🧘',
    i18nKey: 'onboarding.intentions.relax.label',
    defaultNameKey: 'onboarding.intentions.relax.defaultName',
    defaultDuration: 900, // 15 min (aligned with 5 scales)
  },
  {
    id: 'work',
    emoji: '💻',
    i18nKey: 'onboarding.intentions.work.label',
    defaultNameKey: 'onboarding.intentions.work.defaultName',
    defaultDuration: 1800, // 30 min (aligned with 5 scales, closest to Pomodoro)
  },
  {
    id: 'create',
    emoji: '🎨',
    i18nKey: 'onboarding.intentions.create.label',
    defaultNameKey: 'onboarding.intentions.create.defaultName',
    defaultDuration: 2700, // 45 min
  },
  {
    id: 'learn',
    emoji: '📚',
    i18nKey: 'onboarding.intentions.learn.label',
    defaultNameKey: 'onboarding.intentions.learn.defaultName',
    defaultDuration: 1800, // 30 min
  },
  {
    id: 'move',
    emoji: '🏃',
    i18nKey: 'onboarding.intentions.move.label',
    defaultNameKey: 'onboarding.intentions.move.defaultName',
    defaultDuration: 900, // 15 min
  },
  {
    id: 'other',
    emoji: '✨',
    i18nKey: 'onboarding.intentions.other.label',
    defaultNameKey: 'onboarding.intentions.other.defaultName',
    defaultDuration: 1800, // 30 min
    requiresCustomName: true,
    miniEmojiPicker: ['✨', '⭐', '🌟', '💫', '🎯', '❤️'], // 6 neutral emojis for "Other"
  },
];

/**
 * Get intention by ID
 * @param {string} id - Intention ID
 * @returns {Object|undefined} Intention object
 */
export const getIntentionById = (id) => {
  return ACTIVITY_INTENTIONS.find((intention) => intention.id === id);
};

/**
 * Get all intentions
 * @returns {Array} All intention objects
 */
export const getAllIntentions = () => {
  return ACTIVITY_INTENTIONS;
};

/**
 * Get default duration for intention
 * @param {string} intentionId - Intention ID
 * @returns {number} Duration in seconds
 */
export const getDefaultDuration = (intentionId) => {
  const intention = getIntentionById(intentionId);
  return intention?.defaultDuration || 1800; // Default to 30 min
};
