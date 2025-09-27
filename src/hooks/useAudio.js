// src/hooks/useAudio.js
import { useEffect, useCallback } from 'react';
import { useAudioPlayer } from 'expo-audio';

export default function useAudio() {
  // Utilisation du nouveau hook expo-audio
  const player = useAudioPlayer(require('../../assets/sounds/407342__forthehorde68__fx_bell_short.wav'));

  // Configuration audio au mount
  useEffect(() => {
    const configureAudio = async () => {
      try {
        // La configuration audio n'est plus nécessaire avec expo-audio
        // Il respecte automatiquement les paramètres système
        if (__DEV__) {
          console.log('Audio system initialized with expo-audio');
        }
      } catch (error) {
        if (__DEV__) {
          console.log('Audio config error (silent fallback):', error.message);
        }
      }
    };

    configureAudio();
  }, []);

  // Fonction pour jouer le son
  const playSound = useCallback(async () => {
    try {
      // Reset position au début et jouer
      await player.seekTo(0);
      await player.play();
    } catch (error) {
      // Erreur silencieuse - pas de popup/crash
      if (__DEV__) {
        console.log('Audio playback failed (silent fallback):', error.message);
      }
    }
  }, [player]);

  return { playSound };
}