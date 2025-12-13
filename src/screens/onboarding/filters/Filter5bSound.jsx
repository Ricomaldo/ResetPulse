// src/screens/onboarding/filters/Filter5bSound.jsx
// Filtre 5b : Choix du son (parcours Personnaliser)

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../../theme/ThemeProvider';
import { useTranslation } from '../../../hooks/useTranslation';
import { rs } from '../onboardingConstants';
import haptics from '../../../utils/haptics';
import useSimpleAudio from '../../../hooks/useSimpleAudio';
import { TIMER_SOUNDS } from '../../../config/sounds';

export default function Filter5bSound({ onContinue }) {
  const { colors, spacing, borderRadius } = useTheme();
  const t = useTranslation();
  const { playSound, stopSound } = useSimpleAudio('preview');

  const [selectedSound, setSelectedSound] = useState('bell_classic');
  const [playingId, setPlayingId] = useState(null);
  const timeoutRef = useRef(null);

  // Tap sur un son: sélectionne + joue preview 2 secondes
  const handleSoundPress = async (soundId) => {
    haptics.selection().catch(() => {});

    // Sélectionner le son immédiatement
    setSelectedSound(soundId);

    // Stop preview actuel si existant
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      stopSound();
    }

    // Jouer le son
    try {
      setPlayingId(soundId);
      await playSound(soundId);

      // Stopper après 2 secondes
      timeoutRef.current = setTimeout(() => {
        stopSound();
        setPlayingId(null);
      }, 2000);
    } catch (error) {
      console.warn('[Filter5b] Failed to play sound:', error);
      setPlayingId(null);
    }
  };

  const handleContinue = () => {
    // Stop preview si en cours
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      stopSound();
    }

    haptics.selection().catch(() => {});
    onContinue({ selectedSound });
  };

  const handleSkip = () => {
    // Stop preview si en cours
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      stopSound();
    }

    haptics.selection().catch(() => {});
    onContinue({ selectedSound: 'bell_classic' }); // Default
  };

  const styles = createStyles(colors, spacing, borderRadius);

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      {/* Title */}
      <View style={styles.header}>
        <Text style={styles.title}>
          {t('onboarding.v3.filter5b.title')}
        </Text>
      </View>

      {/* Sound List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {TIMER_SOUNDS.map((sound) => {
          const isSelected = selectedSound === sound.id;
          const isPlaying = playingId === sound.id;

          return (
            <TouchableOpacity
              key={sound.id}
              style={[
                styles.soundRow,
                isSelected && styles.soundRowSelected,
                isPlaying && styles.soundRowPlaying,
              ]}
              onPress={() => handleSoundPress(sound.id)}
              activeOpacity={0.7}
            >
              {isSelected && (
                <View style={styles.checkmark}>
                  <Text style={styles.checkmarkIcon}>✓</Text>
                </View>
              )}
              <View style={styles.soundInfo}>
                <Text
                  style={[
                    styles.soundName,
                    isSelected && styles.soundNameActive,
                  ]}
                >
                  {t(`sounds.${sound.id}`)}
                </Text>
                <Text style={styles.soundDuration}>{sound.duration}</Text>
              </View>
              {isPlaying && (
                <View style={styles.playingIndicator}>
                  <Text style={styles.playingIcon}>🔊</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Bottom Buttons */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleContinue}
          activeOpacity={0.7}
        >
          <Text style={styles.primaryButtonText}>
            {t('onboarding.v3.filter5b.continue')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.skipButton}
          onPress={handleSkip}
          activeOpacity={0.7}
        >
          <Text style={styles.skipButtonText}>
            {t('onboarding.v3.filter5b.skip')}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const createStyles = (colors, spacing, borderRadius) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      paddingHorizontal: rs(spacing.xl),
      paddingTop: rs(spacing.lg),
      paddingBottom: rs(spacing.md),
    },
    title: {
      fontSize: rs(28),
      fontWeight: '600',
      color: colors.text,
      textAlign: 'center',
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: rs(spacing.xl),
      paddingBottom: rs(spacing.lg),
    },
    soundRow: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      padding: rs(spacing.md),
      borderWidth: 2,
      borderColor: colors.border,
      minHeight: rs(60),
      marginBottom: rs(spacing.sm),
    },
    soundRowSelected: {
      borderColor: colors.brand.primary,
      backgroundColor: colors.brand.primary + '10',
    },
    soundRowPlaying: {
      borderColor: colors.brand.primary,
      backgroundColor: colors.brand.primary + '05',
    },
    checkmark: {
      width: rs(24),
      height: rs(24),
      borderRadius: rs(12),
      backgroundColor: colors.brand.primary,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: rs(spacing.sm),
    },
    checkmarkIcon: {
      color: colors.background,
      fontSize: rs(14),
      fontWeight: '600',
    },
    soundInfo: {
      flex: 1,
    },
    soundName: {
      fontSize: rs(15),
      fontWeight: '500',
      color: colors.text,
      marginBottom: rs(2),
    },
    soundNameActive: {
      color: colors.brand.primary,
      fontWeight: '600',
    },
    soundDuration: {
      fontSize: rs(12),
      color: colors.textSecondary,
    },
    playingIndicator: {
      marginLeft: rs(spacing.sm),
      paddingHorizontal: rs(spacing.sm),
    },
    playingIcon: {
      fontSize: rs(18),
    },
    bottomContainer: {
      paddingHorizontal: rs(spacing.xl),
      paddingTop: rs(spacing.md),
      paddingBottom: rs(spacing.lg),
      gap: rs(spacing.sm),
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    primaryButton: {
      backgroundColor: colors.brand.primary,
      paddingVertical: rs(spacing.md),
      borderRadius: borderRadius.xl,
      alignItems: 'center',
      minHeight: rs(56),
      justifyContent: 'center',
    },
    primaryButtonText: {
      color: colors.background,
      fontSize: rs(18),
      fontWeight: '600',
    },
    skipButton: {
      paddingVertical: rs(spacing.sm),
      alignItems: 'center',
    },
    skipButtonText: {
      color: colors.textSecondary,
      fontSize: rs(15),
      fontWeight: '500',
    },
  });
