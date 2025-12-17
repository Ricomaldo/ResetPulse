// src/components/modals/SettingsModal.jsx
import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  TouchableNativeFeedback,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../../theme/ThemeProvider';
import { useTimerOptions } from '../../contexts/TimerOptionsContext';
import { rs } from '../../styles/responsive';
import { fontWeights } from '../../theme/tokens';
import PremiumModal from './PremiumModal';
import MoreColorsModal from './MoreColorsModal';
import MoreActivitiesModal from './MoreActivitiesModal';
import { getAllActivities } from '../../config/activities';
import haptics from '../../utils/haptics';
import { usePremiumStatus } from '../../hooks/usePremiumStatus';
import { useTranslation } from '../../hooks/useTranslation';

// Import section components
import {
  SettingsCommandBarSection,
  SettingsCarouselBarSection,
  SettingsFavoritesSection,
  SettingsDialSection,
  SettingsSoundSection,
  SettingsGeneralSection,
  SettingsThemeSection,
  SettingsAboutSection,
} from './settings';

// Storage key pour onboarding V2 (same as App.js)
const ONBOARDING_COMPLETED_KEY = 'onboarding_v2_completed';

export default function SettingsModal({ visible, onClose }) {
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [showMoreColorsModal, setShowMoreColorsModal] = useState(false);
  const [showMoreActivitiesModal, setShowMoreActivitiesModal] = useState(false);
  const t = useTranslation();
  const theme = useTheme();
  const {
    shouldPulse,
    setShouldPulse,
    showActivityEmoji,
    setShowActivityEmoji,
    keepAwakeEnabled,
    setKeepAwakeEnabled,
    clockwise,
    setClockwise,
    favoriteActivities,
    setFavoriteActivities,
    favoritePalettes,
    toggleFavoritePalette,
    selectedSoundId,
    setSelectedSoundId,
    commandBarConfig,
    setCommandBarConfig,
    carouselBarConfig,
    setCarouselBarConfig,
  } = useTimerOptions();

  const allActivities = getAllActivities();
  const { isPremium: isPremiumUser } = usePremiumStatus();

  const toggleFavoriteActivity = (activityId) => {
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
      console.warn('[SettingsModal] Failed to reset onboarding:', error);
    }
  };

  // Platform-specific touchable component
  const Touchable =
    Platform.OS === 'android' &&
    TouchableNativeFeedback?.canUseNativeForeground?.()
      ? TouchableNativeFeedback
      : TouchableOpacity;

  const touchableProps =
    Platform.OS === 'android' && TouchableNativeFeedback?.Ripple
      ? {
        background: TouchableNativeFeedback.Ripple(
          theme.colors.brand.primary + '20',
          false
        ),
      }
      : {
        activeOpacity: 0.7,
      };

  const styles = StyleSheet.create({
    activityEmoji: {
      fontSize: rs(24, 'min'),
      marginBottom: theme.spacing.xs / 2,
      textAlign: 'center',
    },

    activityItem: {
      alignItems: 'center',
      aspectRatio: 1,
      backgroundColor: theme.colors.surface,
      borderColor: 'transparent',
      borderRadius: theme.borderRadius.md,
      borderWidth: 2,
      justifyContent: 'center',
      width: '22%',
      ...theme.shadow('sm'),
      padding: theme.spacing.xs,
    },

    activityItemDisabled: {
      opacity: 0.4,
    },

    activityItemFavorite: {
      backgroundColor: theme.colors.background,
      borderColor: theme.colors.brand.primary,
      ...theme.shadow('md'),
    },

    activityItemLabel: {
      color: theme.colors.textLight,
      fontSize: rs(9, 'min'),
      fontWeight: fontWeights.medium,
      textAlign: 'center',
      width: '100%',
    },

    activityItemLabelFavorite: {
      color: theme.colors.brand.primary,
      fontWeight: fontWeights.semibold,
    },

    closeButton: {
      alignItems: 'center',
      justifyContent: 'center',
      margin: -theme.spacing.sm,
      minHeight: 44,
      minWidth: 44,
      padding: theme.spacing.md,
    },

    closeText: {
      color: theme.colors.text,
      fontSize: rs(20, 'min'),
    },

    discoverActivityButton: {
      alignItems: 'center',
      aspectRatio: 1,
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.brand.primary + '40',
      borderRadius: theme.borderRadius.md,
      borderStyle: 'dashed',
      borderWidth: 2,
      gap: theme.spacing.xs / 2,
      justifyContent: 'center',
      padding: theme.spacing.xs,
      width: '22%',
    },

    discoverActivityIcon: {
      color: theme.colors.brand.primary,
      fontSize: rs(24),
      fontWeight: fontWeights.semibold,
    },

    discoverActivityText: {
      color: theme.colors.brand.primary,
      fontSize: rs(8, 'min'),
      fontWeight: fontWeights.semibold,
      lineHeight: rs(10),
      textAlign: 'center',
    },

    discoverButton: {
      alignItems: 'center',
      aspectRatio: 1.5,
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.brand.primary + '40',
      borderRadius: theme.borderRadius.md,
      borderStyle: 'dashed',
      borderWidth: 2,
      gap: theme.spacing.xs,
      justifyContent: 'center',
      marginBottom: theme.spacing.sm,
      padding: theme.spacing.xs,
      width: '30%',
    },

    discoverIcon: {
      color: theme.colors.brand.primary,
      fontSize: rs(20),
      fontWeight: fontWeights.semibold,
    },

    discoverIconContainer: {
      alignItems: 'center',
      backgroundColor: theme.colors.brand.primary + '20',
      borderRadius: rs(16),
      height: rs(32),
      justifyContent: 'center',
      width: rs(32),
    },

    discoverText: {
      color: theme.colors.brand.primary,
      fontSize: rs(9, 'min'),
      fontWeight: fontWeights.semibold,
      lineHeight: rs(11),
      textAlign: 'center',
    },

    favoritesGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.sm,
      marginTop: theme.spacing.sm,
    },

    header: {
      alignItems: 'center',
      borderBottomColor: theme.colors.border,
      borderBottomWidth: 1,
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: theme.spacing.lg,
      paddingBottom: theme.spacing.sm,
    },

    levelDivider: {
      backgroundColor: theme.colors.divider,
      height: 1,
      marginHorizontal: theme.spacing.md,
      marginVertical: theme.spacing.lg,
    },

    modalContainer: {
      backgroundColor: theme.colors.surface,
      borderRadius: Platform.select({
        ios: 16,
        android: 12,
      }),
      maxHeight: '80%',
      padding: theme.spacing.lg,
      width: '90%',
      ...theme.shadow('xl'),
      ...Platform.select({
        ios: {
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: theme.colors.brand.primary + '30',
        },
        android: {},
      }),
    },

    optionDescription: {
      color: theme.colors.textLight,
      fontSize: rs(11, 'min'),
      marginTop: theme.spacing.xs / 2,
    },

    optionLabel: {
      color: theme.colors.text,
      flex: 1,
      fontSize: rs(14, 'min'),
    },

    optionRow: {
      alignItems: 'center',
      borderBottomColor: theme.colors.border,
      borderBottomWidth: StyleSheet.hairlineWidth,
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: theme.spacing.sm,
    },

    overlay: {
      alignItems: 'center',
      backgroundColor: theme.colors.overlay,
      flex: 1,
      justifyContent: 'center',
    },

    paletteGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.sm,
      marginTop: theme.spacing.sm,
    },

    paletteItem: {
      aspectRatio: 1.5,
      backgroundColor: theme.colors.surface,
      borderColor: 'transparent',
      borderRadius: theme.borderRadius.md,
      borderWidth: 2,
      marginBottom: theme.spacing.sm,
      padding: theme.spacing.xs,
      width: '30%',
      ...theme.shadow('sm'),
    },

    paletteItemActive: {
      backgroundColor: theme.colors.background,
      borderColor: theme.colors.brand.primary,
      ...theme.shadow('md'),
    },

    paletteItemDisabled: {
      opacity: 0.4,
    },

    paletteName: {
      color: theme.colors.text,
      fontSize: rs(10, 'min'),
      fontWeight: fontWeights.medium,
      marginTop: theme.spacing.xs / 2,
      textAlign: 'center',
    },

    paletteNameActive: {
      color: theme.colors.brand.primary,
      fontWeight: fontWeights.semibold,
    },

    scrollContent: {
      paddingBottom: theme.spacing.md,
    },

    sectionCard: {
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.brand.primary + '30',
      borderRadius: theme.borderRadius.lg,
      borderWidth: 1,
      marginBottom: theme.spacing.md,
      padding: theme.spacing.md,
      ...theme.shadow('sm'),
    },

    sectionCardPrimary: {
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.brand.primary + '15',
      borderRadius: theme.borderRadius.lg,
      borderWidth: 1,
      marginBottom: theme.spacing.sm,
      padding: theme.spacing.md,
      ...theme.shadow('md'),
    },

    sectionTitle: {
      color: theme.colors.text,
      fontSize: rs(16, 'min'),
      fontWeight: fontWeights.semibold,
      marginBottom: theme.spacing.sm,
    },

    segmentButton: {
      alignItems: 'center',
      borderRadius: theme.borderRadius.md - 2,
      flex: 1,
      minWidth: 60,
      paddingHorizontal: theme.spacing.xs,
      paddingVertical: theme.spacing.xs,
    },

    segmentButtonActive: {
      backgroundColor: theme.colors.brand.primary,
    },

    segmentText: {
      color: theme.colors.text,
      fontSize: rs(11, 'min'),
      fontWeight: fontWeights.medium,
      textAlign: 'center',
    },

    segmentTextActive: {
      color: theme.colors.fixed.white,
    },

    segmentedControl: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.md,
      flexDirection: 'row',
      padding: 2,
    },

    title: {
      color: theme.colors.text,
      fontSize: rs(24, 'min'),
      fontWeight: fontWeights.bold,
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
            {/* 1. Zone commandes (haut) */}
            <SettingsCommandBarSection
              commandBarConfig={commandBarConfig}
              setCommandBarConfig={setCommandBarConfig}
              theme={theme}
              t={t}
              styles={styles}
            />

            {/* 2. Zone carrousels (bas) */}
            <SettingsCarouselBarSection
              carouselBarConfig={carouselBarConfig}
              setCarouselBarConfig={setCarouselBarConfig}
              theme={theme}
              t={t}
              styles={styles}
            />

            {/* 3. Favoris */}
            <SettingsFavoritesSection
              favoriteActivities={favoriteActivities}
              toggleFavoriteActivity={toggleFavoriteActivity}
              allActivities={allActivities}
              isPremiumUser={isPremiumUser}
              setShowMoreActivitiesModal={setShowMoreActivitiesModal}
              favoritePalettes={favoritePalettes}
              toggleFavoritePalette={toggleFavoritePalette}
              setShowMoreColorsModal={setShowMoreColorsModal}
              theme={theme}
              t={t}
              styles={styles}
              Touchable={Touchable}
              touchableProps={touchableProps}
            />

            {/* 4. Dial */}
            <SettingsDialSection
              showActivityEmoji={showActivityEmoji}
              shouldPulse={shouldPulse}
              setShowActivityEmoji={setShowActivityEmoji}
              setShouldPulse={setShouldPulse}
              theme={theme}
              t={t}
              styles={styles}
            />

            {/* 5. Son */}
            <SettingsSoundSection
              selectedSoundId={selectedSoundId}
              setSelectedSoundId={setSelectedSoundId}
              theme={theme}
              t={t}
              styles={styles}
            />

            {/* 6. Général */}
            <SettingsGeneralSection
              clockwise={clockwise}
              keepAwakeEnabled={keepAwakeEnabled}
              setClockwise={setClockwise}
              setKeepAwakeEnabled={setKeepAwakeEnabled}
              theme={theme}
              t={t}
              styles={styles}
            />

            {/* 7. Thème */}
            <SettingsThemeSection
              theme={theme}
              t={t}
              styles={styles}
              Touchable={Touchable}
              touchableProps={touchableProps}
            />

            {/* Divider avant À propos */}
            <View style={styles.levelDivider} />

            {/* 8. À propos */}
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
