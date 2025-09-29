// src/hooks/useTimerAudio.js
// Hook audio spécifique pour le timer avec son sélectionné
import { useEffect, useCallback, useRef } from 'react';
import { useAudioPlayer, setAudioModeAsync } from 'expo-audio';
import { Platform } from 'react-native';
import { getSoundById } from '../config/sounds';

export default function useTimerAudio(selectedSoundId) {
  const selectedSound = getSoundById(selectedSoundId);
  const player = useAudioPlayer(selectedSound.file);
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
          console.log('✅ Timer Audio configuré pour:', selectedSoundId);
        }
      } catch (error) {
        // Fallback silencieux mais log pour debug
        if (__DEV__) {
          console.warn('⚠️ Audio config fallback:', error.message);
        }
      }
    };

    configureAudioMode();

    // Cleanup
    return () => {
      isConfigured.current = false;
    };
  }, [selectedSoundId]);

  // Fonction pour jouer le son avec gestion d'erreur robuste
  const playSound = useCallback(async () => {
    try {
      // Vérifier que le player est prêt
      if (!player) {
        if (__DEV__) console.log('Player not ready');
        return;
      }

      // Reset position au début et jouer
      await player.seekTo(0);
      await player.play();

      if (__DEV__) {
        console.log('🔊 Son timer joué:', selectedSoundId);
      }
    } catch (error) {
      // Erreur silencieuse - pas de popup/crash pour l'utilisateur
      if (__DEV__) {
        console.log('🔇 Audio playback fallback:', error.message);
      }
    }
  }, [player, selectedSoundId]);

  return {
    playSound,
    // Exposer le player pour contrôle avancé si besoin
    player
  };
}