// src/contexts/TimerOptionsContext.jsx
import React, { createContext, useContext, useEffect } from 'react';
import { useTheme } from '../components/ThemeProvider';
import { usePersistedObject } from '../hooks/usePersistedState';

const TimerOptionsContext = createContext(null);

export const TimerOptionsProvider = ({ children }) => {
  const theme = useTheme();

  // Utiliser un seul objet persisté pour toutes les options
  const { values, updateValue, isLoading } = usePersistedObject(
    '@ResetPulse:timerOptions',
    {
      clockwise: false,
      scaleMode: '60min',
      currentColor: theme.colors.energy,
    }
  );

  // Mettre à jour la couleur si elle n'existe pas dans la palette actuelle
  useEffect(() => {
    const paletteColors = Object.values(theme.colors);
    if (!paletteColors.includes(values.currentColor)) {
      updateValue('currentColor', theme.colors.energy);
    }
  }, [theme.colors]);

  const value = {
    // States
    clockwise: values.clockwise,
    scaleMode: values.scaleMode,
    currentColor: values.currentColor,

    // Actions
    setClockwise: (val) => updateValue('clockwise', val),
    setScaleMode: (val) => updateValue('scaleMode', val),
    setCurrentColor: (val) => updateValue('currentColor', val),

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