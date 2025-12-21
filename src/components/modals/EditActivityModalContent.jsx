/**
 * @fileoverview EditActivityModalContent - Content for editing/deleting custom activities
 * Pure content component (no BottomSheetModal wrapper - handled by ModalStackRenderer)
 * @created 2025-12-21
 * @updated 2025-12-21
 */
import React, { useState, useEffect } from 'react';
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
import { useCustomActivities } from '../../hooks/useCustomActivities';
import { rs } from '../../styles/responsive';
import haptics from '../../utils/haptics';
import analytics from '../../services/analytics';
import { fontWeights } from '../../theme/tokens';
import EmojiPicker from '../pickers/EmojiPicker';
import DurationSlider from '../pickers/DurationSlider';

// Constants
const MAX_NAME_LENGTH = 20;

/**
 * EditActivityModalContent
 *
 * Business logic for editing/deleting custom activities.
 * Includes emoji picker, name input, duration slider, validation, and delete confirmation.
 *
 * @param {Function} onClose - Callback to close modal
 * @param {Object} activity - Activity object being edited
 * @param {Function} onActivityUpdated - Callback when activity is updated
 * @param {Function} onActivityDeleted - Callback when activity is deleted
 */
export default function EditActivityModalContent({
  onClose,
  activity,
  onActivityUpdated,
  onActivityDeleted,
}) {
  const theme = useTheme();
  const t = useTranslation();
  const { updateActivity, deleteActivity: removeActivity } = useCustomActivities();

  // Form state
  const [selectedEmoji, setSelectedEmoji] = useState('');
  const [activityName, setActivityName] = useState('');
  const [duration, setDuration] = useState(1800);

  // Initialize form with activity data
  useEffect(() => {
    if (activity) {
      setSelectedEmoji(activity.emoji || '');
      setActivityName(activity.name || activity.label || '');
      setDuration(activity.defaultDuration || 1800);
    }
  }, [activity]);

  const handleClose = () => {
    haptics.selection().catch(() => { /* Optional operation - failure is non-critical */ });
    onClose();
  };

  const handleSave = () => {
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

    // Update the activity
    updateActivity(activity.id, {
      emoji: selectedEmoji,
      name: activityName.trim(),
      defaultDuration: duration,
    });

    // Track analytics
    analytics.trackCustomActivityEdited(activity.id);

    haptics.success().catch(() => { /* Optional operation - failure is non-critical */ });
    onActivityUpdated?.({
      ...activity,
      emoji: selectedEmoji,
      name: activityName.trim(),
      label: activityName.trim(),
      defaultDuration: duration,
    });
    onClose();
  };

  const handleDelete = () => {
    haptics.warning().catch(() => { /* Optional operation - failure is non-critical */ });

    Alert.alert(
      t('customActivities.edit.deleteConfirmTitle'),
      t('customActivities.edit.deleteConfirmMessage'),
      [
        {
          text: t('customActivities.edit.deleteCancelButton'),
          style: 'cancel',
        },
        {
          text: t('customActivities.edit.deleteConfirmButton'),
          style: 'destructive',
          onPress: () => {
            // Track analytics before deletion
            analytics.trackCustomActivityDeleted(
              activity.id,
              activity.timesUsed || 0
            );

            // Delete the activity
            removeActivity(activity.id);

            haptics.notification('error').catch(() => { /* Optional operation - failure is non-critical */ });
            onActivityDeleted?.(activity);
            onClose();
          },
        },
      ]
    );
  };

  const styles = StyleSheet.create({
    buttonRow: {
      flexDirection: 'row',
      gap: theme.spacing.md,
    },

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

    deleteButton: {
      alignItems: 'center',
      backgroundColor: theme.colors.fixed.transparent,
      borderColor: theme.colors.fixed.red,
      borderRadius: theme.borderRadius.lg,
      borderWidth: 1,
      justifyContent: 'center',
      minHeight: rs(48, 'min'),
      padding: theme.spacing.md,
    },

    deleteButtonText: {
      color: theme.colors.fixed.red,
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

    saveButton: {
      alignItems: 'center',
      backgroundColor: theme.colors.brand.primary,
      borderRadius: theme.borderRadius.lg,
      flex: 2,
      justifyContent: 'center',
      minHeight: rs(52, 'min'),
      padding: theme.spacing.md,
      ...theme.shadow('md'),
    },

    saveButtonDisabled: {
      backgroundColor: theme.colors.textSecondary,
      opacity: 0.5,
    },

    saveButtonText: {
      color: theme.colors.fixed.white,
      fontSize: rs(16, 'min'),
      fontWeight: fontWeights.semibold,
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

    statsCard: {
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      flexDirection: 'row',
      padding: theme.spacing.md,
    },

    statsIcon: {
      fontSize: rs(24, 'min'),
      marginRight: theme.spacing.md,
    },

    statsSection: {
      marginTop: theme.spacing.xl,
    },

    statsText: {
      color: theme.colors.textSecondary,
      fontSize: rs(14, 'min'),
    },
  });

  const isFormValid = selectedEmoji && activityName.trim().length > 0;

  if (!activity) {
    return null;
  }

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
          {t('customActivities.edit.title')}
        </Text>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={handleClose}
          activeOpacity={0.7}
          accessibilityLabel={t('accessibility.closeEditActivity')}
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

        {/* Usage Stats */}
        {activity.timesUsed > 0 && (
          <View style={styles.statsSection}>
            <View style={styles.statsCard}>
              <Text style={styles.statsIcon}>📊</Text>
              <Text style={styles.statsText}>
                {t('customActivities.edit.usageStats', {
                  count: activity.timesUsed,
                })}
              </Text>
            </View>
          </View>
        )}
      </BottomSheetScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.buttonRow}>
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
              styles.saveButton,
              !isFormValid && styles.saveButtonDisabled,
            ]}
            onPress={handleSave}
            activeOpacity={0.8}
            disabled={!isFormValid}
            accessibilityLabel={t('customActivities.edit.buttonSave')}
            accessibilityRole="button"
            accessibilityHint={t('accessibility.saveActivityHint')}
            accessibilityState={{ disabled: !isFormValid }}
          >
            <Text style={styles.saveButtonText}>
              {t('customActivities.edit.buttonSave')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Delete Button */}
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleDelete}
          activeOpacity={0.7}
          accessibilityLabel={t('customActivities.edit.buttonDelete')}
          accessibilityRole="button"
          accessibilityHint={t('accessibility.deleteActivityHint')}
        >
          <Text style={styles.deleteButtonText}>
            {t('customActivities.edit.buttonDelete')}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
