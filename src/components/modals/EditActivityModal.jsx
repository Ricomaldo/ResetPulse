// src/components/modals/EditActivityModal.jsx
// Modal for editing/deleting custom activities

import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Alert,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { useTranslation } from '../../hooks/useTranslation';
import { useCustomActivities } from '../../hooks/useCustomActivities';
import EmojiPicker from '../pickers/EmojiPicker';
import DurationSlider from '../pickers/DurationSlider';
import { rs } from '../../styles/responsive';
import haptics from '../../utils/haptics';
import analytics from '../../services/analytics';

// Constants
const MAX_NAME_LENGTH = 20;

export default function EditActivityModal({
  visible,
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
    if (visible && activity) {
      setSelectedEmoji(activity.emoji || '');
      setActivityName(activity.name || activity.label || '');
      setDuration(activity.defaultDuration || 1800);
    }
  }, [visible, activity]);

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
    overlay: {
      flex: 1,
      backgroundColor: Platform.select({
        ios: 'rgba(0, 0, 0, 0.4)',
        android: 'rgba(0, 0, 0, 0.5)',
      }),
      justifyContent: 'flex-end',
    },

    modalContainer: {
      backgroundColor: theme.colors.background,
      borderTopLeftRadius: Platform.select({
        ios: 24,
        android: 20,
      }),
      borderTopRightRadius: Platform.select({
        ios: 24,
        android: 20,
      }),
      maxHeight: '90%',
      ...theme.shadow('xl'),
      ...Platform.select({
        ios: {
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: theme.colors.border + '30',
        },
        android: {},
      }),
    },

    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.lg,
      paddingBottom: theme.spacing.md,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.colors.border,
    },

    headerTitle: {
      fontSize: rs(20, 'min'),
      fontWeight: 'bold',
      color: theme.colors.text,
    },

    closeButton: {
      width: rs(32, 'min'),
      height: rs(32, 'min'),
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: rs(16, 'min'),
      backgroundColor: theme.colors.surface,
    },

    closeButtonText: {
      fontSize: rs(18, 'min'),
      color: theme.colors.textSecondary,
    },

    scrollContent: {
      paddingHorizontal: theme.spacing.lg,
      paddingBottom: theme.spacing.xl,
    },

    section: {
      marginTop: theme.spacing.lg,
    },

    sectionLabel: {
      fontSize: rs(14, 'min'),
      fontWeight: '600',
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.sm,
    },

    emojiPickerContainer: {
      maxHeight: rs(200, 'min'),
      borderRadius: theme.borderRadius.lg,
      backgroundColor: theme.colors.surface,
      padding: theme.spacing.sm,
    },

    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      paddingHorizontal: theme.spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },

    input: {
      flex: 1,
      height: rs(48, 'min'),
      fontSize: rs(16, 'min'),
      color: theme.colors.text,
    },

    charCounter: {
      fontSize: rs(12, 'min'),
      color: theme.colors.textSecondary,
    },

    clearButton: {
      padding: theme.spacing.xs,
    },

    clearButtonText: {
      fontSize: rs(16, 'min'),
      color: theme.colors.textSecondary,
    },

    durationContainer: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.md,
    },

    statsSection: {
      marginTop: theme.spacing.xl,
    },

    statsCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.md,
    },

    statsIcon: {
      fontSize: rs(24, 'min'),
      marginRight: theme.spacing.md,
    },

    statsText: {
      fontSize: rs(14, 'min'),
      color: theme.colors.textSecondary,
    },

    footer: {
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.lg,
      gap: theme.spacing.md,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: theme.colors.border,
    },

    buttonRow: {
      flexDirection: 'row',
      gap: theme.spacing.md,
    },

    cancelButton: {
      flex: 1,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.md,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: rs(52, 'min'),
      borderWidth: 1,
      borderColor: theme.colors.border,
    },

    cancelButtonText: {
      fontSize: rs(16, 'min'),
      fontWeight: '600',
      color: theme.colors.textSecondary,
    },

    saveButton: {
      flex: 2,
      backgroundColor: theme.colors.brand.primary,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.md,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: rs(52, 'min'),
      ...theme.shadow('md'),
    },

    saveButtonDisabled: {
      backgroundColor: theme.colors.textSecondary,
      opacity: 0.5,
    },

    saveButtonText: {
      fontSize: rs(16, 'min'),
      fontWeight: '600',
      color: '#FFFFFF',
    },

    deleteButton: {
      backgroundColor: 'transparent',
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.md,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: rs(48, 'min'),
      borderWidth: 1,
      borderColor: theme.colors.fixed?.red || '#FF3B30',
    },

    deleteButtonText: {
      fontSize: rs(16, 'min'),
      fontWeight: '600',
      color: theme.colors.fixed?.red || '#FF3B30',
    },
  });

  const isFormValid = selectedEmoji && activityName.trim().length > 0;

  if (!activity) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={handleClose}
        >
          <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalContainer}>
              {/* Header */}
              <View style={styles.header}>
                <Text style={styles.headerTitle}>
                  {t('customActivities.edit.title')}
                </Text>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={handleClose}
                  activeOpacity={0.7}
                >
                  <Text style={styles.closeButtonText}>X</Text>
                </TouchableOpacity>
              </View>

              {/* Content */}
              <ScrollView
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
                        <Text style={styles.clearButtonText}>X</Text>
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
              </ScrollView>

              {/* Footer */}
              <View style={styles.footer}>
                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={handleClose}
                    activeOpacity={0.7}
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
                >
                  <Text style={styles.deleteButtonText}>
                    {t('customActivities.edit.buttonDelete')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </Modal>
  );
}
