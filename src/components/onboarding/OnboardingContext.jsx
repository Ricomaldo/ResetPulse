// src/components/onboarding/OnboardingContext.jsx
import { createContext, useContext } from 'react';

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
export const TOOLTIPS_CONFIG = [
  {
    id: 'activities',
    text: 'Sélectionnez votre activité',
    arrowDirection: 'up',
  },
  {
    id: 'dial',
    text: 'Ajustez la durée du timer',
    arrowDirection: 'down',
  },
  {
    id: 'palette',
    text: 'Changez les couleurs à votre guise',
    arrowDirection: 'down',
  },
  {
    id: 'controls',
    text: 'Démarrez, mettez en pause, ou réinitialisez',
    subtext: 'Le timer continue en arrière-plan',
    arrowDirection: 'down',
  },
  {
    id: 'completion',
    text: 'Profitez bien de ResetPulse !',
    subtext: null,
    arrowDirection: null, // Centered message, no target
  },
];
