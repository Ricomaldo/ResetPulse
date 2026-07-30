/**
 * @fileoverview rituals - Ritual schema, base rituals and pure resolution helpers
 * @description Modèle à deux étages (ADR-015) : un Rituel référence une Activité
 * par id (`activityId`) + porte durée/couleur/son. `steps` réservé au build n+1
 * (séquences/Pomodoro), toujours vide au recentrage.
 *
 * Rituel { id, name, activityId, color, duration, soundId, steps }
 *
 * `color` (C6.2, arbitrage pilote) : hex EN VALEUR, pas un index dans la
 * palette courante — un rituel garde SA couleur, changer de palette
 * (`timer-palettes.js`) ne le recolore pas. `colorIndex` (référence,
 * silencieusement recolorée par C6.1) est mort.
 */
import i18n from '../i18n';
import { getActivityById, getDefaultActivity } from './activities';
import { DEFAULT_SOUND_ID } from './sounds';
import { MIN_DURATION, MAX_DURATION } from './durations';
import { getTimerColors } from './timer-palettes';

export const RITUAL_ID_PREFIX = 'ritual_';

// Palette de référence pour les seeds/repli — un rituel de base doit exister
// même avant tout choix de palette utilisateur (ADR-014 : serenity = défaut).
const SEED_COLORS = getTimerColors('serenity');
export const DEFAULT_RITUAL_COLOR = SEED_COLORS.energy;

/**
 * Couleur (hex) suggérée par l'activité, pour préremplir le champ Couleur
 * du formulaire à la création d'un rituel — dérivée de `suggestedColor`
 * (energy/focus/calm/deep) via la palette de référence.
 * @param {Object} activity
 * @returns {string}
 */
export const suggestedColorFor = (activity) =>
  SEED_COLORS[activity?.suggestedColor] ?? DEFAULT_RITUAL_COLOR;

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
      color: suggestedColorFor(activity),
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
 * Détermine si le nom d'un rituel doit être re-dérivé depuis l'activité
 * BUILT-IN sélectionnée dans RitualForm au moment de la sauvegarde.
 *
 * Bug C1b (hotfix-porte-1, audit 30/07) : `selectedActivityId` est
 * pré-rempli à l'activité courante dès l'ouverture du formulaire en édition
 * — re-dériver le nom dès que `activityId` est truthy écrasait donc
 * systématiquement un nom custom (« Respiration » → « Méditation ») même
 * quand l'user n'avait rien touché. Ne re-dériver que si l'activité
 * sélectionnée diffère RÉELLEMENT de celle du rituel édité (ou s'il n'y a
 * pas de rituel édité — création). Pur, testable sans monter le formulaire
 * (l'infra de test du projet n'a pas de fireEvent/testing-library).
 * @param {string|null} selectedActivityId
 * @param {Object|null} initialRitual
 * @returns {boolean}
 */
export const shouldDeriveNameFromActivity = (selectedActivityId, initialRitual) =>
  Boolean(selectedActivityId) && (!initialRitual || selectedActivityId !== initialRitual.activityId);

/**
 * Calcule le payload d'application d'un rituel (activité résolue + valeurs
 * plafonnées/validées) — pur, sans effet de bord ni dépendance à un contexte
 * React, pour rester testable indépendamment du branchement écran.
 * @param {Object} ritual
 * @param {Array<Object>} customActivities
 * @returns {{activity: Object, duration: number, soundId: string, color: string}}
 */
export const buildRitualApplyPayload = (ritual, customActivities = []) => ({
  activity: resolveRitualActivity(ritual, customActivities),
  duration: clampRitualDuration(ritual.duration),
  soundId: ritual.soundId || DEFAULT_SOUND_ID,
  color: ritual.color || DEFAULT_RITUAL_COLOR,
});

/**
 * Trouve le Rituel à mettre à jour quand un Moment est gardé (ADR-016 §3).
 * Comme le Moment part toujours d'un rituel existant (rangée d'accueil, dé,
 * sheet…), « garder » met à jour CE rituel plutôt que d'en créer un nouveau —
 * le cap gratuit (3) reste intact, zéro mur jour 1. Préfère le rituel de
 * BASE (id `ritual_${activityId}`, cf. getDefaultRituals) si présent parmi
 * les matchs — sinon le premier qui matche, dans l'ordre du tableau. Pur.
 * @param {Array<Object>} rituals
 * @param {string} activityId
 * @returns {Object|null}
 */
export const findRitualToKeep = (rituals = [], activityId) => {
  if (!activityId) {
    return null;
  }
  const matches = rituals.filter((ritual) => ritual.activityId === activityId);
  if (matches.length === 0) {
    return null;
  }
  const baseRitualId = `${RITUAL_ID_PREFIX}${activityId}`;
  return matches.find((ritual) => ritual.id === baseRitualId) || matches[0];
};
