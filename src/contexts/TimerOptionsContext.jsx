// src/contexts/TimerOptionsContext.jsx
import React, { createContext, useContext, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import logger from '../utils/logger';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { usePersistedObject } from '../hooks/usePersistedState';
import { getDefaultActivity } from '../config/activities';

const TimerOptionsContext = createContext(null);

/**
 * Provider for timer options (duration, activity, sound, etc.)
 * @param {React.ReactNode} children - Components to wrap
 * @returns {React.ReactElement}
 */
export const TimerOptionsProvider = ({ children }) => {
  const hasLoadedOnboardingConfig = useRef(false);

  // Utiliser un seul objet persisté pour toutes les options
  const { values, updateValue, isLoading } = usePersistedObject('@ResetPulse:timerOptions', {
    shouldPulse: false, // Animation de pulsation désactivée par défaut (conformité épilepsie)
    showDigitalTimer: false, // Chrono numérique masqué par défaut (mode zen)
    showActivityEmoji: true, // Affichage de l'emoji d'activité dans le dial activé par défaut
    keepAwakeEnabled: true, // Maintenir l'écran allumé pendant le timer (ON par défaut - timer visuel TDAH)
    clockwise: false,
    scaleMode: '45min',
    currentActivity: getDefaultActivity(),
    currentDuration: 2700, // 45 minutes par défaut (45 * 60 = 2700s)
    favoriteActivities: ['work', 'break', 'meditation'], // Free activities as default favorites (excluding 'none')
    favoritePalettes: [], // Palettes favorites (max 4) - affichées en premier dans carrousel
    selectedSoundId: 'bell_classic', // Son par défaut
    activityDurations: {}, // { activityId: duration } - Mémorise la durée préférée par activité
    completedTimersCount: 0, // Compteur de timers complétés (ADR-003: trigger après 2)
    hasSeenTwoTimersModal: false, // Modal "2 moments créés" déjà affiché
    // Nouvelle architecture : zones configurables
    commandBarConfig: [], // Zone commandes (haut) - valeurs possibles: ['playPause', 'reset', 'rotation', 'presets']
    carouselBarConfig: [], // Zone carrousels (bas) - valeurs possibles: ['activities', 'palettes']
  });

  // Load onboarding config once after initial load
  useEffect(() => {
    if (isLoading || hasLoadedOnboardingConfig.current) {return;}

    const loadOnboardingConfig = async () => {
      try {
        // Load timer config (Filter2Creation: activity + duration)
        const timerConfigStr = await AsyncStorage.getItem('user_timer_config');
        if (timerConfigStr) {
          try {
            const config = JSON.parse(timerConfigStr);
            if (config.activity) {
              updateValue('currentActivity', config.activity);
            }
            if (config.duration) {
              updateValue('currentDuration', config.duration);
            }
            await AsyncStorage.removeItem('user_timer_config');
            if (__DEV__) {
              logger.log('[TimerOptionsContext] Applied timer config:', config);
            }
          } catch (parseError) {
            logger.warn('[TimerOptionsContext] Failed to parse timer config:', parseError.message);
            await AsyncStorage.removeItem('user_timer_config');
          }
        }

        // Load sound config (Filter5bSound: selectedSound)
        const soundConfigStr = await AsyncStorage.getItem('user_sound_config');
        if (soundConfigStr) {
          try {
            const soundId = JSON.parse(soundConfigStr);
            updateValue('selectedSoundId', soundId);
            await AsyncStorage.removeItem('user_sound_config');
            if (__DEV__) {
              logger.log('[TimerOptionsContext] Applied sound config:', soundId);
            }
          } catch (parseError) {
            logger.warn('[TimerOptionsContext] Failed to parse sound config:', parseError.message);
            await AsyncStorage.removeItem('user_sound_config');
          }
        }

        // Load interface config (Filter5cInterface: theme, minimalInterface, digitalTimer)
        const interfaceConfigStr = await AsyncStorage.getItem('user_interface_config');
        if (interfaceConfigStr) {
          try {
            const config = JSON.parse(interfaceConfigStr);

            if (config.theme) {
              await AsyncStorage.setItem('@ResetPulse:themeMode', config.theme);
            }
            if (config.minimalInterface !== undefined) {
              updateValue('useMinimalInterface', config.minimalInterface);
            }
            if (config.digitalTimer !== undefined) {
              updateValue('showDigitalTimer', config.digitalTimer);
            }
            await AsyncStorage.removeItem('user_interface_config');
            if (__DEV__) {
              logger.log('[TimerOptionsContext] Applied interface config:', config);
            }
          } catch (parseError) {
            logger.warn(
              '[TimerOptionsContext] Failed to parse interface config:',
              parseError.message
            );
            await AsyncStorage.removeItem('user_interface_config');
          }
        }

        hasLoadedOnboardingConfig.current = true;
      } catch (error) {
        logger.warn('[TimerOptionsContext] Failed to load onboarding config:', error);
      }
    };

    loadOnboardingConfig();
  }, [isLoading, updateValue]);

  const value = {
    // States
    shouldPulse: values.shouldPulse,
    showDigitalTimer: values.showDigitalTimer,
    showActivityEmoji: values.showActivityEmoji,
    keepAwakeEnabled: values.keepAwakeEnabled,
    clockwise: values.clockwise,
    scaleMode: values.scaleMode,
    currentActivity: values.currentActivity,
    currentDuration: values.currentDuration,
    favoriteActivities: values.favoriteActivities,
    favoritePalettes: values.favoritePalettes,
    selectedSoundId: values.selectedSoundId,
    activityDurations: values.activityDurations,
    completedTimersCount: values.completedTimersCount,
    hasSeenTwoTimersModal: values.hasSeenTwoTimersModal,
    commandBarConfig: values.commandBarConfig,
    carouselBarConfig: values.carouselBarConfig,

    // Actions
    setShouldPulse: (val) => updateValue('shouldPulse', val),
    setShowDigitalTimer: (val) => updateValue('showDigitalTimer', val),
    setShowActivityEmoji: (val) => updateValue('showActivityEmoji', val),
    setKeepAwakeEnabled: (val) => updateValue('keepAwakeEnabled', val),
    setClockwise: (val) => updateValue('clockwise', val),
    setScaleMode: (val) => updateValue('scaleMode', val),
    setCurrentActivity: (val) => updateValue('currentActivity', val),
    setCurrentDuration: (val) => updateValue('currentDuration', val),
    setFavoriteActivities: (val) => updateValue('favoriteActivities', val),
    setFavoritePalettes: (val) => updateValue('favoritePalettes', val),
    setSelectedSoundId: (val) => updateValue('selectedSoundId', val),
    setActivityDurations: (val) => updateValue('activityDurations', val),
    setCompletedTimersCount: (val) => updateValue('completedTimersCount', val),
    setHasSeenTwoTimersModal: (val) => updateValue('hasSeenTwoTimersModal', val),
    setCommandBarConfig: (val) => updateValue('commandBarConfig', val),
    setCarouselBarConfig: (val) => updateValue('carouselBarConfig', val),

    // Helper pour sauvegarder la durée d'une activité spécifique
    saveActivityDuration: (activityId, duration) => {
      const updated = { ...values.activityDurations, [activityId]: duration };
      updateValue('activityDurations', updated);
    },

    // Helper pour incrémenter le compteur de timers complétés (ADR-003)
    incrementCompletedTimers: () => {
      const newCount = (values.completedTimersCount || 0) + 1;
      updateValue('completedTimersCount', newCount);
      return newCount; // Retourne le nouveau count pour trigger immédiat
    },

    // Helper pour toggle une palette dans les favoris (max 4)
    toggleFavoritePalette: (paletteId) => {
      const currentFavorites = values.favoritePalettes || [];
      const isFavorite = currentFavorites.includes(paletteId);

      let newFavorites;
      if (isFavorite) {
        // Retirer des favoris
        newFavorites = currentFavorites.filter((id) => id !== paletteId);
      } else {
        // Ajouter aux favoris (max 4)
        if (currentFavorites.length >= 4) {
          return; // Ne rien faire si on a déjà 4 favoris
        }
        newFavorites = [...currentFavorites, paletteId];
      }
      updateValue('favoritePalettes', newFavorites);
    },

    // Loading state
    isLoading,
  };

  // Ne pas rendre les enfants tant que le chargement n'est pas terminé
  if (isLoading) {
    return null; // Ou un loader si préféré
  }

  return <TimerOptionsContext.Provider value={value}>{children}</TimerOptionsContext.Provider>;
};

TimerOptionsProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useTimerOptions = () => {
  const context = useContext(TimerOptionsContext);
  if (!context) {
    throw new Error('useTimerOptions must be used within TimerOptionsProvider');
  }
  return context;
};
