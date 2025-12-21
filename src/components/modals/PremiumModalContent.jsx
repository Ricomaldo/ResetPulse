/**
 * @fileoverview PremiumModalContent - Premium paywall content (BottomSheet)
 * Extracted from PremiumModal.jsx - Pure content component (no Modal wrapper)
 * @created 2025-12-21
 * @updated 2025-12-21
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import PropTypes from 'prop-types';
import { useTheme } from '../../theme/ThemeProvider';
import { usePurchases } from '../../contexts/PurchaseContext';
import { useAnalytics } from '../../hooks/useAnalytics';
import { useTranslation } from '../../hooks/useTranslation';
import { useModalStack } from '../../contexts/ModalStackContext';
import { rs } from '../../styles/responsive';
import haptics from '../../utils/haptics';
import { fontWeights } from '../../theme/tokens';

/**
 * PremiumModalContent - Premium paywall UI
 *
 * Business logic:
 * - Fetch dynamic price from RevenueCat
 * - Handle purchase flow (with retry logic)
 * - Handle restore purchases
 * - Track Mixpanel analytics (paywall viewed)
 * - Network error handling with retry buttons (max 3 attempts)
 *
 * @param {Function} onClose - Callback to close modal
 * @param {string} highlightedFeature - Feature that triggered paywall (for analytics)
 * @param {string} modalId - Modal ID in ModalStack (for pop)
 */
export default function PremiumModalContent({ onClose, highlightedFeature, modalId }) {
  const modalStack = useModalStack();
  const theme = useTheme();
  const analytics = useAnalytics();
  const t = useTranslation();
  const {
    purchaseProduct,
    restorePurchases,
    getOfferings,
    isPurchasing: contextPurchasing,
  } = usePurchases();
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [hasTrackedPaywall, setHasTrackedPaywall] = useState(false);
  const [dynamicPrice, setDynamicPrice] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [isLoadingPrice, setIsLoadingPrice] = useState(false);
  const [purchaseAttempts, setPurchaseAttempts] = useState(0);

  // Track paywall viewed once per session (M7.5)
  useEffect(() => {
    if (!hasTrackedPaywall) {
      const source = highlightedFeature || 'unknown';
      analytics.trackPaywallViewed(source);
      setHasTrackedPaywall(true);
    }
  }, [hasTrackedPaywall, highlightedFeature, analytics]);

  // Fetch dynamic price from RevenueCat when component mounts
  useEffect(() => {
    const fetchPrice = async () => {
      if (dynamicPrice) {return;}

      setIsLoadingPrice(true);
      try {
        const offerings = await getOfferings();
        if (offerings?.availablePackages?.[0]?.product?.priceString) {
          setDynamicPrice(offerings.availablePackages[0].product.priceString);
        }
      } catch (error) {
        if (__DEV__) {
          console.warn('[PremiumModalContent] Could not fetch dynamic price:', error);
        }
      } finally {
        setIsLoadingPrice(false);
      }
    };

    fetchPrice();
  }, [dynamicPrice, getOfferings]);

  // Combined loading state (local + context)
  const isAnyOperationInProgress =
    isPurchasing || isRestoring || contextPurchasing;

  const handlePurchase = async () => {
    try {
      if (__DEV__) {
        console.warn('[IAP] 🚀 Starting purchase flow...');
      }
      setIsPurchasing(true);
      haptics.selection().catch(() => { /* Optional operation - failure is non-critical */ });

      // Get offerings from RevenueCat
      if (__DEV__) {
        console.warn('[IAP] 📡 Fetching offerings from RevenueCat...');
      }
      const offerings = await getOfferings();

      // Log offerings structure for debugging
      if (__DEV__) {
        console.warn('[IAP] 📦 Offerings received:', {
          hasOfferings: !!offerings,
          hasError: !!offerings?.error,
          errorType: offerings?.error || 'none',
          packagesCount: offerings?.availablePackages?.length || 0,
        });
      }

      // Handle network error from getOfferings
      if (offerings?.error === 'network') {
        console.error('[IAP] ❌ Network error while fetching offerings');
        Alert.alert(
          t('premium.noConnection'),
          t('premium.noConnectionMessage'),
          [{ text: t('common.ok') }]
        );
        setIsPurchasing(false);
        return;
      }

      // Handle other errors or missing offerings
      if (
        !offerings ||
        offerings.error ||
        !offerings.availablePackages ||
        offerings.availablePackages.length === 0
      ) {
        console.error('[IAP] ❌ No offerings available:', {
          error: offerings?.error,
          hasPackages: !!offerings?.availablePackages,
          packagesLength: offerings?.availablePackages?.length
        });
        Alert.alert(
          t('premium.error'),
          t('premium.errorOfferings'),
          [{ text: t('common.ok') }]
        );
        setIsPurchasing(false);
        return;
      }

      // Get the first package (should be our premium_lifetime)
      const premiumPackage = offerings.availablePackages[0];

      // Log package details
      if (__DEV__) {
        console.warn('[IAP] 📋 Package selected:', {
          packageId: premiumPackage.identifier,
          productId: premiumPackage.product.identifier,
          price: premiumPackage.product.priceString,
          title: premiumPackage.product.title,
          description: premiumPackage.product.description,
        });

        console.warn('[IAP] 💳 Initiating purchase for product:', premiumPackage.product.identifier);
      }
      const result = await purchaseProduct(premiumPackage.product.identifier);

      if (__DEV__) {
        console.warn('[IAP] ✅ Purchase result:', {
          success: result.success,
          cancelled: result.cancelled,
          isNetworkError: result.isNetworkError,
          isPaymentPending: result.isPaymentPending,
          error: result.error || 'none',
        });
      }

      if (result.success) {
        // Reset attempts on success
        setPurchaseAttempts(0);
        haptics.success().catch(() => { /* Optional operation - failure is non-critical */ });
        Alert.alert(
          t('premium.welcomeTitle'),
          t('premium.welcomeMessage'),
          [{ text: t('premium.welcomeButton'), onPress: onClose }]
        );
      } else if (result.cancelled) {
        // User cancelled, silent
      } else if (result.isNetworkError) {
        // Network error - show retry button
        const newAttempts = purchaseAttempts + 1;
        setPurchaseAttempts(newAttempts);

        const buttons = [
          { text: t('common.cancel'), style: 'cancel' }
        ];

        // Show retry button if less than 3 attempts
        if (newAttempts < 3) {
          buttons.unshift({
            text: t('common.retry'),
            onPress: handlePurchase
          });
        } else {
          // After 3 failed attempts, show support link
          buttons.unshift({
            text: t('premium.contactSupport'),
            onPress: () => {
              // Future: open support email or link
              if (__DEV__) {
                console.warn('[PremiumModalContent] Contact support requested after 3 failed attempts');
              }
            }
          });
        }

        Alert.alert(
          t('premium.noConnection'),
          result.error + (newAttempts >= 3 ? '\n\n' + t('premium.tooManyAttempts') : ''),
          buttons
        );
      } else if (result.isPaymentPending) {
        // Payment pending - informative message
        Alert.alert(t('premium.paymentPending'), result.error, [
          { text: t('common.ok'), onPress: onClose },
        ]);
      } else {
        // Generic error - show retry button
        const newAttempts = purchaseAttempts + 1;
        setPurchaseAttempts(newAttempts);

        const buttons = [
          { text: t('common.cancel'), style: 'cancel' }
        ];

        // Show retry button if less than 3 attempts
        if (newAttempts < 3) {
          buttons.unshift({
            text: t('common.retry'),
            onPress: handlePurchase
          });
        } else {
          // After 3 failed attempts, show support link
          buttons.unshift({
            text: t('premium.contactSupport'),
            onPress: () => {
              if (__DEV__) {
                console.warn('[PremiumModalContent] Contact support requested after 3 failed attempts');
              }
            }
          });
        }

        Alert.alert(
          t('premium.error'),
          (result.error || t('premium.errorPurchase')) + (newAttempts >= 3 ? '\n\n' + t('premium.tooManyAttempts') : ''),
          buttons
        );
      }
    } catch (error) {
      console.error('[PremiumModalContent] Purchase error:', error);
      Alert.alert(t('premium.error'), t('premium.errorOfferings'), [
        { text: t('common.ok') },
      ]);
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleRestore = async () => {
    try {
      setIsRestoring(true);
      haptics.selection().catch(() => { /* Optional operation - failure is non-critical */ });

      const result = await restorePurchases();

      if (result.success) {
        if (result.hasPremium) {
          haptics.success().catch(() => { /* Optional operation - failure is non-critical */ });
          Alert.alert(
            t('premium.restoreSuccess'),
            t('premium.restoreSuccessMessage'),
            [{ text: t('premium.welcomeButton'), onPress: onClose }]
          );
        } else {
          Alert.alert(
            t('premium.restoreNone'),
            t('premium.restoreNoneMessage'),
            [{ text: t('common.ok') }]
          );
        }
      } else if (result.isNetworkError) {
        // Network error during restore
        Alert.alert(t('premium.noConnection'), result.error, [{ text: t('common.ok') }]);
      } else {
        // Generic restore error
        Alert.alert(
          t('premium.error'),
          result.error || t('premium.restoreError'),
          [{ text: t('common.ok') }]
        );
      }
    } catch (error) {
      console.error('[PremiumModalContent] Restore error:', error);
      Alert.alert(t('premium.error'), t('premium.unexpectedError'), [
        { text: t('common.ok') },
      ]);
    } finally {
      setIsRestoring(false);
    }
  };

  const handleClose = () => {
    // Prevent closing during operations
    if (isAnyOperationInProgress) {
      return;
    }
    haptics.selection().catch(() => { /* Optional operation - failure is non-critical */ });

    // Call onClose (ModalStackRenderer handles animation delay + popById)
    if (onClose) {
      onClose();
    }
  };

  const styles = StyleSheet.create({
    body: {
      marginBottom: theme.spacing.xl,
    },

    bodyText: {
      color: theme.colors.textSecondary,
      fontSize: rs(16, 'min'),
      lineHeight: rs(24, 'min'),
      marginBottom: theme.spacing.lg,
      textAlign: 'center',
    },

    buttons: {
      gap: theme.spacing.md,
    },

    container: {
      padding: theme.spacing.xl,
    },

    features: {
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.brand.primary + '30',
      borderRadius: 12,
      borderWidth: 2,
      marginBottom: theme.spacing.lg,
      padding: theme.spacing.lg,
    },

    featuresText: {
      color: theme.colors.text,
      fontSize: rs(18, 'min'),
      fontWeight: fontWeights.semibold,
      marginBottom: theme.spacing.sm,
      textAlign: 'center',
    },

    header: {
      marginBottom: theme.spacing.lg,
    },

    loader: {
      marginLeft: theme.spacing.sm,
    },

    priceText: {
      color: theme.colors.brand.primary,
      fontSize: rs(20, 'min'),
      fontWeight: fontWeights.bold,
      marginBottom: theme.spacing.xs,
      textAlign: 'center',
    },

    primaryButton: {
      alignItems: 'center',
      backgroundColor: theme.colors.brand.primary,
      borderRadius: 12,
      justifyContent: 'center',
      minHeight: 52,
      padding: theme.spacing.lg,
      ...theme.shadow('md'),
    },

    primaryButtonDisabled: {
      opacity: 0.6,
    },

    primaryButtonText: {
      color: theme.colors.fixed.white,
      fontSize: rs(17, 'min'),
      fontWeight: fontWeights.semibold,
    },

    restoreButton: {
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: theme.spacing.md,
      minHeight: 44,
      minWidth: 44,
      padding: theme.spacing.sm,
    },

    restoreButtonText: {
      color: theme.colors.textSecondary,
      fontSize: rs(13, 'min'),
      textDecorationLine: 'underline',
    },

    secondaryButton: {
      alignItems: 'center',
      backgroundColor: theme.colors.fixed.transparent,
      borderRadius: 12,
      justifyContent: 'center',
      minHeight: 44,
      minWidth: 44,
      padding: theme.spacing.md,
    },

    secondaryButtonText: {
      color: theme.colors.textSecondary,
      fontSize: rs(15, 'min'),
      fontWeight: fontWeights.medium,
    },

    title: {
      color: theme.colors.text,
      fontSize: rs(26, 'min'),
      fontWeight: fontWeights.bold,
      marginBottom: theme.spacing.md,
      textAlign: 'center',
    },
  });

  return (
    <BottomSheetScrollView contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text
          style={styles.title}
          accessibilityRole="header"
        >
          {t('premium.title')}
        </Text>
      </View>

      {/* Body */}
      <View style={styles.body}>
        <Text style={styles.bodyText}>
          {t('premium.description')}
        </Text>

        {/* Features Box */}
        <View style={styles.features}>
          <Text style={styles.featuresText}>
            {t('premium.features')}
          </Text>
          <Text style={styles.priceText}>
            {t('premium.price', { price: dynamicPrice || '4,99€' })}
          </Text>
        </View>
      </View>

      {/* Buttons */}
      <View style={styles.buttons}>
        <TouchableOpacity
          style={[
            styles.primaryButton,
            isAnyOperationInProgress && styles.primaryButtonDisabled,
          ]}
          onPress={handlePurchase}
          disabled={isAnyOperationInProgress}
          activeOpacity={0.8}
          accessibilityLabel={t('accessibility.unlockPremium', { price: dynamicPrice || '4,99€' })}
          accessibilityRole="button"
          accessibilityHint={t('accessibility.unlockPremiumHint')}
          accessibilityState={{ disabled: isAnyOperationInProgress }}
        >
          {isPurchasing ? (
            <ActivityIndicator color={theme.colors.fixed.white} size="small" />
          ) : (
            <Text style={styles.primaryButtonText}>
              {t('premium.startTrial')}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={handleClose}
          disabled={isAnyOperationInProgress}
          activeOpacity={0.7}
          accessibilityLabel={t('accessibility.closePremiumModal')}
          accessibilityRole="button"
          accessibilityHint={t('accessibility.closeModalHint')}
        >
          <Text style={styles.secondaryButtonText}>
            {t('premium.maybeLater')}
          </Text>
        </TouchableOpacity>

        {/* Restore Purchases */}
        <TouchableOpacity
          style={styles.restoreButton}
          onPress={handleRestore}
          disabled={isAnyOperationInProgress}
          activeOpacity={0.7}
          accessibilityLabel={t('accessibility.restorePurchases')}
          accessibilityRole="button"
          accessibilityHint={t('accessibility.restorePurchasesHint')}
          accessibilityState={{ disabled: isAnyOperationInProgress }}
        >
          {isRestoring ? (
            <ActivityIndicator
              color={theme.colors.textSecondary}
              size="small"
              style={styles.loader}
            />
          ) : (
            <Text style={styles.restoreButtonText}>
              {t('premium.restore')}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </BottomSheetScrollView>
  );
}

PremiumModalContent.propTypes = {
  onClose: PropTypes.func.isRequired,
  highlightedFeature: PropTypes.string,
  modalId: PropTypes.string,
};
