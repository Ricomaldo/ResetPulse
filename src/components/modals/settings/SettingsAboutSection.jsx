// src/components/modals/settings/SettingsAboutSection.jsx
import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import haptics from '../../../utils/haptics';

/**
 * Settings section for app information:
 * - App name, description, version
 * - Restart guide button (resets onboarding)
 * - Dev tools (only visible in __DEV__ mode)
 */
export default function SettingsAboutSection({
  // Callbacks
  resetOnboarding,
  onClose,
  // Theme & i18n
  theme,
  t,
  // Styles
  styles,
}) {
  return (
    <>
      {/* À propos */}
      <View style={styles.sectionFlat}>
        <Text style={styles.sectionTitle}>{t('settings.about.title')}</Text>
        <View style={styles.optionRow}>
          <View>
            <Text style={styles.optionLabel}>{t('settings.about.appName')}</Text>
            <Text style={styles.optionDescription}>
              {t('settings.about.appDescription')}
            </Text>
            <Text
              style={[
                styles.optionDescription,
                { marginTop: theme.spacing.xs },
              ]}
            >
              {t('settings.about.version')} 1.1.7
            </Text>
          </View>
        </View>

        {/* Relancer le guide - Available for all users */}
        <TouchableOpacity
          style={styles.optionRow}
          onPress={() => {
            haptics.selection().catch(() => { /* Optional operation - failure is non-critical */ });
            // Reset l'onboarding complet (WelcomeScreen + tooltips)
            resetOnboarding();
            // Fermer le modal pour laisser le WelcomeScreen apparaître
            onClose();
          }}
          activeOpacity={0.7}
        >
          <View style={{ flex: 1 }}>
            <Text style={styles.optionLabel}>{t('onboarding.restartGuide')}</Text>
            <Text style={styles.optionDescription}>
              {t('onboarding.restartGuideDescription')}
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Dev Section - Only visible in development */}
      {__DEV__ && (
        <View style={styles.sectionFlat}>
          <Text style={styles.sectionTitle}>{t('settings.dev.title')}</Text>
          <TouchableOpacity
            style={styles.optionRow}
            onPress={() => {
              Alert.alert(
                t('settings.dev.resetOnboardingConfirmTitle'),
                t('settings.dev.resetOnboardingConfirmMessage'),
                [
                  {
                    text: t('common.cancel'),
                    style: 'cancel',
                    onPress: () => {
                      haptics.selection().catch(() => { /* Optional operation - failure is non-critical */ });
                    },
                  },
                  {
                    text: t('settings.dev.resetOnboardingConfirmButton'),
                    onPress: () => {
                      resetOnboarding();
                      haptics.success().catch(() => { /* Optional operation - failure is non-critical */ });
                      onClose();
                    },
                    style: 'destructive',
                  },
                ]
              );
            }}
            activeOpacity={0.7}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.optionLabel}>
                {t('settings.dev.resetOnboarding')}
              </Text>
              <Text style={styles.optionDescription}>
                {t('onboarding.restartGuideDescription')}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      )}
    </>
  );
}
