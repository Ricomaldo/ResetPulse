// src/components/SoundPicker.jsx
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { rs } from '../styles/responsive';
import { TIMER_SOUNDS, getSoundById } from '../config/sounds';
import haptics from '../utils/haptics';
import useSimpleAudio from '../hooks/useSimpleAudio';
import { PlayIcon, PauseIcon } from './Icons';

export default function SoundPicker({ selectedSoundId, onSoundSelect }) {
  const theme = useTheme();
  const { playSound, stopSound, isPlaying } = useSimpleAudio('preview');
  const [playingId, setPlayingId] = useState(null);

  const handleSoundPress = useCallback(async (soundId) => {
    haptics.selection().catch(() => {});

    // Si on appuie sur le son actuellement en lecture, on l'arrête
    if (playingId === soundId && isPlaying) {
      await stopSound();
      setPlayingId(null);
      return;
    }

    // Arrêter tout son en cours
    if (isPlaying) {
      await stopSound();
    }

    // Sélectionner le son
    onSoundSelect(soundId);

    // Jouer l'aperçu
    setPlayingId(soundId);

    try {
      const sound = getSoundById(soundId);
      await playSound(sound.file);

      // Auto-reset après 3 secondes max (preview)
      setTimeout(() => {
        if (playingId === soundId) {
          setPlayingId(null);
        }
      }, 3000);
    } catch (error) {
      console.log('Error playing sound preview:', error);
      setPlayingId(null);
    }
  }, [playingId, isPlaying, onSoundSelect, playSound, stopSound]);

  const styles = StyleSheet.create({
    container: {
      marginTop: theme.spacing.sm,
    },

    soundList: {
      maxHeight: 200,
    },

    soundItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.sm,
      borderRadius: theme.borderRadius.md,
      marginBottom: theme.spacing.xs,
      backgroundColor: theme.colors.surface,
      borderWidth: 2,
      borderColor: 'transparent',
    },

    soundItemActive: {
      borderColor: theme.colors.brand.primary,
      backgroundColor: theme.colors.background,
      ...theme.shadow('sm'),
    },

    soundItemPlaying: {
      backgroundColor: theme.colors.brand.primary + '10',
    },

    soundEmoji: {
      fontSize: rs(20, 'min'),
      marginRight: theme.spacing.sm,
    },

    soundInfo: {
      flex: 1,
    },

    soundName: {
      fontSize: rs(13, 'min'),
      fontWeight: '500',
      color: theme.colors.text,
      marginBottom: 2,
    },

    soundDuration: {
      fontSize: rs(11, 'min'),
      color: theme.colors.textLight,
    },

    playIndicator: {
      marginLeft: theme.spacing.sm,
    },

    playIcon: {
      fontSize: rs(16, 'min'),
      color: theme.colors.brand.primary,
    },

    loader: {
      padding: theme.spacing.lg,
      alignItems: 'center',
    },
  });

  // Plus besoin de loader, le hook est synchrone

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.soundList}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled={true}
      >
        {TIMER_SOUNDS.map((sound) => {
          const isActive = selectedSoundId === sound.id;
          const isCurrentlyPlaying = playingId === sound.id && isPlaying;

          return (
            <TouchableOpacity
              key={sound.id}
              style={[
                styles.soundItem,
                isActive && styles.soundItemActive,
                isCurrentlyPlaying && styles.soundItemPlaying,
              ]}
              onPress={() => handleSoundPress(sound.id)}
              activeOpacity={0.7}
            >
              <Text style={styles.soundEmoji}>{sound.emoji}</Text>

              <View style={styles.soundInfo}>
                <Text style={styles.soundName}>{sound.name}</Text>
                <Text style={styles.soundDuration}>
                  Durée: {sound.duration}
                </Text>
              </View>

              <View style={styles.playIndicator}>
                {isCurrentlyPlaying ? (
                  <PauseIcon size={16} color={theme.colors.brand.primary} />
                ) : isActive ? (
                  <Text style={styles.playIcon}>✓</Text>
                ) : (
                  <PlayIcon size={16} color={theme.colors.brand.primary + '30'} />
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}