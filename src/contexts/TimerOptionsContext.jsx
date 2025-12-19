// src/contexts/TimerOptionsContext.jsx
import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import logger from '../utils/logger';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { usePersistedObject } from '../hooks/usePersistedState';
import { getDefaultActivity, getActivityById } from '../config/activities';
import { DEV_MODE, DEV_DEFAULT_TIMER_CONFIG } from '../config/test-mode';

const TimerOptionsContext = createContext(null);

/**
 * Provider for timer options (duration, activity, sound, etc.)
 * @param {React.ReactNode} children - Components to wrap
 * @returns {React.ReactElement}
 */
export const TimerOptionsProvider = ({ children }) => {
  const hasLoadedOnboardingConfig = useRef(false);

  // Transient state for timer remaining (not persisted)
  const [timerRemaining, setTimerRemaining] = useState(0);

  // Flash state for activity selection feedback (ADR-007 messaging)
  const [flashActivity, setFlashActivity] = useState(null);
  const flashTimeoutRef = useRef(null);

  // Valeurs par défaut : mode production ou dev
  const getDefaultValues = () => {
    if (DEV_MODE && DEV_DEFAULT_TIMER_CONFIG) {
      // Mode dev : forcer config connue (20min méditation)
      const devActivity = getActivityById(DEV_DEFAULT_TIMER_CONFIG.activity) || getDefaultActivity();
      return {
        shouldPulse: false,
        showDigitalTimer: false,
        showActivityEmoji: true,
        keepAwakeEnabled: true,
        clockwise: false,
        scaleMode: DEV_DEFAULT_TIMER_CONFIG.scaleMode,
        currentActivity: devActivity,
        currentDuration: DEV_DEFAULT_TIMER_CONFIG.duration,
        favoriteActivities: ['work', 'break', 'meditation'],
        favoritePalettes: [],
        selectedSoundId: 'bell_classic',
        activityDurations: {},
        completedTimersCount: 0,
        hasSeenTwoTimersModal: false,
        commandBarConfig: [],
        carouselBarConfig: [],
        longPressConfirmDuration: 2500, // ADR-007: Default 2.5s for stop (range: 1000-5000ms)
        longPressStartDuration: 3000, // ADR-007: Default 3s for deliberate start (range: 1000-5000ms)
        startAnimationDuration: 1200, // Default 1.2s for start animation (range: 300-2000ms)
        showTime: true, // Eye toggle state for DigitalTimer (ADR-007: persist across FavoriteToolBox/ToolBox)
      };
    }

    // Mode production : valeurs standard
    return {
      shouldPulse: false,
      showDigitalTimer: false,
      showActivityEmoji: true,
      keepAwakeEnabled: true,
      clockwise: false,
      scaleMode: '25min',
      currentActivity: getDefaultActivity(),
      currentDuration: 1500, // 25 minutes par défaut (25 * 60 = 1500s)
      favoriteActivities: ['work', 'break', 'meditation'],
      favoritePalettes: [],
      selectedSoundId: 'bell_classic',
      activityDurations: {},
      completedTimersCount: 0,
      hasSeenTwoTimersModal: false,
      commandBarConfig: [],
      carouselBarConfig: [],
      longPressConfirmDuration: 2500, // ADR-007: Default 2.5s for stop (range: 1000-5000ms)
      longPressStartDuration: 3000, // ADR-007: Default 3s for deliberate start (range: 1000-5000ms)
      startAnimationDuration: 1200, // Default 1.2s for start animation (range: 300-2000ms)
      showTime: true, // Eye toggle state for DigitalTimer (ADR-007: persist across FavoriteToolBox/ToolBox)
    };
  };

  // Utiliser un seul objet persisté pour toutes les options
  const { values, updateValue, isLoading } = usePersistedObject(
    '@ResetPulse:timerOptions',
    getDefaultValues()
  );

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

  // Handle activity selection with flash feedback (ADR-007 messaging)
  const handleActivitySelect = useCallback((activity) => {
    // Clear any existing timeout
    if (flashTimeoutRef.current) {
      clearTimeout(flashTimeoutRef.current);
    }
    // Show activity flash for 2 seconds
    setFlashActivity(activity);
    flashTimeoutRef.current = setTimeout(() => {
      setFlashActivity(null);
    }, 2000);
  }, []);

  const value = {
    // Transient state (not persisted)
    timerRemaining,
    setTimerRemaining,
    flashActivity,
    setFlashActivity,
    handleActivitySelect,

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
    longPressConfirmDuration: values.longPressConfirmDuration,
    longPressStartDuration: values.longPressStartDuration,
    startAnimationDuration: values.startAnimationDuration,
    showTime: values.showTime,

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
    setShowTime: (val) => updateValue('showTime', val),
    setLongPressConfirmDuration: (val) => {
      // ADR-007: Clamp value to valid range (1000-5000ms)
      const clamped = Math.max(1000, Math.min(5000, val));
      updateValue('longPressConfirmDuration', clamped);
    },
    setLongPressStartDuration: (val) => {
      // ADR-007: Clamp value to valid range (1000-5000ms)
      const clamped = Math.max(1000, Math.min(5000, val));
      updateValue('longPressStartDuration', clamped);
    },
    setStartAnimationDuration: (val) => {
      // Clamp value to valid range (300-2000ms)
      const clamped = Math.max(300, Math.min(2000, val));
      updateValue('startAnimationDuration', clamped);
    },

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
