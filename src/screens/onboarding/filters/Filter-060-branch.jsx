// src/screens/onboarding/filters/Filter4Branch.jsx
// Filtre 4 : Embranchement Découvrir / Personnaliser

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../../theme/ThemeProvider';
import { useTranslation } from '../../../hooks/useTranslation';
import { rs } from '../onboardingConstants';
import haptics from '../../../utils/haptics';
import { fontWeights } from '../../../theme/tokens';

export default function Filter4Branch({ onContinue }) {
  const { colors, spacing, borderRadius } = useTheme();
  const t = useTranslation();

  const handleChoiceDiscover = () => {
    haptics.selection().catch(() => { /* Optional operation - failure is non-critical */ });
    onContinue({ branch: 'discover' });
  };

  const handleChoicePersonalize = () => {
    haptics.selection().catch(() => { /* Optional operation - failure is non-critical */ });
    onContinue({ branch: 'personalize' });
  };

  const styles = createStyles(colors, spacing, borderRadius);

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.centerContent}>
        {/* Title */}
        <Text style={styles.title}>
          {t('onboarding.v3.filter4.title')}
        </Text>

        {/* Choice Cards */}
        <View style={styles.choicesContainer}>
          {/* Card A: Explorer */}
          <TouchableOpacity
            style={styles.choiceCard}
            onPress={handleChoiceDiscover}
            activeOpacity={0.8}
          >
            <Text style={styles.choiceTitle}>
              {t('onboarding.v3.filter4.discoverTitle')}
            </Text>
            <Text style={styles.choiceSubtitle}>
              {t('onboarding.v3.filter4.discoverSubtitle')}
            </Text>
          </TouchableOpacity>

          {/* Card B: Personnaliser */}
          <TouchableOpacity
            style={styles.choiceCard}
            onPress={handleChoicePersonalize}
            activeOpacity={0.8}
          >
            <Text style={styles.choiceTitle}>
              {t('onboarding.v3.filter4.personalizeTitle')}
            </Text>
            <Text style={styles.choiceSubtitle}>
              {t('onboarding.v3.filter4.personalizeSubtitle')}
            </Text>
          </TouchableOpacity>
        </View>
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
    centerContent: {
      flex: 1,
      justifyContent: 'center',
      paddingHorizontal: rs(spacing.xl),
    },
    title: {
      fontSize: rs(28),
      fontWeight: fontWeights.semibold,
      color: colors.text,
      textAlign: 'center',
      marginBottom: rs(spacing.xxl),
    },
    choicesContainer: {
      gap: rs(spacing.lg),
    },
    choiceCard: {
      backgroundColor: colors.surface,
      borderRadius: borderRadius.xl,
      padding: rs(spacing.xl),
      alignItems: 'center',
      borderWidth: 2,
      borderColor: colors.border,
      minHeight: rs(160),
      justifyContent: 'center',
    },
    choiceIconContainer: {
      width: rs(64),
      height: rs(64),
      borderRadius: rs(32),
      backgroundColor: colors.brand.primary + '20',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: rs(spacing.md),
    },
    choiceIcon: {
      fontSize: rs(32),
    },
    choiceTitle: {
      fontSize: rs(20),
      fontWeight: fontWeights.semibold,
      color: colors.text,
      textAlign: 'center',
      marginBottom: rs(spacing.xs),
    },
    choiceSubtitle: {
      fontSize: rs(14),
      color: colors.textSecondary,
      textAlign: 'center',
    },
  });
