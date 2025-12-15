// src/screens/onboarding/filters/Filter5Paywall.jsx
// Filtre 5 : Paywall soft (trial / skip)

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../../theme/ThemeProvider';
import { useTranslation } from '../../../hooks/useTranslation';
import { rs } from '../onboardingConstants';
import PremiumModal from '../../../components/modals/PremiumModal';
import { fontWeights } from '../../../theme/tokens';

export default function Filter5Paywall({ onComplete }) {
  const { colors, spacing, borderRadius } = useTheme();
  const t = useTranslation();
  const [premiumModalVisible, setPremiumModalVisible] = useState(false);

  const handleTrial = () => {
    // Open premium paywall modal for actual RevenueCat purchase flow
    setPremiumModalVisible(true);
  };

  const handlePremiumModalClose = () => {
    // Close modal and continue onboarding with trial/premium status
    setPremiumModalVisible(false);
    onComplete('trial');
  };

  const handleSkip = () => {
    onComplete('skipped');
  };

  const styles = createStyles(colors, spacing, borderRadius);

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.centerContent}>
        <Text style={styles.title}>{t('onboarding.v2.filter5.title')}</Text>

        <Text style={styles.subtitle}>
          {t('onboarding.v2.filter5.subtitle')}
        </Text>

        <TouchableOpacity style={styles.button} onPress={handleTrial}>
          <Text style={styles.buttonText}>{t('onboarding.v2.filter5.ctaPrimary')}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.skipButton} onPress={handleSkip} activeOpacity={0.7}>
          <Text style={styles.skipText}>{t('onboarding.v2.filter5.ctaSecondary')}</Text>
        </TouchableOpacity>
      </View>

      {/* Premium paywall modal - opens when user taps "Try Premium" */}
      <PremiumModal
        visible={premiumModalVisible}
        onClose={handlePremiumModalClose}
        highlightedFeature="onboarding_paywall"
      />
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
      paddingHorizontal: rs(spacing.lg),
    },
    title: {
      fontSize: rs(28),
      fontWeight: fontWeights.semibold,
      color: colors.text,
      textAlign: 'center',
      marginBottom: rs(spacing.lg),
    },
    subtitle: {
      fontSize: rs(17),
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: rs(26),
      marginBottom: rs(spacing.xl),
      paddingHorizontal: rs(spacing.md),
    },
    button: {
      backgroundColor: colors.brand.primary,
      paddingVertical: rs(spacing.md),
      paddingHorizontal: rs(spacing.xl),
      borderRadius: borderRadius.xl,
      alignItems: 'center',
      minWidth: rs(200),
      minHeight: rs(56),
      justifyContent: 'center',
    },
    buttonText: {
      color: colors.background,
      fontSize: rs(18),
      fontWeight: fontWeights.semibold,
    },
    skipButton: {
      marginTop: rs(spacing.lg),
      paddingVertical: rs(spacing.md),
      paddingHorizontal: rs(spacing.xl),
      borderRadius: borderRadius.xl,
      borderWidth: 2,
      borderColor: colors.border,
      alignItems: 'center',
      minWidth: rs(200),
      backgroundColor: colors.surface,
    },
    skipText: {
      color: colors.text,
      fontSize: rs(16),
      fontWeight: fontWeights.semibold,
    },
  });
