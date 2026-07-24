/**
 * @fileoverview activities - Central activity definitions
 * @description All activities with metadata: emoji, duration, messages, etc.
 *
 * IMPORTANT: Message Linkage
 * Each activity ID (e.g. 'work', 'meditation') maps to timerMessages in i18n locales.
 * The mapping is explicit in: src/config/activityMessages.js
 *
 * Example:
 *   - Activity ID: 'work'
 *   - Start message: timerMessages.work.startMessage ("Focus")
 *   - End message: timerMessages.work.endMessage ("Accompli ✨")
 *
 * To add a new activity:
 *   1. Add entry to ACTIVITIES array here
 *   2. Add corresponding entry to ACTIVITY_MESSAGE_KEYS in activityMessages.js
 *   3. Add translations in locales/en.json, fr.json, etc. (timerMessages section)
 */

// src/config/activities.js
import i18n from '../i18n';

export const ACTIVITIES = [
  // ===== FREE ACTIVITIES (3 total) — asymétrie assumée vs 4 couleurs (ADR-014) =====
  {
    id: 'work',
    emoji: '💻',
    get label() {
      return i18n.t('activities.work');
    },
    defaultDuration: 1800, // 30 minutes (aligned with 5 scales, closest to Pomodoro)
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
    defaultDuration: 900, // 15 minutes (aligned with 5 scales)
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
    isPremium: true, // PREMIUM - Onboarding v2.1 freemium strategy
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
    defaultDuration: 900, // 15 minutes (aligned with 5 scales)
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
    defaultDuration: 900, // 15 minutes (aligned with 5 scales)
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
    defaultDuration: 900, // 15 minutes (aligned with 5 scales)
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
    defaultDuration: 900, // 15 minutes (aligned with 5 scales) - cycle sieste optimal
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
    defaultDuration: 900, // 15 minutes (aligned with 5 scales) - morning pages
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

// Get default activity — première des activités gratuites (« none » retiré, ADR-014)
export const getDefaultActivity = () => getFreeActivities()[0];

// Check if an activity is custom (created by user)
export const isCustomActivity = (activity) => activity?.isCustom === true;

// Get activity by ID (checks built-in activities only)
// For custom activities, use useCustomActivities hook
export const isBuiltInActivity = (activity) => !activity?.isCustom;
