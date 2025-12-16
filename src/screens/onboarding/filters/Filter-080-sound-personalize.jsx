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
import { fontWeights } from '../../../theme/tokens';

export default function Filter5bSound({ onContinue }) {
  const { colors, spacing, borderRadius } = useTheme();
  const t = useTranslation();
  const { playSound, stopSound } = useSimpleAudio('preview');

  const [selectedSound, setSelectedSound] = useState('bell_classic');
  const [playingId, setPlayingId] = useState(null);
  const timeoutRef = useRef(null);

  // Tap sur un son: sélectionne + joue preview 2 secondes
  const handleSoundPress = async (soundId) => {
    haptics.selection().catch(() => { /* Optional operation - failure is non-critical */ });

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

    haptics.selection().catch(() => { /* Optional operation - failure is non-critical */ });
    onContinue({ selectedSound });
  };

  const handleSkip = () => {
    // Stop preview si en cours
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      stopSound();
    }

    haptics.selection().catch(() => { /* Optional operation - failure is non-critical */ });
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
    bottomContainer: {
      borderTopColor: colors.border,
      borderTopWidth: 1,
      gap: rs(spacing.sm),
      paddingBottom: rs(spacing.lg),
      paddingHorizontal: rs(spacing.xl),
      paddingTop: rs(spacing.md),
    },
    checkmark: {
      alignItems: 'center',
      backgroundColor: colors.brand.primary,
      borderRadius: rs(12),
      height: rs(24),
      justifyContent: 'center',
      marginRight: rs(spacing.sm),
      width: rs(24),
    },
    checkmarkIcon: {
      color: colors.background,
      fontSize: rs(14),
      fontWeight: fontWeights.semibold,
    },
    header: {
      paddingBottom: rs(spacing.md),
      paddingHorizontal: rs(spacing.xl),
      paddingTop: rs(spacing.lg),
    },
    playingIcon: {
      fontSize: rs(18),
    },
    playingIndicator: {
      marginLeft: rs(spacing.sm),
      paddingHorizontal: rs(spacing.sm),
    },
    primaryButton: {
      alignItems: 'center',
      backgroundColor: colors.brand.primary,
      borderRadius: borderRadius.xl,
      justifyContent: 'center',
      minHeight: rs(56),
      paddingVertical: rs(spacing.md),
    },
    primaryButtonText: {
      color: colors.background,
      fontSize: rs(18),
      fontWeight: fontWeights.semibold,
    },
    screen: {
      backgroundColor: colors.background,
      flex: 1,
    },
    scrollContent: {
      paddingBottom: rs(spacing.lg),
      paddingHorizontal: rs(spacing.xl),
    },
    scrollView: {
      flex: 1,
    },
    skipButton: {
      alignItems: 'center',
      paddingVertical: rs(spacing.sm),
    },
    skipButtonText: {
      color: colors.textSecondary,
      fontSize: rs(15),
      fontWeight: fontWeights.medium,
    },
    soundDuration: {
      color: colors.textSecondary,
      fontSize: rs(12),
    },
    soundInfo: {
      flex: 1,
    },
    soundName: {
      color: colors.text,
      fontSize: rs(15),
      fontWeight: fontWeights.medium,
      marginBottom: rs(2),
    },
    soundNameActive: {
      color: colors.brand.primary,
      fontWeight: fontWeights.semibold,
    },
    soundRow: {
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderRadius: borderRadius.lg,
      borderWidth: 2,
      flexDirection: 'row',
      marginBottom: rs(spacing.sm),
      minHeight: rs(60),
      padding: rs(spacing.md),
    },
    soundRowPlaying: {
      backgroundColor: colors.brand.primary + '05',
      borderColor: colors.brand.primary,
    },
    soundRowSelected: {
      backgroundColor: colors.brand.primary + '10',
      borderColor: colors.brand.primary,
    },
    title: {
      color: colors.text,
      fontSize: rs(28),
      fontWeight: fontWeights.semibold,
      textAlign: 'center',
    },
  });
