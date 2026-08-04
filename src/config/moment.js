/**
 * @fileoverview moment - Moment SALE/VIERGE (Lambda R2, Q3b « chip intelligent »)
 * @description Helper PUR, aucun état interne — une fonction de transition
 * testable sans monter d'écran ni de contexte React.
 *
 * Principe (verdict Eric 05/08, « à essayer ») : « un rituel remplit un
 * cadran vierge ; un cadran déjà réglé, il ne change que l'activité. »
 *
 * VIERGE : le Moment n'a pas été touché À LA MAIN depuis le dernier repère
 * qui l'a remis à plat. SALE : l'utilisateur a réglé la durée ou la couleur
 * lui-même depuis.
 *
 * Intégration (TimerScreen) : un ref (pas de state — aucun rendu n'en
 * dépend, seul le tap du chip le relit) alimenté par les événements
 * EXISTANTS de l'écran — cf. commentaires au fil de TimerScreen.jsx. Ne vit
 * jamais dans useTimer (sacré) : tout s'observe depuis l'écran.
 */

export const MOMENT_VIERGE = 'vierge';
export const MOMENT_SALE = 'sale';

/**
 * Vocabulaire des événements écran qui font bouger l'état — noms stables,
 * à référencer plutôt que des chaînes littérales dispersées.
 */
export const MOMENT_EVENTS = {
  // Durée réglée à la main (release du drag/tap sur le cadran), AU REPOS
  // uniquement — l'appelant (TimeTimer) filtre déjà sur `!timer.running`.
  DURATION_COMMIT_REST: 'duration-commit-rest',
  // Couleur choisie à la main (rangée/palette d'accueil, CompactRow).
  COLOR_SELECT: 'color-select',
  // Un rituel vient d'être appliqué EN ENTIER (activité + durée + couleur +
  // son) — le Moment recommence.
  RITUAL_APPLIED: 'ritual-applied',
  // Tap pendant la séance = rembobinage (ADR-007, timer.stopTimer()).
  STOP_REMBOBINAGE: 'stop-rembobinage',
  // Fin naturelle de la séance (remaining atteint 0).
  COMPLETION: 'completion',
  // Tap post-complétion = reset (timer.resetTimer()).
  RESET: 'reset',
};

// Événements qui salissent le Moment (réglage manuel depuis le dernier
// repère vierge).
const DIRTYING_EVENTS = new Set([
  MOMENT_EVENTS.DURATION_COMMIT_REST,
  MOMENT_EVENTS.COLOR_SELECT,
]);

// Événements qui remettent le Moment à plat — il recommence VIERGE.
const CLEANING_EVENTS = new Set([
  MOMENT_EVENTS.RITUAL_APPLIED,
  MOMENT_EVENTS.STOP_REMBOBINAGE,
  MOMENT_EVENTS.COMPLETION,
  MOMENT_EVENTS.RESET,
]);

/**
 * Transition pure : état courant + événement → état suivant. Un événement
 * inconnu (ou neutre, ex. démarrage du timer) ne change rien — repli
 * permissif, jamais de throw sur un événement non listé.
 * @param {string} state - MOMENT_VIERGE | MOMENT_SALE
 * @param {string} event - une valeur de MOMENT_EVENTS
 * @returns {string}
 */
export function nextMomentState(state, event) {
  if (CLEANING_EVENTS.has(event)) {
    return MOMENT_VIERGE;
  }
  if (DIRTYING_EVENTS.has(event)) {
    return MOMENT_SALE;
  }
  return state;
}

/**
 * @param {string} state
 * @returns {boolean}
 */
export const isMomentDirty = (state) => state === MOMENT_SALE;
