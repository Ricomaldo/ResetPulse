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
export const getJourneyScenarios = (needs = [], colors, t) => {
  const hasMeditation = needs.includes('meditation');
  const hasWork = needs.includes('work');
  const hasCreativity = needs.includes('creativity');
  const hasNeuro = needs.includes('neurodivergent');

  return [
    {
      emoji: '\u{1F305}',
      label: t('onboarding.v2.filter4.morning'),
      sublabel: hasMeditation
        ? t('onboarding.v2.filter4.morningMeditation')
        : hasNeuro
        ? t('onboarding.v2.filter4.morningNeuro')
        : t('onboarding.v2.filter4.morningGentle'),
      color: colors?.success || '#6B8E23',
    },
    {
      emoji: '\u{1F4BC}',
      label: t('onboarding.v2.filter4.day'),
      sublabel: hasWork
        ? t('onboarding.v2.filter4.dayWork')
        : hasNeuro
        ? t('onboarding.v2.filter4.dayNeuro')
        : t('onboarding.v2.filter4.dayFocus'),
      color: colors?.accent || '#FF6B6B',
    },
    {
      emoji: '\u2615',
      label: t('onboarding.v2.filter4.break'),
      sublabel: hasNeuro
        ? t('onboarding.v2.filter4.breakNeuro')
        : t('onboarding.v2.filter4.breakRelax'),
      color: colors?.primary || '#8B7355',
    },
    {
      emoji: '\u{1F319}',
      label: t('onboarding.v2.filter4.evening'),
      sublabel: hasCreativity
        ? t('onboarding.v2.filter4.eveningCreative')
        : hasMeditation
        ? t('onboarding.v2.filter4.eveningMeditation')
        : t('onboarding.v2.filter4.eveningRelax'),
      color: colors?.info || '#4ECDC4',
    },
  ];
};

// Durées disponibles
export const DURATION_OPTIONS = [5, 10, 15, 20, 25, 30, 45, 60];

// Step names pour analytics
export const STEP_NAMES = [
  'opening',
  'needs',
  'creation',
  'test',
  'vision',
  'paywall',
];
