// src/screens/onboarding/filters/Filter5aVision.jsx
// Filtre 5a : Vision aspirationnelle (parcours Découvrir)

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../../theme/ThemeProvider';
import { useTranslation } from '../../../hooks/useTranslation';
import { rs, getJourneyScenarios } from '../onboardingConstants';
import { fontWeights } from '../../../theme/tokens';

export default function Filter5aVision({ needs = [], onContinue }) {
  const { colors, spacing, borderRadius } = useTheme();
  const t = useTranslation();
  const scenarios = getJourneyScenarios(needs, colors, t);

  const styles = createStyles(colors, spacing, borderRadius);

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.title}>{t('onboarding.v2.filter4.title')}</Text>

        {scenarios.map((s, i) => (
          <View key={i} style={styles.scenarioCard}>
            <Text style={styles.scenarioEmoji}>{s.emoji}</Text>
            <View style={styles.scenarioText}>
              <Text style={styles.scenarioLabel}>{s.label}</Text>
              <Text style={styles.scenarioSublabel}>{s.sublabel}</Text>
            </View>
            <View style={[styles.scenarioCircle, { borderColor: s.color }]} />
          </View>
        ))}

        <Text style={styles.tagline}>
          {t('onboarding.v2.filter4.tagline')}
        </Text>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.button} onPress={onContinue}>
          <Text style={styles.buttonText}>{t('onboarding.v2.filter4.cta')}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const createStyles = (colors, spacing, borderRadius) =>
  StyleSheet.create({
    button: {
      alignItems: 'center',
      backgroundColor: colors.brand.primary,
      borderRadius: borderRadius.xl,
      minWidth: rs(200),
      paddingHorizontal: rs(spacing.xl),
      paddingVertical: rs(spacing.md),
    },
    buttonText: {
      color: colors.text,
      fontSize: rs(18),
      fontWeight: fontWeights.semibold,
    },
    footer: {
      backgroundColor: colors.background,
      bottom: 0,
      left: 0,
      padding: rs(spacing.lg),
      paddingBottom: rs(40),
      position: 'absolute',
      right: 0,
    },
    scenarioCard: {
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: borderRadius.xl,
      flexDirection: 'row',
      marginBottom: rs(spacing.md),
      padding: rs(spacing.md),
    },
    scenarioCircle: {
      backgroundColor: colors.surface,
      borderRadius: rs(22),
      borderWidth: rs(5),
      height: rs(44),
      width: rs(44),
    },
    scenarioEmoji: {
      fontSize: rs(32),
      marginRight: rs(spacing.md),
    },
    scenarioLabel: {
      color: colors.text,
      fontSize: rs(17),
      fontWeight: fontWeights.semibold,
    },
    scenarioSublabel: {
      color: colors.textSecondary,
      fontSize: rs(14),
      marginTop: 2,
    },
    scenarioText: {
      flex: 1,
    },
    screen: {
      backgroundColor: colors.background,
      flex: 1,
    },
    scrollContent: {
      paddingBottom: rs(120),
      paddingHorizontal: rs(spacing.lg),
      paddingTop: rs(spacing.lg),
    },
    scrollView: {
      flex: 1,
    },
    tagline: {
      color: colors.textSecondary,
      fontSize: rs(17),
      fontStyle: 'italic',
      lineHeight: rs(26),
      marginTop: rs(spacing.xl),
      textAlign: 'center',
    },
    title: {
      color: colors.text,
      fontSize: rs(28),
      fontWeight: fontWeights.semibold,
      marginBottom: rs(spacing.lg),
      textAlign: 'center',
    },
  });
