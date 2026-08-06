// src/config/soundsMapping.js
// Mapping centralisé des sons pour faciliter les changements futurs
import i18n from '../i18n';

// Mapping des fichiers audio
// Clé = identifiant interne stable
// Valeur = require() du fichier audio
//
// Curation sons (retour Eric) : 12 sons au total — 3 survivants de la
// sélection d'origine (Accompli/Ping/Pop, kitchen_timer alias "Ding" retiré)
// + 9 nouveaux sons doux/organiques. Répartition 4 gratuits (isPremium:
// false) / 8 Ambiances (isPremium: true, donnée seulement — le câblage du
// gating est un chantier séparé, 3b). Tous les fichiers sont normalisés en
// crête à -1 dBFS pour un niveau perçu homogène à volume device constant.
export const SOUND_FILES = {
  // Gratuits (4) — 2 legacy + 2 nouveaux, variété de textures
  'timer_complete': require('../../assets/sounds/aj_heels__timercomplete01.wav'),
  'microwave_ping': require('../../assets/sounds/theplax__microwave_ping.wav'),
  'singing_bowl': require('../../assets/sounds/inoshirodesign__singing_bowl_strike.wav'),
  'contrabass_pluck': require('../../assets/sounds/sgossner__contrabass_pizzicato_c2.wav'),

  // Ambiances (8, premium — données seulement)
  'toaster_bell': require('../../assets/sounds/azumarill__toaster_oven_or_liftelevator_bell.wav'),
  'jingle_achievement': require('../../assets/sounds/littlerobotsoundfactory__jingle_achievement.wav'),
  'kalimba': require('../../assets/sounds/foochie_foochie__kalimba_c_note.wav'),
  'vibraphone_chord': require('../../assets/sounds/jack_urbanski__vibraphone_chord.wav'),
  'marimba_dry': require('../../assets/sounds/joesh2__marimba_c3.wav'),
  'marimba_ascending': require('../../assets/sounds/pogmothoin__marimba_ascending.wav'),
  'up_chime': require('../../assets/sounds/foolboymedia__up_chime_2.wav'),
  'success_glissando': require('../../assets/sounds/grunz__success.wav'),
};

// Métadonnées des sons (nom affiché, durée, emoji, gating)
// Les noms utilisent des getters pour supporter i18n dynamique
export const SOUND_METADATA = {
  'timer_complete': {
    get name() { return i18n.t('sounds.timer_complete'); },
    duration: '4s',
    emoji: '🏁',
    isPremium: false
  },
  'microwave_ping': {
    get name() { return i18n.t('sounds.microwave_ping'); },
    duration: '4s',
    emoji: '📍',
    isPremium: false
  },
  'singing_bowl': {
    get name() { return i18n.t('sounds.singing_bowl'); },
    duration: '6s',
    emoji: '🔔',
    isPremium: false
  },
  'contrabass_pluck': {
    get name() { return i18n.t('sounds.contrabass_pluck'); },
    duration: '2s',
    emoji: '🎻',
    isPremium: false
  },
  'toaster_bell': {
    get name() { return i18n.t('sounds.toaster_bell'); },
    duration: '4s',
    emoji: '💫',
    isPremium: true
  },
  'jingle_achievement': {
    get name() { return i18n.t('sounds.jingle_achievement'); },
    duration: '4s',
    emoji: '🏆',
    isPremium: true
  },
  'kalimba': {
    get name() { return i18n.t('sounds.kalimba'); },
    duration: '4s',
    emoji: '🎶',
    isPremium: true
  },
  'vibraphone_chord': {
    get name() { return i18n.t('sounds.vibraphone_chord'); },
    duration: '2s',
    emoji: '✨',
    isPremium: true
  },
  'marimba_dry': {
    get name() { return i18n.t('sounds.marimba_dry'); },
    duration: '2s',
    emoji: '🪵',
    isPremium: true
  },
  'marimba_ascending': {
    get name() { return i18n.t('sounds.marimba_ascending'); },
    duration: '4s',
    emoji: '🎼',
    isPremium: true
  },
  'up_chime': {
    get name() { return i18n.t('sounds.up_chime'); },
    duration: '1s',
    emoji: '🎵',
    isPremium: true
  },
  'success_glissando': {
    get name() { return i18n.t('sounds.success_glissando'); },
    duration: '1s',
    emoji: '🌟',
    isPremium: true
  },
};

// Son par défaut — celui d'origine, gratuit, universel
export const DEFAULT_SOUND_ID = 'timer_complete';

// Fichiers déclarés dans app.json (plugin expo-notifications, clé `sounds`) —
// nécessaires pour référencer un son custom depuis une NOTIFICATION native.
// Le require() de SOUND_FILES ci-dessus ne donne qu'un id d'asset Metro (pour
// la lecture audio en direct via expo-audio) ; l'API notifications a besoin
// du nom de fichier tel que packagé nativement. Garder synchronisé avec
// app.json → plugins → expo-notifications → sounds ET avec assets/sounds/
// (Lot 3e, fix packaging custom-sound, finding C2).
export const NOTIFICATION_SOUND_FILES = {
  timer_complete: 'aj_heels__timercomplete01.wav',
  microwave_ping: 'theplax__microwave_ping.wav',
  singing_bowl: 'inoshirodesign__singing_bowl_strike.wav',
  contrabass_pluck: 'sgossner__contrabass_pizzicato_c2.wav',
  toaster_bell: 'azumarill__toaster_oven_or_liftelevator_bell.wav',
  jingle_achievement: 'littlerobotsoundfactory__jingle_achievement.wav',
  kalimba: 'foochie_foochie__kalimba_c_note.wav',
  vibraphone_chord: 'jack_urbanski__vibraphone_chord.wav',
  marimba_dry: 'joesh2__marimba_c3.wav',
  marimba_ascending: 'pogmothoin__marimba_ascending.wav',
  up_chime: 'foolboymedia__up_chime_2.wav',
  success_glissando: 'grunz__success.wav',
};

/**
 * Nom de fichier natif pour un son de notification — repli silencieux sur le
 * son par défaut si l'id est invalide/manquant (jamais de crash sur une
 * valeur persistée corrompue).
 * @param {string} soundId
 * @returns {string}
 */
export const getNotificationSoundFile = (soundId) =>
  NOTIFICATION_SOUND_FILES[soundId] || NOTIFICATION_SOUND_FILES[DEFAULT_SOUND_ID];

// Helper pour obtenir la liste des sons formatée
export const getTimerSounds = () => {
  return Object.keys(SOUND_FILES).map(id => ({
    id,
    file: SOUND_FILES[id],
    ...SOUND_METADATA[id]
  }));
};

// Helper pour récupérer un son par ID
export const getSoundById = (id) => {
  if (!SOUND_FILES[id]) {
    // Fallback au son par défaut si ID invalide
    return {
      id: DEFAULT_SOUND_ID,
      file: SOUND_FILES[DEFAULT_SOUND_ID],
      ...SOUND_METADATA[DEFAULT_SOUND_ID]
    };
  }

  return {
    id,
    file: SOUND_FILES[id],
    ...SOUND_METADATA[id]
  };
};

// Miroir de isPalettePremium (timer-palettes.js) — id inconnu = jamais premium
// (repli silencieux, jamais de throw sur une valeur persistée corrompue).
export const isSoundPremium = (soundId) =>
  SOUND_METADATA[soundId]?.isPremium || false;

/**
 * Résout le son qui doit être actif au lancement (Lambda L, mandat Eric —
 * miroir de resolvePaletteOnLaunch/usePaletteGating pour les sons). Fonction
 * pure : pas d'état, pas de hook, testable isolément — cf. useSoundGating
 * pour le déclenchement (une fois par montage).
 *
 * - Premium : jamais de retour forcé, le son actif reste tel quel.
 * - FREE + son actif inclus : rien à faire.
 * - FREE + son actif Ambiances (essai libre en cours) : retour au dernier
 *   inclus connu, ou DEFAULT_SOUND_ID par défaut si aucun connu.
 *
 * @param {boolean} isPremium
 * @param {string} currentSoundId
 * @param {string|null} lastIncludedSoundId
 * @returns {string} L'id de son qui doit être actif
 */
export const resolveSoundOnLaunch = (isPremium, currentSoundId, lastIncludedSoundId) => {
  if (isPremium) return currentSoundId;
  if (!isSoundPremium(currentSoundId)) return currentSoundId;
  return lastIncludedSoundId || DEFAULT_SOUND_ID;
};
