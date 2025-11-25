// src/components/PremiumModal.jsx
// Phase 4 - Premium Modal UI

import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useTheme } from "../theme/ThemeProvider";
import { usePurchases } from "../contexts/PurchaseContext";
import { useAnalytics } from "../hooks/useAnalytics";
import { useTranslation } from "../hooks/useTranslation";
import { rs } from "../styles/responsive";
import haptics from "../utils/haptics";

export default function PremiumModal({ visible, onClose, highlightedFeature }) {
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

  // Track paywall viewed (M7.5)
  useEffect(() => {
    if (visible) {
      // Determine source from highlightedFeature or default
      const source = highlightedFeature || 'unknown';
      analytics.trackPaywallViewed(source);
    }
  }, [visible, highlightedFeature]);

  // Combined loading state (local + context)
  const isAnyOperationInProgress =
    isPurchasing || isRestoring || contextPurchasing;

  const handlePurchase = async () => {
    try {
      console.log('[IAP] 🚀 Starting purchase flow...');
      setIsPurchasing(true);
      haptics.selection().catch(() => {});

      // Get offerings from RevenueCat
      console.log('[IAP] 📡 Fetching offerings from RevenueCat...');
      const offerings = await getOfferings();

      // Log offerings structure for debugging
      console.log('[IAP] 📦 Offerings received:', {
        hasOfferings: !!offerings,
        hasError: !!offerings?.error,
        errorType: offerings?.error || 'none',
        packagesCount: offerings?.availablePackages?.length || 0,
      });

      // Handle network error from getOfferings
      if (offerings?.error === "network") {
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
      console.log('[IAP] 📋 Package selected:', {
        packageId: premiumPackage.identifier,
        productId: premiumPackage.product.identifier,
        price: premiumPackage.product.priceString,
        title: premiumPackage.product.title,
        description: premiumPackage.product.description,
      });

      console.log('[IAP] 💳 Initiating purchase for product:', premiumPackage.product.identifier);
      const result = await purchaseProduct(premiumPackage.product.identifier);

      console.log('[IAP] ✅ Purchase result:', {
        success: result.success,
        cancelled: result.cancelled,
        isNetworkError: result.isNetworkError,
        isPaymentPending: result.isPaymentPending,
        error: result.error || 'none',
      });

      if (result.success) {
        haptics.success().catch(() => {});
        Alert.alert(
          t('premium.welcomeTitle'),
          t('premium.welcomeMessage'),
          [{ text: t('premium.welcomeButton'), onPress: onClose }]
        );
      } else if (result.cancelled) {
        // User cancelled, silent
      } else if (result.isNetworkError) {
        // Network error - user-friendly message
        Alert.alert(t('premium.noConnection'), result.error, [{ text: t('common.ok') }]);
      } else if (result.isPaymentPending) {
        // Payment pending - informative message
        Alert.alert(t('premium.paymentPending'), result.error, [
          { text: t('common.ok'), onPress: onClose },
        ]);
      } else {
        // Generic error
        Alert.alert(
          t('premium.error'),
          result.error || t('premium.errorPurchase'),
          [{ text: t('common.ok') }]
        );
      }
    } catch (error) {
      console.error("[PremiumModal] Purchase error:", error);
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
      haptics.selection().catch(() => {});

      const result = await restorePurchases();

      if (result.success) {
        if (result.hasPremium) {
          haptics.success().catch(() => {});
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
      console.error("[PremiumModal] Restore error:", error);
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
    haptics.selection().catch(() => {});
    onClose();
  };

  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: Platform.select({
        ios: "rgba(0, 0, 0, 0.4)",
        android: "rgba(0, 0, 0, 0.5)",
      }),
      justifyContent: "center",
      alignItems: "center",
    },

    modalContainer: {
      backgroundColor: theme.colors.background,
      borderRadius: Platform.select({
        ios: 16,
        android: 12,
      }),
      width: "85%",
      maxWidth: 400,
      padding: theme.spacing.xl,
      ...theme.shadow("xl"),
      ...Platform.select({
        ios: {
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: theme.colors.border + "30",
        },
        android: {},
      }),
    },

    header: {
      marginBottom: theme.spacing.lg,
    },

    title: {
      fontSize: rs(26, "min"),
      fontWeight: "bold",
      color: theme.colors.text,
      textAlign: "center",
      marginBottom: theme.spacing.md,
    },

    body: {
      marginBottom: theme.spacing.xl,
    },

    bodyText: {
      fontSize: rs(16, "min"),
      color: theme.colors.textSecondary,
      textAlign: "center",
      lineHeight: rs(24, "min"),
      marginBottom: theme.spacing.lg,
    },

    features: {
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      padding: theme.spacing.lg,
      marginBottom: theme.spacing.lg,
      borderWidth: 2,
      borderColor: theme.colors.brand.primary + "30",
    },

    featuresText: {
      fontSize: rs(18, "min"),
      fontWeight: "600",
      color: theme.colors.text,
      textAlign: "center",
      marginBottom: theme.spacing.sm,
    },

    priceText: {
      fontSize: rs(20, "min"),
      fontWeight: "bold",
      color: theme.colors.brand.primary,
      textAlign: "center",
      marginBottom: theme.spacing.xs,
    },

    trialText: {
      fontSize: rs(14, "min"),
      color: theme.colors.textSecondary,
      textAlign: "center",
      fontStyle: "italic",
    },

    buttons: {
      gap: theme.spacing.md,
    },

    primaryButton: {
      backgroundColor: theme.colors.brand.primary,
      borderRadius: 12,
      padding: theme.spacing.lg,
      alignItems: "center",
      justifyContent: "center",
      minHeight: 52,
      ...theme.shadow("md"),
    },

    primaryButtonDisabled: {
      opacity: 0.6,
    },

    primaryButtonText: {
      fontSize: rs(17, "min"),
      fontWeight: "600",
      color: "#FFFFFF",
    },

    secondaryButton: {
      backgroundColor: "transparent",
      borderRadius: 12,
      padding: theme.spacing.md,
      alignItems: "center",
      justifyContent: "center",
      minHeight: 44,
    },

    secondaryButtonText: {
      fontSize: rs(15, "min"),
      fontWeight: "500",
      color: theme.colors.textSecondary,
    },

    restoreButton: {
      marginTop: theme.spacing.md,
      padding: theme.spacing.sm,
      alignItems: "center",
    },

    restoreButtonText: {
      fontSize: rs(13, "min"),
      color: theme.colors.textSecondary,
      textDecorationLine: "underline",
    },

    loader: {
      marginLeft: theme.spacing.sm,
    },
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>{t('premium.title')}</Text>
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
                {t('premium.price')}
              </Text>
              <Text style={styles.trialText}>{t('premium.trial')}</Text>
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
              accessibilityLabel={t('premium.startTrial')}
              accessibilityRole="button"
            >
              {isPurchasing ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
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
              accessibilityLabel={t('premium.maybeLater')}
              accessibilityRole="button"
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
              accessibilityLabel={t('premium.restore')}
              accessibilityRole="button"
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
        </View>
      </View>
    </Modal>
  );
}
