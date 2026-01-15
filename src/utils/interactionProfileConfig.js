/**
 * @fileoverview interactionProfileConfig - Map interaction profiles to button behavior
 * @created 2025-12-20
 */

/**
 * Get button behavior config for a given interaction profile (ADR-008)
 *
 * @param {string} profileId - 'impulsif' | 'abandonniste' | 'ritualiste' | 'veloce' | 'custom'
 * @param {{startRequiresLongPress?: boolean, stopRequiresLongPress?: boolean}} customConfig - Custom profile config (only used when profileId === 'custom')
 * @returns {{startRequiresLongPress: boolean, stopRequiresLongPress: boolean}}
 */
export const getProfileConfig = (profileId, customConfig = {}) => {
  // Handle custom profile
  if (profileId === 'custom') {
    return {
      startRequiresLongPress: customConfig.startRequiresLongPress ?? true,
      stopRequiresLongPress: customConfig.stopRequiresLongPress ?? true,
    };
  }

  switch (profileId) {
    case 'impulsif':
      // 🎯 Intention: Start: Long, Stop: Tap
      return {
        startRequiresLongPress: true,
        stopRequiresLongPress: false,
      };

    case 'abandonniste':
      // ⚓ Ancrage: Start: Tap, Stop: Long
      return {
        startRequiresLongPress: false,
        stopRequiresLongPress: true,
      };

    case 'ritualiste':
      // 🧘 Présence: Start: Long, Stop: Long
      return {
        startRequiresLongPress: true,
        stopRequiresLongPress: true,
      };

    case 'veloce':
      // ⚡ Flow: Start: Tap, Stop: Tap
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
