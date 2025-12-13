// src/contexts/TimerOptionsContext.jsx
import React, { createContext, useContext, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { usePersistedObject } from '../hooks/usePersistedState';
import { getDefaultActivity } from '../config/activities';

const TimerOptionsContext = createContext(null);

export const TimerOptionsProvider = ({ children }) => {
  const hasLoadedOnboardingConfig = useRef(false);

  // Utiliser un seul objet persisté pour toutes les options
  const { values, updateValue, isLoading } = usePersistedObject(
    '@ResetPulse:timerOptions',
    {
      shouldPulse: false, // Animation de pulsation désactivée par défaut (conformité épilepsie)
      showActivities: true, // Affichage des activités activé par défaut
      showPalettes: true, // Affichage des palettes activé par défaut
      useMinimalInterface: true, // Interface minimaliste activée par défaut (masque activités + palettes quand timer tourne)
      showDigitalTimer: true, // Chrono numérique activé par défaut
      keepAwakeEnabled: true, // Maintenir l'écran allumé pendant le timer (ON par défaut - timer visuel TDAH)
      clockwise: false,
      scaleMode: '60min',
      currentActivity: getDefaultActivity(),
      currentDuration: 2700, // 45 minutes par défaut (45 * 60 = 2700s)
      favoriteActivities: ['work', 'break', 'meditation'], // Free activities as default favorites (excluding 'none')
      selectedSoundId: 'bell_classic', // Son par défaut
      activityDurations: {}, // { activityId: duration } - Mémorise la durée préférée par activité
    }
  );

  // Load onboarding config once after initial load
  useEffect(() => {
    if (isLoading || hasLoadedOnboardingConfig.current) return;

    const loadOnboardingConfig = async () => {
      try {
        const configStr = await AsyncStorage.getItem('user_timer_config');
        if (configStr) {
          const config = JSON.parse(configStr);

          // Apply onboarding config to context
          if (config.activity) {
            updateValue('currentActivity', config.activity);
          }
          if (config.duration) {
            updateValue('currentDuration', config.duration);
          }

          // Remove temp config after applying
          await AsyncStorage.removeItem('user_timer_config');

          if (__DEV__) {
            console.log('[TimerOptionsContext] Applied onboarding config:', config);
          }
        }
        hasLoadedOnboardingConfig.current = true;
      } catch (error) {
        console.warn('[TimerOptionsContext] Failed to load onboarding config:', error);
      }
    };

    loadOnboardingConfig();
  }, [isLoading, updateValue]);

  const value = {
    // States
    shouldPulse: values.shouldPulse,
    showActivities: values.showActivities,
    showPalettes: values.showPalettes,
    useMinimalInterface: values.useMinimalInterface,
    showDigitalTimer: values.showDigitalTimer,
    keepAwakeEnabled: values.keepAwakeEnabled,
    clockwise: values.clockwise,
    scaleMode: values.scaleMode,
    currentActivity: values.currentActivity,
    currentDuration: values.currentDuration,
    favoriteActivities: values.favoriteActivities,
    selectedSoundId: values.selectedSoundId,
    activityDurations: values.activityDurations,

    // Actions
    setShouldPulse: (val) => updateValue('shouldPulse', val),
    setShowActivities: (val) => updateValue('showActivities', val),
    setShowPalettes: (val) => updateValue('showPalettes', val),
    setUseMinimalInterface: (val) => updateValue('useMinimalInterface', val),
    setShowDigitalTimer: (val) => updateValue('showDigitalTimer', val),
    setKeepAwakeEnabled: (val) => updateValue('keepAwakeEnabled', val),
    setClockwise: (val) => updateValue('clockwise', val),
    setScaleMode: (val) => updateValue('scaleMode', val),
    setCurrentActivity: (val) => updateValue('currentActivity', val),
    setCurrentDuration: (val) => updateValue('currentDuration', val),
    setFavoriteActivities: (val) => updateValue('favoriteActivities', val),
    setSelectedSoundId: (val) => updateValue('selectedSoundId', val),
    setActivityDurations: (val) => updateValue('activityDurations', val),

    // Helper pour sauvegarder la durée d'une activité spécifique
    saveActivityDuration: (activityId, duration) => {
      const updated = { ...values.activityDurations, [activityId]: duration };
      updateValue('activityDurations', updated);
    },

    // Loading state
    isLoading
  };

  // Ne pas rendre les enfants tant que le chargement n'est pas terminé
  if (isLoading) {
    return null; // Ou un loader si préféré
  }

  return (
    <TimerOptionsContext.Provider value={value}>
      {children}
    </TimerOptionsContext.Provider>
  );
};

export const useTimerOptions = () => {
  const context = useContext(TimerOptionsContext);
  if (!context) {
    throw new Error('useTimerOptions must be used within TimerOptionsProvider');
  }
  return context;
};