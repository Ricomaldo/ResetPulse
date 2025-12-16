// src/contexts/TimerPaletteContext.jsx
// Contexte dédié aux palettes du timer (séparé du thème global)

import React, { createContext, useContext, useEffect, useRef } from 'react';
import logger from '../utils/logger';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { usePersistedState } from '../hooks/usePersistedState';
import { TIMER_PALETTES, getTimerColors } from '../config/timer-palettes';

const TimerPaletteContext = createContext(null);

export const TimerPaletteProvider = ({ children }) => {
  const hasLoadedOnboardingConfig = useRef(false);

  // Palette actuelle (persistée)
  const [currentPalette, setCurrentPalette] = usePersistedState(
    '@ResetPulse:timerPalette',
    'serenity' // Palette par défaut
  );

  // Couleur sélectionnée dans la palette
  const [selectedColorIndex, setSelectedColorIndex] = usePersistedState(
    '@ResetPulse:selectedColor',
    0 // Index de la couleur - corail rosé par défaut (index 0 palette sérénité)
  );

  // Load onboarding config once (palette + colorIndex)
  useEffect(() => {
    if (hasLoadedOnboardingConfig.current) {return;}

    const loadOnboardingConfig = async () => {
      try {
        const configStr = await AsyncStorage.getItem('user_timer_config');
        if (configStr) {
          try {
            const config = JSON.parse(configStr);

            // Apply palette and color from onboarding
            if (config.palette && TIMER_PALETTES[config.palette]) {
              setCurrentPalette(config.palette);
            }
            if (config.colorIndex !== undefined) {
              setSelectedColorIndex(config.colorIndex);
            }

            if (__DEV__) {
              logger.log('[TimerPaletteContext] Applied onboarding palette config:', {
                palette: config.palette,
                colorIndex: config.colorIndex,
              });
            }
          } catch (parseError) {
            logger.warn('[TimerPaletteContext] Failed to parse config:', parseError.message);
          }
        }
        hasLoadedOnboardingConfig.current = true;
      } catch (error) {
        logger.warn('[TimerPaletteContext] Failed to load onboarding config:', error);
      }
    };

    loadOnboardingConfig();
  }, [setCurrentPalette, setSelectedColorIndex]);

  // Récupération des couleurs
  const paletteInfo = TIMER_PALETTES[currentPalette] || TIMER_PALETTES.serenity;
  const paletteColors = paletteInfo.colors;
  const timerColors = getTimerColors(currentPalette);

  // Couleur active
  const currentColor = paletteColors[selectedColorIndex] || paletteColors[0];

  const value = {
    // État
    currentPalette,
    paletteInfo,
    paletteColors,
    timerColors,
    selectedColorIndex,
    currentColor,

    // Actions
    setPalette: (paletteName) => {
      if (TIMER_PALETTES[paletteName]) {
        setCurrentPalette(paletteName);
        // Reset la couleur sélectionnée quand on change de palette
        setSelectedColorIndex(0);
      }
    },

    setColorIndex: (index) => {
      if (index >= 0 && index < 4) {
        setSelectedColorIndex(index);
      }
    },

    setColorByType: (type) => {
      const typeToIndex = {
        energy: 0,
        focus: 1,
        calm: 2,
        deep: 3,
      };
      const index = typeToIndex[type];
      if (index !== undefined) {
        setSelectedColorIndex(index);
      }
    },

    // Helpers
    isCurrentPalettePremium: () => paletteInfo.isPremium,
    getAvailablePalettes: (isPremiumUser = false) => {
      return Object.keys(TIMER_PALETTES).filter(
        key => !TIMER_PALETTES[key].isPremium || isPremiumUser
      );
    },
  };

  return (
    <TimerPaletteContext.Provider value={value}>
      {children}
    </TimerPaletteContext.Provider>
  );
};

export const useTimerPalette = () => {
  const context = useContext(TimerPaletteContext);
  if (!context) {
    throw new Error('useTimerPalette must be used within TimerPaletteProvider');
  }
  return context;
};