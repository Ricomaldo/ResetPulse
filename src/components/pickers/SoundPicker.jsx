/**
 * @fileoverview Sound picker component for selecting timer completion sounds
 * @created 2025-12-14
 * @updated 2025-12-14
 */
import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated
} from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useTheme } from '../../theme/ThemeProvider';
import { rs } from '../../styles/responsive';
import { TIMER_SOUNDS, getSoundById } from '../../config/sounds';
import haptics from '../../utils/haptics';
import useSimpleAudio from '../../hooks/useSimpleAudio';
import { PlayIcon, PauseIcon } from '../layout/Icons';

// Composant de loader circulaire style iOS
const CircularProgress = ({ duration, size = 24, strokeWidth = 2, color }) => {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;

  useEffect(() => {
    // Reset et redémarrer l'animation
    animatedValue.setValue(0);
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: duration * 1000, // Convertir en ms
      useNativeDriver: true,
    }).start();
  }, [duration]);

  const AnimatedCircle = Animated.createAnimatedComponent(Circle);

  return (
    <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
      {/* Cercle de fond */}
      <Circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={color + '20'}
        strokeWidth={strokeWidth}
        fill="none"
      />
      {/* Cercle animé */}
      <AnimatedCircle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={animatedValue.interpolate({
          inputRange: [0, 1],
          outputRange: [circumference, 0],
        })}
        strokeLinecap="round"
        fill="none"
      />
    </Svg>
  );
};

export default function SoundPicker({ selectedSoundId, onSoundSelect }) {
  const theme = useTheme();
  const { playSound, stopSound, isPlaying } = useSimpleAudio('preview');
  const [playingId, setPlayingId] = useState(null);
  const timeoutRef = useRef(null);

  // Helper pour convertir la durée en millisecondes
  const parseDuration = (durationStr) => {
    const match = durationStr.match(/(\d+)s/);
    return match ? parseInt(match[1]) : 2; // Default 2s
  };

  const handleSoundPress = useCallback(async (soundId) => {
    haptics.selection().catch(() => {});

    // Si on appuie sur le son actuellement en lecture, on l'arrête
    if (playingId === soundId && isPlaying) {
      await stopSound();
      setPlayingId(null);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      return;
    }

    // Arrêter tout son en cours
    if (isPlaying) {
      await stopSound();
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Sélectionner le son
    onSoundSelect(soundId);

    // Jouer l'aperçu
    setPlayingId(soundId);

    try {
      const sound = getSoundById(soundId);
      await playSound(sound.file);

      // Auto-reset après la durée réelle du son
      const duration = parseDuration(sound.duration);
      timeoutRef.current = setTimeout(() => {
        setPlayingId(null);
      }, duration * 1000);
    } catch (error) {
      console.log('Error playing sound preview:', error);
      setPlayingId(null);
    }
  }, [playingId, isPlaying, onSoundSelect, playSound, stopSound]);

  // Cleanup au démontage
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

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
    },

    playIndicator: {
      marginLeft: theme.spacing.sm,
      width: 24,
      height: 24,
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
    },

    playIndicatorInner: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      alignItems: 'center',
      justifyContent: 'center',
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
          const soundDuration = parseDuration(sound.duration);

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
              </View>

              <View style={styles.playIndicator}>
                {isCurrentlyPlaying ? (
                  <>
                    {/* Loader circulaire en arrière-plan */}
                    <CircularProgress
                      duration={soundDuration}
                      size={24}
                      strokeWidth={2.5}
                      color={theme.colors.brand.primary}
                    />
                    {/* Icône pause au centre */}
                    <View style={styles.playIndicatorInner}>
                      <PauseIcon size={12} color={theme.colors.brand.primary} />
                    </View>
                  </>
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