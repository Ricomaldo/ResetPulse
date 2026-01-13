// src/screens/onboarding/filters/Filter-080-launch.jsx
// Filtre 080 : Dernier écran - Lancement du premier timer

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../../theme/ThemeProvider';
import { useTranslation } from '../../../hooks/useTranslation';
import { rs } from '../../../styles/responsive';
import haptics from '../../../utils/haptics';
import { fontWeights, spacing, typography } from '../../../theme/tokens';
import OnboardingLayout from '../../../components/onboarding/OnboardingLayout';

export default function Filter080Launch({ onContinue, customActivity }) {
  const { colors } = useTheme();
  const t = useTranslation();

  // Fallback si pas d'activité custom (ne devrait pas arriver)
  const activity = customActivity || {
    emoji: '⏱️',
    name: t('onboarding.launch.defaultActivity'),
    defaultDuration: 1500,
  };

  const formatDuration = (seconds) => {
    const minutes = Math.round(seconds / 60);
    return `${minutes} min`;
  };

  const handleLaunch = () => {
    haptics.impact('medium').catch(() => {});
    // Signal to start timer immediately after OB completes
    onContinue({ startTimerImmediately: true });
  };

  const styles = createStyles(colors);

  return (
    <OnboardingLayout
      centerContent={true}
      footerVariant="single"
      primaryButtonProps={{
        label: t('onboarding.launch.cta'),
        onPress: handleLaunch,
        accessibilityHint: t('onboarding.launch.ctaHint'),
      }}
    >
      {/* Title */}
      <Text style={[styles.title, { color: colors.text }]}>
        {t('onboarding.launch.title')}
      </Text>

      {/* Activity Card */}
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={styles.emoji}>{activity.emoji}</Text>
        <Text style={[styles.activityName, { color: colors.text }]}>
          {activity.name}
        </Text>
        <Text style={[styles.duration, { color: colors.textSecondary }]}>
          {formatDuration(activity.defaultDuration)}
        </Text>
      </View>

      {/* Subtitle */}
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        {t('onboarding.launch.subtitle')}
      </Text>
    </OnboardingLayout>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
    title: {
      fontSize: rs(typography.xxl),
      fontWeight: fontWeights.bold,
      marginBottom: rs(spacing.xl),
      textAlign: 'center',
    },
    card: {
      alignItems: 'center',
      borderRadius: rs(20),
      borderWidth: 2,
      marginBottom: rs(spacing.lg),
      paddingHorizontal: rs(spacing.xl),
      paddingVertical: rs(spacing.xl),
      width: '100%',
      maxWidth: rs(280),
    },
    emoji: {
      fontSize: rs(64),
      marginBottom: rs(spacing.md),
    },
    activityName: {
      fontSize: rs(typography.xl),
      fontWeight: fontWeights.semibold,
      marginBottom: rs(spacing.xs),
      textAlign: 'center',
    },
    duration: {
      fontSize: rs(typography.md),
      fontWeight: fontWeights.medium,
    },
    subtitle: {
      fontSize: rs(typography.base),
      lineHeight: rs(24),
      textAlign: 'center',
      paddingHorizontal: rs(spacing.md),
    },
  });
