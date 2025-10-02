// src/components/onboarding/OnboardingController.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { usePersistedState } from '../../hooks/usePersistedState';
import Tooltip from './Tooltip';
import HighlightOverlay from './HighlightOverlay';

// Context pour l'onboarding
const OnboardingContext = createContext(null);

// Tooltips configuration - Séquence: 1→2→3→4 (découverte progressive)
// Ordre optimisé pour permettre l'interaction pendant l'onboarding
const TOOLTIPS_CONFIG = [
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
];

export function OnboardingProvider({ children }) {
  const [onboardingCompleted, setOnboardingCompleted] = usePersistedState(
    '@ResetPulse:onboardingCompleted',
    false
  );

  const [currentTooltip, setCurrentTooltip] = useState(null);
  const [tooltipPositions, setTooltipPositions] = useState({});
  const [tooltipBounds, setTooltipBounds] = useState({});
  const [highlightedElement, setHighlightedElement] = useState(null);

  // Register tooltip target positions and bounds
  const registerTooltipTarget = (id, position, bounds = null) => {
    setTooltipPositions(prev => ({
      ...prev,
      [id]: position
    }));
    if (bounds) {
      setTooltipBounds(prev => ({
        ...prev,
        [id]: bounds
      }));
    }
  };

  // Start onboarding tooltips
  const startTooltips = () => {
    if (!onboardingCompleted || __DEV__) {
      setCurrentTooltip(0);
      setHighlightedElement(TOOLTIPS_CONFIG[0].id);
    }
  };

  // Next tooltip
  const nextTooltip = () => {
    if (currentTooltip < TOOLTIPS_CONFIG.length - 1) {
      const nextIndex = currentTooltip + 1;
      setCurrentTooltip(nextIndex);
      setHighlightedElement(TOOLTIPS_CONFIG[nextIndex].id);
    } else {
      completeOnboarding();
    }
  };

  // Skip all tooltips
  const skipAll = () => {
    completeOnboarding();
  };

  // Complete onboarding
  const completeOnboarding = () => {
    setCurrentTooltip(null);
    setHighlightedElement(null);
    setOnboardingCompleted(true);
  };

  // Reset onboarding (for dev)
  const resetOnboarding = () => {
    setOnboardingCompleted(false);
    setCurrentTooltip(null);
  };

  const value = {
    onboardingCompleted,
    currentTooltip,
    tooltipPositions,
    tooltipBounds,
    highlightedElement,
    registerTooltipTarget,
    startTooltips,
    nextTooltip,
    skipAll,
    completeOnboarding,
    resetOnboarding,
  };

  // Current tooltip config
  const currentTooltipConfig = currentTooltip !== null ? TOOLTIPS_CONFIG[currentTooltip] : null;
  const currentPosition = currentTooltipConfig ? tooltipPositions[currentTooltipConfig.id] : null;
  const currentBounds = currentTooltipConfig ? tooltipBounds[currentTooltipConfig.id] : null;

  return (
    <OnboardingContext.Provider value={value}>
      {/* App content - base layer */}
      {children}

      {/* Highlight overlay - visual only, no touch blocking */}
      <HighlightOverlay
        highlightedElement={highlightedElement}
        targetBounds={currentBounds}
      />

      {/* Tooltip - on top of everything */}
      {currentTooltipConfig && currentPosition && (
        <Tooltip
          text={currentTooltipConfig.text}
          subtext={currentTooltipConfig.subtext}
          position={currentPosition}
          arrowDirection={currentTooltipConfig.arrowDirection}
          isLast={currentTooltip === TOOLTIPS_CONFIG.length - 1}
          onNext={nextTooltip}
          onSkipAll={skipAll}
        />
      )}
    </OnboardingContext.Provider>
  );
}

// Hook to use onboarding
export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within OnboardingProvider');
  }
  return context;
}

// Export tooltip IDs for easy reference
export const TOOLTIP_IDS = {
  ACTIVITIES: 'activities',
  DIAL: 'dial',
  PALETTE: 'palette',
  CONTROLS: 'controls',
};
