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

export default function Filter060Branch({ onContinue }) {
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
    centerContent: {
      flex: 1,
      justifyContent: 'center',
      paddingHorizontal: rs(spacing.xl),
    },
    choiceCard: {
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderRadius: borderRadius.xl,
      borderWidth: 2,
      justifyContent: 'center',
      minHeight: rs(160),
      padding: rs(spacing.xl),
    },
    choiceSubtitle: {
      color: colors.textSecondary,
      fontSize: rs(14),
      textAlign: 'center',
    },
    choiceTitle: {
      color: colors.text,
      fontSize: rs(20),
      fontWeight: fontWeights.semibold,
      marginBottom: rs(spacing.xs),
      textAlign: 'center',
    },
    choicesContainer: {
      gap: rs(spacing.lg),
    },
    screen: {
      backgroundColor: colors.background,
      flex: 1,
    },
    title: {
      color: colors.text,
      fontSize: rs(28),
      fontWeight: fontWeights.semibold,
      marginBottom: rs(spacing.xxl),
      textAlign: 'center',
    },
  });
