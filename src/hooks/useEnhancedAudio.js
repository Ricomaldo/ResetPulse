// src/hooks/useEnhancedAudio.js
// Version améliorée avec sons multiples (optionnel pour v1.0.4+)

import { useEffect, useCallback, useRef } from 'react';
import { useAudioPlayer, setAudioModeAsync } from 'expo-audio';
import { Platform } from 'react-native';

// Sons disponibles
const SOUNDS = {
  complete: require('../../assets/sounds/407342__forthehorde68__fx_bell_short.wav'),
  // Pour v1.0.5+ : ajouter d'autres sons
  // start: require('../../assets/sounds/start.wav'),
  // pause: require('../../assets/sounds/pause.wav'),
};

export default function useEnhancedAudio() {
  // Players pour chaque son
  const players = {
    complete: useAudioPlayer(SOUNDS.complete),
    // start: useAudioPlayer(SOUNDS.start),
    // pause: useAudioPlayer(SOUNDS.pause),
  };

  const isConfigured = useRef(false);

  // Configuration audio robuste au mount
  useEffect(() => {
    const configureAudioMode = async () => {
      if (isConfigured.current) return;

      try {
        // Configuration CRITIQUE pour que le son joue TOUJOURS
        await setAudioModeAsync({
          // PRIORITÉ 1: Son même en mode silencieux (100% consensus famille)
          playsInSilentMode: true,

          // PRIORITÉ 2: Son même app en arrière-plan (timer continue = son doit jouer)
          shouldPlayInBackground: true,

          // PRIORITÉ 3: Audio respectueux des autres apps
          interruptionMode: Platform.OS === 'ios' ? 'duckOthers' : 'duckOthers',

          // Options supplémentaires pour robustesse
          staysActiveInBackground: true,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });

        isConfigured.current = true;

        if (__DEV__) {
          console.log('✅ Enhanced Audio System configuré:', {
            silentMode: 'ENABLED',
            background: 'ENABLED',
            interruption: 'DUCK_OTHERS',
            multipleSounds: Object.keys(SOUNDS).length
          });
        }
      } catch (error) {
        if (__DEV__) {
          console.warn('⚠️ Audio config fallback:', error.message);
        }
      }
    };

    configureAudioMode();

    return () => {
      isConfigured.current = false;
    };
  }, []);

  // Fonction générique pour jouer un son spécifique
  const playSound = useCallback(async (soundType = 'complete') => {
    try {
      const player = players[soundType];

      if (!player) {
        if (__DEV__) console.log(`Player ${soundType} not ready`);
        return;
      }

      // Reset position et jouer
      await player.seekTo(0);
      await player.play();

      if (__DEV__) {
        console.log(`🔊 Son ${soundType} joué avec succès`);
      }
    } catch (error) {
      if (__DEV__) {
        console.log(`🔇 Audio ${soundType} fallback:`, error.message);
      }
    }
  }, [players]);

  // Fonctions spécifiques pour chaque son
  const playCompleteSound = useCallback(() => playSound('complete'), [playSound]);
  // const playStartSound = useCallback(() => playSound('start'), [playSound]);
  // const playPauseSound = useCallback(() => playSound('pause'), [playSound]);

  return {
    playSound,
    playCompleteSound,
    // Pour v1.0.5+
    // playStartSound,
    // playPauseSound,
    players
  };
}