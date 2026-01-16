// src/config/soundsMapping.js
// Mapping centralisé des sons pour faciliter les changements futurs
import i18n from '../i18n';

// Mapping des fichiers audio
// Clé = identifiant interne stable
// Valeur = require() du fichier audio
export const SOUND_FILES = {
  // Son recommandé (par défaut)
  'timer_complete': require('../../assets/sounds/634089__aj_heels__timercomplete01.wav'),

  // Sons de cloche
  'bell_classic': require('../../assets/sounds/bell_short.wav'),
  'bell_melodic': require('../../assets/sounds/815533__mihacappy__bell01.wav'),

  // Sons de minuteur cuisine
  'microwave_vintage': require('../../assets/sounds/135873__crz1990__vintage-microwave-timer-bell-ring-26-november-2011-113900-pm.wav'),
  'microwave_ping': require('../../assets/sounds/609725__theplax__microwave-ping.wav'),
  'kitchen_timer': require('../../assets/sounds/149506__dland__kitchen-timer-done.wav'),
  'kitchen_timer_2': require('../../assets/sounds/204103__maphill__kitchen-timer.wav'),
  'egg_timer': require('../../assets/sounds/490326__knufds__bell-egg-timer.wav'),
  'toaster_bell': require('../../assets/sounds/564623__azumarill__toaster-oven-or-liftelevator-bell.wav'),

  // Sons génériques
  'ding_effect': require('../../assets/sounds/615949__julesv4__ding-effect.wav'),
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
  'bell_classic': {
    get name() { return i18n.t('sounds.bell_classic'); },
    duration: '2s',
    emoji: '🔔',
    category: 'classic'
  },
  'bell_melodic': {
    get name() { return i18n.t('sounds.bell_melodic'); },
    duration: '2s',
    emoji: '🎶',
    category: 'classic'
  },
  'microwave_vintage': {
    get name() { return i18n.t('sounds.microwave_vintage'); },
    duration: '3s',
    emoji: '📻',
    category: 'kitchen'
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
  'kitchen_timer_2': {
    get name() { return i18n.t('sounds.kitchen_timer_2'); },
    duration: '2s',
    emoji: '📢',
    category: 'kitchen'
  },
  'egg_timer': {
    get name() { return i18n.t('sounds.egg_timer'); },
    duration: '1s',
    emoji: '🎯',
    category: 'kitchen'
  },
  'toaster_bell': {
    get name() { return i18n.t('sounds.toaster_bell'); },
    duration: '1s',
    emoji: '💫',
    category: 'kitchen'
  },
  'ding_effect': {
    get name() { return i18n.t('sounds.ding_effect'); },
    duration: '1s',
    emoji: '✨',
    category: 'modern'
  },
};

// Son par défaut
export const DEFAULT_SOUND_ID = 'timer_complete';

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