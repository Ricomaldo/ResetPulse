// src/components/modals/MoreActivitiesModal.jsx
// Modale "Encore plus de moments" - découverte des activités premium

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "../../theme/ThemeProvider";
import { useTranslation } from "../../hooks/useTranslation";
import { rs } from "../../styles/responsive";
import DiscoveryModal from "./DiscoveryModal";

// Emojis des 14 activités premium
const PREMIUM_EMOJIS = [
  "😴", "✍️", "📖", "📚", "🧘‍♀️", "💪", "🚶",
  "👨‍🍳", "🎮", "✏️", "🎵", "🧹"
];

export default function MoreActivitiesModal({ visible, onClose, onOpenPaywall }) {
  const theme = useTheme();
  const t = useTranslation();

  const styles = StyleSheet.create({
    emojiGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "center",
      gap: theme.spacing.md,
      paddingHorizontal: theme.spacing.sm,
    },
    emoji: {
      fontSize: rs(32, "min"),
      width: rs(48, "min"),
      height: rs(48, "min"),
      textAlign: "center",
      lineHeight: rs(48, "min"),
    },
  });

  return (
    <DiscoveryModal
      visible={visible}
      onClose={onClose}
      onUnlock={onOpenPaywall}
      title={t('discovery.moreActivities.title')}
      subtitle={t('discovery.moreActivities.subtitle')}
      tagline={t('discovery.moreActivities.tagline')}
    >
      <View style={styles.emojiGrid}>
        {PREMIUM_EMOJIS.map((emoji, index) => (
          <Text key={index} style={styles.emoji}>
            {emoji}
          </Text>
        ))}
      </View>
    </DiscoveryModal>
  );
}
