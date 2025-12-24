// src/screens/onboarding/filters/Filter-080-paywall.jsx
/**
 * Filter 8: Personalized Paywall
 * Shows summary of created activity + detected persona
 * Soft conversion point with trial CTA
 */

import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useTheme } from '../../../theme/ThemeProvider';
import { useTranslation } from '../../../hooks/useTranslation';
import { usePurchases } from '../../../contexts/PurchaseContext';
import { PrimaryButton, SecondaryButton } from '../../../components/buttons/Button';
import { rs } from '../../../styles/responsive';
import { getPersonaById } from '../personaConstants';
import { useAnalytics } from '../../../hooks/useAnalytics';
import haptics from '../../../utils/haptics';
import { schedulePostSkipReminders } from '../../../services/reminderNotifications';
import { spacing, typography, fontWeights, borderRadius } from '../../../theme/tokens';

export default function Filter080Paywall({
  onContinue,
  customActivity, // From Filter-030
  persona, // From Filter-050 (persona object or id)
}) {
  const t = useTranslation();
  const { colors } = useTheme();
  const { purchaseProduct, getOfferings, isPurchasing: contextPurchasing } = usePurchases();
  const analytics = useAnalytics();

  const [localPurchasing, setLocalPurchasing] = useState(false);
  const isAnyOperationInProgress = localPurchasing || contextPurchasing;

  // Resolve persona if only ID passed
  const personaData = typeof persona === 'string' ? getPersonaById(persona) : persona;

  // Format duration for display
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    return `${mins} min`;
  };

  const handleStartTrial = useCallback(async () => {
    try {
      setLocalPurchasing(true);
      haptics.selection().catch(() => {});

      // Get offerings from RevenueCat
      const offerings = await getOfferings();

      // Handle errors
      if (
        !offerings ||
        offerings.error ||
        !offerings.availablePackages ||
        offerings.availablePackages.length === 0
      ) {
        Alert.alert(
          t('premium.error'),
          t('premium.errorOfferings'),
          [{ text: t('common.ok') }]
        );
        setLocalPurchasing(false);
        return;
      }

      // Get the premium package
      const premiumPackage = offerings.availablePackages[0];
      const result = await purchaseProduct(premiumPackage.product.identifier);

      if (result.success) {
        haptics.success().catch(() => {});
        analytics.trackTrialStarted('onboarding');
        onContinue({ purchaseResult: 'trial' });
      } else if (result.cancelled) {
        // User cancelled, silent
        setLocalPurchasing(false);
      } else if (result.isNetworkError) {
        Alert.alert(
          t('premium.noConnection'),
          t('premium.noConnectionMessage'),
          [{ text: t('common.ok') }]
        );
        setLocalPurchasing(false);
      } else {
        Alert.alert(
          t('premium.error'),
          t('premium.errorPurchase'),
          [{ text: t('common.ok') }]
        );
        setLocalPurchasing(false);
      }
    } catch (error) {
      console.error('[Filter080Paywall] Trial start failed:', error);
      Alert.alert(
        t('premium.error'),
        t('premium.errorPurchase'),
        [{ text: t('common.ok') }]
      );
      setLocalPurchasing(false);
    }
  }, [purchaseProduct, getOfferings, onContinue, analytics, t]);

  const handleSkip = useCallback(async () => {
    haptics.impact('light').catch(() => {});
    analytics.trackPaywallSkipped('onboarding');

    // Schedule post-skip reminder notifications (J+3, J+7)
    await schedulePostSkipReminders(customActivity);

    onContinue({ purchaseResult: 'skipped' });
  }, [onContinue, analytics, customActivity]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        {/* Header */}
        <Text style={[styles.title, { color: colors.text }]}>
          {t('onboarding.paywall.title')}
        </Text>

        {/* Custom Activity Summary */}
        {customActivity && (
          <View style={[styles.summaryCard, { backgroundColor: colors.surface }]}>
            <Text style={styles.activityEmoji}>{customActivity.emoji}</Text>
            <View style={styles.activityInfo}>
              <Text style={[styles.activityName, { color: colors.text }]}>
                {customActivity.name || customActivity.label}
              </Text>
              <Text style={[styles.activityDuration, { color: colors.textSecondary }]}>
                {formatDuration(customActivity.defaultDuration)}
              </Text>
            </View>
          </View>
        )}

        {/* Persona Badge */}
        {personaData && (
          <View style={styles.personaBadge}>
            <Text style={[styles.personaLabel, { color: colors.textSecondary }]}>
              {t('onboarding.paywall.profile')}
            </Text>
            <Text style={[styles.personaValue, { color: colors.text }]}>
              {personaData.emoji} {t(personaData.labelKey)}
            </Text>
          </View>
        )}

        {/* Question */}
        <Text style={[styles.question, { color: colors.text }]}>
          {t('onboarding.paywall.question')}
        </Text>

        {/* Divider */}
        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        {/* Value Proposition */}
        <Text style={[styles.valueProposition, { color: colors.textSecondary }]}>
          {t('onboarding.paywall.valueProposition')}
        </Text>

        {/* Price */}
        <Text style={[styles.price, { color: colors.text }]}>
          {t('onboarding.paywall.price')}
        </Text>
      </View>

      {/* CTAs */}
      <View style={styles.footer}>
        <PrimaryButton
          label={
            isAnyOperationInProgress ? (
              <ActivityIndicator color={colors.background} size="small" />
            ) : (
              t('onboarding.paywall.ctaTrial')
            )
          }
          onPress={handleStartTrial}
          disabled={isAnyOperationInProgress}
          style={styles.primaryButton}
          accessibilityHint="Start 7-day free trial to unlock all premium features"
        />
        <SecondaryButton
          label={t('onboarding.paywall.ctaSkip')}
          onPress={handleSkip}
          disabled={isAnyOperationInProgress}
          style={styles.skipButton}
          accessibilityHint="Skip premium trial and continue with free version"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: rs(spacing.lg),
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: rs(typography.xl),
    fontWeight: fontWeights.semibold,
    textAlign: 'center',
    marginBottom: rs(spacing.lg),
  },
  // Summary card
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: rs(spacing.md),
    borderRadius: rs(borderRadius.lg),
    marginVertical: rs(spacing.md),
    width: '100%',
    maxWidth: rs(300),
  },
  activityEmoji: {
    fontSize: rs(40),
    marginRight: rs(spacing.md),
  },
  activityInfo: {
    flex: 1,
  },
  activityName: {
    fontSize: rs(typography.md),
    fontWeight: fontWeights.semibold,
  },
  activityDuration: {
    fontSize: rs(typography.sm),
    marginTop: rs(spacing.xxs),
  },
  // Persona badge
  personaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: rs(spacing.md),
  },
  personaLabel: {
    fontSize: rs(typography.base),
    marginRight: rs(spacing.sm),
  },
  personaValue: {
    fontSize: rs(typography.md),
    fontWeight: fontWeights.semibold,
  },
  // Question
  question: {
    fontSize: rs(typography.lg),
    fontWeight: fontWeights.medium,
    textAlign: 'center',
    marginTop: rs(spacing.lg),
    marginBottom: rs(spacing.lg),
  },
  // Divider
  divider: {
    height: 1,
    width: '80%',
    marginVertical: rs(spacing.lg),
  },
  // Value proposition
  valueProposition: {
    fontSize: rs(typography.base),
    textAlign: 'center',
    marginBottom: rs(spacing.sm),
  },
  price: {
    fontSize: rs(typography.lg),
    fontWeight: fontWeights.bold,
    textAlign: 'center',
  },
  // Footer
  footer: {
    padding: rs(spacing.lg),
    paddingBottom: rs(spacing.xl),
  },
  primaryButton: {
    marginBottom: rs(spacing.md),
  },
  skipButton: {
    opacity: 0.7,
  },
});
