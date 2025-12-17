// src/screens/onboarding/filters/Filter5cInterface.jsx
// Filtre 5c : Configuration interface (parcours Personnaliser)

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../../theme/ThemeProvider';
import { useTranslation } from '../../../hooks/useTranslation';
import { rs } from '../onboardingConstants';
import haptics from '../../../utils/haptics';
import { fontWeights } from '../../../theme/tokens';

export default function Filter100InterfacePersonalize({ onContinue }) {
  const { colors, spacing, borderRadius, setTheme: applyTheme } = useTheme();
  const t = useTranslation();

  // States avec defaults
  const [selectedTheme, setSelectedTheme] = useState('auto');
  const [minimalInterface, setMinimalInterface] = useState(true);
  const [digitalTimer, setDigitalTimer] = useState(true);

  const handleThemeSelect = (themeValue) => {
    haptics.selection().catch(() => { /* Optional operation - failure is non-critical */ });
    setSelectedTheme(themeValue);
    // Appliquer le thème immédiatement (live preview)
    applyTheme(themeValue);
  };

  const handleFinish = () => {
    haptics.selection().catch(() => { /* Optional operation - failure is non-critical */ });
    onContinue({
      theme: selectedTheme,
      minimalInterface,
      digitalTimer,
    });
  };

  const handleSkip = () => {
    haptics.selection().catch(() => { /* Optional operation - failure is non-critical */ });
    // Remettre le thème par défaut si skip
    applyTheme('auto');
    onContinue({
      theme: 'auto',
      minimalInterface: true,
      digitalTimer: true,
    });
  };

  const styles = createStyles(colors, spacing, borderRadius);

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      {/* Title */}
      <View style={styles.header}>
        <Text style={styles.title}>
          {t('onboarding.v3.filter5c.title')}
        </Text>
      </View>

      {/* Options */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. Thème */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>
            {t('onboarding.v3.filter5c.theme')}
          </Text>
          <View style={styles.segmentedControl}>
            {['light', 'dark', 'auto'].map((themeOption) => (
              <TouchableOpacity
                key={themeOption}
                style={[
                  styles.segmentButton,
                  selectedTheme === themeOption && styles.segmentButtonActive,
                ]}
                onPress={() => handleThemeSelect(themeOption)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.segmentText,
                    selectedTheme === themeOption && styles.segmentTextActive,
                  ]}
                >
                  {t(`onboarding.v3.filter5c.theme${themeOption.charAt(0).toUpperCase() + themeOption.slice(1)}`)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 2. Interface minimaliste */}
        <View style={styles.section}>
          <View style={styles.toggleRow}>
            <View style={styles.toggleInfo}>
              <Text style={styles.toggleLabel}>
                {t('onboarding.v3.filter5c.minimalInterface')}
              </Text>
              <Text style={styles.toggleHint}>
                {t('onboarding.v3.filter5c.minimalInterfaceHint')}
              </Text>
            </View>
            <Switch
              value={minimalInterface}
              onValueChange={(value) => {
                haptics.switchToggle().catch(() => { /* Optional operation - failure is non-critical */ });
                setMinimalInterface(value);
              }}
              trackColor={{
                false: colors.neutral,
                true: colors.brand.primary,
              }}
              thumbColor={colors.background}
            />
          </View>
        </View>

        {/* 3. Chrono digital */}
        <View style={styles.section}>
          <View style={styles.toggleRow}>
            <View style={styles.toggleInfo}>
              <Text style={styles.toggleLabel}>
                {t('onboarding.v3.filter5c.digitalTimer')}
              </Text>
              <Text style={styles.toggleHint}>
                {t('onboarding.v3.filter5c.digitalTimerHint')}
              </Text>
            </View>
            <Switch
              value={digitalTimer}
              onValueChange={(value) => {
                haptics.switchToggle().catch(() => { /* Optional operation - failure is non-critical */ });
                setDigitalTimer(value);
              }}
              trackColor={{
                false: colors.neutral,
                true: colors.brand.primary,
              }}
              thumbColor={colors.background}
            />
          </View>
        </View>
      </ScrollView>

      {/* Bottom Buttons */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleFinish}
          activeOpacity={0.7}
        >
          <Text style={styles.primaryButtonText}>
            {t('onboarding.v3.filter5c.finish')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.skipButton}
          onPress={handleSkip}
          activeOpacity={0.7}
        >
          <Text style={styles.skipButtonText}>
            {t('onboarding.v3.filter5c.skip')}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const createStyles = (colors, spacing, borderRadius) =>
  StyleSheet.create({
    bottomContainer: {
      borderTopColor: colors.border,
      borderTopWidth: 1,
      gap: rs(spacing.sm),
      paddingBottom: rs(spacing.lg),
      paddingHorizontal: rs(spacing.xl),
      paddingTop: rs(spacing.md),
    },
    header: {
      paddingBottom: rs(spacing.md),
      paddingHorizontal: rs(spacing.xl),
      paddingTop: rs(spacing.lg),
    },
    primaryButton: {
      alignItems: 'center',
      backgroundColor: colors.brand.primary,
      borderRadius: borderRadius.xl,
      justifyContent: 'center',
      minHeight: rs(56),
      paddingVertical: rs(spacing.md),
    },
    primaryButtonText: {
      color: colors.background,
      fontSize: rs(18),
      fontWeight: fontWeights.semibold,
    },
    screen: {
      backgroundColor: colors.background,
      flex: 1,
    },
    scrollContent: {
      paddingBottom: rs(spacing.lg),
      paddingHorizontal: rs(spacing.xl),
    },
    scrollView: {
      flex: 1,
    },
    section: {
      marginBottom: rs(spacing.xl),
    },
    sectionLabel: {
      color: colors.text,
      fontSize: rs(16),
      fontWeight: fontWeights.semibold,
      marginBottom: rs(spacing.sm),
    },
    segmentButton: {
      alignItems: 'center',
      borderRadius: borderRadius.md,
      flex: 1,
      justifyContent: 'center',
      minHeight: rs(44),
      paddingVertical: rs(spacing.sm),
    },
    segmentButtonActive: {
      backgroundColor: colors.brand.primary,
    },
    segmentText: {
      color: colors.text,
      fontSize: rs(14),
      fontWeight: fontWeights.medium,
    },
    segmentTextActive: {
      color: colors.background,
      fontWeight: fontWeights.semibold,
    },
    segmentedControl: {
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      flexDirection: 'row',
      gap: rs(4),
      padding: rs(4),
    },
    skipButton: {
      alignItems: 'center',
      paddingVertical: rs(spacing.sm),
    },
    skipButtonText: {
      color: colors.textSecondary,
      fontSize: rs(15),
      fontWeight: fontWeights.medium,
    },
    title: {
      color: colors.text,
      fontSize: rs(28),
      fontWeight: fontWeights.semibold,
      textAlign: 'center',
    },
    toggleHint: {
      color: colors.textSecondary,
      fontSize: rs(13),
      lineHeight: rs(18),
    },
    toggleInfo: {
      flex: 1,
      marginRight: rs(spacing.md),
    },
    toggleLabel: {
      color: colors.text,
      fontSize: rs(16),
      fontWeight: fontWeights.semibold,
      marginBottom: rs(4),
    },
    toggleRow: {
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderRadius: borderRadius.lg,
      borderWidth: 1,
      flexDirection: 'row',
      justifyContent: 'space-between',
      padding: rs(spacing.md),
    },
  });
