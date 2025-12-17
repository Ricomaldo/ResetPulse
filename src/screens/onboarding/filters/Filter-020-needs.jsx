// src/screens/onboarding/filters/Filter1Needs.jsx
// Filtre 1 : Identification des besoins utilisateur

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../../theme/ThemeProvider';
import { useTranslation } from '../../../hooks/useTranslation';
import { rs, NEEDS_OPTIONS } from '../onboardingConstants';
import { fontWeights } from '../../../theme/tokens';

export default function Filter020Needs({ onContinue }) {
  const { colors, spacing, borderRadius } = useTheme();
  const t = useTranslation();
  const [selected, setSelected] = useState([]);

  const toggleNeed = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleContinue = () => {
    onContinue(selected);
  };

  const canContinue = selected.length > 0;
  const styles = createStyles(colors, spacing, borderRadius);

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.title}>{t('onboarding.v2.filter1.title')}</Text>

        {NEEDS_OPTIONS.map((need) => {
          const isSelected = selected.includes(need.id);
          return (
            <TouchableOpacity
              key={need.id}
              style={[styles.needOption, isSelected && styles.needSelected]}
              onPress={() => toggleNeed(need.id)}
              activeOpacity={0.7}
            >
              <Text style={styles.needEmoji}>{need.emoji}</Text>
              <Text
                style={[
                  styles.needLabel,
                  isSelected && styles.needLabelSelected,
                ]}
              >
                {t(`onboarding.v2.filter1.${need.id}`)}
              </Text>
              {isSelected && <Text style={styles.checkmark}>✓</Text>}
            </TouchableOpacity>
          );
        })}

        <Text style={styles.helperText}>{t('onboarding.v2.filter1.helper')}</Text>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.button, !canContinue && styles.buttonDisabled]}
          onPress={handleContinue}
          disabled={!canContinue}
        >
          <Text
            style={[
              styles.buttonText,
              !canContinue && styles.buttonTextDisabled,
            ]}
          >
            {t('onboarding.v2.filter1.continue')}
          </Text>
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
    buttonDisabled: {
      backgroundColor: colors.border,
    },
    buttonText: {
      color: colors.text,
      fontSize: rs(18),
      fontWeight: fontWeights.semibold,
    },
    buttonTextDisabled: {
      color: colors.textTertiary,
    },
    checkmark: {
      color: colors.success,
      fontSize: rs(20),
      fontWeight: fontWeights.bold,
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
    helperText: {
      color: colors.textLight,
      fontSize: rs(14),
      marginTop: rs(spacing.lg),
      textAlign: 'center',
    },
    needEmoji: {
      fontSize: rs(26),
      marginRight: rs(spacing.md),
    },
    needLabel: {
      color: colors.text,
      flex: 1,
      fontSize: rs(16),
    },
    needLabelSelected: {
      color: colors.text,
      fontWeight: fontWeights.semibold,
    },
    needOption: {
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderRadius: borderRadius.xl,
      borderWidth: 2,
      flexDirection: 'row',
      marginBottom: rs(spacing.md),
      padding: rs(spacing.md),
    },
    needSelected: {
      backgroundColor: colors.surfaceElevated,
      borderColor: colors.brand.primary,
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
    title: {
      color: colors.text,
      fontSize: rs(28),
      fontWeight: fontWeights.semibold,
      marginBottom: rs(spacing.lg),
      textAlign: 'center',
    },
  });
