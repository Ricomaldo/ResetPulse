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
    pulseDuration: 800, // Vitesse normale
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
    pulseDuration: 600, // Rapide - focus intense
  },
  {
    id: "break",
    emoji: "☕",
    label: "Pause",
    defaultDuration: 900, // 15 minutes
    isPremium: false, // Complète le Pomodoro
    suggestedColor: "calm",
    description: "Vraie déconnexion",
    pulseDuration: 1000, // Plus lent - repos
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
    pulseDuration: 500, // Très rapide - énergie
  },
  {
    id: "study",
    emoji: "📚",
    label: "Étude",
    defaultDuration: 2700, // 45 minutes
    isPremium: true,
    pulseDuration: 700, // Modéré-rapide
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
    pulseDuration: 900, // Lent - concentration calme
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
    pulseDuration: 1100, // Très lent - flow
  },
  {
    id: "meditation",
    emoji: "🧘",
    label: "Méditation",
    defaultDuration: 1200, // 20 minutes
    isPremium: true, // Toute la verticale mindfulness devient premium
    suggestedColor: "calm",
    description: "Sessions de méditation guidée",
    pulseDuration: 1200, // Très lent - calme profond
  },
  {
    id: "breathing",
    emoji: "🌬️",
    label: "Respiration",
    defaultDuration: 240, // 4 minutes
    isPremium: false, // Gratuit - ancrage neuroatypique baseline
    suggestedColor: "energy",
    description: "Exercices de respiration",
    pulseDuration: 900, // Lent - respiration contrôlée
  },
  {
    id: "walking",
    emoji: "🚶",
    label: "Marche",
    defaultDuration: 1200, // 20 minutes
    isPremium: true,
    suggestedColor: "deep",
    description: "Mouvement conscient",
    pulseDuration: 800, // Normal - rythme naturel
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
    pulseDuration: 750, // Modéré - flow créatif
  },
  {
    id: "cooking",
    emoji: "👨‍🍳",
    label: "Cuisine",
    defaultDuration: 1800, // 30 minutes
    isPremium: true,
    suggestedColor: "energy",
    description: "Préparation de repas",
    pulseDuration: 700, // Modéré-rapide - activité
  },
  {
    id: "gaming",
    emoji: "🎮",
    label: "Jeux",
    defaultDuration: 1200, // 20 minutes
    isPremium: true,
    suggestedColor: "energy",
    description: "Temps d'écran contrôlé",
    pulseDuration: 550, // Rapide - attention soutenue
  },
  {
    id: "homework",
    emoji: "✏️",
    label: "Devoirs",
    defaultDuration: 1800, // 30 minutes
    isPremium: true,
    suggestedColor: "focus",
    description: "Aide aux devoirs",
    pulseDuration: 650, // Rapide - concentration
  },
  {
    id: "music",
    emoji: "🎵",
    label: "Musique",
    defaultDuration: 1800, // 30 minutes
    isPremium: true,
    suggestedColor: "calm",
    description: "Pratique instrumentale",
    pulseDuration: 850, // Lent - flow musical
  },
  {
    id: "cleaning",
    emoji: "🧹",
    label: "Ménage",
    defaultDuration: 900, // 15 minutes
    isPremium: true,
    pulseDuration: 700, // Modéré-rapide - activité physique
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