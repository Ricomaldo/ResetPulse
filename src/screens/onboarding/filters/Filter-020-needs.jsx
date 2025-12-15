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

export default function Filter1Needs({ onContinue }) {
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
      fontWeight: fontWeights.semibold,
      color: colors.text,
      textAlign: 'center',
      marginBottom: rs(spacing.lg),
    },
    needOption: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: rs(spacing.md),
      borderRadius: borderRadius.xl,
      borderWidth: 2,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      marginBottom: rs(spacing.md),
    },
    needSelected: {
      borderColor: colors.brand.primary,
      backgroundColor: colors.surfaceElevated,
    },
    needEmoji: {
      fontSize: rs(26),
      marginRight: rs(spacing.md),
    },
    needLabel: {
      flex: 1,
      fontSize: rs(16),
      color: colors.text,
    },
    needLabelSelected: {
      color: colors.text,
      fontWeight: fontWeights.semibold,
    },
    checkmark: {
      fontSize: rs(20),
      color: colors.success,
      fontWeight: fontWeights.bold,
    },
    helperText: {
      fontSize: rs(14),
      color: colors.textLight,
      textAlign: 'center',
      marginTop: rs(spacing.lg),
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
      backgroundColor: colors.brand.primary,
      paddingVertical: rs(spacing.md),
      paddingHorizontal: rs(spacing.xl),
      borderRadius: borderRadius.xl,
      alignItems: 'center',
      minWidth: rs(200),
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
  });
