// src/components/modals/CreateActivityModal.jsx
// Modal for creating custom activities (Premium feature)

import React, { useState } from 'react';
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
import { usePremiumStatus } from '../../hooks/usePremiumStatus';
import { useCustomActivities } from '../../hooks/useCustomActivities';
import EmojiPicker from '../pickers/EmojiPicker';
import DurationSlider from '../pickers/DurationSlider';
import { rs } from '../../styles/responsive';
import haptics from '../../utils/haptics';
import analytics from '../../services/analytics';
import { fontWeights } from '../../theme/tokens';

// Constants
const MAX_NAME_LENGTH = 20;
const DEFAULT_DURATION = 1800; // 30 minutes

export default function CreateActivityModal({
  visible,
  onClose,
  onOpenPaywall,
  onActivityCreated,
}) {
  const theme = useTheme();
  const t = useTranslation();
  const { isPremium } = usePremiumStatus();
  const { createActivity } = useCustomActivities();

  // Form state
  const [selectedEmoji, setSelectedEmoji] = useState('');
  const [activityName, setActivityName] = useState('');
  const [duration, setDuration] = useState(DEFAULT_DURATION);

  // Reset form when modal opens/closes
  React.useEffect(() => {
    if (visible) {
      setSelectedEmoji('');
      setActivityName('');
      setDuration(DEFAULT_DURATION);
    }
  }, [visible]);

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
      Alert.alert(
        t('customActivities.premium.gateTitle'),
        t('customActivities.premium.gateMessage'),
        [
          {
            text: t('customActivities.premium.gateDismiss'),
            style: 'cancel',
          },
          {
            text: t('customActivities.premium.gateButton'),
            onPress: () => {
              onClose();
              setTimeout(() => {
                onOpenPaywall?.();
              }, 300);
            },
          },
        ]
      );
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
      fontWeight: fontWeights.bold,
      color: theme.colors.text,
    },

    closeButton: {
      padding: theme.spacing.sm,
      minWidth: 44,
      minHeight: 44,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: theme.borderRadius.md,
      backgroundColor: theme.colors.surface,
      margin: -theme.spacing.xs,
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
      fontWeight: fontWeights.semibold,
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

    previewSection: {
      marginTop: theme.spacing.xl,
    },

    previewCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },

    previewEmoji: {
      fontSize: rs(40, 'min'),
      marginRight: theme.spacing.md,
    },

    previewInfo: {
      flex: 1,
    },

    previewName: {
      fontSize: rs(18, 'min'),
      fontWeight: fontWeights.semibold,
      color: theme.colors.text,
    },

    previewDuration: {
      fontSize: rs(14, 'min'),
      color: theme.colors.textSecondary,
      marginTop: theme.spacing.xs,
    },

    previewPlaceholder: {
      fontSize: rs(40, 'min'),
      marginRight: theme.spacing.md,
      opacity: 0.3,
    },

    footer: {
      flexDirection: 'row',
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.lg,
      gap: theme.spacing.md,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: theme.colors.border,
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
      fontWeight: fontWeights.semibold,
      color: theme.colors.textSecondary,
    },

    createButton: {
      flex: 2,
      backgroundColor: theme.colors.brand.primary,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.md,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: rs(52, 'min'),
      ...theme.shadow('md'),
    },

    createButtonDisabled: {
      backgroundColor: theme.colors.textSecondary,
      opacity: 0.5,
    },

    createButtonText: {
      fontSize: rs(16, 'min'),
      fontWeight: fontWeights.semibold,
      color: '#FFFFFF',
    },
  });

  const isFormValid = selectedEmoji && activityName.trim().length > 0;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
      statusBarTranslucent
      accessible={true}
      accessibilityViewIsModal={true}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={handleClose}
          accessible={false}
          importantForAccessibility="no"
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
            accessible={false}
          >
            <View
              style={styles.modalContainer}
              accessible={true}
              accessibilityRole="dialog"
              accessibilityLabel={t('customActivities.create.title')}
              accessibilityHint={t('accessibility.createActivityModalHint')}
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
              </ScrollView>

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
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </Modal>
  );
}
