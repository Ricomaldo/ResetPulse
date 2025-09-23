// src/theme/ThemeProvider.jsx
// Provider simplifié pour la gestion light/dark mode

import React, { createContext, useContext, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { usePersistedState } from '../hooks/usePersistedState';
import { lightTheme, darkTheme } from './colors';
import { spacing, borderRadius, shadows, typography, layout, animation, zIndex } from './tokens';

// Context du thème
const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  // Détection du thème système
  const systemColorScheme = useColorScheme();

  // État persisté : 'light', 'dark', ou 'auto'
  const [themeMode, setThemeMode] = usePersistedState('@ResetPulse:themeMode', 'auto');

  // Déterminer le thème actif
  const isDark = themeMode === 'auto'
    ? systemColorScheme === 'dark'
    : themeMode === 'dark';

  // Sélection des couleurs selon le mode
  const colors = isDark ? darkTheme : lightTheme;

  // Adaptation des ombres selon le thème
  const themedShadows = Object.entries(shadows).reduce((acc, [key, shadow]) => {
    acc[key] = {
      ...shadow,
      shadowColor: colors.shadow,
    };
    return acc;
  }, {});

  // Objet thème complet
  const theme = {
    // Couleurs adaptatives
    colors,

    // Design tokens
    spacing,
    borderRadius,
    shadows: themedShadows,
    typography,
    layout,
    animation,
    zIndex,

    // État et contrôles du thème
    isDark,
    mode: themeMode,

    // Actions
    setTheme: (mode) => setThemeMode(mode), // 'light', 'dark', ou 'auto'
    toggleTheme: () => setThemeMode(isDark ? 'light' : 'dark'),
  };

  // Log du changement de thème (dev only)
  useEffect(() => {
    console.log(`🎨 Theme mode: ${themeMode} (isDark: ${isDark})`);
  }, [themeMode, isDark]);

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};

// Hook d'accès au thème
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

// Export du contexte si besoin direct
export { ThemeContext };