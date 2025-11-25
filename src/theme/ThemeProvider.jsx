// src/theme/ThemeProvider.jsx
// Provider simplifié pour la gestion light/dark mode avec support platform-adaptive

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Appearance, Platform } from 'react-native';
import { usePersistedState } from '../hooks/usePersistedState';
import { lightTheme, darkTheme } from './colors';
import { spacing, borderRadius, shadows, typography, layout, animation, zIndex } from './tokens';
import { shadow, themedShadow, componentShadows } from '../styles/shadows';
import {
  createButtonStyle,
  createCardStyle,
  createModalStyle,
  createInputStyle,
  getSwitchProps,
  getAnimationConfig,
  getTouchableProps,
  platformValues
} from '../styles/platformStyles';

// Context du thème
const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  // Détection du thème système avec Appearance API (plus fiable que useColorScheme)
  const initialScheme = Appearance.getColorScheme();
  const [systemColorScheme, setSystemColorScheme] = useState(
    initialScheme || 'light'
  );

  // État persisté : 'light', 'dark', ou 'auto'
  const [themeMode, setThemeMode] = usePersistedState('@ResetPulse:themeMode', 'auto');

  // Écouter les changements du thème système avec Appearance API
  useEffect(() => {
    // Listener pour les changements de thème système
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemColorScheme(colorScheme || 'light');
    });

    return () => subscription.remove();
  }, []);

  // Déterminer le thème actif
  const isDark = themeMode === 'auto'
    ? systemColorScheme === 'dark'
    : themeMode === 'dark';

  // Sélection des couleurs selon le mode
  const colors = isDark ? darkTheme : lightTheme;

  // Adaptation des ombres selon le thème (legacy)
  const themedShadows = Object.entries(shadows).reduce((acc, [key, shadow]) => {
    acc[key] = {
      ...shadow,
      shadowColor: colors.shadow,
    };
    return acc;
  }, {});

  // Objet thème complet avec support platform-adaptive
  const theme = {
    // Couleurs adaptatives
    colors,

    // Design tokens (legacy)
    spacing,
    borderRadius,
    shadows: themedShadows,
    typography,
    layout,
    animation,
    zIndex,

    // Platform-adaptive shadows (new)
    shadow: (level) => themedShadow(level, isDark),
    componentShadows,

    // Platform-adaptive style creators
    styles: {
      button: (variant) => createButtonStyle(variant, { colors }),
      card: () => createCardStyle({ colors, border: colors.border }),
      modal: () => createModalStyle({ colors, border: colors.border }),
      input: (focused) => createInputStyle({ colors, inputBackground: colors.surface }, focused),
      switch: (value) => getSwitchProps({ colors }, value),
    },

    // Platform-adaptive utilities
    platform: {
      ...platformValues,
      animation: getAnimationConfig(),
      touchable: getTouchableProps(),
    },

    // État et contrôles du thème
    isDark,
    mode: themeMode,

    // Actions
    setTheme: (mode) => setThemeMode(mode), // 'light', 'dark', ou 'auto'
    toggleTheme: () => {
      // Cycle à travers les modes : light → dark → auto → light
      if (themeMode === 'light') {
        setThemeMode('dark');
      } else if (themeMode === 'dark') {
        setThemeMode('auto');
      } else {
        setThemeMode('light');
      }
    },
  };

  // Theme changes effect (dev logging removed - use React DevTools if needed)

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