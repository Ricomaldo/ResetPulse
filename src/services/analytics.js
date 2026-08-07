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
import { DEV_MODE } from '../config/test-mode';
import logger from '../utils/logger';
import { detectEnvironment } from './analytics-environment';

const noop = () => {};

// Normalise activity (objet ou id selon l'appel, cf. useTimer.js) vers un id
// seul — jamais de label/emoji en clair dans les payloads (pas de PII).
const activityId = (activity) => activity?.id ?? activity ?? null;

const analyticsAdapter = {
  isInitialized: false,
  _client: null,

  async init() {
    // Gate DEV_MODE (audit 06/08) : jamais d'événement dev vers le projet
    // PostHog prod, même si la clé est présente. isInitialized reste false
    // → track()/identify()/setSuperProperties() no-op (guard existant),
    // et le Proxy en fin de fichier absorbe tout appel track* non défini
    // ici — aucun throw possible côté appelant, initialisé ou non.
    // Note pilote : un build device avec DEV_MODE=false (donc __DEV__
    // false) n'est PAS distingué d'un build store — décision de marquage
    // en attente.
    if (DEV_MODE) {
      logger.boot.step('analytics', 'no-op (DEV_MODE actif)');
      return;
    }

    if (!POSTHOG_API_KEY) {
      logger.boot.step('analytics', 'no-op (clé PostHog absente)');
      return;
    }

    this._client = new PostHog(POSTHOG_API_KEY, {
      host: POSTHOG_HOST,
      captureAppLifecycleEvents: false, // on trace nous-mêmes (trackAppOpened)
    });
    this.isInitialized = true;

    // Super-property `environment` (décision Eric 07/08, audit 06/08) :
    // distingue les builds device release (TestFlight, QA) d'un vrai
    // événement prod store — cf. analytics-environment.js pour la détection
    // (repli 'prod' inconditionnel assumé, TestFlight indiscernable sans
    // nouvelle dépendance). Posée tout de suite pour ne jamais retarder
    // l'init ; detectEnvironment() est async par construction — si elle
    // résout un jour à autre chose que 'prod', un second register() corrige
    // la valeur. Un throw est catché : la valeur initiale ('prod') reste,
    // aucune exception ne remonte à l'appelant. _environmentReady n'est là
    // que pour les tests (déterminisme de la correction async).
    this.setSuperProperties({ environment: 'prod' });
    this._environmentReady = detectEnvironment()
      .then((environment) => {
        if (environment !== 'prod') {
          this.setSuperProperties({ environment });
        }
      })
      .catch(() => {
        // Repli déjà posé ('prod') — rien à corriger.
      });

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

  trackAppOpened(isFirstLaunch) {
    this.track('app_opened', { is_first_launch: !!isFirstLaunch });
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

  // via : 'tap' (poignée) | 'swipe' (pan gesture) — le produit supporte les
  // deux chemins d'ouverture, la mesure doit distinguer lequel (audit 06/08).
  trackSheetOpened(via) {
    this.track('sheet_opened', { via });
  },

  // Appelée depuis useTimer.js (démarrage d'un timer sur une activité
  // custom) mais jamais définie ici — avalée en silence par le Proxy
  // (audit adversarial 06/08). timesUsed : compteur d'usages transmis par
  // l'appelant (déjà incrémenté avant l'appel).
  trackCustomActivityUsed(activityIdValue, timesUsed) {
    this.track('custom_activity_used', { activity_id: activityIdValue, times_used: timesUsed });
  },

  // LA mesure d'activation (vision gagner-de-largent) : « un tap sur un
  // rituel et ça tourne » — distingue qui vit par ses rituels de qui
  // configure à la main. source : 'home_row' (rangée d'accueil) | 'list'
  // (liste du sheet).
  // mode : 'activity_only' (branche moment-sale, TimerScreen — le chip ne
  // touche que l'activité) | 'full' (durée/couleur/son/activité posés
  // ensemble). Additif (audit 06/08) — n'existait pas jusqu'ici.
  trackRitualApplied(source, mode) {
    this.track('ritual_applied', { source, mode });
  },

  trackPaletteSelected(palette) {
    this.track('palette_selected', { palette });
  },

  trackSoundSelected(soundId) {
    this.track('sound_selected', { sound_id: soundId });
  },

  // Funnel Ambiances (Lot 3b, frontière gratuit/payant) : invitation
  // discrète vue/tapée, avant la surface d'achat.
  trackAmbiancesInvitationShown(source) {
    this.track('ambiances_invitation_shown', { source });
  },

  trackAmbiancesInvitationTapped(source) {
    this.track('ambiances_invitation_tapped', { source });
  },

  // Bout du funnel — l'argent. Ces méthodes étaient APPELÉES
  // (PurchaseContext, PremiumModalContent) mais jamais définies : le Proxy
  // ci-dessous les absorbait en silence, aucun événement d'achat ne
  // partait. Trouvé le 30/07 en répondant à Eric, définies depuis.
  // (une méthode d'essai gratuit en faisait partie — retirée le 06/08,
  // devenue orpheline le même jour côté appelant.)
  trackPaywallViewed(source) {
    this.track('paywall_viewed', { source });
  },

  // Comble le trou du funnel entre paywall_viewed et purchase_completed
  // (audit analytics 06/08, décision Eric 07/08) : émis au tap sur le CTA
  // d'achat, AVANT l'appel purchaseProduct — même `source` que
  // trackPaywallViewed (jointure du funnel). product_id null si pas encore
  // résolu au moment du tap (offerings non chargées).
  trackCtaBuyTapped(source, productId = null) {
    this.track('cta_buy_tapped', { source, product_id: productId });
  },

  trackPurchaseCompleted(productId, price, transactionId, currency = null) {
    this.track('purchase_completed', { product_id: productId, price, transaction_id: transactionId, currency });
  },

  // Annulation utilisateur sur la feuille de paiement native (PurchaseContext,
  // seul point d'émission — cf. commentaire au call site). L'UI reste
  // silencieuse (result.cancelled géré sans Alert dans
  // PremiumModalContent) : cet événement est la seule trace qui reste.
  trackPurchaseCancelled(productId) {
    this.track('purchase_cancelled', { product_id: productId });
  },

  trackPurchaseFailed(errorCode, errorMessage, productId) {
    this.track('purchase_failed', { error_code: errorCode, error_message: errorMessage, product_id: productId });
  },

  trackColorSelected(color) {
    this.track('color_selected', { color });
  },

  // Preuve par les chiffres de l'ADR-016 (§6) — funnel Première fois : sortie
  // du seuil → premier Moment accompli → naissance du Rituel. Tranche le
  // deuil du tour guidé par la réalité, pas par une opinion.
  trackFirstMomentStarted() {
    this.track('first_moment_started');
  },

  trackFirstMomentCompleted() {
    this.track('first_moment_completed');
  },

  trackRitualKept() {
    this.track('ritual_kept');
  },

  // Option A « garde ce moment ? » (07/08) : l'affichage et l'action sont
  // désormais séparés (verrou consommé à l'action). Définis EN DUR (jamais via
  // le Proxy no-op, cf. incident « événements avalés ») pour tracer le funnel
  // montrée → gardée / passée.
  trackRitualKeepShown() {
    this.track('ritual_keep_shown');
  },

  trackRitualDismissed() {
    this.track('ritual_dismissed');
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
