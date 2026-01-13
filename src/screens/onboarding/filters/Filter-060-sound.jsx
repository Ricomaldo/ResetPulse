// src/screens/onboarding/filters/Filter-060-sound.jsx
// Filtre 060 : Choix du son

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useTheme } from '../../../theme/ThemeProvider';
import { useTranslation } from '../../../hooks/useTranslation';
import { rs } from '../../../styles/responsive';
import haptics from '../../../utils/haptics';
import useSimpleAudio from '../../../hooks/useSimpleAudio';
import { TIMER_SOUNDS } from '../../../config/sounds';
import { fontWeights } from '../../../theme/tokens';
import OnboardingLayout from '../../../components/onboarding/OnboardingLayout';

export default function Filter080SoundPersonalize({ onContinue }) {
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
    <OnboardingLayout
      title={t('onboarding.v3.filter5b.title')}
      scrollable={true}
      centerContent={false}
      footerVariant="primary-skip"
      primaryButtonProps={{
        label: t('onboarding.v3.filter5b.continue'),
        onPress: handleContinue,
        accessibilityHint: 'Confirm selected sound and continue to next step',
      }}
      skipButtonProps={{
        label: t('onboarding.v3.filter5b.skip'),
        onPress: handleSkip,
        accessibilityHint: 'Skip sound selection and use default bell sound',
      }}
    >
      {/* Sound List */}
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
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={t(`sounds.${sound.id}`)}
            accessibilityHint={`Select ${t(`sounds.${sound.id}`)} as timer completion sound. Tap to preview.`}
            accessibilityState={{ selected: isSelected }}
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
            </View>
            {isPlaying && (
              <View style={styles.playingIndicator}>
                <Text style={styles.playingIcon}>{sound.emoji}</Text>
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </OnboardingLayout>
  );
}

const createStyles = (colors, spacing, borderRadius) =>
  StyleSheet.create({
    // Checkmark for selected sound
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

    // Playing indicator
    playingIcon: {
      fontSize: rs(18),
    },
    playingIndicator: {
      marginLeft: rs(spacing.sm),
      paddingHorizontal: rs(spacing.sm),
    },

    // Sound info
    soundInfo: {
      flex: 1,
    },
    soundName: {
      color: colors.text,
      fontSize: rs(15),
      fontWeight: fontWeights.medium,
    },
    soundNameActive: {
      color: colors.brand.primary,
      fontWeight: fontWeights.semibold,
    },

    // Sound row
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
    soundRowSelected: {
      backgroundColor: colors.brand.primary + '10',
      borderColor: colors.brand.primary,
    },
    soundRowPlaying: {
      backgroundColor: colors.brand.primary + '05',
      borderColor: colors.brand.primary,
    },
  });
