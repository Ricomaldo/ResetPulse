// src/services/analytics.js
/**
 * Analytics adapter — PostHog (Lot 2 recentrage, ADR-014).
 * Mixpanel est sorti (Lot 1). Client no-op tant que POSTHOG_API_KEY est null
 * (src/config/posthog.js) — aucun réseau, aucun throw.
 * L'API est conservée : tout appel (track, identify, événements) est absorbé
 * sans effet si non initialisé, les consommateurs (useAnalytics, contexts,
 * modales legacy) restent inchangés — Proxy volontaire, cf. plus bas.
 */
import { PostHog } from 'posthog-react-native';
import { POSTHOG_API_KEY, POSTHOG_HOST } from '../config/posthog';
import logger from '../utils/logger';

const noop = () => {};

// Normalise activity (objet ou id selon l'appel, cf. useTimer.js) vers un id
// seul — jamais de label/emoji en clair dans les payloads (pas de PII).
const activityId = (activity) => activity?.id ?? activity ?? null;

const analyticsAdapter = {
  isInitialized: false,
  _client: null,

  async init() {
    if (!POSTHOG_API_KEY) {
      logger.boot.step('analytics', 'no-op (clé PostHog absente)');
      return;
    }

    this._client = new PostHog(POSTHOG_API_KEY, {
      host: POSTHOG_HOST,
      captureAppLifecycleEvents: false, // on trace nous-mêmes (trackAppOpened)
    });
    this.isInitialized = true;

    logger.boot.step('analytics', 'PostHog initialisé (EU)');
  },

  track(eventName, properties) {
    if (!this.isInitialized || !this._client) {return;}
    this._client.capture(eventName, properties);
  },

  identify(distinctId, properties) {
    if (!this.isInitialized || !this._client) {return;}
    this._client.identify(distinctId, properties);
  },

  setSuperProperties(properties) {
    if (!this.isInitialized || !this._client) {return;}
    this._client.register(properties);
  },

  trackAppOpened() {
    this.track('app_opened');
  },

  trackTimerStarted(duration, activity, color, palette) {
    this.track('timer_started', {
      duration_minutes: duration ? Math.round(duration / 60) : 0,
      activity_id: activityId(activity),
      color,
      palette,
    });
  },

  trackTimerCompleted(duration, activity) {
    this.track('timer_completed', {
      duration_minutes: duration ? Math.round(duration / 60) : 0,
      activity_id: activityId(activity),
    });
  },

  trackTimerAbandoned(duration, elapsed, reason, activity) {
    this.track('timer_abandoned', {
      duration_minutes: duration ? Math.round(duration / 60) : 0,
      elapsed_seconds: elapsed,
      activity_id: activityId(activity),
    });
  },

  trackFocusEntered(via) {
    this.track('focus_entered', { via });
  },

  trackFocusExited() {
    this.track('focus_exited');
  },

  trackDiceRolled() {
    this.track('dice_rolled');
  },

  trackSheetOpened() {
    this.track('sheet_opened');
  },

  trackActivitySelected(activityIdValue) {
    this.track('activity_selected', { activity_id: activityIdValue });
  },

  trackPaletteSelected(palette) {
    this.track('palette_selected', { palette });
  },

  trackColorSelected(color) {
    this.track('color_selected', { color });
  },
};

// Proxy : absorbe toute méthode d'événement sans maintenir la liste exhaustive
// (les modales legacy appellent des méthodes qu'on ne mappe plus — no-op
// silencieux, jamais de throw).
export default new Proxy(analyticsAdapter, {
  get(target, prop) {
    if (prop in target) {
      const value = target[prop];
      return typeof value === 'function' ? value.bind(target) : value;
    }
    return noop;
  },
});
