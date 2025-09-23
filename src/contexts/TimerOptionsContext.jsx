// src/contexts/TimerOptionsContext.jsx
import React, { createContext, useContext } from 'react';
import { usePersistedObject } from '../hooks/usePersistedState';
import { getDefaultActivity } from '../config/activities';

const TimerOptionsContext = createContext(null);

export const TimerOptionsProvider = ({ children }) => {
  // Utiliser un seul objet persisté pour toutes les options
  const { values, updateValue, isLoading } = usePersistedObject(
    '@ResetPulse:timerOptions',
    {
      shouldPulse: false, // Animation de pulsation désactivée par défaut (conformité épilepsie)
      showActivities: true, // Affichage des activités activé par défaut
      clockwise: false,
      scaleMode: '60min',
      currentActivity: getDefaultActivity(),
      currentDuration: 300, // 5 minutes par défaut
      favoriteActivities: ['breathing', 'meditation', 'reading', 'work'], // Default favorites
    }
  );

  const value = {
    // States
    shouldPulse: values.shouldPulse,
    showActivities: values.showActivities,
    clockwise: values.clockwise,
    scaleMode: values.scaleMode,
    currentActivity: values.currentActivity,
    currentDuration: values.currentDuration,
    favoriteActivities: values.favoriteActivities,

    // Actions
    setShouldPulse: (val) => updateValue('shouldPulse', val),
    setShowActivities: (val) => updateValue('showActivities', val),
    setClockwise: (val) => updateValue('clockwise', val),
    setScaleMode: (val) => updateValue('scaleMode', val),
    setCurrentActivity: (val) => updateValue('currentActivity', val),
    setCurrentDuration: (val) => updateValue('currentDuration', val),
    setFavoriteActivities: (val) => updateValue('favoriteActivities', val),

    // Loading state
    isLoading
  };

  // Ne pas rendre les enfants tant que le chargement n'est pas terminé
  if (isLoading) {
    return null; // Ou un loader si préféré
  }

  return (
    <TimerOptionsContext.Provider value={value}>
      {children}
    </TimerOptionsContext.Provider>
  );
};

export const useTimerOptions = () => {
  const context = useContext(TimerOptionsContext);
  if (!context) {
    throw new Error('useTimerOptions must be used within TimerOptionsProvider');
  }
  return context;
};