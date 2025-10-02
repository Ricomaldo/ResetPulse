// src/config/activities.js

export const ACTIVITIES = [
  // Basic timer - always first
  {
    id: "none",
    emoji: "",
    label: "Basique",
    defaultDuration: 2700, // 45 minutes
    isPremium: false,
    suggestedColor: "calm",
    description: "Timer simple sans activité",
  },

  // Free activities - Pomodoro cycle complet + diversité
  {
    id: "work",
    emoji: "💻",
    label: "Travail",
    defaultDuration: 1500, // 25 minutes (Pomodoro)
    isPremium: false,
    suggestedColor: "deep",
    description: "Sessions de travail concentré",
  },
  {
    id: "break",
    emoji: "☕",
    label: "Pause",
    defaultDuration: 900, // 15 minutes
    isPremium: false, // Complète le Pomodoro
    suggestedColor: "calm",
    description: "Vraie déconnexion",
  },

  // Premium - Bien-être physique
  {
    id: "sport",
    emoji: "💪",
    label: "Sport",
    defaultDuration: 600, // 10 minutes
    isPremium: true,
    suggestedColor: "energy",
    description: "Étirements et exercices courts",
  },
  {
    id: "study",
    emoji: "📚",
    label: "Étude",
    defaultDuration: 2700, // 45 minutes
    isPremium: true,
    suggestedColor: "focus",
    description: "Sessions d'apprentissage",
  },

  // Free - Autre verticale utile
  {
    id: "reading",
    emoji: "📖",
    label: "Lecture",
    defaultDuration: 1800, // 30 minutes
    isPremium: false, // Montre la diversité
    suggestedColor: "focus",
    description: "Focus lecture profonde",
  },

  // Premium - Mindfulness verticale bloquée
  {
    id: "yoga",
    emoji: "🧘‍♀️",
    label: "Yoga",
    defaultDuration: 900, // 15 minutes
    isPremium: true,
    suggestedColor: "calm",
    description: "Étirements et postures",
  },
  {
    id: "meditation",
    emoji: "🧘",
    label: "Méditation",
    defaultDuration: 1200, // 20 minutes
    isPremium: true, // Toute la verticale mindfulness devient premium
    suggestedColor: "calm",
    description: "Sessions de méditation guidée",
  },
  {
    id: "breathing",
    emoji: "🌬️",
    label: "Respiration",
    defaultDuration: 240, // 4 minutes
    isPremium: true, // Toute la verticale mindfulness devient premium
    suggestedColor: "energy",
    description: "Exercices de respiration",
  },
  {
    id: "walking",
    emoji: "🚶",
    label: "Marche",
    defaultDuration: 1200, // 20 minutes
    isPremium: true,
    suggestedColor: "deep",
    description: "Mouvement conscient",
  },

  // Premium - Autres activités
  {
    id: "creativity",
    emoji: "🎨",
    label: "Créativité",
    defaultDuration: 2700, // 45 minutes
    isPremium: true,
    suggestedColor: "focus",
    description: "Dessin, écriture libre",
  },
  {
    id: "cooking",
    emoji: "👨‍🍳",
    label: "Cuisine",
    defaultDuration: 1800, // 30 minutes
    isPremium: true,
    suggestedColor: "energy",
    description: "Préparation de repas",
  },
  {
    id: "gaming",
    emoji: "🎮",
    label: "Jeux",
    defaultDuration: 1200, // 20 minutes
    isPremium: true,
    suggestedColor: "energy",
    description: "Temps d'écran contrôlé",
  },
  {
    id: "homework",
    emoji: "✏️",
    label: "Devoirs",
    defaultDuration: 1800, // 30 minutes
    isPremium: true,
    suggestedColor: "focus",
    description: "Aide aux devoirs",
  },
  {
    id: "music",
    emoji: "🎵",
    label: "Musique",
    defaultDuration: 1800, // 30 minutes
    isPremium: true,
    suggestedColor: "calm",
    description: "Pratique instrumentale",
  },
  {
    id: "cleaning",
    emoji: "🧹",
    label: "Ménage",
    defaultDuration: 900, // 15 minutes
    isPremium: true,
    suggestedColor: "energy",
    description: "Tâches ménagères",
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
  ACTIVITIES.find((activity) => activity.id === "none");