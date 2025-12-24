// src/screens/onboarding/filters/Filter-070-notifications.jsx
// Filtre 070 : Permission notifications (pré-permission expliquée)

import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../../theme/ThemeProvider';
import { useTranslation } from '../../../hooks/useTranslation';
import { rs } from '../../../styles/responsive';
import haptics from '../../../utils/haptics';
import analytics from '../../../services/analytics';
import { fontWeights, spacing, typography } from '../../../theme/tokens';
import OnboardingLayout from '../../../components/onboarding/OnboardingLayout';

export default function Filter050Notifications({ onContinue }) {
  const { colors } = useTheme();
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

  const styles = createStyles();

  return (
    <OnboardingLayout
      centerContent={true}
      footerVariant="primary-secondary"
      primaryButtonProps={{
        label: t('onboarding.v3.filter3_5.ctaPrimary'),
        onPress: handleRequestPermission,
        accessibilityHint: 'Enable notifications to get alerts when timer completes',
      }}
      secondaryButtonProps={{
        label: t('onboarding.v3.filter3_5.ctaSecondary'),
        onPress: handleSkip,
        accessibilityHint: 'Skip notification setup and continue without notifications',
      }}
    >
      {/* Icon */}
      <View style={[styles.iconContainer, { backgroundColor: colors.brand.primary + '20' }]}>
        <Text style={styles.icon}>🔔</Text>
      </View>

      {/* Title */}
      <Text style={[styles.title, { color: colors.text }]}>
        {t('onboarding.v3.filter3_5.title')}
      </Text>

      {/* Body */}
      <Text style={[styles.body, { color: colors.text }]}>
        {t('onboarding.v3.filter3_5.body')}
      </Text>

      <Text style={[styles.bodySecondary, { color: colors.textSecondary }]}>
        {t('onboarding.v3.filter3_5.bodySecondary')}
      </Text>
    </OnboardingLayout>
  );
}

const createStyles = () =>
  StyleSheet.create({
    // Icon container
    iconContainer: {
      alignItems: 'center',
      borderRadius: rs(50),
      height: rs(100),
      justifyContent: 'center',
      marginBottom: rs(spacing.xl),
      width: rs(100),
    },
    icon: {
      fontSize: rs(50),
    },

    // Text styles
    title: {
      fontSize: rs(typography.xl),
      fontWeight: fontWeights.semibold,
      marginBottom: rs(spacing.lg),
      textAlign: 'center',
    },
    body: {
      fontSize: rs(typography.base),
      lineHeight: rs(24),
      marginBottom: rs(spacing.md),
      textAlign: 'center',
    },
    bodySecondary: {
      fontSize: rs(typography.sm),
      lineHeight: rs(20),
      textAlign: 'center',
    },
  });
