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
import { useTimerPalette } from '../../contexts/TimerPaletteContext';
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
  SettingsInterfaceSection,
  SettingsTimerSection,
  SettingsAppearanceSection,
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
      backgroundColor: theme.colors.background,
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
          borderColor: theme.colors.border + '30',
        },
        android: {},
      }),
    },

    overlay: {
      alignItems: 'center',
      backgroundColor: Platform.select({
        ios: 'rgba(0, 0, 0, 0.4)',
        android: 'rgba(0, 0, 0, 0.5)',
      }),
      flex: 1,
      justifyContent: 'center',
    },

    scrollContent: {
      paddingBottom: theme.spacing.md,
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
