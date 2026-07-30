// src/config/soundsMapping.js
// Mapping centralisé des sons pour faciliter les changements futurs
import i18n from '../i18n';

// Mapping des fichiers audio
// Clé = identifiant interne stable
// Valeur = require() du fichier audio
//
// Curation sons (retour Eric) : legacy entièrement retiré (aucun utilisateur
// du reborn à migrer), remplacé par 9 sons doux/organiques répartis en 4
// gratuits (un par famille, isPremium: false dans SOUND_METADATA) + 5 en
// réserve pack Ambiances (isPremium: true) — cf. structure 4+8 visée à terme.
// Le câblage du gating premium lui-même est un chantier séparé (3b) ; ici,
// isPremium n'est qu'une donnée.
export const SOUND_FILES = {
  // Gratuits — un par famille (suggestedColor des activités)
  'jingle_achievement': require('../../assets/sounds/270404__littlerobotsoundfactory__jingle-achievement.wav'),
  'singing_bowl': require('../../assets/sounds/271370__inoshirodesign__singing-bowl-strike.wav'),
  'contrabass_pluck': require('../../assets/sounds/373053__sgossner__contrabass-pizzicato-c2.wav'),
  'kalimba': require('../../assets/sounds/331047__foochie_foochie__kalimba-c-note.wav'),

  // Ambiances (premium, données seulement — pas de gating ici)
  'vibraphone_chord': require('../../assets/sounds/495674__jack_urbanski__vibraphone-chord.wav'),
  'marimba_dry': require('../../assets/sounds/577692__joesh2__marimba-c3.wav'),
  'marimba_ascending': require('../../assets/sounds/401722__pogmothoin__marimba-ascending.wav'),
  'up_chime': require('../../assets/sounds/352666__foolboymedia__up-chime-2.wav'),
  'success_glissando': require('../../assets/sounds/109662__grunz__success.wav'),
};

// Métadonnées des sons (nom affiché, durée, emoji, famille, gating)
// Les noms utilisent des getters pour supporter i18n dynamique
// family = même vocabulaire que suggestedColor des activités (calm/deep/focus/energy)
export const SOUND_METADATA = {
  'jingle_achievement': {
    get name() { return i18n.t('sounds.jingle_achievement'); },
    duration: '4s',
    emoji: '🏆',
    family: 'energy',
    isPremium: false
  },
  'singing_bowl': {
    get name() { return i18n.t('sounds.singing_bowl'); },
    duration: '6s',
    emoji: '🔔',
    family: 'calm',
    isPremium: false
  },
  'contrabass_pluck': {
    get name() { return i18n.t('sounds.contrabass_pluck'); },
    duration: '2s',
    emoji: '🎻',
    family: 'deep',
    isPremium: false
  },
  'kalimba': {
    get name() { return i18n.t('sounds.kalimba'); },
    duration: '4s',
    emoji: '🎶',
    family: 'focus',
    isPremium: false
  },
  'vibraphone_chord': {
    get name() { return i18n.t('sounds.vibraphone_chord'); },
    duration: '2s',
    emoji: '✨',
    family: 'calm',
    isPremium: true
  },
  'marimba_dry': {
    get name() { return i18n.t('sounds.marimba_dry'); },
    duration: '2s',
    emoji: '🪵',
    family: 'deep',
    isPremium: true
  },
  'marimba_ascending': {
    get name() { return i18n.t('sounds.marimba_ascending'); },
    duration: '4s',
    emoji: '🎼',
    family: 'focus',
    isPremium: true
  },
  'up_chime': {
    get name() { return i18n.t('sounds.up_chime'); },
    duration: '1s',
    emoji: '🎵',
    family: 'energy',
    isPremium: true
  },
  'success_glissando': {
    get name() { return i18n.t('sounds.success_glissando'); },
    duration: '1s',
    emoji: '🌟',
    family: 'energy',
    isPremium: true
  },
};

// Son par défaut — jingle d'accomplissement, gratuit, universel (pas
// spécifique à une famille contemplative comme le bol ou la contrebasse)
export const DEFAULT_SOUND_ID = 'jingle_achievement';

// Fichiers déclarés dans app.json (plugin expo-notifications, clé `sounds`) —
// nécessaires pour référencer un son custom depuis une NOTIFICATION native.
// Le require() de SOUND_FILES ci-dessus ne donne qu'un id d'asset Metro (pour
// la lecture audio en direct via expo-audio) ; l'API notifications a besoin
// du nom de fichier tel que packagé nativement. Garder synchronisé avec
// app.json → plugins → expo-notifications → sounds ET avec assets/sounds/
// (Lot 3e, fix packaging custom-sound, finding C2).
export const NOTIFICATION_SOUND_FILES = {
  jingle_achievement: '270404__littlerobotsoundfactory__jingle-achievement.wav',
  singing_bowl: '271370__inoshirodesign__singing-bowl-strike.wav',
  contrabass_pluck: '373053__sgossner__contrabass-pizzicato-c2.wav',
  kalimba: '331047__foochie_foochie__kalimba-c-note.wav',
  vibraphone_chord: '495674__jack_urbanski__vibraphone-chord.wav',
  marimba_dry: '577692__joesh2__marimba-c3.wav',
  marimba_ascending: '401722__pogmothoin__marimba-ascending.wav',
  up_chime: '352666__foolboymedia__up-chime-2.wav',
  success_glissando: '109662__grunz__success.wav',
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

// Helper pour obtenir les sons par famille (calm/deep/focus/energy)
export const getSoundsByFamily = () => {
  const families = {
    calm: [],
    deep: [],
    focus: [],
    energy: []
  };

  Object.keys(SOUND_FILES).forEach(id => {
    const sound = {
      id,
      file: SOUND_FILES[id],
      ...SOUND_METADATA[id]
    };
    const family = SOUND_METADATA[id]?.family;
    if (families[family]) families[family].push(sound);
  });

  return families;
};
