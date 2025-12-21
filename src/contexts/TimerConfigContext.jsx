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

import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
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

  // Compute derived palette state
  const paletteInfo = TIMER_PALETTES[values.palette.currentPalette] || TIMER_PALETTES.serenity;
  const paletteColors = paletteInfo.colors;
  const timerColors = getTimerColors(values.palette.currentPalette);
  const currentColor = paletteColors[values.palette.selectedColorIndex] || paletteColors[0];

  // Context value with grouped namespaces
  const value = {
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
    setCurrentActivity: (activity) => updateValue('timer', { ...values.timer, currentActivity: activity }),
    setCurrentDuration: (duration) => updateValue('timer', { ...values.timer, currentDuration: duration }),
    setSelectedSoundId: (soundId) => updateValue('timer', { ...values.timer, selectedSoundId: soundId }),
    setClockwise: (clockwise) => updateValue('timer', { ...values.timer, clockwise }),
    setScaleMode: (scaleMode) => updateValue('timer', { ...values.timer, scaleMode }),

    // Display
    setShouldPulse: (shouldPulse) => updateValue('display', { ...values.display, shouldPulse }),
    setShowDigitalTimer: (showDigitalTimer) => updateValue('display', { ...values.display, showDigitalTimer }),
    setShowActivityEmoji: (showActivityEmoji) => updateValue('display', { ...values.display, showActivityEmoji }),
    setShowTime: (showTime) => updateValue('display', { ...values.display, showTime }),

    // Interaction (with validation)
    setInteractionProfile: (profile) => {
      const validProfiles = ['impulsif', 'abandonniste', 'ritualiste', 'veloce'];
      if (validProfiles.includes(profile)) {
        updateValue('interaction', { ...values.interaction, interactionProfile: profile });
      }
    },
    setLongPressConfirmDuration: (duration) => {
      const clamped = Math.max(1000, Math.min(5000, duration));
      updateValue('interaction', { ...values.interaction, longPressConfirmDuration: clamped });
    },
    setLongPressStartDuration: (duration) => {
      const clamped = Math.max(1000, Math.min(5000, duration));
      updateValue('interaction', { ...values.interaction, longPressStartDuration: clamped });
    },
    setStartAnimationDuration: (duration) => {
      const clamped = Math.max(300, Math.min(2000, duration));
      updateValue('interaction', { ...values.interaction, startAnimationDuration: clamped });
    },

    // System
    setKeepAwakeEnabled: (enabled) => updateValue('system', { ...values.system, keepAwakeEnabled: enabled }),

    // Favorites
    setFavoriteActivities: (activities) => updateValue('favorites', { ...values.favorites, favoriteActivities: activities }),
    setFavoritePalettes: (palettes) => updateValue('favorites', { ...values.favorites, favoritePalettes: palettes }),
    toggleFavoritePalette: (paletteId) => {
      const currentFavorites = values.favorites.favoritePalettes || [];
      const isFavorite = currentFavorites.includes(paletteId);
      let newFavorites;
      if (isFavorite) {
        newFavorites = currentFavorites.filter((id) => id !== paletteId);
      } else {
        if (currentFavorites.length >= 4) {
          return; // Max 4 favorites
        }
        newFavorites = [...currentFavorites, paletteId];
      }
      updateValue('favorites', { ...values.favorites, favoritePalettes: newFavorites });
    },

    // Layout
    setCommandBarConfig: (config) => updateValue('layout', { ...values.layout, commandBarConfig: config }),
    setCarouselBarConfig: (config) => updateValue('layout', { ...values.layout, carouselBarConfig: config }),
    setFavoriteToolMode: (mode) => updateValue('layout', { ...values.layout, favoriteToolMode: mode }),

    // Stats
    setActivityDurations: (durations) => updateValue('stats', { ...values.stats, activityDurations: durations }),
    saveActivityDuration: (activityId, duration) => {
      const updated = { ...values.stats.activityDurations, [activityId]: duration };
      updateValue('stats', { ...values.stats, activityDurations: updated });
    },
    incrementCompletedTimers: () => {
      const newCount = (values.stats.completedTimersCount || 0) + 1;
      updateValue('stats', { ...values.stats, completedTimersCount: newCount });
      return newCount;
    },
    setCompletedTimersCount: (count) => updateValue('stats', { ...values.stats, completedTimersCount: count }),
    setHasSeenTwoTimersModal: (seen) => updateValue('stats', { ...values.stats, hasSeenTwoTimersModal: seen }),

    // Palette
    setPalette: (paletteName) => {
      if (TIMER_PALETTES[paletteName]) {
        updateValue('palette', { ...values.palette, currentPalette: paletteName, selectedColorIndex: 0 });
      }
    },
    setColorIndex: (index) => {
      if (index >= 0 && index < 4) {
        updateValue('palette', { ...values.palette, selectedColorIndex: index });
      }
    },
    setColorByType: (type) => {
      const typeToIndex = { energy: 0, focus: 1, calm: 2, deep: 3 };
      const index = typeToIndex[type];
      if (index !== undefined) {
        updateValue('palette', { ...values.palette, selectedColorIndex: index });
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
  };

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
// BACKWARD COMPATIBILITY ALIASES (DEPRECATED)
// ============================================================================

/**
 * @deprecated Use useTimerConfig() instead
 * Alias hook for backward compatibility with old useTimerOptions()
 * Returns flat structure matching old API
 */
export const useTimerOptions = () => {
  if (__DEV__) {
    console.warn('[DEPRECATED] useTimerOptions is deprecated, use useTimerConfig()');
  }
  const config = useTimerConfig();

  // Return flat structure matching old API
  return {
    // Transient
    timerRemaining: config.transient.timerRemaining,
    setTimerRemaining: config.setTimerRemaining,
    flashActivity: config.transient.flashActivity,
    setFlashActivity: config.setFlashActivity,
    handleActivitySelect: config.handleActivitySelect,

    // Timer
    currentActivity: config.timer.currentActivity,
    currentDuration: config.timer.currentDuration,
    selectedSoundId: config.timer.selectedSoundId,
    clockwise: config.timer.clockwise,
    scaleMode: config.timer.scaleMode,
    setCurrentActivity: config.setCurrentActivity,
    setCurrentDuration: config.setCurrentDuration,
    setSelectedSoundId: config.setSelectedSoundId,
    setClockwise: config.setClockwise,
    setScaleMode: config.setScaleMode,

    // Display
    shouldPulse: config.display.shouldPulse,
    showDigitalTimer: config.display.showDigitalTimer,
    showActivityEmoji: config.display.showActivityEmoji,
    showTime: config.display.showTime,
    setShouldPulse: config.setShouldPulse,
    setShowDigitalTimer: config.setShowDigitalTimer,
    setShowActivityEmoji: config.setShowActivityEmoji,
    setShowTime: config.setShowTime,

    // Interaction
    interactionProfile: config.interaction.interactionProfile,
    longPressConfirmDuration: config.interaction.longPressConfirmDuration,
    longPressStartDuration: config.interaction.longPressStartDuration,
    startAnimationDuration: config.interaction.startAnimationDuration,
    setInteractionProfile: config.setInteractionProfile,
    setLongPressConfirmDuration: config.setLongPressConfirmDuration,
    setLongPressStartDuration: config.setLongPressStartDuration,
    setStartAnimationDuration: config.setStartAnimationDuration,

    // System
    keepAwakeEnabled: config.system.keepAwakeEnabled,
    setKeepAwakeEnabled: config.setKeepAwakeEnabled,

    // Favorites
    favoriteActivities: config.favorites.favoriteActivities,
    favoritePalettes: config.favorites.favoritePalettes,
    setFavoriteActivities: config.setFavoriteActivities,
    setFavoritePalettes: config.setFavoritePalettes,
    toggleFavoritePalette: config.toggleFavoritePalette,

    // Layout
    commandBarConfig: config.layout.commandBarConfig,
    carouselBarConfig: config.layout.carouselBarConfig,
    setCommandBarConfig: config.setCommandBarConfig,
    setCarouselBarConfig: config.setCarouselBarConfig,

    // Stats
    activityDurations: config.stats.activityDurations,
    completedTimersCount: config.stats.completedTimersCount,
    hasSeenTwoTimersModal: config.stats.hasSeenTwoTimersModal,
    setActivityDurations: config.setActivityDurations,
    saveActivityDuration: config.saveActivityDuration,
    incrementCompletedTimers: config.incrementCompletedTimers,
    setCompletedTimersCount: config.setCompletedTimersCount,
    setHasSeenTwoTimersModal: config.setHasSeenTwoTimersModal,

    // Loading
    isLoading: config.transient.isLoading,
  };
};

/**
 * @deprecated Use useTimerConfig() instead
 * Alias hook for backward compatibility with old useTimerPalette()
 * Returns palette-only structure
 */
export const useTimerPalette = () => {
  if (__DEV__) {
    console.warn('[DEPRECATED] useTimerPalette is deprecated, use useTimerConfig()');
  }
  const config = useTimerConfig();

  return {
    currentPalette: config.palette.currentPalette,
    paletteInfo: config.palette.paletteInfo,
    paletteColors: config.palette.paletteColors,
    timerColors: config.palette.timerColors,
    selectedColorIndex: config.palette.selectedColorIndex,
    currentColor: config.palette.currentColor,
    setPalette: config.setPalette,
    setColorIndex: config.setColorIndex,
    setColorByType: config.setColorByType,
    isCurrentPalettePremium: config.isCurrentPalettePremium,
    getAvailablePalettes: config.getAvailablePalettes,
  };
};

/**
 * @deprecated Use useTimerConfig() instead
 * Alias hook for backward compatibility with old useUserPreferences()
 * Returns favoriteToolMode only
 */
export const useUserPreferences = () => {
  if (__DEV__) {
    console.warn('[DEPRECATED] useUserPreferences is deprecated, use useTimerConfig()');
  }
  const config = useTimerConfig();

  return {
    favoriteToolMode: config.layout.favoriteToolMode,
    setFavoriteToolMode: config.setFavoriteToolMode,
    isLoaded: !config.transient.isLoading,
  };
};
