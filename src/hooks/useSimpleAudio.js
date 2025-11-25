// src/hooks/useSimpleAudio.js
// UN SEUL HOOK AUDIO - Simple, Robuste, Crossplatform
// Utilise uniquement expo-audio SDK 54

import { useEffect, useCallback, useRef, useState } from 'react';
import { useAudioPlayer, setAudioModeAsync } from 'expo-audio';
import { Platform } from 'react-native';
import { getSoundById } from '../config/sounds';

// Configuration audio globale (une seule fois)
let isGloballyConfigured = false;

const configureAudioOnce = async () => {
  if (isGloballyConfigured) return;

  try {
    await setAudioModeAsync({
      playsInSilentMode: true,              // iOS: joue même en mode silencieux
      shouldPlayInBackground: true,          // Continue en background
      interruptionMode: 'duckOthers',       // Baisse le volume des autres apps
      staysActiveInBackground: true,         // Reste actif en background
      shouldDuckAndroid: true,              // Android: baisse le volume des autres
      playThroughEarpieceAndroid: false,    // Android: joue sur haut-parleur
    });

    isGloballyConfigured = true;
  } catch (error) {
    if (__DEV__) {
      console.warn('⚠️ Audio config warning:', error.message);
    }
  }
};

/**
 * Hook audio simple et unifié
 * @param {string} defaultSoundId - ID du son par défaut
 * @returns {Object} - playSound function et état de chargement
 */
export default function useSimpleAudio(defaultSoundId = 'bell_classic') {
  const [currentSoundFile, setCurrentSoundFile] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const player = useAudioPlayer(currentSoundFile);
  const lastSoundIdRef = useRef(null);

  // Configuration au premier mount de n'importe quel composant
  useEffect(() => {
    configureAudioOnce();
  }, []);

  // Gestion du player quand le fichier son change
  useEffect(() => {
    if (currentSoundFile && player) {
      const play = async () => {
        try {
          await player.seekTo(0);
          await player.play();
          setIsPlaying(true);

          if (__DEV__) {
            console.log('🔊 Playing sound:', lastSoundIdRef.current || 'preview');
          }
        } catch (error) {
          if (__DEV__) {
            console.log('🔇 Playback error:', error.message);
          }
          setIsPlaying(false);
        }
      };

      play();
    }
  }, [currentSoundFile, player]);

  // Listener pour savoir quand le son est terminé
  useEffect(() => {
    if (!player) return;

    const subscription = player.addListener('playbackStatusUpdate', (status) => {
      if (status.isLoaded && status.didJustFinish) {
        setIsPlaying(false);
        setCurrentSoundFile(null); // Reset pour pouvoir rejouer le même son

        if (__DEV__) {
          console.log('✅ Sound finished');
        }
      }
    });

    return () => {
      subscription.remove();
    };
  }, [player]);

  /**
   * Joue un son par ID ou fichier direct
   * @param {string|Object} soundIdOrFile - ID du son ou fichier direct
   */
  const playSound = useCallback(async (soundIdOrFile = null) => {
    try {
      let soundFile;
      let soundId;

      if (typeof soundIdOrFile === 'string') {
        // C'est un ID de son
        soundId = soundIdOrFile;
        const sound = getSoundById(soundId);
        soundFile = sound.file;
      } else if (soundIdOrFile) {
        // C'est un fichier direct (pour preview)
        soundFile = soundIdOrFile;
        soundId = 'preview';
      } else {
        // Utiliser le son par défaut
        soundId = defaultSoundId;
        const sound = getSoundById(soundId);
        soundFile = sound.file;
      }

      lastSoundIdRef.current = soundId;

      // Stop le son actuel s'il y en a un
      if (player && isPlaying) {
        await player.remove();
        setIsPlaying(false);
      }

      // Déclencher le nouveau son
      setCurrentSoundFile(soundFile);

    } catch (error) {
      if (__DEV__) {
        console.error('🔇 Sound error:', error);
      }
    }
  }, [defaultSoundId, player, isPlaying]);

  /**
   * Arrête le son en cours
   */
  const stopSound = useCallback(async () => {
    if (player && isPlaying) {
      try {
        await player.remove();
        setIsPlaying(false);
        setCurrentSoundFile(null);
      } catch (error) {
        if (__DEV__) {
          console.log('Stop error:', error.message);
        }
      }
    }
  }, [player, isPlaying]);

  return {
    playSound,
    stopSound,
    isPlaying,
  };
}