// src/config/activities.js
import i18n from '../i18n';

export const ACTIVITIES = [
  // Basic timer - always first
  {
    id: 'none',
    emoji: '',
    get label() {
      return i18n.t('activities.none');
    },
    defaultDuration: 2700, // 45 minutes
    isPremium: false,
    suggestedColor: 'calm',
    description: 'Timer simple sans activité',
    pulseDuration: 800, // Vitesse normale
  },

  // ===== FREE ACTIVITIES (4 total) =====
  {
    id: 'work',
    emoji: '💻',
    get label() {
      return i18n.t('activities.work');
    },
    defaultDuration: 1500, // 25 minutes (Pomodoro)
    isPremium: false,
    suggestedColor: 'deep',
    description: 'Sessions de travail concentré',
    pulseDuration: 600, // Rapide - focus intense
  },
  {
    id: 'break',
    emoji: '☕',
    get label() {
      return i18n.t('activities.break');
    },
    defaultDuration: 900, // 15 minutes
    isPremium: false, // Complète le Pomodoro
    suggestedColor: 'calm',
    description: 'Vraie déconnexion',
    pulseDuration: 1000, // Plus lent - repos
  },
  {
    id: 'meditation',
    emoji: '🧘',
    get label() {
      return i18n.t('activities.meditation');
    },
    defaultDuration: 1200, // 20 minutes
    isPremium: false, // FREE - ancrage bien-être
    suggestedColor: 'calm',
    description: 'Sessions de méditation guidée',
    pulseDuration: 1200, // Très lent - calme profond
  },
  {
    id: 'creativity',
    emoji: '🎨',
    get label() {
      return i18n.t('activities.creativity');
    },
    defaultDuration: 2700, // 45 minutes
    isPremium: false, // FREE - activité créative de base
    suggestedColor: 'focus',
    description: 'Dessin, écriture libre',
    pulseDuration: 750, // Modéré - flow créatif
  },

  // ===== PREMIUM ACTIVITIES (14 total) =====
  {
    id: 'reading',
    emoji: '📖',
    get label() {
      return i18n.t('activities.reading');
    },
    defaultDuration: 1800, // 30 minutes
    isPremium: true,
    suggestedColor: 'focus',
    description: 'Focus lecture profonde',
    pulseDuration: 900, // Lent - concentration calme
  },
  {
    id: 'study',
    emoji: '📚',
    get label() {
      return i18n.t('activities.study');
    },
    defaultDuration: 2700, // 45 minutes
    isPremium: true,
    pulseDuration: 700, // Modéré-rapide
    suggestedColor: 'focus',
    description: "Sessions d'apprentissage",
  },
  {
    id: 'yoga',
    emoji: '🧘‍♀️',
    get label() {
      return i18n.t('activities.yoga');
    },
    defaultDuration: 900, // 15 minutes
    isPremium: true,
    suggestedColor: 'calm',
    description: 'Étirements et postures',
    pulseDuration: 1100, // Très lent - flow
  },
  {
    id: 'sport',
    emoji: '💪',
    get label() {
      return i18n.t('activities.sport');
    },
    defaultDuration: 600, // 10 minutes
    isPremium: true,
    suggestedColor: 'energy',
    description: 'Étirements et exercices courts',
    pulseDuration: 500, // Très rapide - énergie
  },
  {
    id: 'walking',
    emoji: '🚶',
    get label() {
      return i18n.t('activities.walking');
    },
    defaultDuration: 1200, // 20 minutes
    isPremium: true,
    suggestedColor: 'deep',
    description: 'Mouvement conscient',
    pulseDuration: 800, // Normal - rythme naturel
  },

  // Premium - Autres activités
  {
    id: 'cooking',
    emoji: '👨‍🍳',
    get label() {
      return i18n.t('activities.cooking');
    },
    defaultDuration: 1800, // 30 minutes
    isPremium: true,
    suggestedColor: 'energy',
    description: 'Préparation de repas',
    pulseDuration: 700, // Modéré-rapide - activité
  },
  {
    id: 'gaming',
    emoji: '🎮',
    get label() {
      return i18n.t('activities.gaming');
    },
    defaultDuration: 1200, // 20 minutes
    isPremium: true,
    suggestedColor: 'energy',
    description: "Temps d'écran contrôlé",
    pulseDuration: 550, // Rapide - attention soutenue
  },
  {
    id: 'homework',
    emoji: '✏️',
    get label() {
      return i18n.t('activities.homework');
    },
    defaultDuration: 1800, // 30 minutes
    isPremium: true,
    suggestedColor: 'focus',
    description: 'Aide aux devoirs',
    pulseDuration: 650, // Rapide - concentration
  },
  {
    id: 'music',
    emoji: '🎵',
    get label() {
      return i18n.t('activities.music');
    },
    defaultDuration: 1800, // 30 minutes
    isPremium: true,
    suggestedColor: 'calm',
    description: 'Pratique instrumentale',
    pulseDuration: 850, // Lent - flow musical
  },
  {
    id: 'cleaning',
    emoji: '🧹',
    get label() {
      return i18n.t('activities.cleaning');
    },
    defaultDuration: 900, // 15 minutes
    isPremium: true,
    pulseDuration: 700, // Modéré-rapide - activité physique
    suggestedColor: 'energy',
    description: 'Tâches ménagères',
  },
  {
    id: 'nap',
    emoji: '😴',
    get label() {
      return i18n.t('activities.nap');
    },
    defaultDuration: 1200, // 20 minutes - cycle sieste optimal
    isPremium: true,
    suggestedColor: 'calm',
    description: 'Power nap récupérateur',
    pulseDuration: 1300, // Très lent - sommeil léger
  },
  {
    id: 'writing',
    emoji: '✍️',
    get label() {
      return i18n.t('activities.writing');
    },
    defaultDuration: 1200, // 20 minutes - morning pages
    isPremium: true,
    suggestedColor: 'focus',
    description: 'Journaling, écriture libre',
    pulseDuration: 850, // Lent - introspection fluide
  },
];

// Get only free activities
export const getFreeActivities = () =>
  ACTIVITIES.filter((activity) => !activity.isPremium);

// Get all activities (always show all, but lock premium ones)
export const getAllActivities = () => ACTIVITIES;

// Get activity by ID
export const getActivityById = (id) =>
  ACTIVITIES.find((activity) => activity.id === id);

// Get default activity
export const getDefaultActivity = () =>
  ACTIVITIES.find((activity) => activity.id === 'none');

// Check if an activity is custom (created by user)
export const isCustomActivity = (activity) => activity?.isCustom === true;

// Get activity by ID (checks built-in activities only)
// For custom activities, use useCustomActivities hook
export const isBuiltInActivity = (activity) => !activity?.isCustom;
