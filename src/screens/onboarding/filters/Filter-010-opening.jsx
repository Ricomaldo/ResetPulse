// src/screens/onboarding/filters/Filter0Opening.jsx
// Filtre 0 : Animation de respiration d'introduction

import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { useTheme } from '../../../theme/ThemeProvider';
import { useTranslation } from '../../../hooks/useTranslation';
import { rs } from '../onboardingConstants';
import { fontWeights } from '../../../theme/tokens';

const BREATH_CYCLES = 5;
const BREATH_DURATION = 1500;

export default function Filter010Opening({ onContinue }) {
  const { colors, spacing } = useTheme();
  const t = useTranslation();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const cycleCount = useRef(0);

  useEffect(() => {
    const pulse = () => {
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.2,
          duration: BREATH_DURATION,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: BREATH_DURATION,
          useNativeDriver: true,
        }),
      ]).start(() => {
        cycleCount.current += 1;
        if (cycleCount.current < BREATH_CYCLES) {
          pulse();
        } else {
          onContinue();
        }
      });
    };
    pulse();
  }, [onContinue, scaleAnim]);

  const styles = createStyles(colors, spacing);

  return (
    <TouchableOpacity
      style={styles.fullScreen}
      onPress={onContinue}
      activeOpacity={1}
    >
      <View style={styles.centerContent}>
        <Animated.View
          style={[
            styles.breathingCircle,
            { transform: [{ scale: scaleAnim }] },
          ]}
        />
        <Text style={styles.breathingText}>
          {t('onboarding.v2.filter0.breathe')}
        </Text>
        <Text style={styles.tapHint}>{t('onboarding.v2.filter0.tapToContinue')}</Text>
      </View>
    </TouchableOpacity>
  );
}

const createStyles = (colors, spacing) =>
  StyleSheet.create({
    breathingCircle: {
      backgroundColor: colors.brand.primary,
      borderRadius: rs(80),
      height: rs(160),
      marginBottom: rs(spacing.xl),
      opacity: 0.8,
      width: rs(160),
    },
    breathingText: {
      color: colors.text,
      fontSize: rs(26),
      fontWeight: fontWeights.light,
      lineHeight: rs(38),
      textAlign: 'center',
    },
    centerContent: {
      alignItems: 'center',
      flex: 1,
      justifyContent: 'center',
      paddingHorizontal: rs(spacing.lg),
    },
    fullScreen: {
      alignItems: 'center',
      backgroundColor: colors.background,
      flex: 1,
      justifyContent: 'center',
    },
    tapHint: {
      bottom: rs(100),
      color: colors.textLight,
      fontSize: rs(14),
      position: 'absolute',
    },
  });
