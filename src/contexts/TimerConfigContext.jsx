// src/contexts/TimerConfigContext.jsx
/**
 * @fileoverview Consolidated Timer Configuration Context
 * @description Merges TimerOptionsContext + TimerPaletteContext + UserPreferencesContext
 *              into a single cohesive provider with grouped state namespaces.
 * @created 2025-12-21
 *
 * State Namespaces:
 * - timer: currentActivity, currentDuration, selectedSoundId, clockwise, scaleMode
 * - display: shouldPulse, showDigitalTimer, showTime
 * - system: keepAwakeEnabled
 * - mode: current (Mixte/Focus — Complet mort C6.2 ; ADR-014, réglage global unique)
 * - favorites: favoriteActivities, favoritePalettes
 * - layout: commandBarConfig, carouselBarConfig, favoriteToolMode
 * - stats: activityDurations, completedTimersCount, hasSeenTwoTimersModal, hasSeenReviewRequest
 * - palette: currentPalette, currentColor (source de vérité, hex — C6.2),
 *   selectedColorIndex (dérivé, -1 si currentColor n'est pas dans la palette
 *   active — ex. couleur de Rituel propre), paletteInfo, paletteColors, timerColors
 * - transient: timerRemaining, flashActivity, isLoading
 */

import React, { createContext, useContext, useEffect, useRef, useState, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import logger from '../utils/logger';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { usePersistedObject } from '../hooks/usePersistedState';
import { getDefaultActivity, getActivityById } from '../config/activities';
import { DEV_MODE, DEV_DEFAULT_TIMER_CONFIG } from '../config/test-mode';
import { TIMER_PALETTES, getTimerColors } from '../config/timer-palettes';
import { DEFAULT_SOUND_ID } from '../config/sounds';

const TimerConfigContext = createContext(null);

// Storage keys
const NEW_STORAGE_KEY = '@ResetPulse:config';
const OLD_KEYS = {
  timerOptions: '@ResetPulse:timerOptions',
  timerPalette: '@ResetPulse:timerPalette',
  selectedColor: '@ResetPulse:selectedColor',
  favoriteToolMode: '@ResetPulse:favoriteToolMode',
};

/**
 * Provider for consolidated timer configuration
 * @param {React.ReactNode} children - Components to wrap
 * @returns {React.ReactElement}
 */
export const TimerConfigProvider = ({ children }) => {
  const hasMigratedOldKeys = useRef(false);
  const hasLoggedBoot = useRef(false);

  // Transient state (not persisted)
  const [timerRemaining, setTimerRemaining] = useState(0);
  const [flashActivity, setFlashActivity] = useState(null);
  const flashTimeoutRef = useRef(null);

  // Default values factory
  const getDefaultValues = () => {
    if (DEV_MODE && DEV_DEFAULT_TIMER_CONFIG) {
      // Dev mode: force known config
      const devActivity = getActivityById(DEV_DEFAULT_TIMER_CONFIG.activity) || getDefaultActivity();
      return {
        version: 2,
        timer: {
          currentActivity: devActivity,
          currentDuration: DEV_DEFAULT_TIMER_CONFIG.duration,
          selectedSoundId: DEFAULT_SOUND_ID,
          clockwise: false,
          scaleMode: DEV_DEFAULT_TIMER_CONFIG.scaleMode,
        },
        display: {
          shouldPulse: false,
          showDigitalTimer: false,
          showTime: true,
        },
        system: {
          keepAwakeEnabled: true,
        },
        mode: {
          current: 'mixte',
        },
        favorites: {
          favoriteActivities: ['work', 'break', 'meditation'],
          favoritePalettes: [],
        },
        layout: {
          commandBarConfig: [],
          carouselBarConfig: [],
          favoriteToolMode: 'activities',
        },
        stats: {
          activityDurations: {},
          completedTimersCount: 0,
          hasSeenTwoTimersModal: false,
          hasSeenReviewRequest: false,
        },
        palette: {
          currentPalette: 'serenity',
          currentColor: TIMER_PALETTES.serenity.colors[0],
        },
      };
    }

    // Production mode: standard values
    return {
      version: 2,
      timer: {
        currentActivity: getDefaultActivity(),
        currentDuration: 1500, // 25 minutes
        selectedSoundId: DEFAULT_SOUND_ID,
        clockwise: false,
        scaleMode: '25min',
      },
      display: {
        shouldPulse: false,
        showDigitalTimer: false,
        showTime: true,
      },
      system: {
        keepAwakeEnabled: true,
      },
      mode: {
        current: 'mixte',
      },
      favorites: {
        favoriteActivities: ['work', 'break', 'meditation'],
        favoritePalettes: [],
      },
      layout: {
        commandBarConfig: [],
        carouselBarConfig: [],
        favoriteToolMode: 'activities',
      },
      stats: {
        activityDurations: {},
        completedTimersCount: 0,
        hasSeenTwoTimersModal: false,
        hasSeenReviewRequest: false,
      },
      palette: {
        currentPalette: 'serenity',
        selectedColorIndex: 0,
      },
    };
  };

  // Persisted state using new single-key strategy
  const { values, updateValue, setValues, isLoading } = usePersistedObject(
    NEW_STORAGE_KEY,
    getDefaultValues()
  );

  // Migrate from old AsyncStorage keys on first load (once)
  useEffect(() => {
    if (isLoading || hasMigratedOldKeys.current) {
      return;
    }

    const migrateOldKeys = async () => {
      try {
        // Check if new key already exists (skip migration if it does)
        const newKeyExists = await AsyncStorage.getItem(NEW_STORAGE_KEY);
        if (newKeyExists) {
          hasMigratedOldKeys.current = true;
          return;
        }

        // Load old keys — selectedColor (index legacy) n'est plus migré : le
        // modèle palette est passé à currentColor en valeur (C6.2), un vieil
        // index numérique n'a plus de sens à traduire.
        const [oldTimerOptions, oldPalette, oldFavoriteToolMode] = await Promise.all([
          AsyncStorage.getItem(OLD_KEYS.timerOptions),
          AsyncStorage.getItem(OLD_KEYS.timerPalette),
          AsyncStorage.getItem(OLD_KEYS.favoriteToolMode),
        ]);

        let needsMigration = false;
        const migratedValues = { ...getDefaultValues() };

        // Migrate TimerOptions
        if (oldTimerOptions) {
          try {
            const parsed = JSON.parse(oldTimerOptions);
            migratedValues.timer = {
              currentActivity: parsed.currentActivity || migratedValues.timer.currentActivity,
              currentDuration: parsed.currentDuration || migratedValues.timer.currentDuration,
              selectedSoundId: parsed.selectedSoundId || migratedValues.timer.selectedSoundId,
              clockwise: parsed.clockwise !== undefined ? parsed.clockwise : migratedValues.timer.clockwise,
              scaleMode: parsed.scaleMode || migratedValues.timer.scaleMode,
            };
            migratedValues.display = {
              shouldPulse: parsed.shouldPulse !== undefined ? parsed.shouldPulse : migratedValues.display.shouldPulse,
              showDigitalTimer: parsed.showDigitalTimer !== undefined ? parsed.showDigitalTimer : migratedValues.display.showDigitalTimer,
              showTime: parsed.showTime !== undefined ? parsed.showTime : migratedValues.display.showTime,
            };
            migratedValues.system = {
              keepAwakeEnabled: parsed.keepAwakeEnabled !== undefined ? parsed.keepAwakeEnabled : migratedValues.system.keepAwakeEnabled,
            };
            migratedValues.favorites = {
              favoriteActivities: parsed.favoriteActivities || migratedValues.favorites.favoriteActivities,
              favoritePalettes: parsed.favoritePalettes || migratedValues.favorites.favoritePalettes,
            };
            migratedValues.layout = {
              commandBarConfig: parsed.commandBarConfig || migratedValues.layout.commandBarConfig,
              carouselBarConfig: parsed.carouselBarConfig || migratedValues.layout.carouselBarConfig,
              favoriteToolMode: migratedValues.layout.favoriteToolMode, // Will be overwritten if old key exists
            };
            migratedValues.stats = {
              activityDurations: parsed.activityDurations || migratedValues.stats.activityDurations,
              completedTimersCount: parsed.completedTimersCount || migratedValues.stats.completedTimersCount,
              hasSeenTwoTimersModal: parsed.hasSeenTwoTimersModal !== undefined ? parsed.hasSeenTwoTimersModal : migratedValues.stats.hasSeenTwoTimersModal,
              hasSeenReviewRequest: parsed.hasSeenReviewRequest !== undefined ? parsed.hasSeenReviewRequest : migratedValues.stats.hasSeenReviewRequest,
            };
            needsMigration = true;
          } catch (e) {
            logger.warn('[TimerConfigContext] Failed to parse old timerOptions:', e.message);
          }
        }

        // Migrate Palette
        if (oldPalette) {
          try {
            const parsed = JSON.parse(oldPalette);
            migratedValues.palette.currentPalette = parsed || migratedValues.palette.currentPalette;
            needsMigration = true;
          } catch (e) {
            logger.warn('[TimerConfigContext] Failed to parse old palette:', e.message);
          }
        }

        // Migrate FavoriteToolMode
        if (oldFavoriteToolMode) {
          migratedValues.layout.favoriteToolMode = oldFavoriteToolMode;
          needsMigration = true;
        }

        // Save migrated values if any old keys were found
        if (needsMigration) {
          setValues(migratedValues);
          if (__DEV__) {
            logger.log('[TimerConfigContext] Migration completed from old keys');
          }

          // Optional: Delete old keys (commented out to keep them as backup)
          // await Promise.all([
          //   AsyncStorage.removeItem(OLD_KEYS.timerOptions),
          //   AsyncStorage.removeItem(OLD_KEYS.timerPalette),
          //   AsyncStorage.removeItem(OLD_KEYS.selectedColor),
          //   AsyncStorage.removeItem(OLD_KEYS.favoriteToolMode),
          // ]);
        }

        hasMigratedOldKeys.current = true;
      } catch (error) {
        logger.warn('[TimerConfigContext] Migration from old keys failed:', error);
        hasMigratedOldKeys.current = true;
      }
    };

    migrateOldKeys();
  }, [isLoading, setValues]);

  // C5 : « none » retiré de la barre d'activités (asymétrie 3 activités |
  // 4 couleurs, ADR-014) — bascule tout état persisté qui le référence encore.
  useEffect(() => {
    if (!isLoading && values.timer.currentActivity?.id === 'none') {
      updateValue('timer', { ...values.timer, currentActivity: getDefaultActivity() });
    }
  }, [isLoading, values.timer, updateValue]);

  // C6.2 : mode « complet » mort (segmenté à 2 entrées) — bascule tout état
  // persisté qui le référence encore vers le défaut (même patron que le
  // garde « none » ci-dessus, pas une couche de migration générique).
  useEffect(() => {
    if (!isLoading && values.mode.current === 'complet') {
      updateValue('mode', { current: 'mixte' });
    }
  }, [isLoading, values.mode, updateValue]);

  // Handle activity selection with flash feedback (ADR-007 messaging)
  const handleActivitySelect = useCallback((activity) => {
    if (flashTimeoutRef.current) {
      clearTimeout(flashTimeoutRef.current);
    }
    setFlashActivity(activity);
    flashTimeoutRef.current = setTimeout(() => {
      setFlashActivity(null);
    }, 2000);
  }, []);

  // Compute derived palette state (memoized to avoid unnecessary recalculations)
  // currentColor est la source de vérité (hex, C6.2) — selectedColorIndex est
  // dérivé pour l'affichage (quelle pastille entourer), -1 si la couleur
  // courante (ex. couleur propre d'un Rituel) n'est pas dans la palette active.
  const paletteData = useMemo(() => {
    const info = TIMER_PALETTES[values.palette.currentPalette] || TIMER_PALETTES.serenity;
    const colors = info.colors;
    const colors_timer = getTimerColors(values.palette.currentPalette);
    const color = values.palette.currentColor || colors[0];
    const selectedColorIndex = colors.indexOf(color);
    return { paletteInfo: info, paletteColors: colors, timerColors: colors_timer, currentColor: color, selectedColorIndex };
  }, [values.palette.currentPalette, values.palette.currentColor]);

  const { paletteInfo, paletteColors, timerColors, currentColor, selectedColorIndex } = paletteData;

  // Context value with grouped namespaces - MUST BE IN useMemo to trigger updates
  const value = useMemo(() => ({
    // === STATE NAMESPACES ===
    timer: {
      currentActivity: values.timer.currentActivity,
      currentDuration: values.timer.currentDuration,
      selectedSoundId: values.timer.selectedSoundId,
      clockwise: values.timer.clockwise,
      scaleMode: values.timer.scaleMode,
    },
    display: {
      shouldPulse: values.display.shouldPulse,
      showDigitalTimer: values.display.showDigitalTimer,
      showTime: values.display.showTime,
    },
    system: {
      keepAwakeEnabled: values.system.keepAwakeEnabled,
    },
    mode: {
      current: values.mode.current,
    },
    favorites: {
      favoriteActivities: values.favorites.favoriteActivities,
      favoritePalettes: values.favorites.favoritePalettes,
    },
    layout: {
      commandBarConfig: values.layout.commandBarConfig,
      carouselBarConfig: values.layout.carouselBarConfig,
      favoriteToolMode: values.layout.favoriteToolMode,
    },
    stats: {
      activityDurations: values.stats.activityDurations,
      completedTimersCount: values.stats.completedTimersCount,
      hasSeenTwoTimersModal: values.stats.hasSeenTwoTimersModal,
      hasSeenReviewRequest: values.stats.hasSeenReviewRequest,
    },
    palette: {
      currentPalette: values.palette.currentPalette,
      selectedColorIndex,
      paletteInfo,
      paletteColors,
      timerColors,
      currentColor,
    },
    transient: {
      timerRemaining,
      flashActivity,
      isLoading,
    },

    // === ACTIONS ===
    // Timer
    setCurrentActivity: (activity) => {
      setValues(prev => ({
        ...prev,
        timer: { ...prev.timer, currentActivity: activity }
      }));
    },
    setCurrentDuration: (duration) => {
      setValues(prev => ({
        ...prev,
        timer: { ...prev.timer, currentDuration: duration }
      }));
    },
    setSelectedSoundId: (soundId) => {
      setValues(prev => ({
        ...prev,
        timer: { ...prev.timer, selectedSoundId: soundId }
      }));
    },
    setClockwise: (clockwise) => {
      setValues(prev => ({
        ...prev,
        timer: { ...prev.timer, clockwise: clockwise }
      }));
    },
    setScaleMode: (scaleMode) => {
      setValues(prev => ({
        ...prev,
        timer: { ...prev.timer, scaleMode: scaleMode }
      }));
    },

    // Display
    setShouldPulse: (shouldPulse) => {
      setValues(prev => ({
        ...prev,
        display: { ...prev.display, shouldPulse }
      }));
    },
    setShowDigitalTimer: (showDigitalTimer) => {
      setValues(prev => ({
        ...prev,
        display: { ...prev.display, showDigitalTimer }
      }));
    },
    setShowTime: (showTime) => {
      setValues(prev => ({
        ...prev,
        display: { ...prev.display, showTime }
      }));
    },

    // System
    setKeepAwakeEnabled: (enabled) => {
      setValues(prev => ({
        ...prev,
        system: { ...prev.system, keepAwakeEnabled: enabled }
      }));
    },

    // Mode (Mixte/Focus — Complet mort C6.2, segmenté à 2 entrées)
    setMode: (mode) => {
      setValues(prev => ({
        ...prev,
        mode: { ...prev.mode, current: mode }
      }));
    },

    // Favorites
    setFavoriteActivities: (activities) => {
      setValues(prev => ({
        ...prev,
        favorites: { ...prev.favorites, favoriteActivities: activities }
      }));
    },
    setFavoritePalettes: (palettes) => {
      setValues(prev => ({
        ...prev,
        favorites: { ...prev.favorites, favoritePalettes: palettes }
      }));
    },
    toggleFavoritePalette: (paletteId) => {
      setValues(prev => {
        const currentFavorites = prev.favorites.favoritePalettes || [];
        const isFavorite = currentFavorites.includes(paletteId);
        let newFavorites;
        if (isFavorite) {
          newFavorites = currentFavorites.filter((id) => id !== paletteId);
        } else {
          if (currentFavorites.length >= 4) {
            return prev; // Max 4 favorites
          }
          newFavorites = [...currentFavorites, paletteId];
        }
        return {
          ...prev,
          favorites: { ...prev.favorites, favoritePalettes: newFavorites }
        };
      });
    },

    // Layout
    setCommandBarConfig: (config) => {
      setValues(prev => ({
        ...prev,
        layout: { ...prev.layout, commandBarConfig: config }
      }));
    },
    setCarouselBarConfig: (config) => {
      setValues(prev => ({
        ...prev,
        layout: { ...prev.layout, carouselBarConfig: config }
      }));
    },
    setFavoriteToolMode: (mode) => {
      setValues(prev => ({
        ...prev,
        layout: { ...prev.layout, favoriteToolMode: mode }
      }));
    },

    // Stats
    setActivityDurations: (durations) => {
      setValues(prev => ({
        ...prev,
        stats: { ...prev.stats, activityDurations: durations }
      }));
    },
    saveActivityDuration: (activityId, duration) => {
      setValues(prev => {
        const updated = { ...prev.stats.activityDurations, [activityId]: duration };
        return {
          ...prev,
          stats: { ...prev.stats, activityDurations: updated }
        };
      });
    },
    incrementCompletedTimers: () => {
      let newCount;
      setValues(prev => {
        newCount = (prev.stats.completedTimersCount || 0) + 1;
        return {
          ...prev,
          stats: { ...prev.stats, completedTimersCount: newCount }
        };
      });
      return newCount;
    },
    setCompletedTimersCount: (count) => {
      setValues(prev => ({
        ...prev,
        stats: { ...prev.stats, completedTimersCount: count }
      }));
    },
    setHasSeenTwoTimersModal: (seen) => {
      setValues(prev => ({
        ...prev,
        stats: { ...prev.stats, hasSeenTwoTimersModal: seen }
      }));
    },
    setHasSeenReviewRequest: (seen) => {
      setValues(prev => ({
        ...prev,
        stats: { ...prev.stats, hasSeenReviewRequest: seen }
      }));
    },

    // Palette — currentColor est la source de vérité (hex, C6.2) ; setColorIndex
    // et setColorByType restent des raccourcis pratiques qui résolvent un
    // index vers le hex de la palette ACTIVE au moment de l'appel.
    setPalette: (paletteName) => {
      if (TIMER_PALETTES[paletteName]) {
        setValues(prev => ({
          ...prev,
          palette: { ...prev.palette, currentPalette: paletteName, currentColor: TIMER_PALETTES[paletteName].colors[0] }
        }));
      }
    },
    setColorIndex: (index) => {
      if (index >= 0 && index < 4) {
        setValues(prev => {
          const colors = (TIMER_PALETTES[prev.palette.currentPalette] || TIMER_PALETTES.serenity).colors;
          return { ...prev, palette: { ...prev.palette, currentColor: colors[index] } };
        });
      }
    },
    setColorByType: (type) => {
      const typeToIndex = { energy: 0, focus: 1, calm: 2, deep: 3 };
      const index = typeToIndex[type];
      if (index !== undefined) {
        setValues(prev => {
          const colors = (TIMER_PALETTES[prev.palette.currentPalette] || TIMER_PALETTES.serenity).colors;
          return { ...prev, palette: { ...prev.palette, currentColor: colors[index] } };
        });
      }
    },
    // Couleur en valeur directe (ex. couleur propre d'un Rituel, C6.2) — peut
    // ne correspondre à aucune pastille de la palette active (selectedColorIndex
    // dérivé retombe alors à -1, aucune pastille en surbrillance : attendu).
    setColorByValue: (hex) => {
      if (hex) {
        setValues(prev => ({
          ...prev,
          palette: { ...prev.palette, currentColor: hex }
        }));
      }
    },
    isCurrentPalettePremium: () => paletteInfo.isPremium,
    getAvailablePalettes: (isPremiumUser = false) => {
      return Object.keys(TIMER_PALETTES).filter(
        (key) => !TIMER_PALETTES[key].isPremium || isPremiumUser
      );
    },

    // Transient
    setTimerRemaining,
    setFlashActivity,
    handleActivitySelect,
  }), [values, setValues, timerRemaining, flashActivity, isLoading, paletteData, setTimerRemaining, setFlashActivity, handleActivitySelect]);

  // Block children render until loaded
  if (isLoading) {
    return null;
  }

  if (!hasLoggedBoot.current) {
    hasLoggedBoot.current = true;
    logger.boot.step('config', `timer config loaded (activity=${values.timer?.currentActivity?.id}, palette=${values.palette?.currentPalette})`);
  }

  return <TimerConfigContext.Provider value={value}>{children}</TimerConfigContext.Provider>;
};

TimerConfigProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

/**
 * Main hook to access timer configuration
 * @returns {Object} Consolidated timer config with grouped namespaces + actions
 */
export const useTimerConfig = () => {
  const context = useContext(TimerConfigContext);
  if (!context) {
    throw new Error('useTimerConfig must be used within TimerConfigProvider');
  }
  return context;
};

// ============================================================================
// EXPORTS
// ============================================================================
// All deprecated hooks have been removed. Use useTimerConfig() directly.
