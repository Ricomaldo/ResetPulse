// src/constants/onboarding.js
// Constantes pour l'onboarding V2

import { Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

// Responsive sizing
const BASE_WIDTH = 390;
export const rs = (size) => Math.round((size * width) / BASE_WIDTH);

// Free activities pour l'onboarding (subset de activities.js)
export const FREE_ACTIVITIES = [
  { id: 'work', emoji: '\u{1F4BB}', label: 'Travail', defaultDuration: 25 },
  { id: 'break', emoji: '\u2615', label: 'Pause', defaultDuration: 15 },
  { id: 'meditation', emoji: '\u{1F9D8}', label: 'Méditation', defaultDuration: 20 },
  { id: 'creativity', emoji: '\u{1F3A8}', label: 'Créativité', defaultDuration: 45 },
];

// Needs options pour Filter1
export const NEEDS_OPTIONS = [
  { id: 'meditation', emoji: '\u{1F9D8}', labelKey: 'onboarding.needs.meditation' },
  { id: 'work', emoji: '\u{1F4BC}', labelKey: 'onboarding.needs.work' },
  { id: 'creativity', emoji: '\u{1F3A8}', labelKey: 'onboarding.needs.creativity' },
  { id: 'time', emoji: '\u23F1\uFE0F', labelKey: 'onboarding.needs.time' },
  { id: 'neurodivergent', emoji: '\u{1F9E0}', labelKey: 'onboarding.needs.neurodivergent' },
];

// Smart defaults selon les needs sélectionnés
export const getSmartDefaults = (needs, freePalettes) => {
  const defaultPalette = freePalettes[0] || 'terre';

  if (needs.includes('meditation')) {
    return { duration: 20, palette: defaultPalette, colorIndex: 2 };
  }
  if (needs.includes('work')) {
    return { duration: 25, palette: freePalettes[1] || defaultPalette, colorIndex: 0 };
  }
  if (needs.includes('creativity')) {
    return { duration: 45, palette: freePalettes[1] || defaultPalette, colorIndex: 1 };
  }
  if (needs.includes('time')) {
    return { duration: 15, palette: defaultPalette, colorIndex: 0 };
  }
  if (needs.includes('neurodivergent')) {
    return { duration: 25, palette: freePalettes[1] || defaultPalette, colorIndex: 0 };
  }
  return { duration: 15, palette: defaultPalette, colorIndex: 0 };
};

// Journey scenarios pour Filter4 (adaptés selon needs)
export const getJourneyScenarios = (needs = [], colors) => {
  const hasMeditation = needs.includes('meditation');
  const hasWork = needs.includes('work');
  const hasCreativity = needs.includes('creativity');
  const hasNeuro = needs.includes('neurodivergent');

  return [
    {
      emoji: '\u{1F305}',
      label: 'Matin',
      sublabel: hasMeditation ? 'Méditation 20min' : hasNeuro ? 'Ancrage 5min' : 'Réveil en douceur 10min',
      color: colors?.success || '#6B8E23',
    },
    {
      emoji: '\u{1F4BC}',
      label: 'Journée',
      sublabel: hasWork ? 'Focus Pomodoro 25min' : hasNeuro ? 'Sprints courts 15min' : 'Concentration 30min',
      color: colors?.accent || '#FF6B6B',
    },
    {
      emoji: '\u2615',
      label: 'Pause',
      sublabel: hasNeuro ? 'Reset sensoriel 5min' : 'Déconnexion 15min',
      color: colors?.primary || '#8B7355',
    },
    {
      emoji: '\u{1F319}',
      label: 'Soir',
      sublabel: hasCreativity ? 'Créativité libre 45min' : hasMeditation ? 'Relaxation 15min' : 'Décompression 20min',
      color: colors?.info || '#4ECDC4',
    },
  ];
};

// Durées disponibles
export const DURATION_OPTIONS = [5, 10, 15, 20, 25, 30, 45, 60];
