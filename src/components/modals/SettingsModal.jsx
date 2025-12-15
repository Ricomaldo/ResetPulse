// src/components/modals/SettingsModal.jsx
import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  TouchableNativeFeedback,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "../../theme/ThemeProvider";
import { useTimerOptions } from "../../contexts/TimerOptionsContext";
import { useTimerPalette } from "../../contexts/TimerPaletteContext";
import { rs } from "../../styles/responsive";
import { fontWeights } from "../../theme/tokens";
import PremiumModal from "./PremiumModal";
import MoreColorsModal from "./MoreColorsModal";
import MoreActivitiesModal from "./MoreActivitiesModal";
import { getAllActivities } from "../../config/activities";
import haptics from "../../utils/haptics";
import { usePremiumStatus } from "../../hooks/usePremiumStatus";
import { useTranslation } from "../../hooks/useTranslation";

// Import section components
import {
  SettingsInterfaceSection,
  SettingsTimerSection,
  SettingsAppearanceSection,
  SettingsAboutSection,
} from "./settings";

// Storage key pour onboarding V2 (same as App.js)
const ONBOARDING_COMPLETED_KEY = "onboarding_v2_completed";

export default function SettingsModal({ visible, onClose }) {
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [showMoreColorsModal, setShowMoreColorsModal] = useState(false);
  const [showMoreActivitiesModal, setShowMoreActivitiesModal] = useState(false);
  const t = useTranslation();
  const theme = useTheme();
  const { currentPalette, setPalette } = useTimerPalette();
  const {
    shouldPulse,
    setShouldPulse,
    showActivities,
    setShowActivities,
    showPalettes,
    setShowPalettes,
    useMinimalInterface,
    setUseMinimalInterface,
    showDigitalTimer,
    setShowDigitalTimer,
    keepAwakeEnabled,
    setKeepAwakeEnabled,
    currentActivity,
    setCurrentActivity,
    clockwise,
    setClockwise,
    scaleMode,
    setScaleMode,
    favoriteActivities,
    setFavoriteActivities,
    selectedSoundId,
    setSelectedSoundId,
  } = useTimerOptions();

  const allActivities = getAllActivities();
  const { isPremium: isPremiumUser } = usePremiumStatus();

  const toggleFavorite = (activityId) => {
    haptics.selection().catch(() => { /* Optional operation - failure is non-critical */ });
    const newFavorites = favoriteActivities.includes(activityId)
      ? favoriteActivities.filter((id) => id !== activityId)
      : [...favoriteActivities, activityId];
    setFavoriteActivities(newFavorites);
  };

  // Reset onboarding V2 - reloads app to show onboarding flow
  const resetOnboarding = async () => {
    try {
      await AsyncStorage.removeItem(ONBOARDING_COMPLETED_KEY);
      // Note: App needs to reload to detect onboarding state change
      // User will need to force quit and reopen the app
    } catch (error) {
      console.warn("[SettingsModal] Failed to reset onboarding:", error);
    }
  };

  // Platform-specific touchable component
  const Touchable =
    Platform.OS === "android" &&
    TouchableNativeFeedback?.canUseNativeForeground?.()
      ? TouchableNativeFeedback
      : TouchableOpacity;

  const touchableProps =
    Platform.OS === "android" && TouchableNativeFeedback?.Ripple
      ? {
          background: TouchableNativeFeedback.Ripple(
            theme.colors.brand.primary + "20",
            false
          ),
        }
      : {
          activeOpacity: 0.7,
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
      width: "90%",
      maxHeight: "80%",
      padding: theme.spacing.lg,
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
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: theme.spacing.lg,
      paddingBottom: theme.spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },

    title: {
      fontSize: rs(24, "min"),
      fontWeight: fontWeights.bold,
      color: theme.colors.text,
    },

    closeButton: {
      padding: theme.spacing.md,
      margin: -theme.spacing.sm,
      minWidth: 44,
      minHeight: 44,
      alignItems: 'center',
      justifyContent: 'center',
    },

    closeText: {
      fontSize: rs(20, "min"),
      color: theme.colors.text,
    },

    scrollContent: {
      paddingBottom: theme.spacing.md,
    },

    section: {
      marginBottom: theme.spacing.lg,
    },

    sectionCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.border + '30',
      ...theme.shadow('sm'),
    },

    sectionCardPrimary: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.sm,
      borderWidth: 1,
      borderColor: theme.colors.brand.primary + '15',
      ...theme.shadow('md'),
    },

    sectionFlat: {
      marginBottom: theme.spacing.md,
      paddingTop: theme.spacing.sm,
    },

    levelDivider: {
      height: 1,
      backgroundColor: theme.colors.divider,
      marginVertical: theme.spacing.lg,
      marginHorizontal: theme.spacing.md,
    },

    sectionTitle: {
      fontSize: rs(16, "min"),
      fontWeight: fontWeights.semibold,
      color: theme.colors.text,
      marginBottom: theme.spacing.sm,
    },

    optionRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: theme.spacing.sm,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.colors.border,
    },

    optionLabel: {
      fontSize: rs(14, "min"),
      color: theme.colors.text,
      flex: 1,
    },

    optionDescription: {
      fontSize: rs(11, "min"),
      color: theme.colors.textLight,
      marginTop: theme.spacing.xs / 2,
    },

    segmentedControl: {
      flexDirection: "row",
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.md,
      padding: 2,
    },

    segmentButton: {
      flex: 1,
      paddingVertical: theme.spacing.xs,
      paddingHorizontal: theme.spacing.xs,
      borderRadius: theme.borderRadius.md - 2,
      alignItems: "center",
      minWidth: 60,
    },

    segmentButtonActive: {
      backgroundColor: theme.colors.brand.primary,
    },

    segmentText: {
      fontSize: rs(11, "min"),
      color: theme.colors.text,
      fontWeight: fontWeights.medium,
      textAlign: "center",
    },

    segmentTextActive: {
      color: theme.colors.background,
    },

    dialModeGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.xs,
      marginTop: theme.spacing.sm,
      justifyContent: 'space-between',
    },

    dialModeButton: {
      width: '31%',
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.xs,
      borderRadius: theme.borderRadius.md,
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      borderWidth: 2,
      borderColor: theme.colors.border,
    },

    dialModeButtonActive: {
      backgroundColor: theme.colors.brand.primary,
      borderColor: theme.colors.brand.primary,
    },

    dialModeText: {
      fontSize: rs(12, 'min'),
      color: theme.colors.text,
      fontWeight: fontWeights.semibold,
      textAlign: 'center',
    },

    dialModeTextActive: {
      color: theme.colors.background,
    },

    paletteGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: theme.spacing.sm,
      marginTop: theme.spacing.sm,
    },

    paletteItem: {
      width: "30%",
      aspectRatio: 1.5,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.xs,
      borderWidth: 2,
      borderColor: "transparent",
      backgroundColor: theme.colors.surface,
      marginBottom: theme.spacing.sm,
      ...theme.shadow("sm"),
    },

    paletteItemActive: {
      borderColor: theme.colors.brand.primary,
      backgroundColor: theme.colors.background,
      ...theme.shadow("md"),
    },

    paletteName: {
      fontSize: rs(10, "min"),
      color: theme.colors.text,
      textAlign: "center",
      marginTop: theme.spacing.xs / 2,
      fontWeight: fontWeights.medium,
    },

    paletteNameActive: {
      color: theme.colors.brand.primary,
      fontWeight: fontWeights.semibold,
    },

    discoverButton: {
      width: "30%",
      aspectRatio: 1.5,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.xs,
      borderWidth: 2,
      borderColor: theme.colors.brand.primary + "40",
      borderStyle: "dashed",
      backgroundColor: theme.colors.surface,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: theme.spacing.sm,
      gap: theme.spacing.xs,
    },

    discoverIconContainer: {
      width: rs(32),
      height: rs(32),
      borderRadius: rs(16),
      backgroundColor: theme.colors.brand.primary + "20",
      alignItems: "center",
      justifyContent: "center",
    },

    discoverIcon: {
      fontSize: rs(20),
      fontWeight: fontWeights.semibold,
      color: theme.colors.brand.primary,
    },

    discoverText: {
      fontSize: rs(9, "min"),
      color: theme.colors.brand.primary,
      textAlign: "center",
      fontWeight: fontWeights.semibold,
      lineHeight: rs(11),
    },

    discoverActivityButton: {
      width: "22%",
      aspectRatio: 1,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.xs,
      borderWidth: 2,
      borderColor: theme.colors.brand.primary + "40",
      borderStyle: "dashed",
      backgroundColor: theme.colors.surface,
      alignItems: "center",
      justifyContent: "center",
      gap: theme.spacing.xs / 2,
    },

    discoverActivityIcon: {
      fontSize: rs(24),
      fontWeight: fontWeights.semibold,
      color: theme.colors.brand.primary,
    },

    discoverActivityText: {
      fontSize: rs(8, "min"),
      color: theme.colors.brand.primary,
      textAlign: "center",
      fontWeight: fontWeights.semibold,
      lineHeight: rs(10),
    },

    favoritesGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: theme.spacing.sm,
      marginTop: theme.spacing.sm,
    },

    activityItem: {
      width: "22%",
      aspectRatio: 1,
      borderRadius: theme.borderRadius.md,
      backgroundColor: theme.colors.surface,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 2,
      borderColor: "transparent",
      ...theme.shadow("sm"),
      padding: theme.spacing.xs,
    },

    activityItemFavorite: {
      borderColor: theme.colors.brand.primary,
      backgroundColor: theme.colors.background,
      ...theme.shadow("md"),
    },

    activityEmoji: {
      fontSize: rs(24, "min"),
      marginBottom: theme.spacing.xs / 2,
      textAlign: "center",
    },

    activityItemLabel: {
      fontSize: rs(9, "min"),
      color: theme.colors.textLight,
      fontWeight: fontWeights.medium,
      textAlign: "center",
      width: "100%",
    },

    activityItemLabelFavorite: {
      color: theme.colors.brand.primary,
      fontWeight: fontWeights.semibold,
    },
  });

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
      accessible={true}
      accessibilityViewIsModal={true}
    >
      <View style={styles.overlay}>
        <View
          style={styles.modalContainer}
          accessible={true}
          accessibilityRole="dialog"
          accessibilityLabel={t('settings.title')}
          accessibilityHint={t('accessibility.settingsModalHint')}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text
              style={styles.title}
              accessibilityRole="header"
            >
              {t('settings.title')}
            </Text>
            <TouchableOpacity
              accessible={true}
              accessibilityLabel={t('accessibility.closeSettings')}
              accessibilityRole="button"
              accessibilityHint={t('accessibility.closeModalHint')}
              onPress={onClose}
              style={styles.closeButton}
            >
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* 1. Interface Section */}
            <SettingsInterfaceSection
              useMinimalInterface={useMinimalInterface}
              showDigitalTimer={showDigitalTimer}
              shouldPulse={shouldPulse}
              setUseMinimalInterface={setUseMinimalInterface}
              setShowDigitalTimer={setShowDigitalTimer}
              setShouldPulse={setShouldPulse}
              theme={theme}
              t={t}
              styles={styles}
            />

            {/* 2. Timer Section */}
            <SettingsTimerSection
              selectedSoundId={selectedSoundId}
              scaleMode={scaleMode}
              clockwise={clockwise}
              keepAwakeEnabled={keepAwakeEnabled}
              setSelectedSoundId={setSelectedSoundId}
              setScaleMode={setScaleMode}
              setClockwise={setClockwise}
              setKeepAwakeEnabled={setKeepAwakeEnabled}
              theme={theme}
              t={t}
              styles={styles}
            />

            {/* 3. Appearance Section */}
            <SettingsAppearanceSection
              theme={theme}
              currentPalette={currentPalette}
              setPalette={setPalette}
              showPalettes={showPalettes}
              setShowPalettes={setShowPalettes}
              showActivities={showActivities}
              setShowActivities={setShowActivities}
              favoriteActivities={favoriteActivities}
              toggleFavorite={toggleFavorite}
              allActivities={allActivities}
              setCurrentActivity={setCurrentActivity}
              isPremiumUser={isPremiumUser}
              setShowMoreColorsModal={setShowMoreColorsModal}
              setShowMoreActivitiesModal={setShowMoreActivitiesModal}
              t={t}
              styles={styles}
              Touchable={Touchable}
              touchableProps={touchableProps}
            />

            {/* Divider avant À propos */}
            <View style={styles.levelDivider} />

            {/* 4. About Section */}
            <SettingsAboutSection
              resetOnboarding={resetOnboarding}
              onClose={onClose}
              theme={theme}
              t={t}
              styles={styles}
            />
          </ScrollView>
        </View>
      </View>

      {/* Premium Modal */}
      <PremiumModal
        visible={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
        highlightedFeature="contenu premium"
      />

      {/* Discovery Modals */}
      <MoreColorsModal
        visible={showMoreColorsModal}
        onClose={() => setShowMoreColorsModal(false)}
      />

      <MoreActivitiesModal
        visible={showMoreActivitiesModal}
        onClose={() => setShowMoreActivitiesModal(false)}
      />
    </Modal>
  );
}
