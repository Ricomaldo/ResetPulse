/**
 * @fileoverview CreateActivityForm - Pure UI form for creating custom activities
 * @description Dual-mode form: simplified onboarding vs full customization
 * @created 2025-12-22
 * @updated 2025-12-22 - Added dual-mode support (onboarding | full)
 */
import React, { useState, useRef } from 'react';
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
import PropTypes from 'prop-types';
import { useTheme } from '../../theme/ThemeProvider';
import { useTranslation } from '../../hooks/useTranslation';
import DurationSlider from '../pickers/DurationSlider';
import IntentionPicker from '../onboarding/IntentionPicker';
import CustomizeStep from './CustomizeStep';
import { rs } from '../../styles/responsive';
import { fontWeights, typography } from '../../theme/tokens';

// Constants
const MAX_NAME_LENGTH = 20;
const DEFAULT_DURATION = 1800; // 30 minutes

/**
 * CreateActivityForm - Dual-mode form component
 *
 * @param {string} mode - Form mode: "onboarding" (simplified) | "full" (complete customization)
 * @param {Function} onSubmit - Callback with form data: { emoji, name, defaultDuration }
 * @param {Function} onCancel - Optional cancel callback
 * @param {boolean} showCancelButton - Show cancel button in footer
 * @param {boolean} showHeader - Show header with close button
 * @param {Function} children - Render prop for scroll container wrapper
 */
export default function CreateActivityForm({
  mode = 'full',
  onSubmit,
  onCancel,
  onIntentionSelect,
  showCancelButton = true,
  showHeader = true,
  children,
}) {
  const theme = useTheme();
  const t = useTranslation();
  const nativeEmojiInputRef = useRef(null);

  // Form state
  const [selectedEmoji, setSelectedEmoji] = useState('');
  const [activityName, setActivityName] = useState('');
  const [duration, setDuration] = useState(DEFAULT_DURATION);

  // Onboarding mode state
  const [selectedIntention, setSelectedIntention] = useState(null);
  const [step, setStep] = useState('intention'); // 'intention' | 'customize'

  const formatDuration = (seconds) => {
    const minutes = Math.round(seconds / 60);
    return `${minutes} ${t('customActivities.duration.minutes')}`;
  };

  // Full mode: Open native emoji keyboard
  const handleOpenNativeEmojiPicker = () => {
    nativeEmojiInputRef.current?.focus();
  };

  // Full mode: Handle emoji from native keyboard
  const handleNativeEmojiChange = (text) => {
    // Extract last emoji from text (handles multi-char emojis)
    const emojiRegex = /[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu;
    const emojis = text.match(emojiRegex);

    if (emojis && emojis.length > 0) {
      // Get last emoji typed
      const lastEmoji = emojis[emojis.length - 1];
      setSelectedEmoji(lastEmoji);

      // Close keyboard after selection
      nativeEmojiInputRef.current?.blur();
    }
  };

  const handleSubmit = () => {
    // Onboarding mode: validation is simpler (intention ensures emoji + name)
    if (mode === 'onboarding') {
      // If "Other" selected, user must enter name
      if (selectedIntention?.requiresCustomName && !activityName.trim()) {
        Alert.alert(
          t('customActivities.create.errorTitle'),
          t('customActivities.create.errorName')
        );
        return;
      }

      // Submit with auto-populated or custom data
      onSubmit({
        emoji: selectedEmoji,
        name: activityName.trim() || t('onboarding.intentions.other.defaultName'),
        defaultDuration: duration,
      });
      return;
    }

    // Full mode: standard validation
    if (!selectedEmoji) {
      Alert.alert(
        t('customActivities.create.errorTitle'),
        t('customActivities.create.errorEmoji')
      );
      return;
    }

    if (!activityName.trim()) {
      Alert.alert(
        t('customActivities.create.errorTitle'),
        t('customActivities.create.errorName')
      );
      return;
    }

    // Submit form data
    onSubmit({
      emoji: selectedEmoji,
      name: activityName.trim(),
      defaultDuration: duration,
    });
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
      flex: showCancelButton ? 2 : 1,
      justifyContent: 'center',
      minHeight: rs(52, 'min'),
      padding: theme.spacing.md,
      ...theme.shadow('md'),
    },

    createButtonDisabled: {
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

    emojiInputButton: {
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.border,
      borderRadius: theme.borderRadius.lg,
      borderWidth: 1,
      flexDirection: 'row',
      minHeight: rs(80, 'min'),
      padding: theme.spacing.lg,
    },

    emojiDisplay: {
      fontSize: rs(48, 'min'),
      marginRight: theme.spacing.md,
    },

    emojiInputPlaceholder: {
      color: theme.colors.textSecondary,
      flex: 1,
      fontSize: rs(16, 'min'),
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

    hiddenEmojiInput: {
      height: 0,
      opacity: 0,
      position: 'absolute',
      width: 0,
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

    sectionTitle: {
      fontSize: rs(typography.xl),
      fontWeight: fontWeights.semibold,
      textAlign: 'center',
      marginBottom: theme.spacing.xl,
    },
  });

  // Validation logic depends on mode
  const isFormValid = mode === 'onboarding'
    ? selectedIntention && (selectedIntention.requiresCustomName ? activityName.trim().length > 0 : true)
    : selectedEmoji && activityName.trim().length > 0;

  // Onboarding: Handle step transition and customize submission
  const handleCustomizeSubmit = (customData) => {
    // Submit final form data to parent (including intentionId for message mapping)
    onSubmit({
      emoji: customData.emoji,
      name: customData.name,
      defaultDuration: customData.defaultDuration,
      intentionId: customData.intentionId,
    });
  };

  const handleCustomizeBack = () => {
    setStep('intention');
  };

  const handleIntentionSelectStep = (intention) => {
    setSelectedIntention(intention);
    setStep('customize');
    onIntentionSelect?.(intention);
  };

  // Form content to be wrapped by parent's scroll container
  const formContent = mode === 'onboarding' ? (
    <>
      {/* Onboarding Mode: 2-Step Flow */}
      {step === 'intention' && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            {t('onboarding.creation.sectionTitle')}
          </Text>
          <IntentionPicker
            selectedIntention={selectedIntention}
            onIntentionSelect={handleIntentionSelectStep}
          />
        </View>
      )}

      {step === 'customize' && selectedIntention && (
        <CustomizeStep
          intention={selectedIntention}
          onBack={handleCustomizeBack}
          onSubmit={handleCustomizeSubmit}
        />
      )}
    </>
  ) : (
    <>
      {/* Full Mode: Complete Customization */}

      {/* Emoji Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>
          {t('customActivities.create.emojiLabel')}
        </Text>
        <TouchableOpacity
          style={styles.emojiInputButton}
          onPress={handleOpenNativeEmojiPicker}
          activeOpacity={0.7}
        >
          <Text style={styles.emojiDisplay}>
            {selectedEmoji || '?'}
          </Text>
          <Text style={styles.emojiInputPlaceholder}>
            {selectedEmoji ? t('customActivities.create.emojiLabel') : 'Appuyer pour choisir'}
          </Text>
        </TouchableOpacity>

        {/* Hidden TextInput for native emoji keyboard */}
        <TextInput
          ref={nativeEmojiInputRef}
          style={styles.hiddenEmojiInput}
          value=""
          onChangeText={handleNativeEmojiChange}
          keyboardType="default"
          placeholder=""
          maxLength={10}
        />
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
    </>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      {/* Header (optional) */}
      {showHeader && (
        <View style={styles.header}>
          <Text
            style={styles.headerTitle}
            accessibilityRole="header"
          >
            {t('customActivities.create.title')}
          </Text>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onCancel}
            activeOpacity={0.7}
            accessibilityLabel={t('accessibility.closeCreateActivity')}
            accessibilityRole="button"
            accessibilityHint={t('accessibility.closeModalHint')}
          >
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Scrollable content - wrapped by parent via children render prop */}
      {children ? children(formContent, styles.scrollContent) : formContent}

      {/* Footer - hidden in onboarding mode (CustomizeStep has its own CTA) */}
      {mode !== 'onboarding' && (
        <View style={styles.footer}>
        {showCancelButton && (
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={onCancel}
            activeOpacity={0.7}
            accessibilityLabel={t('customActivities.create.buttonCancel')}
            accessibilityRole="button"
            accessibilityHint={t('accessibility.closeModalHint')}
          >
            <Text style={styles.cancelButtonText}>
              {t('customActivities.create.buttonCancel')}
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[
            styles.createButton,
            !isFormValid && styles.createButtonDisabled,
          ]}
          onPress={handleSubmit}
          activeOpacity={0.8}
          disabled={!isFormValid}
          accessibilityLabel={t('customActivities.create.buttonCreate')}
          accessibilityRole="button"
          accessibilityHint={t('accessibility.createActivityHint')}
          accessibilityState={{ disabled: !isFormValid }}
        >
          <Text style={styles.createButtonText}>
            {mode === 'onboarding'
              ? t('onboarding.creation.cta')
              : t('customActivities.create.buttonCreate')}
          </Text>
        </TouchableOpacity>
      </View>
      )}
    </KeyboardAvoidingView>
  );
}

CreateActivityForm.propTypes = {
  mode: PropTypes.oneOf(['onboarding', 'full']),
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func,
  onIntentionSelect: PropTypes.func,
  showCancelButton: PropTypes.bool,
  showHeader: PropTypes.bool,
  children: PropTypes.func,
};
