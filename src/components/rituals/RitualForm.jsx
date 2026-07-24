/**
 * @fileoverview RitualForm — formulaire unique SCR-16 (création + édition)
 * @description 4 champs dans l'ordre (spec recentrage) : Emoji → Couleur →
 * Durée → Son de fin. Emoji custom (SCR-17) : clavier système, crée une
 * Activité anonyme à la volée (ADR-015) — invisible pour l'user.
 */
import React, { useRef, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { useTimerConfig } from '../../contexts/TimerConfigContext';
import { useCustomActivities } from '../../hooks/useCustomActivities';
import { useTranslation } from '../../hooks/useTranslation';
import { getActivityById } from '../../config/activities';
import { deriveRitualName, resolveRitualActivity, suggestedColorFor } from '../../config/rituals';
import { DEFAULT_SOUND_ID } from '../../config/sounds';
import DurationSlider from '../pickers/DurationSlider';
import SoundPicker from '../pickers/SoundPicker';
import { fontWeights } from '../../theme/tokens';
import { rs } from '../../styles/responsive';
import haptics from '../../utils/haptics';

const FORM_ACTIVITY_IDS = ['meditation', 'break', 'work'];

export default function RitualForm({ initialRitual, onSave, onCancel, onDelete }) {
  const theme = useTheme();
  const t = useTranslation();
  const {
    palette: { paletteColors },
  } = useTimerConfig();
  const { customActivities, createActivity } = useCustomActivities();
  const nativeEmojiInputRef = useRef(null);

  const initialActivity = initialRitual
    ? resolveRitualActivity(initialRitual, customActivities)
    : getActivityById(FORM_ACTIVITY_IDS[0]);
  const initialBuiltInId = FORM_ACTIVITY_IDS.includes(initialActivity?.id) ? initialActivity.id : null;

  const [selectedActivityId, setSelectedActivityId] = useState(initialBuiltInId);
  const [pendingCustomEmoji, setPendingCustomEmoji] = useState(
    initialBuiltInId ? null : initialActivity?.emoji || null
  );
  const [color, setColor] = useState(
    initialRitual ? initialRitual.color : suggestedColorFor(initialActivity)
  );
  const [duration, setDuration] = useState(
    initialRitual ? initialRitual.duration : initialActivity?.defaultDuration
  );
  const [soundId, setSoundId] = useState(initialRitual?.soundId || DEFAULT_SOUND_ID);

  const handleSelectBuiltIn = (activityId) => {
    haptics.selection().catch(() => {});
    setSelectedActivityId(activityId);
    setPendingCustomEmoji(null);
  };

  const handleOpenCustomEmoji = () => {
    nativeEmojiInputRef.current?.focus();
  };

  const handleNativeEmojiChange = (text) => {
    const emojiRegex = /[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu;
    const emojis = text.match(emojiRegex);
    if (emojis && emojis.length > 0) {
      haptics.selection().catch(() => {});
      setPendingCustomEmoji(emojis[emojis.length - 1]);
      setSelectedActivityId(null);
      nativeEmojiInputRef.current?.blur();
    }
  };

  const handleSave = () => {
    let activityId = selectedActivityId;
    let name;

    if (activityId) {
      name = deriveRitualName(getActivityById(activityId));
    } else if (pendingCustomEmoji && pendingCustomEmoji !== initialActivity?.emoji) {
      const created = createActivity(
        pendingCustomEmoji,
        t('rituals.form.customActivityName'),
        duration,
        { isPremium: false }
      );
      activityId = created.id;
      name = deriveRitualName(created);
    } else if (initialRitual) {
      activityId = initialRitual.activityId;
      name = initialRitual.name;
    } else {
      return; // pas de sélection possible — le premier bouton est présélectionné
    }

    onSave({ name, activityId, color, duration, soundId });
  };

  const handleDelete = () => {
    Alert.alert(
      t('rituals.form.deleteConfirmTitle'),
      t('rituals.form.deleteConfirmMessage'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('rituals.form.deleteButton'), style: 'destructive', onPress: () => onDelete(initialRitual.id) },
      ]
    );
  };

  const styles = StyleSheet.create({
    cancelButton: {
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.border,
      borderRadius: theme.borderRadius.lg,
      borderWidth: 1,
      flex: 1,
      justifyContent: 'center',
      minHeight: rs(48, 'min'),
      padding: theme.spacing.sm,
    },
    cancelButtonText: {
      color: theme.colors.textSecondary,
      fontSize: rs(15, 'min'),
      fontWeight: fontWeights.semibold,
    },
    closeButton: {
      minHeight: 44,
      minWidth: 44,
      padding: theme.spacing.xs,
    },
    closeButtonText: {
      color: theme.colors.textSecondary,
      fontSize: rs(18, 'min'),
    },
    colorDot: {
      borderColor: theme.colors.shadow,
      borderRadius: theme.borderRadius.round,
      borderWidth: 1.5,
      height: rs(32, 'min'),
      padding: 3,
      width: rs(32, 'min'),
    },
    colorDotActive: {
      borderColor: theme.colors.text,
      borderWidth: 2,
    },
    colorDotInner: {
      borderRadius: theme.borderRadius.round,
      flex: 1,
    },
    colorRow: {
      flexDirection: 'row',
      gap: theme.spacing.md,
    },
    deleteButton: {
      alignItems: 'center',
      marginTop: theme.spacing.md,
      minHeight: 44,
      padding: theme.spacing.sm,
    },
    deleteButtonText: {
      color: theme.colors.danger,
      fontSize: rs(14, 'min'),
      fontWeight: fontWeights.medium,
    },
    emojiButton: {
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.border,
      borderRadius: theme.borderRadius.round,
      borderWidth: 2,
      height: rs(48, 'min'),
      justifyContent: 'center',
      width: rs(48, 'min'),
    },
    emojiButtonActive: {
      borderColor: theme.colors.brand.primary,
    },
    emojiButtonText: {
      fontSize: rs(22, 'min'),
    },
    emojiCustomButtonText: {
      color: theme.colors.textSecondary,
      fontSize: rs(20, 'min'),
      fontWeight: fontWeights.medium,
    },
    emojiRow: {
      flexDirection: 'row',
      gap: theme.spacing.md,
    },
    footer: {
      flexDirection: 'row',
      gap: theme.spacing.md,
      paddingTop: theme.spacing.md,
    },
    header: {
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: theme.spacing.sm,
    },
    hiddenEmojiInput: {
      height: 0,
      opacity: 0,
      position: 'absolute',
      width: 0,
    },
    saveButton: {
      alignItems: 'center',
      backgroundColor: theme.colors.brand.primary,
      borderRadius: theme.borderRadius.lg,
      flex: 2,
      justifyContent: 'center',
      minHeight: rs(48, 'min'),
      padding: theme.spacing.sm,
    },
    saveButtonText: {
      color: theme.colors.fixed.white,
      fontSize: rs(15, 'min'),
      fontWeight: fontWeights.semibold,
    },
    section: {
      marginTop: theme.spacing.md,
    },
    sectionLabel: {
      color: theme.colors.textSecondary,
      fontSize: rs(13, 'min'),
      fontWeight: fontWeights.semibold,
      marginBottom: theme.spacing.xs,
    },
    title: {
      color: theme.colors.text,
      fontSize: rs(17, 'min'),
      fontWeight: fontWeights.semibold,
    },
  });

  return (
    <View>
      <View style={styles.header}>
        <Text style={styles.title} accessibilityRole="header">
          {initialRitual ? t('rituals.form.editTitle') : t('rituals.form.createTitle')}
        </Text>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={onCancel}
          accessible
          accessibilityRole="button"
          accessibilityLabel={t('accessibility.closeRitualForm')}
        >
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>
      </View>

      <ScrollView nestedScrollEnabled showsVerticalScrollIndicator={false}>
        {/* 1. Emoji */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{t('rituals.form.emojiLabel')}</Text>
          <View style={styles.emojiRow}>
            {FORM_ACTIVITY_IDS.map((activityId) => {
              const activity = getActivityById(activityId);
              const isActive = selectedActivityId === activityId;
              return (
                <TouchableOpacity
                  key={activityId}
                  style={[styles.emojiButton, isActive && styles.emojiButtonActive]}
                  onPress={() => handleSelectBuiltIn(activityId)}
                  activeOpacity={0.7}
                  accessible
                  accessibilityRole="button"
                  accessibilityLabel={activity.label}
                  accessibilityState={{ selected: isActive }}
                >
                  <Text style={styles.emojiButtonText}>{activity.emoji}</Text>
                </TouchableOpacity>
              );
            })}
            <TouchableOpacity
              style={[styles.emojiButton, !selectedActivityId && pendingCustomEmoji && styles.emojiButtonActive]}
              onPress={handleOpenCustomEmoji}
              activeOpacity={0.7}
              accessible
              accessibilityRole="button"
              accessibilityLabel={t('accessibility.chooseCustomEmoji')}
            >
              {!selectedActivityId && pendingCustomEmoji ? (
                <Text style={styles.emojiButtonText}>{pendingCustomEmoji}</Text>
              ) : (
                <Text style={styles.emojiCustomButtonText}>+</Text>
              )}
            </TouchableOpacity>
            <TextInput
              ref={nativeEmojiInputRef}
              style={styles.hiddenEmojiInput}
              value=""
              onChangeText={handleNativeEmojiChange}
              maxLength={8}
            />
          </View>
        </View>

        {/* 2. Couleur */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{t('rituals.form.colorLabel')}</Text>
          <View style={styles.colorRow}>
            {paletteColors.map((paletteColor, index) => (
              <TouchableOpacity
                key={paletteColor}
                style={[
                  styles.colorDot,
                  color === paletteColor && styles.colorDotActive,
                ]}
                onPress={() => {
                  haptics.selection().catch(() => {});
                  setColor(paletteColor);
                }}
                activeOpacity={0.7}
                accessible
                accessibilityRole="button"
                accessibilityLabel={t('accessibility.colorNumber', { number: index + 1 })}
                accessibilityState={{ selected: color === paletteColor }}
              >
                <View style={[styles.colorDotInner, { backgroundColor: paletteColor }]} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 3. Durée */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{t('rituals.form.durationLabel')}</Text>
          <DurationSlider value={duration} onValueChange={setDuration} />
        </View>

        {/* 4. Son de fin */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{t('rituals.form.soundLabel')}</Text>
          <SoundPicker selectedSoundId={soundId} onSoundSelect={setSoundId} />
        </View>

        {initialRitual && (
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDelete}
            accessible
            accessibilityRole="button"
            accessibilityLabel={t('rituals.form.deleteButton')}
          >
            <Text style={styles.deleteButtonText}>{t('rituals.form.deleteButton')}</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.cancelButton} onPress={onCancel} activeOpacity={0.7}>
          <Text style={styles.cancelButtonText}>{t('common.cancel')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave} activeOpacity={0.8}>
          <Text style={styles.saveButtonText}>{t('rituals.form.saveButton')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
