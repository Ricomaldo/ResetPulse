// src/screens/onboarding/filters/Filter4Vision.jsx
// Filtre 4 : Vision aspirationnelle (journée type)

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../../theme/ThemeProvider';
import { useTranslation } from '../../../hooks/useTranslation';
import { rs, getJourneyScenarios } from '../onboardingConstants';

export default function Filter4Vision({ needs = [], onContinue }) {
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
    screen: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: rs(spacing.lg),
      paddingTop: rs(spacing.lg),
      paddingBottom: rs(120),
    },
    title: {
      fontSize: rs(28),
      fontWeight: '600',
      color: colors.text,
      textAlign: 'center',
      marginBottom: rs(spacing.lg),
    },
    scenarioCard: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: rs(spacing.md),
      backgroundColor: colors.surface,
      borderRadius: borderRadius.xl,
      marginBottom: rs(spacing.md),
    },
    scenarioEmoji: {
      fontSize: rs(32),
      marginRight: rs(spacing.md),
    },
    scenarioText: {
      flex: 1,
    },
    scenarioLabel: {
      fontSize: rs(17),
      color: colors.text,
      fontWeight: '600',
    },
    scenarioSublabel: {
      fontSize: rs(14),
      color: colors.textSecondary,
      marginTop: 2,
    },
    scenarioCircle: {
      width: rs(44),
      height: rs(44),
      borderRadius: rs(22),
      borderWidth: rs(5),
      backgroundColor: colors.surface,
    },
    tagline: {
      fontSize: rs(17),
      color: colors.textSecondary,
      textAlign: 'center',
      fontStyle: 'italic',
      marginTop: rs(spacing.xl),
      lineHeight: rs(26),
    },
    footer: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      padding: rs(spacing.lg),
      paddingBottom: rs(40),
      backgroundColor: colors.background,
    },
    button: {
      backgroundColor: colors.primary,
      paddingVertical: rs(spacing.md),
      paddingHorizontal: rs(spacing.xl),
      borderRadius: borderRadius.xl,
      alignItems: 'center',
      minWidth: rs(200),
    },
    buttonText: {
      color: colors.text,
      fontSize: rs(18),
      fontWeight: '600',
    },
  });
