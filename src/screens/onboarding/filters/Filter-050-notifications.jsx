// src/screens/onboarding/filters/Filter3_5Notifications.jsx
// Filtre 3.5 : Permission notifications (pré-permission expliquée)

import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Notifications from 'expo-notifications';
import { useTheme } from '../../../theme/ThemeProvider';
import { useTranslation } from '../../../hooks/useTranslation';
import { rs } from '../onboardingConstants';
import haptics from '../../../utils/haptics';
import analytics from '../../../services/analytics';
import { fontWeights } from '../../../theme/tokens';

export default function Filter3_5Notifications({ onContinue }) {
  const { colors, spacing, borderRadius } = useTheme();
  const t = useTranslation();

  // Track when filter is displayed
  useEffect(() => {
    analytics.trackOnboardingNotifRequested();
  }, []);

  const handleRequestPermission = async () => {
    haptics.selection().catch(() => { /* Optional operation - failure is non-critical */ });

    // Defer actual permission request until after onboarding
    // This avoids interrupting the onboarding flow with system dialogs
    analytics.trackOnboardingNotifGranted();

    // Save preference without requesting system permission yet
    // The permission will be requested after onboarding completes
    onContinue({ notificationPermission: true, shouldRequestLater: true });
  };

  const handleSkip = () => {
    haptics.selection().catch(() => { /* Optional operation - failure is non-critical */ });
    analytics.trackOnboardingNotifSkipped();
    onContinue({ notificationPermission: false, shouldRequestLater: false });
  };

  const styles = createStyles(colors, spacing, borderRadius);

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.centerContent}>
        {/* Icon */}
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>🔔</Text>
        </View>

        {/* Title */}
        <Text style={styles.title}>
          {t('onboarding.v3.filter3_5.title')}
        </Text>

        {/* Body */}
        <Text style={styles.body}>
          {t('onboarding.v3.filter3_5.body')}
        </Text>

        <Text style={styles.bodySecondary}>
          {t('onboarding.v3.filter3_5.bodySecondary')}
        </Text>

        {/* CTA Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleRequestPermission}
            activeOpacity={0.7}
          >
            <Text style={styles.primaryButtonText}>
              {t('onboarding.v3.filter3_5.ctaPrimary')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleSkip}
            activeOpacity={0.7}
          >
            <Text style={styles.secondaryButtonText}>
              {t('onboarding.v3.filter3_5.ctaSecondary')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const createStyles = (colors, spacing, borderRadius) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.background,
    },
    centerContent: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: rs(spacing.xl),
    },
    iconContainer: {
      width: rs(100),
      height: rs(100),
      borderRadius: rs(50),
      backgroundColor: colors.brand.primary + '20',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: rs(spacing.xl),
    },
    icon: {
      fontSize: rs(50),
    },
    title: {
      fontSize: rs(28),
      fontWeight: fontWeights.semibold,
      color: colors.text,
      textAlign: 'center',
      marginBottom: rs(spacing.lg),
    },
    body: {
      fontSize: rs(16),
      color: colors.text,
      textAlign: 'center',
      lineHeight: rs(24),
      marginBottom: rs(spacing.md),
    },
    bodySecondary: {
      fontSize: rs(14),
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: rs(20),
      marginBottom: rs(spacing.xl),
    },
    buttonContainer: {
      width: '100%',
      gap: rs(spacing.md),
      marginTop: rs(spacing.lg),
    },
    primaryButton: {
      backgroundColor: colors.brand.primary,
      paddingVertical: rs(spacing.md),
      paddingHorizontal: rs(spacing.xl),
      borderRadius: borderRadius.xl,
      alignItems: 'center',
      minHeight: rs(56),
      justifyContent: 'center',
    },
    primaryButtonText: {
      color: colors.background,
      fontSize: rs(18),
      fontWeight: fontWeights.semibold,
    },
    secondaryButton: {
      paddingVertical: rs(spacing.md),
      paddingHorizontal: rs(spacing.xl),
      borderRadius: borderRadius.xl,
      alignItems: 'center',
      minHeight: rs(56),
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: colors.border,
      backgroundColor: colors.surface,
    },
    secondaryButtonText: {
      color: colors.text,
      fontSize: rs(16),
      fontWeight: fontWeights.semibold,
    },
  });
