/**
 * @fileoverview CustomizeStep - Étape B de personnalisation pour onboarding
 * @description Emoji + Nom + Durée après sélection intention
 * @created 2025-12-22
 */
import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import PropTypes from 'prop-types';
import { useTheme } from '../../theme/ThemeProvider';
import { useTranslation } from '../../hooks/useTranslation';
import { rs } from '../../styles/responsive';
import { spacing, typography, fontWeights } from '../../theme/tokens';
import haptics from '../../utils/haptics';

const MAX_NAME_LENGTH = 20;
const DURATION_PRESETS = [
  { minutes: 10, seconds: 600 },
  { minutes: 20, seconds: 1200 },
  { minutes: 30, seconds: 1800 },
  { minutes: 45, seconds: 2700 },
];

/**
 * CustomizeStep - Personnalisation emoji + nom + durée
 *
 * @param {Object} intention - Intention sélectionnée (étape A)
 * @param {Function} onBack - Callback retour vers étape A
 * @param {Function} onSubmit - Callback soumission (emoji, name, duration)
 */
export default function CustomizeStep({ intention, onBack, onSubmit }) {
  const theme = useTheme();
  const t = useTranslation();
  const nativeEmojiInputRef = useRef(null);

  const isOther = intention.id === 'other';

  // État local
  const [emoji, setEmoji] = useState(intention.emoji);
  const [name, setName] = useState(
    isOther ? '' : t(intention.defaultNameKey)
  );
  const [duration, setDuration] = useState(intention.defaultDuration);

  const isValid = name.trim().length > 0 && emoji;

  const handleDurationSelect = (durationSeconds) => {
    haptics.selection().catch(() => {});
    setDuration(durationSeconds);
  };

  const handleEmojiPickerOpen = () => {
    nativeEmojiInputRef.current?.focus();
  };

  const handleNativeEmojiChange = (text) => {
    const emojiRegex = /[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu;
    const emojis = text.match(emojiRegex);

    if (emojis && emojis.length > 0) {
      const lastEmoji = emojis[emojis.length - 1];
      setEmoji(lastEmoji);
      nativeEmojiInputRef.current?.blur();
    }
  };

  const handleSubmit = () => {
    if (!isValid) return;

    onSubmit({
      emoji,
      name: name.trim(),
      defaultDuration: duration,
    });
  };

  const styles = StyleSheet.create({
    backButton: {
      alignItems: 'center',
      alignSelf: 'flex-start',
      flexDirection: 'row',
      marginBottom: theme.spacing.lg,
      padding: theme.spacing.xs,
    },

    backButtonText: {
      color: theme.colors.textSecondary,
      fontSize: rs(16),
      fontWeight: fontWeights.medium,
      marginLeft: theme.spacing.xs,
    },

    container: {
      alignItems: 'center',
      paddingTop: theme.spacing.xl,
    },

    ctaButton: {
      alignItems: 'center',
      backgroundColor: theme.colors.brand.primary,
      borderRadius: theme.borderRadius.lg,
      justifyContent: 'center',
      marginTop: theme.spacing.xxl,
      minHeight: rs(52),
      paddingHorizontal: theme.spacing.xl,
      paddingVertical: theme.spacing.md,
      width: '100%',
      ...theme.shadow('md'),
    },

    ctaButtonDisabled: {
      opacity: 0.5,
    },

    ctaButtonText: {
      color: theme.colors.fixed.white,
      fontSize: rs(16),
      fontWeight: fontWeights.semibold,
    },

    durationButton: {
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.border,
      borderRadius: theme.borderRadius.md,
      borderWidth: 2,
      justifyContent: 'center',
      minHeight: 60,
      minWidth: 70,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.sm,
    },

    durationButtonSelected: {
      backgroundColor: theme.colors.brand.primary + '15',
      borderColor: theme.colors.brand.primary,
    },

    durationRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.sm,
      justifyContent: 'center',
      marginTop: theme.spacing.md,
    },

    durationText: {
      color: theme.colors.text,
      fontSize: rs(18),
      fontWeight: fontWeights.semibold,
    },

    durationTextSelected: {
      color: theme.colors.brand.primary,
    },

    emoji: {
      fontSize: rs(64),
      marginBottom: theme.spacing.md,
    },

    emojiTouchable: {
      marginBottom: theme.spacing.md,
    },

    header: {
      alignItems: 'center',
      marginBottom: theme.spacing.xxl,
    },

    hiddenEmojiInput: {
      height: 0,
      opacity: 0,
      position: 'absolute',
      width: 0,
    },

    name: {
      color: theme.colors.text,
      fontSize: rs(typography.xl),
      fontWeight: fontWeights.semibold,
      textAlign: 'center',
    },

    nameInput: {
      borderBottomColor: theme.colors.border,
      borderBottomWidth: 2,
      color: theme.colors.text,
      fontSize: rs(typography.xl),
      fontWeight: fontWeights.semibold,
      minWidth: 200,
      paddingBottom: theme.spacing.xs,
      paddingHorizontal: theme.spacing.sm,
      textAlign: 'center',
    },

    sectionLabel: {
      color: theme.colors.textSecondary,
      fontSize: rs(typography.base),
      fontWeight: fontWeights.semibold,
      marginBottom: theme.spacing.sm,
      marginTop: theme.spacing.xl,
      textAlign: 'center',
    },
  });

  return (
    <View style={styles.container}>
      {/* Bouton retour */}
      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <Text style={styles.backButtonText}>← Retour</Text>
      </TouchableOpacity>

      {/* Header : Emoji + Nom */}
      <View style={styles.header}>
        {isOther ? (
          <>
            <TouchableOpacity
              style={styles.emojiTouchable}
              onPress={handleEmojiPickerOpen}
              activeOpacity={0.7}
            >
              <Text style={styles.emoji}>{emoji}</Text>
            </TouchableOpacity>

            {/* Hidden TextInput for native emoji keyboard */}
            <TextInput
              ref={nativeEmojiInputRef}
              style={styles.hiddenEmojiInput}
              value=""
              onChangeText={handleNativeEmojiChange}
              keyboardType="default"
              maxLength={10}
            />

            <TextInput
              style={styles.nameInput}
              value={name}
              onChangeText={(text) => setName(text.slice(0, MAX_NAME_LENGTH))}
              placeholder={t('onboarding.creation.namePlaceholder')}
              placeholderTextColor={theme.colors.textSecondary}
              maxLength={MAX_NAME_LENGTH}
              autoFocus
              returnKeyType="done"
            />
          </>
        ) : (
          <>
            <Text style={styles.emoji}>{emoji}</Text>
            <Text style={styles.name}>{name}</Text>
          </>
        )}
      </View>

      {/* Durée */}
      <Text style={styles.sectionLabel}>
        {t('onboarding.creation.durationLabel')}
      </Text>
      <View style={styles.durationRow}>
        {DURATION_PRESETS.map((preset) => {
          const isSelected = duration === preset.seconds;
          return (
            <TouchableOpacity
              key={preset.minutes}
              style={[
                styles.durationButton,
                isSelected && styles.durationButtonSelected,
              ]}
              onPress={() => handleDurationSelect(preset.seconds)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.durationText,
                  isSelected && styles.durationTextSelected,
                ]}
              >
                {preset.minutes}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* CTA */}
      <TouchableOpacity
        style={[styles.ctaButton, !isValid && styles.ctaButtonDisabled]}
        onPress={handleSubmit}
        disabled={!isValid}
        activeOpacity={0.8}
      >
        <Text style={styles.ctaButtonText}>
          {t('onboarding.creation.cta')}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

CustomizeStep.propTypes = {
  intention: PropTypes.shape({
    id: PropTypes.string.isRequired,
    emoji: PropTypes.string.isRequired,
    defaultNameKey: PropTypes.string.isRequired,
    defaultDuration: PropTypes.number.isRequired,
  }).isRequired,
  onBack: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};
