// src/components/modals/MoreColorsModal.jsx
// Modale "Encore plus de couleurs" - découverte des palettes premium

import React, { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "../../theme/ThemeProvider";
import { useTranslation } from "../../hooks/useTranslation";
import { rs } from "../../styles/responsive";
import { TIMER_PALETTES } from '../../config/timer-palettes';
import DiscoveryModal from "./DiscoveryModal";
import analytics from "../../services/analytics";
import { fontWeights } from '../../theme/tokens';

// Récupérer les palettes premium
const PREMIUM_PALETTES = Object.entries(TIMER_PALETTES)
  .filter(([_, palette]) => palette.isPremium)
  .map(([key, palette]) => ({
    key,
    name: palette.name,
    colors: palette.colors,
  }));

export default function MoreColorsModal({ visible, onClose, onOpenPaywall, modalId }) {
  const theme = useTheme();
  const t = useTranslation();

  useEffect(() => {
    if (visible) {
      analytics.trackDiscoveryModalShown('colors');
    }
  }, [visible]);

  const handleUnlock = () => {
    analytics.trackDiscoveryModalUnlockClicked('colors');
    // Legacy callback for backward compatibility
    onOpenPaywall?.();
  };

  const handleClose = () => {
    analytics.trackDiscoveryModalDismissed('colors');
    onClose();
  };

  const styles = StyleSheet.create({
    paletteGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "center",
      gap: theme.spacing.md,
      paddingHorizontal: theme.spacing.xs,
    },
    paletteItem: {
      width: "28%",
      alignItems: "center",
      marginBottom: theme.spacing.sm,
    },
    colorsRow: {
      flexDirection: "row",
      gap: 4,
      marginBottom: theme.spacing.xs,
    },
    colorCircle: {
      width: rs(16, "min"),
      height: rs(16, "min"),
      borderRadius: rs(8, "min"),
      ...theme.shadow("sm"),
    },
    paletteName: {
      fontSize: rs(10, "min"),
      color: theme.colors.textSecondary,
      textAlign: "center",
      fontWeight: fontWeights.medium,
    },
  });

  return (
    <DiscoveryModal
      visible={visible}
      onClose={handleClose}
      onUnlock={handleUnlock}
      title={t('discovery.moreColors.title')}
      subtitle={t('discovery.moreColors.subtitle')}
      tagline={t('discovery.moreColors.tagline')}
      modalId={modalId}
      highlightedFeature="colors"
    >
      <View
        style={styles.paletteGrid}
        accessible={true}
        accessibilityRole="list"
        accessibilityLabel={t('accessibility.premiumPalettesList')}
      >
        {PREMIUM_PALETTES.map((palette) => (
          <View
            key={palette.key}
            style={styles.paletteItem}
            accessible={true}
            accessibilityRole="text"
            accessibilityLabel={t('accessibility.paletteItem', { name: palette.name })}
          >
            <View
              style={styles.colorsRow}
              accessible={false}
              importantForAccessibility="no-hide-descendants"
            >
              {palette.colors.map((color, index) => (
                <View
                  key={index}
                  style={[styles.colorCircle, { backgroundColor: color }]}
                  accessible={false}
                />
              ))}
            </View>
            <Text style={styles.paletteName} numberOfLines={1}>
              {palette.name}
            </Text>
          </View>
        ))}
      </View>
    </DiscoveryModal>
  );
}
