// src/config/activities.js

export const ACTIVITIES = [
  {
    id: 'meditation',
    emoji: '🧘',
    label: 'Méditation',
    defaultDuration: 1200, // 20 minutes
    isPremium: false,
    suggestedColor: 'calm',
    description: 'Sessions de méditation guidée'
  },
  {
    id: 'reading',
    emoji: '📖',
    label: 'Lecture',
    defaultDuration: 1800, // 30 minutes
    isPremium: false,
    suggestedColor: 'focus',
    description: 'Focus lecture profonde'
  },
  {
    id: 'breathing',
    emoji: '🌬️',
    label: 'Respiration',
    defaultDuration: 240, // 4 minutes
    isPremium: false,
    suggestedColor: 'energy',
    description: 'Exercices de respiration'
  },
  {
    id: 'work',
    emoji: '💼',
    label: 'Travail',
    defaultDuration: 1500, // 25 minutes (Pomodoro)
    isPremium: false,
    suggestedColor: 'deep',
    description: 'Sessions de travail concentré'
  },
  // Premium activities
  {
    id: 'sport',
    emoji: '💪',
    label: 'Sport',
    defaultDuration: 600, // 10 minutes
    isPremium: true,
    suggestedColor: 'energy',
    description: 'Étirements et exercices courts'
  },
  {
    id: 'creativity',
    emoji: '🎨',
    label: 'Créativité',
    defaultDuration: 2700, // 45 minutes
    isPremium: true,
    suggestedColor: 'focus',
    description: 'Dessin, écriture libre'
  },
  {
    id: 'break',
    emoji: '☕',
    label: 'Pause',
    defaultDuration: 900, // 15 minutes
    isPremium: true,
    suggestedColor: 'calm',
    description: 'Vraie déconnexion'
  },
  {
    id: 'walking',
    emoji: '🚶',
    label: 'Marche',
    defaultDuration: 1200, // 20 minutes
    isPremium: true,
    suggestedColor: 'deep',
    description: 'Mouvement conscient'
  }
];

// Get only free activities
export const getFreeActivities = () =>
  ACTIVITIES.filter(activity => !activity.isPremium);

// Get all activities (always show all, but lock premium ones)
export const getAllActivities = () => ACTIVITIES;

// Get activity by ID
export const getActivityById = (id) =>
  ACTIVITIES.find(activity => activity.id === id);

// Get default activity
export const getDefaultActivity = () =>
  ACTIVITIES.find(activity => activity.id === 'breathing');