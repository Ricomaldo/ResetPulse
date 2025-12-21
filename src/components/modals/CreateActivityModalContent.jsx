/**
 * @fileoverview CreateActivityModalContent - Content for creating custom activities
 * Pure content component (no BottomSheetModal wrapper - handled by ModalStackRenderer)
 * @created 2025-12-21
 * @updated 2025-12-21
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Alert,
  KeyboardAvoidingView,
} from 'react-native';
import { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { useTheme } from '../../theme/ThemeProvider';
import { useTranslation } from '../../hooks/useTranslation';
import { usePremiumStatus } from '../../hooks/usePremiumStatus';
import { useCustomActivities } from '../../hooks/useCustomActivities';
import { useModalStack } from '../../contexts/ModalStackContext';
import EmojiPicker from '../pickers/EmojiPicker';
import DurationSlider from '../pickers/DurationSlider';
import { rs } from '../../styles/responsive';
import haptics from '../../utils/haptics';
import analytics from '../../services/analytics';
import { fontWeights } from '../../theme/tokens';

// Constants
const MAX_NAME_LENGTH = 20;
const DEFAULT_DURATION = 1800; // 30 minutes

/**
 * CreateActivityModalContent
 *
 * Business logic for creating custom activities (Premium feature).
 * Includes emoji picker, name input, duration slider, and validation.
 *
 * @param {Function} onClose - Callback to close modal
 * @param {Function} onActivityCreated - Callback when activity is created
 */
export default function CreateActivityModalContent({
  onClose,
  onActivityCreated,
}) {
  const theme = useTheme();
  const t = useTranslation();
  const { isPremium } = usePremiumStatus();
  const { createActivity } = useCustomActivities();
  const modalStack = useModalStack();

  // Form state
  const [selectedEmoji, setSelectedEmoji] = useState('');
  const [activityName, setActivityName] = useState('');
  const [duration, setDuration] = useState(DEFAULT_DURATION);

  const handleClose = () => {
    haptics.selection().catch(() => { /* Optional operation - failure is non-critical */ });
    onClose();
  };

  const formatDuration = (seconds) => {
    const minutes = Math.round(seconds / 60);
    return `${minutes} ${t('customActivities.duration.minutes')}`;
  };

  const handleCreate = () => {
    // Validate inputs
    if (!selectedEmoji) {
      haptics.warning().catch(() => { /* Optional operation - failure is non-critical */ });
      Alert.alert(
        t('customActivities.create.errorTitle'),
        t('customActivities.create.errorEmoji')
      );
      return;
    }

    if (!activityName.trim()) {
      haptics.warning().catch(() => { /* Optional operation - failure is non-critical */ });
      Alert.alert(
        t('customActivities.create.errorTitle'),
        t('customActivities.create.errorName')
      );
      return;
    }

    // Premium gate
    if (!isPremium) {
      analytics.trackCustomActivityCreateAttemptFreeUser();

      // Close current modal and push premium modal
      onClose();
      setTimeout(() => {
        modalStack.push('premium', {
          highlightedFeature: 'customActivities',
        });
      }, 300);
      return;
    }

    // Create the activity
    const newActivity = createActivity(
      selectedEmoji,
      activityName.trim(),
      duration
    );

    // Track analytics
    analytics.trackCustomActivityCreated(
      selectedEmoji,
      activityName.trim().length,
      duration
    );

    haptics.success().catch(() => { /* Optional operation - failure is non-critical */ });
    onActivityCreated?.(newActivity);
    onClose();
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
      minHeight: rs(52, 'min'),
      padding: theme.spacing.md,
    },

    cancelButtonText: {
      color: theme.colors.textSecondary,
      fontSize: rs(16, 'min'),
      fontWeight: fontWeights.semibold,
    },

    charCounter: {
      color: theme.colors.textSecondary,
      fontSize: rs(12, 'min'),
    },

    clearButton: {
      padding: theme.spacing.xs,
    },

    clearButtonText: {
      color: theme.colors.textSecondary,
      fontSize: rs(16, 'min'),
    },

    closeButton: {
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.md,
      justifyContent: 'center',
      margin: -theme.spacing.xs,
      minHeight: 44,
      minWidth: 44,
      padding: theme.spacing.sm,
    },

    closeButtonText: {
      color: theme.colors.textSecondary,
      fontSize: rs(18, 'min'),
    },

    container: {
      flex: 1,
    },

    createButton: {
      alignItems: 'center',
      backgroundColor: theme.colors.brand.primary,
      borderRadius: theme.borderRadius.lg,
      flex: 2,
      justifyContent: 'center',
      minHeight: rs(52, 'min'),
      padding: theme.spacing.md,
      ...theme.shadow('md'),
    },

    createButtonDisabled: {
      backgroundColor: theme.colors.textSecondary,
      opacity: 0.5,
    },

    createButtonText: {
      color: theme.colors.fixed.white,
      fontSize: rs(16, 'min'),
      fontWeight: fontWeights.semibold,
    },

    durationContainer: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.md,
    },

    emojiPickerContainer: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      maxHeight: rs(200, 'min'),
      padding: theme.spacing.sm,
    },

    footer: {
      borderTopColor: theme.colors.border,
      borderTopWidth: StyleSheet.hairlineWidth,
      flexDirection: 'row',
      gap: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.lg,
    },

    header: {
      alignItems: 'center',
      borderBottomColor: theme.colors.border,
      borderBottomWidth: StyleSheet.hairlineWidth,
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingBottom: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.lg,
    },

    headerTitle: {
      color: theme.colors.text,
      fontSize: rs(20, 'min'),
      fontWeight: fontWeights.bold,
    },

    input: {
      color: theme.colors.text,
      flex: 1,
      fontSize: rs(16, 'min'),
      height: rs(48, 'min'),
    },

    inputContainer: {
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.border,
      borderRadius: theme.borderRadius.lg,
      borderWidth: 1,
      flexDirection: 'row',
      paddingHorizontal: theme.spacing.md,
    },

    previewCard: {
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.border,
      borderRadius: theme.borderRadius.lg,
      borderWidth: 1,
      flexDirection: 'row',
      padding: theme.spacing.md,
    },

    previewDuration: {
      color: theme.colors.textSecondary,
      fontSize: rs(14, 'min'),
      marginTop: theme.spacing.xs,
    },

    previewEmoji: {
      fontSize: rs(40, 'min'),
      marginRight: theme.spacing.md,
    },

    previewInfo: {
      flex: 1,
    },

    previewName: {
      color: theme.colors.text,
      fontSize: rs(18, 'min'),
      fontWeight: fontWeights.semibold,
    },

    previewPlaceholder: {
      fontSize: rs(40, 'min'),
      marginRight: theme.spacing.md,
      opacity: 0.3,
    },

    previewSection: {
      marginTop: theme.spacing.xl,
    },

    scrollContent: {
      paddingBottom: theme.spacing.xl,
      paddingHorizontal: theme.spacing.lg,
    },

    section: {
      marginTop: theme.spacing.lg,
    },

    sectionLabel: {
      color: theme.colors.textSecondary,
      fontSize: rs(14, 'min'),
      fontWeight: fontWeights.semibold,
      marginBottom: theme.spacing.sm,
    },
  });

  const isFormValid = selectedEmoji && activityName.trim().length > 0;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text
          style={styles.headerTitle}
          accessibilityRole="header"
        >
          {t('customActivities.create.title')}
        </Text>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={handleClose}
          activeOpacity={0.7}
          accessibilityLabel={t('accessibility.closeCreateActivity')}
          accessibilityRole="button"
          accessibilityHint={t('accessibility.closeModalHint')}
        >
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <BottomSheetScrollView
        style={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Emoji Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>
            {t('customActivities.create.emojiLabel')}
          </Text>
          <View style={styles.emojiPickerContainer}>
            <EmojiPicker
              selectedEmoji={selectedEmoji}
              onSelectEmoji={setSelectedEmoji}
            />
          </View>
        </View>

        {/* Name Input */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>
            {t('customActivities.create.nameLabel')}
          </Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={activityName}
              onChangeText={(text) =>
                setActivityName(text.slice(0, MAX_NAME_LENGTH))
              }
              placeholder={t('customActivities.create.namePlaceholder')}
              placeholderTextColor={theme.colors.textSecondary}
              maxLength={MAX_NAME_LENGTH}
              returnKeyType="done"
            />
            <Text style={styles.charCounter}>
              {activityName.length}/{MAX_NAME_LENGTH}
            </Text>
            {activityName.length > 0 && (
              <TouchableOpacity
                style={styles.clearButton}
                onPress={() => setActivityName('')}
                activeOpacity={0.7}
              >
                <Text style={styles.clearButtonText}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Duration Picker */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>
            {t('customActivities.create.durationLabel')}
          </Text>
          <View style={styles.durationContainer}>
            <DurationSlider
              value={duration}
              onValueChange={setDuration}
            />
          </View>
        </View>

        {/* Preview */}
        <View style={styles.previewSection}>
          <Text style={styles.sectionLabel}>
            {t('customActivities.create.preview')}
          </Text>
          <View style={styles.previewCard}>
            <Text
              style={
                selectedEmoji
                  ? styles.previewEmoji
                  : styles.previewPlaceholder
              }
            >
              {selectedEmoji || '?'}
            </Text>
            <View style={styles.previewInfo}>
              <Text style={styles.previewName}>
                {activityName.trim() ||
                  t('customActivities.create.previewPlaceholder')}
              </Text>
              <Text style={styles.previewDuration}>
                {formatDuration(duration)}
              </Text>
            </View>
          </View>
        </View>
      </BottomSheetScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={handleClose}
          activeOpacity={0.7}
          accessibilityLabel={t('customActivities.create.buttonCancel')}
          accessibilityRole="button"
          accessibilityHint={t('accessibility.closeModalHint')}
        >
          <Text style={styles.cancelButtonText}>
            {t('customActivities.create.buttonCancel')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.createButton,
            !isFormValid && styles.createButtonDisabled,
          ]}
          onPress={handleCreate}
          activeOpacity={0.8}
          disabled={!isFormValid}
          accessibilityLabel={t('customActivities.create.buttonCreate')}
          accessibilityRole="button"
          accessibilityHint={t('accessibility.createActivityHint')}
          accessibilityState={{ disabled: !isFormValid }}
        >
          <Text style={styles.createButtonText}>
            {t('customActivities.create.buttonCreate')}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
