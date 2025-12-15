// src/components/modals/MoreActivitiesModal.jsx
// Modale "Encore plus de moments" - découverte des activités premium

import React, { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "../../theme/ThemeProvider";
import { useTranslation } from "../../hooks/useTranslation";
import { rs } from "../../styles/responsive";
import { ACTIVITIES } from "../../config/activities";
import DiscoveryModal from "./DiscoveryModal";
import analytics from "../../services/analytics";

export default function MoreActivitiesModal({ visible, onClose, onOpenPaywall, modalId }) {
  const theme = useTheme();
  const t = useTranslation();

  useEffect(() => {
    if (visible) {
      analytics.trackDiscoveryModalShown('activities');
    }
  }, [visible]);

  const handleUnlock = () => {
    analytics.trackDiscoveryModalUnlockClicked('activities');
    // Legacy callback for backward compatibility
    onOpenPaywall?.();
  };

  const handleClose = () => {
    analytics.trackDiscoveryModalDismissed('activities');
    onClose();
  };

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
      onClose={handleClose}
      onUnlock={handleUnlock}
      title={t('discovery.moreActivities.title')}
      subtitle={t('discovery.moreActivities.subtitle')}
      tagline={t('discovery.moreActivities.tagline')}
      modalId={modalId}
      highlightedFeature="activities"
    >
      <View
        style={styles.emojiGrid}
        accessible={true}
        accessibilityRole="list"
        accessibilityLabel={t('accessibility.premiumActivitiesList')}
      >
        {ACTIVITIES.filter(activity => activity.isPremium && activity.emoji).map((activity) => (
          <Text
            key={activity.id}
            style={styles.emoji}
            accessible={true}
            accessibilityRole="text"
            accessibilityLabel={`${activity.emoji} ${activity.name || activity.label}`}
          >
            {activity.emoji}
          </Text>
        ))}
      </View>
    </DiscoveryModal>
  );
}
