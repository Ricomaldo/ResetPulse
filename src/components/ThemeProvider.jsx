// src/components/ThemeProvider.jsx
import React, { createContext, useContext, useMemo } from 'react';
import { createTheme, PALETTE_NAMES } from '../styles/theme';
import { usePersistedState } from '../hooks/usePersistedState';

const ThemeContext = createContext();

export const ThemeProvider = ({ children, initialPalette = 'classique' }) => {
  const [currentPalette, setCurrentPalette, isLoading] = usePersistedState(
    '@ResetPulse:palette',
    initialPalette
  );
  
  const theme = useMemo(() => createTheme(currentPalette), [currentPalette]);
  
  const contextValue = useMemo(() => ({
    ...theme,
    setPalette: setCurrentPalette,
    availablePalettes: PALETTE_NAMES,
    currentPalette,
    isLoadingPalette: isLoading,
  }), [theme, currentPalette, isLoading]);

  // Ne pas rendre les enfants tant que le chargement n'est pas terminé
  if (isLoading) {
    return null; // Ou un loader si préféré
  }

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

// Hook pour changer de palette
export const usePalette = () => {
  const { setPalette, availablePalettes, currentPalette } = useTheme();
  
  return {
    setPalette,
    availablePalettes,
    currentPalette,
  };
};

// Helper hook for responsive styles
export const useResponsiveStyle = (styles) => {
  const { device } = useTheme();
  return styles[device.size] || styles.medium || styles;
};

// Hook pour accéder aux couleurs de timer
export const useTimerColors = () => {
  const { timer } = useTheme();
  return timer;
};