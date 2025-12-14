// src/components/modals/TwoTimersModal.jsx
// Modale de rappel après 2 timers complétés (ADR-003)

import React, { useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { useTranslation } from '../../hooks/useTranslation';
import { rs } from '../../styles/responsive';
import haptics from '../../utils/haptics';
import analytics from '../../services/analytics';

export default function TwoTimersModal({ visible, onClose, onExplore }) {
  const theme = useTheme();
  const t = useTranslation();

  useEffect(() => {
    if (visible) {
      analytics.trackTwoTimersModalShown();
    }
  }, [visible]);

  const handleExplore = () => {
    analytics.trackTwoTimersModalExploreClicked();
    haptics.selection().catch(() => {});
    onClose();
    onExplore?.();
  };

  const handleSkip = () => {
    analytics.trackTwoTimersModalDismissed();
    haptics.selection().catch(() => {});
    onClose();
  };

  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContainer: {
      backgroundColor: theme.colors.background,
      borderRadius: 16,
      width: '85%',
      padding: theme.spacing.xl,
      ...theme.shadow('xl'),
    },
    emoji: {
      fontSize: rs(48),
      textAlign: 'center',
      marginBottom: theme.spacing.md,
    },
    title: {
      fontSize: rs(22),
      fontWeight: '600',
      color: theme.colors.text,
      textAlign: 'center',
      marginBottom: theme.spacing.sm,
    },
    message: {
      fontSize: rs(15),
      color: theme.colors.textSecondary,
      textAlign: 'center',
      lineHeight: rs(22),
      marginBottom: theme.spacing.xl,
    },
    buttonContainer: {
      gap: theme.spacing.sm,
    },
    primaryButton: {
      backgroundColor: theme.colors.brand.primary,
      paddingVertical: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      alignItems: 'center',
    },
    primaryButtonText: {
      fontSize: rs(16),
      fontWeight: '600',
      color: theme.colors.background,
    },
    secondaryButton: {
      paddingVertical: theme.spacing.sm,
      alignItems: 'center',
    },
    secondaryButtonText: {
      fontSize: rs(14),
      color: theme.colors.textLight,
    },
  });

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={handleSkip}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.emoji}>🎉</Text>
          <Text style={styles.title}>
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
            >
              <Text style={styles.primaryButtonText}>
                {t('twoTimers.explore')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handleSkip}
              activeOpacity={0.6}
            >
              <Text style={styles.secondaryButtonText}>
                {t('twoTimers.dismiss')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
