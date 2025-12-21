/**
 * @fileoverview TwoTimersModalContent - Celebration modal after 2 timers completed
 * Pure content component (no BottomSheetModal wrapper - handled by ModalStackRenderer)
 * @created 2025-12-21
 * @updated 2025-12-21
 */
import React, { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { BottomSheetView } from '@gorhom/bottom-sheet';
import { useTheme } from '../../theme/ThemeProvider';
import { useTranslation } from '../../hooks/useTranslation';
import { rs } from '../../styles/responsive';
import haptics from '../../utils/haptics';
import analytics from '../../services/analytics';
import { fontWeights } from '../../theme/tokens';

/**
 * TwoTimersModalContent
 *
 * Celebration modal shown after user completes 2 timers.
 * Encourages exploration of app settings/features (ADR-003).
 *
 * @param {Function} onClose - Callback to close modal
 * @param {Function} onExplore - Callback when user clicks "Explore" button
 */
export default function TwoTimersModalContent({ onClose, onExplore }) {
  const theme = useTheme();
  const t = useTranslation();

  // Track analytics on mount
  useEffect(() => {
    analytics.trackTwoTimersModalShown();
  }, []);

  const handleExplore = () => {
    analytics.trackTwoTimersModalExploreClicked();
    haptics.selection().catch(() => { /* Optional operation - failure is non-critical */ });
    onClose();
    onExplore?.();
  };

  const handleSkip = () => {
    analytics.trackTwoTimersModalDismissed();
    haptics.selection().catch(() => { /* Optional operation - failure is non-critical */ });
    onClose();
  };

  const styles = StyleSheet.create({
    buttonContainer: {
      gap: theme.spacing.sm,
      width: '100%',
    },
    container: {
      alignItems: 'center',
      padding: theme.spacing.xl,
    },
    emoji: {
      fontSize: rs(48),
      marginBottom: theme.spacing.md,
      textAlign: 'center',
    },
    message: {
      color: theme.colors.textSecondary,
      fontSize: rs(15),
      lineHeight: rs(22),
      marginBottom: theme.spacing.xl,
      textAlign: 'center',
    },
    primaryButton: {
      alignItems: 'center',
      backgroundColor: theme.colors.brand.primary,
      borderRadius: theme.borderRadius.md,
      justifyContent: 'center',
      minHeight: 44,
      paddingVertical: theme.spacing.md,
      width: '100%',
    },
    primaryButtonText: {
      color: theme.colors.fixed.white,
      fontSize: rs(16),
      fontWeight: fontWeights.semibold,
    },
    secondaryButton: {
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 44,
      paddingVertical: theme.spacing.sm,
      width: '100%',
    },
    secondaryButtonText: {
      color: theme.colors.textLight,
      fontSize: rs(14),
    },
    title: {
      color: theme.colors.text,
      fontSize: rs(22),
      fontWeight: fontWeights.semibold,
      marginBottom: theme.spacing.sm,
      textAlign: 'center',
    },
  });

  return (
    <BottomSheetView style={styles.container}>
      <Text
        style={styles.emoji}
        accessible={true}
        accessibilityLabel={t('accessibility.celebrationEmoji')}
      >
        🎉
      </Text>
      <Text
        style={styles.title}
        accessibilityRole="header"
      >
        {t('twoTimers.title')}
      </Text>
      <Text style={styles.message}>
        {t('twoTimers.message')}
      </Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleExplore}
          activeOpacity={0.8}
          accessibilityLabel={t('twoTimers.explore')}
          accessibilityRole="button"
          accessibilityHint={t('accessibility.exploreSettingsHint')}
        >
          <Text style={styles.primaryButtonText}>
            {t('twoTimers.explore')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={handleSkip}
          activeOpacity={0.6}
          accessibilityLabel={t('twoTimers.dismiss')}
          accessibilityRole="button"
          accessibilityHint={t('accessibility.closeModalHint')}
        >
          <Text style={styles.secondaryButtonText}>
            {t('twoTimers.dismiss')}
          </Text>
        </TouchableOpacity>
      </View>
    </BottomSheetView>
  );
}
