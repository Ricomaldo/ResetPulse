// src/config/soundsMapping.js
// Mapping centralisé des sons pour faciliter les changements futurs
import i18n from '../i18n';

// Mapping des fichiers audio
// Clé = identifiant interne stable
// Valeur = require() du fichier audio
export const SOUND_FILES = {
  // Son recommandé (par défaut)
  'timer_complete': require('../../assets/sounds/634089__aj_heels__timercomplete01.wav'),

  // Sons de minuteur cuisine — 4 survivants de la sélection d'origine (retour Eric, curation sons)
  'microwave_ping': require('../../assets/sounds/609725__theplax__microwave-ping.wav'),
  'kitchen_timer': require('../../assets/sounds/149506__dland__kitchen-timer-done.wav'),
  'toaster_bell': require('../../assets/sounds/564623__azumarill__toaster-oven-or-liftelevator-bell.wav'),
};

// Métadonnées des sons (nom affiché, durée, emoji)
// Les noms utilisent des getters pour supporter i18n dynamique
export const SOUND_METADATA = {
  'timer_complete': {
    get name() { return i18n.t('sounds.timer_complete'); },
    duration: '2s',
    emoji: '🏁',
    category: 'modern'
  },
  'microwave_ping': {
    get name() { return i18n.t('sounds.microwave_ping'); },
    duration: '1s',
    emoji: '📍',
    category: 'kitchen'
  },
  'kitchen_timer': {
    get name() { return i18n.t('sounds.kitchen_timer'); },
    duration: '1s',
    emoji: '🛎️',
    category: 'kitchen'
  },
  'toaster_bell': {
    get name() { return i18n.t('sounds.toaster_bell'); },
    duration: '1s',
    emoji: '💫',
    category: 'kitchen'
  },
};

// Son par défaut
export const DEFAULT_SOUND_ID = 'timer_complete';

// Fichiers déclarés dans app.json (plugin expo-notifications, clé `sounds`) —
// nécessaires pour référencer un son custom depuis une NOTIFICATION native.
// Le require() de SOUND_FILES ci-dessus ne donne qu'un id d'asset Metro (pour
// la lecture audio en direct via expo-audio) ; l'API notifications a besoin
// du nom de fichier tel que packagé nativement. Garder synchronisé avec
// app.json → plugins → expo-notifications → sounds ET avec assets/sounds/
// (Lot 3e, fix packaging custom-sound, finding C2).
export const NOTIFICATION_SOUND_FILES = {
  timer_complete: '634089__aj_heels__timercomplete01.wav',
  microwave_ping: '609725__theplax__microwave-ping.wav',
  kitchen_timer: '149506__dland__kitchen-timer-done.wav',
  toaster_bell: '564623__azumarill__toaster-oven-or-liftelevator-bell.wav',
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

// Helper pour obtenir les sons par catégorie
export const getSoundsByCategory = () => {
  const categories = {
    classic: [],
    kitchen: [],
    modern: []
  };

  Object.keys(SOUND_FILES).forEach(id => {
    const sound = {
      id,
      file: SOUND_FILES[id],
      ...SOUND_METADATA[id]
    };
    const category = SOUND_METADATA[id]?.category || 'modern';
    categories[category].push(sound);
  });

  return categories;
};