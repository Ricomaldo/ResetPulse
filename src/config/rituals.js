/**
 * @fileoverview rituals - Ritual schema, base rituals and pure resolution helpers
 * @description Modèle à deux étages (ADR-015) : un Rituel référence une Activité
 * par id (`activityId`) + porte durée/couleur/son. `steps` réservé au build n+1
 * (séquences/Pomodoro), toujours vide au recentrage.
 *
 * Rituel { id, name, activityId, colorIndex, duration, soundId, steps }
 */
import i18n from '../i18n';
import { getActivityById, getDefaultActivity } from './activities';
import { DEFAULT_SOUND_ID } from './sounds';
import { MIN_DURATION, MAX_DURATION } from './durations';

export const RITUAL_ID_PREFIX = 'ritual_';

// suggestedColor (activities.js) → slot dans la palette courante (ADR-014 : 4 teintes)
const SUGGESTED_COLOR_TO_INDEX = { energy: 0, focus: 1, calm: 2, deep: 3 };

/**
 * Slot couleur (0-3) suggéré par l'activité, pour préremplir le champ
 * Couleur du formulaire à la création d'un rituel.
 * @param {Object} activity
 * @returns {number}
 */
export const suggestedColorIndexFor = (activity) =>
  SUGGESTED_COLOR_TO_INDEX[activity?.suggestedColor] ?? 0;

// 3 rituels de base (C6) — chacun référence une activité gratuite existante,
// zéro nouveau contenu d'identité.
const BASE_RITUALS_SEED = [
  { activityId: 'meditation', duration: 300 }, // 5 min
  { activityId: 'break', duration: 900 }, // 15 min
  { activityId: 'work', duration: 3000 }, // 50 min
];

/**
 * Rituels de base préconfigurés, calculés à l'appel (noms i18n résolus au
 * moment de la construction, pas de getter — persistés tels quels ensuite).
 * @returns {Array<Object>}
 */
export const getDefaultRituals = () =>
  BASE_RITUALS_SEED.map(({ activityId, duration }) => {
    const activity = getActivityById(activityId);
    return {
      id: `${RITUAL_ID_PREFIX}${activityId}`,
      name: i18n.t(`rituals.base.${activityId}`),
      activityId,
      colorIndex: suggestedColorIndexFor(activity),
      duration,
      soundId: DEFAULT_SOUND_ID,
      steps: [],
    };
  });

/**
 * Plafonne une durée de rituel aux bornes existantes (durations.js).
 * @param {number} duration - Durée en secondes
 * @returns {number}
 */
export const clampRitualDuration = (duration) =>
  Math.min(MAX_DURATION, Math.max(MIN_DURATION, duration || MIN_DURATION));

/**
 * Résout l'Activité référencée par un Rituel : activité built-in d'abord,
 * puis activité custom (créée via le clavier emoji). Garde : si `activityId`
 * ne résout nulle part (custom supprimée entretemps), retombe sur l'activité
 * par défaut plutôt que de laisser l'appelant planter.
 * @param {Object} ritual
 * @param {Array<Object>} customActivities - depuis useCustomActivities()
 * @returns {Object} Activité
 */
export const resolveRitualActivity = (ritual, customActivities = []) => {
  if (!ritual) {
    return getDefaultActivity();
  }
  const builtIn = getActivityById(ritual.activityId);
  if (builtIn) {
    return builtIn;
  }
  const custom = customActivities.find((activity) => activity.id === ritual.activityId);
  return custom || getDefaultActivity();
};

/**
 * Nom par défaut d'un rituel à sa création — label de l'activité (built-in),
 * ou nom générique de repli pour une activité anonyme (emoji custom, ADR-015).
 * @param {Object} activity
 * @returns {string}
 */
export const deriveRitualName = (activity) => {
  if (!activity || activity.isCustom) {
    return i18n.t('rituals.form.customActivityName');
  }
  return activity.label;
};

/**
 * Calcule le payload d'application d'un rituel (activité résolue + valeurs
 * plafonnées/validées) — pur, sans effet de bord ni dépendance à un contexte
 * React, pour rester testable indépendamment du branchement écran.
 * @param {Object} ritual
 * @param {Array<Object>} customActivities
 * @returns {{activity: Object, duration: number, soundId: string, colorIndex: number}}
 */
export const buildRitualApplyPayload = (ritual, customActivities = []) => ({
  activity: resolveRitualActivity(ritual, customActivities),
  duration: clampRitualDuration(ritual.duration),
  soundId: ritual.soundId || DEFAULT_SOUND_ID,
  colorIndex: Math.min(3, Math.max(0, ritual.colorIndex ?? 0)),
});
