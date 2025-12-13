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

export default function Filter5cInterface({ onContinue }) {
  const { colors, spacing, borderRadius } = useTheme();
  const t = useTranslation();

  // States avec defaults
  const [theme, setTheme] = useState('auto');
  const [minimalInterface, setMinimalInterface] = useState(true);
  const [digitalTimer, setDigitalTimer] = useState(true);

  const handleThemeSelect = (themeValue) => {
    haptics.selection().catch(() => {});
    setTheme(themeValue);
  };

  const handleFinish = () => {
    haptics.selection().catch(() => {});
    onContinue({
      theme,
      minimalInterface,
      digitalTimer,
    });
  };

  const handleSkip = () => {
    haptics.selection().catch(() => {});
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
                  theme === themeOption && styles.segmentButtonActive,
                ]}
                onPress={() => handleThemeSelect(themeOption)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.segmentText,
                    theme === themeOption && styles.segmentTextActive,
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
                haptics.switchToggle().catch(() => {});
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
                haptics.switchToggle().catch(() => {});
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
    screen: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      paddingHorizontal: rs(spacing.xl),
      paddingTop: rs(spacing.lg),
      paddingBottom: rs(spacing.md),
    },
    title: {
      fontSize: rs(28),
      fontWeight: '600',
      color: colors.text,
      textAlign: 'center',
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: rs(spacing.xl),
      paddingBottom: rs(spacing.lg),
    },
    section: {
      marginBottom: rs(spacing.xl),
    },
    sectionLabel: {
      fontSize: rs(16),
      fontWeight: '600',
      color: colors.text,
      marginBottom: rs(spacing.sm),
    },
    segmentedControl: {
      flexDirection: 'row',
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      padding: rs(4),
      gap: rs(4),
    },
    segmentButton: {
      flex: 1,
      paddingVertical: rs(spacing.sm),
      borderRadius: borderRadius.md,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: rs(44),
    },
    segmentButtonActive: {
      backgroundColor: colors.brand.primary,
    },
    segmentText: {
      fontSize: rs(14),
      fontWeight: '500',
      color: colors.text,
    },
    segmentTextActive: {
      color: colors.background,
      fontWeight: '600',
    },
    toggleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      padding: rs(spacing.md),
      borderWidth: 1,
      borderColor: colors.border,
    },
    toggleInfo: {
      flex: 1,
      marginRight: rs(spacing.md),
    },
    toggleLabel: {
      fontSize: rs(16),
      fontWeight: '600',
      color: colors.text,
      marginBottom: rs(4),
    },
    toggleHint: {
      fontSize: rs(13),
      color: colors.textSecondary,
      lineHeight: rs(18),
    },
    bottomContainer: {
      paddingHorizontal: rs(spacing.xl),
      paddingTop: rs(spacing.md),
      paddingBottom: rs(spacing.lg),
      gap: rs(spacing.sm),
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    primaryButton: {
      backgroundColor: colors.brand.primary,
      paddingVertical: rs(spacing.md),
      borderRadius: borderRadius.xl,
      alignItems: 'center',
      minHeight: rs(56),
      justifyContent: 'center',
    },
    primaryButtonText: {
      color: colors.background,
      fontSize: rs(18),
      fontWeight: '600',
    },
    skipButton: {
      paddingVertical: rs(spacing.sm),
      alignItems: 'center',
    },
    skipButtonText: {
      color: colors.textSecondary,
      fontSize: rs(15),
      fontWeight: '500',
    },
  });
