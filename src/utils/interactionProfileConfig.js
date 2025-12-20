/**
 * @fileoverview interactionProfileConfig - Map interaction profiles to button behavior
 * @created 2025-12-20
 */

/**
 * Get button behavior config for a given interaction profile (ADR-008)
 *
 * @param {string} profileId - 'impulsif' | 'abandonniste' | 'ritualiste' | 'veloce'
 * @returns {{startRequiresLongPress: boolean, stopRequiresLongPress: boolean}}
 */
export const getProfileConfig = (profileId) => {
  switch (profileId) {
    case 'impulsif':
      // 🚀 Start: Long, Stop: Tap
      return {
        startRequiresLongPress: true,
        stopRequiresLongPress: false,
      };

    case 'abandonniste':
      // 🏃 Start: Tap, Stop: Long
      return {
        startRequiresLongPress: false,
        stopRequiresLongPress: true,
      };

    case 'ritualiste':
      // 🎯 Start: Long, Stop: Long
      return {
        startRequiresLongPress: true,
        stopRequiresLongPress: true,
      };

    case 'veloce':
      // ⚡ Start: Tap, Stop: Tap
      return {
        startRequiresLongPress: false,
        stopRequiresLongPress: false,
      };

    default:
      // Default to ritualiste (most cautious)
      return {
        startRequiresLongPress: true,
        stopRequiresLongPress: true,
      };
  }
};
