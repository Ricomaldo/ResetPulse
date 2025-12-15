/**
 * @fileoverview Plus button for activity carousel (freemium discovery or premium creation)
 * @created 2025-12-14
 * @updated 2025-12-14
 */
import React from "react";
import { Text, TouchableOpacity, Platform, StyleSheet } from "react-native";
import { useTheme } from "../../../theme/ThemeProvider";
import { useTranslation } from "../../../hooks/useTranslation";
import { rs } from "../../../styles/responsive";
import { fontWeights } from '../../../../theme/tokens';

/**
 * PlusButton - Dumb component for "+" button in carousel
 *
 * @param {Object} props
 * @param {boolean} props.isPremium - Whether user is premium (affects styling)
 * @param {function} props.onPress - Handler for press event
 * @param {string} props.accessibilityLabel - Accessibility label
 * @param {string} props.accessibilityHint - Accessibility hint
 */
const PlusButton = React.memo(function PlusButton({
  isPremium,
  onPress,
  accessibilityLabel,
  accessibilityHint,
}) {
  const theme = useTheme();

  const styles = StyleSheet.create({
    // Bouton "+" pour mode freemium
    moreButton: {
      width: rs(60, "min"),
      height: rs(60, "min"),
      borderRadius: rs(30, "min"),
      backgroundColor: theme.colors.surface,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 2,
      borderColor: theme.colors.border,
      borderStyle: "dashed",
      ...(Platform.OS === "ios" ? theme.shadow("sm") : {}),
    },

    moreButtonText: {
      fontSize: rs(28, "min"),
      color: theme.colors.textSecondary,
      fontWeight: fontWeights.light,
    },

    // Bouton "+" pour mode premium (création)
    createButton: {
      width: rs(60, "min"),
      height: rs(60, "min"),
      borderRadius: rs(30, "min"),
      backgroundColor: theme.colors.brand.primary + "15",
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 2,
      borderColor: theme.colors.brand.primary + "40",
      borderStyle: "dashed",
      ...(Platform.OS === "ios" ? theme.shadow("sm") : {}),
    },

    createButtonText: {
      fontSize: rs(28, "min"),
      color: theme.colors.brand.primary,
      fontWeight: fontWeights.light,
    },
  });

  return (
    <TouchableOpacity
      style={isPremium ? styles.createButton : styles.moreButton}
      onPress={onPress}
      activeOpacity={0.7}
      accessible={true}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
    >
      <Text style={isPremium ? styles.createButtonText : styles.moreButtonText}>
        +
      </Text>
    </TouchableOpacity>
  );
});

export default PlusButton;
