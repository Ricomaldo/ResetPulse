// src/hooks/useAnalytics.js
/**
 * React hook pour accès analytics dans composants
 *
 * Usage:
 *   const analytics = useAnalytics();
 *   analytics.trackPaywallViewed('onboarding');
 *
 * @see src/services/analytics.js - Service singleton
 */

import { useMemo } from 'react';
import Analytics from '../services/analytics';

export const useAnalytics = () => {
  // Return singleton (pas de recréation à chaque render)
  return useMemo(() => Analytics, []);
};
