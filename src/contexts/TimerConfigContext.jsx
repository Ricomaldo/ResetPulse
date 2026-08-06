// src/contexts/TimerConfigContext.jsx
/**
 * @fileoverview Consolidated Timer Configuration Context
 * @description Merges TimerOptionsContext + TimerPaletteContext + UserPreferencesContext
 *              into a single cohesive provider with grouped state namespaces.
 * @created 2025-12-21
 *
 * State Namespaces:
 * - timer: currentActivity, currentDuration, selectedSoundId, clockwise,
 *   scaleMode (DÉRIVÉ de currentDuration depuis hotfix-porte-1 B2 — jamais
 *   persisté ni settable, cf. deriveScaleMode/utils/scaleHelpers.js)
 * - display: shouldPulse, showDigitalTimer, showTime
 * - system: keepAwakeEnabled
 * - mode: current (Mixte/Focus — Complet mort C6.2 ; ADR-014, réglage global unique)
 * - favorites: favoriteActivities, favoritePalettes
 * - layout: commandBarConfig, carouselBarConfig
 * - stats: activityDurations, completedTimersCount, hasSeenTwoTimersModal, hasSeenReviewRequest
 * - palette: currentPalette, currentColor (source de vérité, hex — C6.2),
 *   selectedColorIndex (dérivé, -1 si currentColor n'est pas dans la palette
 *   active — ex. couleur de Rituel propre), paletteInfo, paletteColors, timerColors
 * - transient: flashActivity, isLoading
 *   (timerRemaining : sorti vers TimerRemainingContext au hotfix-porte-1 C4
 *   — écrit à 60 Hz par TimeTimer.jsx, il faisait re-rendre TOUT consommateur
 *   de ce contexte à chaque tick tant qu'il vivait dans ce useMemo. Audit du
 *   mandat P1 (crash drag, 2e tentative) : aucun lecteur n'a jamais existé —
 *   TimerRemainingContext lui-même supprimé, écriture morte avec lui)
 */

import React, { createContext, useContext, useEffect, useRef, useState, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import logger from '../utils/logger';
import { usePersistedObject } from '../hooks/usePersistedState';
import { getDefaultActivity, getActivityById } from '../config/activities';
import { CONFIG_SCHEMA_VERSION, migrateConfigSchema } from '../config/config-schema';
import { DEV_MODE, DEV_DEFAULT_TIMER_CONFIG } from '../config/test-mode';
import { TIMER_PALETTES, getTimerColors } from '../config/timer-palettes';
import { DEFAULT_SOUND_ID } from '../config/sounds';
import { deriveScaleMode } from '../utils/scaleHelpers';

const TimerConfigContext = createContext(null);

// Storage keys
const NEW_STORAGE_KEY = '@ResetPulse:config';

/**
 * Provider for consolidated timer configuration
 * @param {React.ReactNode} children - Components to wrap
 * @returns {React.ReactElement}
 */
export const TimerConfigProvider = ({ children }) => {
  const hasLoggedBoot = useRef(false);

  // Transient state (not persisted)
  // timerRemaining n'est plus ici (hotfix-porte-1 C4, plus de re-render à
  // 60 Hz de tout consommateur) — et TimerRemainingContext où il avait été
  // déplacé a été supprimé au mandat P1 : jamais lu, write-only.
  const [flashActivity, setFlashActivity] = useState(null);
  const flashTimeoutRef = useRef(null);

  // Default values factory
  const getDefaultValues = () => {
    if (DEV_MODE && DEV_DEFAULT_TIMER_CONFIG) {
      // Dev mode: force known config
      const devActivity = getActivityById(DEV_DEFAULT_TIMER_CONFIG.activity) || getDefaultActivity();
      return {
        version: CONFIG_SCHEMA_VERSION,
        timer: {
          currentActivity: devActivity,
          currentDuration: DEV_DEFAULT_TIMER_CONFIG.duration,
          selectedSoundId: DEFAULT_SOUND_ID,
          clockwise: false,
          // scaleMode retiré (hotfix-porte-1 B2) : toujours dérivé de
          // currentDuration via deriveScaleMode, plus jamais stocké/choisi.
        },
        display: {
          shouldPulse: true,
          lockedScale: null,
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
      version: CONFIG_SCHEMA_VERSION,
      timer: {
        currentActivity: getDefaultActivity(),
        currentDuration: 1500, // 25 minutes
        selectedSoundId: DEFAULT_SOUND_ID,
        clockwise: false,
        // scaleMode retiré (hotfix-porte-1 B2) : le défaut '25min' était une
        // échelle DÉPRÉCIÉE (DIAL_MODES ne la porte plus depuis 2026-01-15),
        // repli silencieux vers 30min — toujours dérivé de currentDuration
        // désormais, cf. deriveScaleMode plus bas.
      },
      display: {
        shouldPulse: true,
        lockedScale: null,
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
  };

  // Persisted state using new single-key strategy
  const { values, updateValue, setValues, isLoading } = usePersistedObject(
    NEW_STORAGE_KEY,
    getDefaultValues(),
    { migrate: migrateConfigSchema }
  );

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

  // Verdicts CD 25/07 : darkLaser/autumn supprimées de TIMER_PALETTES —
  // bascule tout état persisté qui référence encore une palette morte vers
  // serenity (même patron que les gardes « none »/« complet » ci-dessus).
  useEffect(() => {
    if (!isLoading && !TIMER_PALETTES[values.palette.currentPalette]) {
      updateValue('palette', {
        ...values.palette,
        currentPalette: 'serenity',
        currentColor: TIMER_PALETTES.serenity.colors[0],
      });
    }
  }, [isLoading, values.palette, updateValue]);

  // Lambda X (04/08, correctifs QA visuelle #1, bug 1) : les blobs
  // @ResetPulse:config écrits par un build antérieur à ec76ff2 (halo ON par
  // défaut, 31/07) portent encore shouldPulse:false ET le champ mort
  // showActivityEmoji (purgé du code par 7c2984e, plus jamais écrit depuis)
  // — usePersistedObject ne fait qu'un merge SHALLOW au niveau des clés de
  // premier niveau (usePersistedState.js), donc ce blob écrase entièrement
  // le nouveau défaut display.shouldPulse=true, y compris au chemin
  // d'upgrade v2.1.6 → reborn (la clé @ResetPulse:config existe déjà depuis
  // la consolidation ADR-009, décembre 2025 — l'ancienne migration des clés
  // legacy (retirée, morte par construction : usePersistedObject sauvegarde
  // les défauts avant que son getItem ne s'exécute) ne s'est donc jamais
  // déclenchée pour ces installs, elle n'est pas l'autrice de ce blob).
  // showActivityEmoji n'existe dans AUCUN build
  // courant : sa seule présence signe un blob fossile, jamais un choix
  // utilisateur délibéré — même patron one-shot que les gardes ci-dessus,
  // ne se redéclenche jamais une fois le fossile purgé.
  useEffect(() => {
    if (!isLoading && values.display.showActivityEmoji !== undefined) {
      const { showActivityEmoji, ...cleanDisplay } = values.display;
      updateValue('display', { ...cleanDisplay, shouldPulse: true });
    }
  }, [isLoading, values.display, updateValue]);

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

  // scaleMode dérivé (hotfix-porte-1 B2) : jamais persisté ni choisi
  // manuellement — toujours la plus petite échelle de DIAL_MODES qui
  // contient `currentDuration` (deriveScaleMode, fonction pure testée).
  // Placé ici (pas dans un effet + setScaleMode) : dérivation directe au
  // rendu, aucun état supplémentaire à synchroniser, zéro risque de valeur
  // en retard d'un tick sur currentDuration.
  // VERROU D'ÉCHELLE (sheet-racine, retour Eric item 6 + maquette CD) :
  // `display.lockedScale` (null = auto) fige l'échelle choisie au moment du
  // toggle — « le cadran garde son échelle actuelle, même pour une petite
  // durée ». La dérivation auto reste le repli, et reprend à OFF.
  const derivedScaleMode = values.display.lockedScale || deriveScaleMode(values.timer.currentDuration);

  // Context value with grouped namespaces - MUST BE IN useMemo to trigger updates
  const value = useMemo(() => ({
    // === STATE NAMESPACES ===
    timer: {
      currentActivity: values.timer.currentActivity,
      currentDuration: values.timer.currentDuration,
      selectedSoundId: values.timer.selectedSoundId,
      clockwise: values.timer.clockwise,
      scaleMode: derivedScaleMode,
    },
    display: {
      shouldPulse: values.display.shouldPulse,
      lockedScale: values.display.lockedScale ?? null,
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
    // setScaleMode retiré (hotfix-porte-1 B2) : scaleMode est entièrement
    // dérivé de currentDuration (deriveScaleMode ci-dessus) — l'audit avait
    // constaté que setScaleMode n'était appelé nulle part ; il n'y a
    // désormais plus rien à settre, la dérivation est la seule autorité.

    // Display
    setShouldPulse: (shouldPulse) => {
      setValues(prev => ({
        ...prev,
        display: { ...prev.display, shouldPulse }
      }));
    },
    // Verrou d'échelle (sheet-racine) : null = dérivation auto ; une valeur
    // de DIAL_MODES = échelle figée. Posé par le toggle du sous-écran
    // Réglages avec l'échelle dérivée COURANTE au moment du ON.
    setLockedScale: (lockedScale) => {
      setValues(prev => ({
        ...prev,
        display: { ...prev.display, lockedScale }
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
    setFlashActivity,
    handleActivitySelect,
  }), [values, setValues, flashActivity, isLoading, paletteData, derivedScaleMode, setFlashActivity, handleActivitySelect]);

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
