// src/components/modals/DiscoveryModal.jsx
// Modale générique de découverte premium (activités, couleurs, etc.)

import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import { useTheme } from "../../theme/ThemeProvider";
import { useTranslation } from "../../hooks/useTranslation";
import { useModalStack } from "../../contexts/ModalStackContext";
import { rs } from "../../styles/responsive";
import haptics from "../../utils/haptics";
import { fontWeights } from '../../theme/tokens';
import PremiumModal from "./PremiumModal";

export default function DiscoveryModal({
  visible,
  onClose,
  onUnlock,
  title,
  subtitle,
  tagline,
  children,
  ctaText,
  dismissText,
  modalId,
  highlightedFeature,
}) {
  const theme = useTheme();
  const t = useTranslation();
  const modalStack = useModalStack();

  // Use i18n defaults if not provided
  const ctaTextFinal = ctaText || t('discovery.defaultCta');
  const dismissTextFinal = dismissText || t('discovery.defaultDismiss');

  const handleUnlock = () => {
    haptics.selection().catch(() => { /* Optional operation - failure is non-critical */ });

    // Push PremiumModal to the stack
    modalStack.push(PremiumModal, {
      onClose: () => {
        // When premium modal closes, it will pop itself
        // No need to do anything here
      },
      highlightedFeature: highlightedFeature || 'discovery',
    });

    // Also call legacy onUnlock if provided (for backward compatibility)
    if (onUnlock) {
      onUnlock();
    }
  };

  const handleClose = () => {
    haptics.selection().catch(() => { /* Optional operation - failure is non-critical */ });

    // If this modal is in the stack, pop it
    if (modalId) {
      modalStack.popById(modalId);
    }

    // Always call onClose for backward compatibility
    if (onClose) {
      onClose();
    }
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
        ios: 20,
        android: 16,
      }),
      width: "85%",
      maxWidth: 380,
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

    title: {
      fontSize: rs(24, "min"),
      fontWeight: fontWeights.bold,
      color: theme.colors.text,
      textAlign: "center",
      marginBottom: theme.spacing.sm,
    },

    subtitle: {
      fontSize: rs(14, "min"),
      color: theme.colors.textSecondary,
      textAlign: "center",
      marginBottom: theme.spacing.lg,
    },

    childrenContainer: {
      marginBottom: theme.spacing.lg,
    },

    tagline: {
      fontSize: rs(15, "min"),
      color: theme.colors.textSecondary,
      textAlign: "center",
      lineHeight: rs(22, "min"),
      marginBottom: theme.spacing.xl,
      fontStyle: "italic",
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

    primaryButtonText: {
      fontSize: rs(16, "min"),
      fontWeight: fontWeights.semibold,
      color: "#FFFFFF",
    },

    secondaryButton: {
      backgroundColor: "transparent",
      borderRadius: 12,
      padding: theme.spacing.md,
      alignItems: "center",
      justifyContent: "center",
      marginTop: theme.spacing.md,
    },

    secondaryButtonText: {
      fontSize: rs(14, "min"),
      fontWeight: fontWeights.medium,
      color: theme.colors.textSecondary,
    },
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
      statusBarTranslucent
      accessible={true}
      accessibilityViewIsModal={true}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={handleClose}
          accessible={false}
          importantForAccessibility="no"
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
            accessible={false}
          >
            <View
              style={styles.modalContainer}
              accessible={true}
              accessibilityRole="dialog"
              accessibilityLabel={title}
              accessibilityHint={t('accessibility.discoveryModalHint')}
            >
              {/* Title */}
              <Text
                style={styles.title}
                accessibilityRole="header"
              >
                {title}
              </Text>

              {/* Subtitle */}
              {subtitle && (
                <Text
                  style={styles.subtitle}
                  accessibilityRole="text"
                >
                  {subtitle}
                </Text>
              )}

              {/* Children (grille d'emojis, palettes, etc.) */}
              <View style={styles.childrenContainer}>{children}</View>

              {/* Tagline */}
              {tagline && <Text style={styles.tagline}>{tagline}</Text>}

              {/* CTA Button */}
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleUnlock}
                activeOpacity={0.8}
                accessibilityLabel={ctaTextFinal}
                accessibilityRole="button"
                accessibilityHint={t('accessibility.unlockPremiumHint')}
              >
                <Text style={styles.primaryButtonText}>{ctaTextFinal}</Text>
              </TouchableOpacity>

              {/* Secondary Button */}
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={handleClose}
                activeOpacity={0.7}
                accessibilityLabel={dismissTextFinal}
                accessibilityRole="button"
                accessibilityHint={t('accessibility.closeModalHint')}
              >
                <Text style={styles.secondaryButtonText}>{dismissTextFinal}</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}
