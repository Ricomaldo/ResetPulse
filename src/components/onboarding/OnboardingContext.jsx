// src/components/onboarding/OnboardingContext.jsx
import { createContext, useContext } from 'react';
import i18n from '../../i18n';

// Context pour l'onboarding
export const OnboardingContext = createContext(null);

// Hook pour utiliser le contexte onboarding
export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within OnboardingProvider');
  }
  return context;
}

// Tooltips configuration - Séquence: 1→2→3→4→5 (découverte progressive)
// Ordre optimisé pour permettre l'interaction pendant l'onboarding
// Using i18n directly here since this is a constant, not a component
export const TOOLTIPS_CONFIG = [
  {
    id: 'activities',
    get text() { return i18n.t('onboarding.activities'); },
    arrowDirection: 'up',
  },
  {
    id: 'dial',
    get text() { return i18n.t('onboarding.dial'); },
    arrowDirection: 'down',
  },
  {
    id: 'palette',
    get text() { return i18n.t('onboarding.palette'); },
    arrowDirection: 'down',
  },
  {
    id: 'controls',
    get text() { return i18n.t('onboarding.controls'); },
    get subtext() { return i18n.t('onboarding.controlsSubtext'); },
    arrowDirection: 'down',
  },
  {
    id: 'completion',
    get text() { return i18n.t('onboarding.completion'); },
    subtext: null,
    arrowDirection: null, // Centered message, no target
  },
];
