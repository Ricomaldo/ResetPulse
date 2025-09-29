// src/hooks/useAudioWithSound.js
// Version modifiée de useAudio pour éviter la dépendance circulaire
import { useState, useEffect, useCallback, useRef } from 'react';
import { Audio, setAudioModeAsync } from 'expo-audio';
import { Platform } from 'react-native';
import { getSoundById } from '../config/sounds';

export default function useAudioWithSound(soundId = 'bell_classic') {
  const [isLoading, setIsLoading] = useState(false);
  const currentSoundRef = useRef(null);
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
          console.log('✅ Audio System configuré:', {
            silentMode: 'ENABLED',
            background: 'ENABLED',
            interruption: 'DUCK_OTHERS'
          });
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
  }, []);

  // Cleanup du son actuel
  const cleanupCurrentSound = useCallback(async () => {
    if (currentSoundRef.current) {
      try {
        await currentSoundRef.current.stopAsync();
        await currentSoundRef.current.unloadAsync();
      } catch (error) {
        // Silent cleanup
      }
      currentSoundRef.current = null;
    }
  }, []);

  // Cleanup au unmount
  useEffect(() => {
    return () => {
      cleanupCurrentSound();
    };
  }, [cleanupCurrentSound]);

  // Fonction pour jouer un son spécifique
  const playSound = useCallback(async (customSoundFile = null) => {
    try {
      setIsLoading(true);

      // Nettoyer le son précédent
      await cleanupCurrentSound();

      let soundFile;

      // Si un fichier son custom est passé directement (pour preview)
      if (customSoundFile) {
        soundFile = customSoundFile;
      } else {
        // Utiliser le son par ID
        const sound = getSoundById(soundId);
        soundFile = sound.file;
      }

      // Créer et charger le nouveau son
      const { sound: audioSound } = await Audio.Sound.createAsync(
        soundFile,
        { shouldPlay: true },
        null,
        true
      );

      currentSoundRef.current = audioSound;

      if (__DEV__) {
        console.log('🔊 Son joué avec succès:', customSoundFile ? 'preview' : soundId);
      }

      // Auto-cleanup après la lecture
      audioSound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          cleanupCurrentSound();
        }
      });

    } catch (error) {
      // Erreur silencieuse - pas de popup/crash pour l'utilisateur
      if (__DEV__) {
        console.log('🔇 Audio playback error:', error.message);
      }
    } finally {
      setIsLoading(false);
    }
  }, [soundId, cleanupCurrentSound]);

  return {
    playSound,
    isLoading
  };
}