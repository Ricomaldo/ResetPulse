// src/hooks/useAudio.js
import { useEffect, useRef, useCallback } from 'react';
import { Audio } from 'expo-av';

export default function useAudio() {
  const soundRef = useRef(null);
  const isLoadedRef = useRef(false);

  // Préchargement du son au mount
  useEffect(() => {
    let mounted = true;

    const loadSound = async () => {
      try {
        // Configuration audio pour iOS/Android
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: false, // Respecte le mode silencieux
          staysActiveInBackground: false,
          shouldDuckAndroid: true, // Baisse le volume des autres apps
        });

        // Chargement du son système
        const { sound } = await Audio.Sound.createAsync(
          require('../../assets/sounds/407342__forthehorde68__fx_bell_short.wav'),
          { shouldPlay: false }
        );

        if (mounted) {
          soundRef.current = sound;
          isLoadedRef.current = true;
        }
      } catch (error) {
        // Erreur silencieuse - pas de crash si le son ne charge pas
        if (__DEV__) {
          console.log('Audio loading failed (silent fallback):', error.message);
        }
      }
    };

    loadSound();

    // Cleanup
    return () => {
      mounted = false;
      if (soundRef.current) {
        soundRef.current.unloadAsync().catch(() => {});
        soundRef.current = null;
        isLoadedRef.current = false;
      }
    };
  }, []);

  // Fonction pour jouer le son
  const playSound = useCallback(async () => {
    if (!isLoadedRef.current || !soundRef.current) {
      return; // Fallback silencieux si pas de son chargé
    }

    try {
      // Reset position et jouer
      await soundRef.current.setPositionAsync(0);
      await soundRef.current.playAsync();
    } catch (error) {
      // Erreur silencieuse - pas de popup/crash
      if (__DEV__) {
        console.log('Audio playback failed (silent fallback):', error.message);
      }
    }
  }, []);

  return { playSound };
}