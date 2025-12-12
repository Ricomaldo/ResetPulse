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
import { rs } from "../../styles/responsive";
import haptics from "../../utils/haptics";

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
}) {
  const theme = useTheme();
  const t = useTranslation();

  // Use i18n defaults if not provided
  const ctaTextFinal = ctaText || t('discovery.defaultCta');
  const dismissTextFinal = dismissText || t('discovery.defaultDismiss');

  const handleUnlock = () => {
    haptics.selection().catch(() => {});
    onClose();
    // Petit délai pour la transition fluide
    setTimeout(() => {
      onUnlock();
    }, 200);
  };

  const handleClose = () => {
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
      fontWeight: "bold",
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
      fontWeight: "600",
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
      fontWeight: "500",
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
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={handleClose}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.modalContainer}>
              {/* Title */}
              <Text style={styles.title}>{title}</Text>

              {/* Subtitle */}
              {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}

              {/* Children (grille d'emojis, palettes, etc.) */}
              <View style={styles.childrenContainer}>{children}</View>

              {/* Tagline */}
              {tagline && <Text style={styles.tagline}>{tagline}</Text>}

              {/* CTA Button */}
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleUnlock}
                activeOpacity={0.8}
              >
                <Text style={styles.primaryButtonText}>{ctaTextFinal}</Text>
              </TouchableOpacity>

              {/* Secondary Button */}
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={handleClose}
                activeOpacity={0.7}
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
