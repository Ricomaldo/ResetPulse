// src/services/analytics.js
/**
 * Analytics adapter — no-op (Lot 1 recentrage, ADR-014).
 * Mixpanel est sorti. PostHog se branche ici au Lot 2.
 * L'API est conservée : tout appel track*/identify est absorbé sans effet,
 * les consommateurs (useAnalytics, contexts, modals) restent inchangés.
 */
import logger from '../utils/logger';

const noop = () => {};

const analyticsAdapter = {
  isInitialized: false,

  async init() {
    logger.boot.step('analytics', 'no-op (Mixpanel sorti — PostHog au Lot 2)');
  },

  track: noop,
  identify: noop,
  setSuperProperties: noop,
  trackAppOpened: noop,
};

// Proxy : absorbe toute méthode d'événement sans maintenir la liste exhaustive
export default new Proxy(analyticsAdapter, {
  get(target, prop) {
    if (prop in target) {
      return target[prop];
    }
    return noop;
  },
});
