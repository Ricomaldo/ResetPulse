// src/contexts/TimerConfigContext.jsx
/**
 * @fileoverview Consolidated Timer Configuration Context
 * @description Merges TimerOptionsContext + TimerPaletteContext + UserPreferencesContext
 *              into a single cohesive provider with grouped state namespaces.
 * @created 2025-12-21
 *
 * State Namespaces:
 * - timer: currentActivity, currentDuration, selectedSoundId, clockwise, scaleMode
 * - display: shouldPulse, showDigitalTimer, showActivityEmoji, showTime
 * - interaction: interactionProfile, longPress*, startAnimation*
 * - system: keepAwakeEnabled
 * - favorites: favoriteActivities, favoritePalettes
 * - layout: commandBarConfig, carouselBarConfig, favoriteToolMode
 * - stats: activityDurations, completedTimersCount, hasSeenTwoTimersModal
 * - palette: currentPalette, selectedColorIndex, paletteInfo, paletteColors, timerColors, currentColor
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
  const hasLoadedOnboardingConfig = useRef(false);
  const hasMigratedOldKeys = useRef(false);

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
          selectedSoundId: 'bell_classic',
          clockwise: false,
          scaleMode: DEV_DEFAULT_TIMER_CONFIG.scaleMode,
        },
        display: {
          shouldPulse: false,
          showDigitalTimer: false,
          showActivityEmoji: true,
          showTime: true,
        },
        interaction: {
          interactionProfile: 'ritualiste',
          longPressConfirmDuration: 2500,
          longPressStartDuration: 3000,
          startAnimationDuration: 1200,
        },
        system: {
          keepAwakeEnabled: true,
        },
        favorites: {
          favoriteActivities: ['work', 'break', 'meditation'],
          favoritePalettes: [],
        },
        layout: {
          commandBarConfig: [],
          carouselBarConfig: [],
          favoriteToolMode: 'commands',
        },
        stats: {
          activityDurations: {},
          completedTimersCount: 0,
          hasSeenTwoTimersModal: false,
        },
        palette: {
          currentPalette: 'serenity',
          selectedColorIndex: 0,
        },
      };
    }

    // Production mode: standard values
    return {
      version: 2,
      timer: {
        currentActivity: getDefaultActivity(),
        currentDuration: 1500, // 25 minutes
        selectedSoundId: 'bell_classic',
        clockwise: false,
        scaleMode: '25min',
      },
      display: {
        shouldPulse: false,
        showDigitalTimer: false,
        showActivityEmoji: true,
        showTime: true,
      },
      interaction: {
        interactionProfile: 'ritualiste',
        longPressConfirmDuration: 2500,
        longPressStartDuration: 3000,
        startAnimationDuration: 1200,
      },
      system: {
        keepAwakeEnabled: true,
      },
      favorites: {
        favoriteActivities: ['work', 'break', 'meditation'],
        favoritePalettes: [],
      },
      layout: {
        commandBarConfig: [],
        carouselBarConfig: [],
        favoriteToolMode: 'commands',
      },
      stats: {
        activityDurations: {},
        completedTimersCount: 0,
        hasSeenTwoTimersModal: false,
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

        // Load old keys
        const [oldTimerOptions, oldPalette, oldColorIndex, oldFavoriteToolMode] = await Promise.all([
          AsyncStorage.getItem(OLD_KEYS.timerOptions),
          AsyncStorage.getItem(OLD_KEYS.timerPalette),
          AsyncStorage.getItem(OLD_KEYS.selectedColor),
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
              showActivityEmoji: parsed.showActivityEmoji !== undefined ? parsed.showActivityEmoji : migratedValues.display.showActivityEmoji,
              showTime: parsed.showTime !== undefined ? parsed.showTime : migratedValues.display.showTime,
            };
            migratedValues.interaction = {
              interactionProfile: parsed.interactionProfile || migratedValues.interaction.interactionProfile,
              longPressConfirmDuration: parsed.longPressConfirmDuration || migratedValues.interaction.longPressConfirmDuration,
              longPressStartDuration: parsed.longPressStartDuration || migratedValues.interaction.longPressStartDuration,
              startAnimationDuration: parsed.startAnimationDuration || migratedValues.interaction.startAnimationDuration,
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

        // Migrate Color Index
        if (oldColorIndex) {
          try {
            const parsed = JSON.parse(oldColorIndex);
            migratedValues.palette.selectedColorIndex = parsed !== undefined ? parsed : migratedValues.palette.selectedColorIndex;
            needsMigration = true;
          } catch (e) {
            logger.warn('[TimerConfigContext] Failed to parse old colorIndex:', e.message);
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

  // Load onboarding config once after initial load
  useEffect(() => {
    if (isLoading || hasLoadedOnboardingConfig.current) {
      return;
    }

    const loadOnboardingConfig = async () => {
      try {
        // Load timer config (Filter-030-creation: activity + duration + palette + colorIndex)
        const timerConfigStr = await AsyncStorage.getItem('user_timer_config');
        if (timerConfigStr) {
          try {
            const config = JSON.parse(timerConfigStr);
            if (config.activity) {
              updateValue('timer', { ...values.timer, currentActivity: config.activity });
            }
            if (config.duration) {
              updateValue('timer', { ...values.timer, currentDuration: config.duration });
            }
            if (config.palette && TIMER_PALETTES[config.palette]) {
              updateValue('palette', { ...values.palette, currentPalette: config.palette });
            }
            if (config.colorIndex !== undefined) {
              updateValue('palette', { ...values.palette, selectedColorIndex: config.colorIndex });
            }
            await AsyncStorage.removeItem('user_timer_config');
            if (__DEV__) {
              logger.log('[TimerConfigContext] Applied timer config:', config);
            }
          } catch (parseError) {
            logger.warn('[TimerConfigContext] Failed to parse timer config:', parseError.message);
            await AsyncStorage.removeItem('user_timer_config');
          }
        }

        // Load sound config (Filter-050-sound: selectedSound)
        const soundConfigStr = await AsyncStorage.getItem('user_sound_config');
        if (soundConfigStr) {
          try {
            const soundId = JSON.parse(soundConfigStr);
            updateValue('timer', { ...values.timer, selectedSoundId: soundId });
            await AsyncStorage.removeItem('user_sound_config');
            if (__DEV__) {
              logger.log('[TimerConfigContext] Applied sound config:', soundId);
            }
          } catch (parseError) {
            logger.warn('[TimerConfigContext] Failed to parse sound config:', parseError.message);
            await AsyncStorage.removeItem('user_sound_config');
          }
        }

        // Load interface config (Filter-050-interface: theme, minimalInterface, digitalTimer)
        const interfaceConfigStr = await AsyncStorage.getItem('user_interface_config');
        if (interfaceConfigStr) {
          try {
            const config = JSON.parse(interfaceConfigStr);
            if (config.theme) {
              await AsyncStorage.setItem('@ResetPulse:themeMode', config.theme);
            }
            if (config.digitalTimer !== undefined) {
              updateValue('display', { ...values.display, showDigitalTimer: config.digitalTimer });
            }
            await AsyncStorage.removeItem('user_interface_config');
            if (__DEV__) {
              logger.log('[TimerConfigContext] Applied interface config:', config);
            }
          } catch (parseError) {
            logger.warn('[TimerConfigContext] Failed to parse interface config:', parseError.message);
            await AsyncStorage.removeItem('user_interface_config');
          }
        }

        hasLoadedOnboardingConfig.current = true;
      } catch (error) {
        logger.warn('[TimerConfigContext] Failed to load onboarding config:', error);
      }
    };

    loadOnboardingConfig();
  }, [isLoading, updateValue, values.timer, values.display, values.palette]);

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
  const paletteData = useMemo(() => {
    const info = TIMER_PALETTES[values.palette.currentPalette] || TIMER_PALETTES.serenity;
    const colors = info.colors;
    const colors_timer = getTimerColors(values.palette.currentPalette);
    const color = colors[values.palette.selectedColorIndex] || colors[0];
    return { paletteInfo: info, paletteColors: colors, timerColors: colors_timer, currentColor: color };
  }, [values.palette.currentPalette, values.palette.selectedColorIndex]);

  const { paletteInfo, paletteColors, timerColors, currentColor } = paletteData;

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
      showActivityEmoji: values.display.showActivityEmoji,
      showTime: values.display.showTime,
    },
    interaction: {
      interactionProfile: values.interaction.interactionProfile,
      longPressConfirmDuration: values.interaction.longPressConfirmDuration,
      longPressStartDuration: values.interaction.longPressStartDuration,
      startAnimationDuration: values.interaction.startAnimationDuration,
    },
    system: {
      keepAwakeEnabled: values.system.keepAwakeEnabled,
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
    },
    palette: {
      currentPalette: values.palette.currentPalette,
      selectedColorIndex: values.palette.selectedColorIndex,
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
    setShowActivityEmoji: (showActivityEmoji) => {
      setValues(prev => ({
        ...prev,
        display: { ...prev.display, showActivityEmoji }
      }));
    },
    setShowTime: (showTime) => {
      setValues(prev => ({
        ...prev,
        display: { ...prev.display, showTime }
      }));
    },

    // Interaction (with validation)
    setInteractionProfile: (profile) => {
      const validProfiles = ['impulsif', 'abandonniste', 'ritualiste', 'veloce'];
      if (validProfiles.includes(profile)) {
        setValues(prev => ({
          ...prev,
          interaction: { ...prev.interaction, interactionProfile: profile }
        }));
      }
    },
    setLongPressConfirmDuration: (duration) => {
      const clamped = Math.max(1000, Math.min(5000, duration));
      setValues(prev => ({
        ...prev,
        interaction: { ...prev.interaction, longPressConfirmDuration: clamped }
      }));
    },
    setLongPressStartDuration: (duration) => {
      const clamped = Math.max(1000, Math.min(5000, duration));
      setValues(prev => ({
        ...prev,
        interaction: { ...prev.interaction, longPressStartDuration: clamped }
      }));
    },
    setStartAnimationDuration: (duration) => {
      const clamped = Math.max(300, Math.min(2000, duration));
      setValues(prev => ({
        ...prev,
        interaction: { ...prev.interaction, startAnimationDuration: clamped }
      }));
    },

    // System
    setKeepAwakeEnabled: (enabled) => {
      setValues(prev => ({
        ...prev,
        system: { ...prev.system, keepAwakeEnabled: enabled }
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

    // Palette
    setPalette: (paletteName) => {
      if (TIMER_PALETTES[paletteName]) {
        setValues(prev => ({
          ...prev,
          palette: { ...prev.palette, currentPalette: paletteName, selectedColorIndex: 0 }
        }));
      }
    },
    setColorIndex: (index) => {
      if (index >= 0 && index < 4) {
        setValues(prev => ({
          ...prev,
          palette: { ...prev.palette, selectedColorIndex: index }
        }));
      }
    },
    setColorByType: (type) => {
      const typeToIndex = { energy: 0, focus: 1, calm: 2, deep: 3 };
      const index = typeToIndex[type];
      if (index !== undefined) {
        setValues(prev => ({
          ...prev,
          palette: { ...prev.palette, selectedColorIndex: index }
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
