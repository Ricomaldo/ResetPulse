// src/components/PremiumModal.jsx
// Phase 4 - Premium Modal UI

import React, { useState } from "react";
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
import { rs } from "../styles/responsive";
import haptics from "../utils/haptics";

export default function PremiumModal({ visible, onClose, highlightedFeature }) {
  const theme = useTheme();
  const {
    purchaseProduct,
    restorePurchases,
    getOfferings,
    isPurchasing: contextPurchasing,
  } = usePurchases();
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

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
          "Pas de connexion",
          "Impossible de charger les offres. Vérifiez votre connexion internet.",
          [{ text: "OK" }]
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
          "Erreur",
          "Impossible de récupérer les offres. Réessayez plus tard.",
          [{ text: "OK" }]
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
          "Bienvenue Premium ! 🎉",
          "Toutes les palettes et activités sont maintenant débloquées.",
          [{ text: "Super !", onPress: onClose }]
        );
      } else if (result.cancelled) {
        // User cancelled, silent
      } else if (result.isNetworkError) {
        // Network error - user-friendly message
        Alert.alert("Pas de connexion", result.error, [{ text: "OK" }]);
      } else if (result.isPaymentPending) {
        // Payment pending - informative message
        Alert.alert("Paiement en cours", result.error, [
          { text: "OK", onPress: onClose },
        ]);
      } else {
        // Generic error
        Alert.alert(
          "Erreur",
          result.error || "Une erreur est survenue lors de l'achat.",
          [{ text: "OK" }]
        );
      }
    } catch (error) {
      console.error("[PremiumModal] Purchase error:", error);
      Alert.alert("Erreur", "Une erreur est survenue. Réessayez plus tard.", [
        { text: "OK" },
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
            "Restauration réussie",
            "Vos achats ont été restaurés. Toutes les fonctionnalités premium sont débloquées.",
            [{ text: "Super !", onPress: onClose }]
          );
        } else {
          Alert.alert(
            "Aucun achat trouvé",
            "Aucun achat précédent n'a été trouvé pour ce compte.",
            [{ text: "OK" }]
          );
        }
      } else if (result.isNetworkError) {
        // Network error during restore
        Alert.alert("Pas de connexion", result.error, [{ text: "OK" }]);
      } else {
        // Generic restore error
        Alert.alert(
          "Erreur",
          result.error || "Impossible de restaurer vos achats.",
          [{ text: "OK" }]
        );
      }
    } catch (error) {
      console.error("[PremiumModal] Restore error:", error);
      Alert.alert("Erreur", "Une erreur inattendue est survenue.", [
        { text: "OK" },
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
            <Text style={styles.title}>Débloquer Premium</Text>
          </View>

          {/* Body */}
          <View style={styles.body}>
            <Text style={styles.bodyText}>
              ResetPulse est gratuit et fonctionnel.{"\n"}
              Pour plus d'activités et de palettes, débloquez premium.
            </Text>

            {/* Features Box */}
            <View style={styles.features}>
              <Text style={styles.featuresText}>
                15 palettes + 16 activités
              </Text>
              <Text style={styles.priceText}>
                4,99€ - Une fois, pour toujours
              </Text>
              <Text style={styles.trialText}>Trial gratuit 7 jours</Text>
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
              accessibilityLabel="Commencer l'essai gratuit"
              accessibilityRole="button"
            >
              {isPurchasing ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.primaryButtonText}>
                  Commencer l'essai gratuit
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handleClose}
              disabled={isAnyOperationInProgress}
              activeOpacity={0.7}
              accessibilityLabel="Peut-être plus tard"
              accessibilityRole="button"
            >
              <Text style={styles.secondaryButtonText}>
                Peut-être plus tard
              </Text>
            </TouchableOpacity>

            {/* Restore Purchases */}
            <TouchableOpacity
              style={styles.restoreButton}
              onPress={handleRestore}
              disabled={isAnyOperationInProgress}
              activeOpacity={0.7}
              accessibilityLabel="Restaurer mes achats"
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
                  Restaurer mes achats
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
