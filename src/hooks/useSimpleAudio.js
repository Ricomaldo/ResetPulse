// src/hooks/useSimpleAudio.js
// UN SEUL HOOK AUDIO - Simple, Robuste, Crossplatform
// Utilise uniquement expo-audio SDK 54

import { useEffect, useCallback, useRef, useState } from 'react';
import { useAudioPlayer, useAudioPlayerStatus, setAudioModeAsync } from 'expo-audio';
import { getSoundById, DEFAULT_SOUND_ID } from '../config/sounds';
import logger from '../utils/logger';

// Configuration audio globale (une seule fois)
let isGloballyConfigured = false;

const configureAudioOnce = async () => {
  if (isGloballyConfigured) {return;}

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
    logger.warn('Audio config failed', error.message);
  }
};

/**
 * Hook audio simple et unifié
 * @param {string} defaultSoundId - ID du son par défaut
 * @returns {Object} - playSound function et état de chargement
 */
export default function useSimpleAudio(defaultSoundId = DEFAULT_SOUND_ID) {
  const [currentSoundFile, setCurrentSoundFile] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const player = useAudioPlayer(currentSoundFile);
  const status = useAudioPlayerStatus(player);
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
          logger.log('🔊 Playing sound:', lastSoundIdRef.current || 'preview');
        } catch (error) {
          logger.warn('Playback error', error.message);
          setIsPlaying(false);
        }
      };
      play();
    }
  }, [currentSoundFile, player]);

  // Détection fin de son via useAudioPlayerStatus (évite addListener sur UI thread)
  useEffect(() => {
    if (status?.didJustFinish) {
      setIsPlaying(false);
      setCurrentSoundFile(null);
      logger.log('✅ Sound finished');
    }
  }, [status?.didJustFinish]);

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
      logger.warn('Sound error', error.message);
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
        logger.warn('Stop error', error.message);
      }
    }
  }, [player, isPlaying]);

  return {
    playSound,
    stopSound,
    isPlaying,
  };
}