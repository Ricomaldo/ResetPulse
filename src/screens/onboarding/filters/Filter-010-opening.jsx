// src/screens/onboarding/filters/Filter0Opening.jsx
// Filtre 0 : Animation de respiration d'introduction avec logo de marque

import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { useTheme } from '../../../theme/ThemeProvider';
import { useTranslation } from '../../../hooks/useTranslation';
import BrandLogo from '../../../components/layout/BrandLogo';
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
        }
        // Removed auto-advance: user must tap to continue (ADHD-friendly)
      });
    };
    pulse();
  }, [scaleAnim]);

  const styles = createStyles(colors, spacing);

  return (
    <TouchableOpacity
      style={styles.fullScreen}
      onPress={() => onContinue()}
      activeOpacity={1}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={t('onboarding.v2.filter0.tapToContinue')}
      accessibilityHint="Start onboarding flow"
    >
      <View style={styles.centerContent}>
        {/* Animated Brand Logo - same as splash screen */}
        <Animated.View
          style={{ transform: [{ scale: scaleAnim }] }}
          accessible={false}
        >
          <BrandLogo size={rs(160)} style={styles.logo} />
        </Animated.View>

        <Text style={styles.breathingText} accessibilityLabel={t('onboarding.v2.filter0.breathe')}>
          {t('onboarding.v2.filter0.breathe')}
        </Text>
        <Text style={styles.tapHint} accessible={false}>{t('onboarding.v2.filter0.tapToContinue')}</Text>
      </View>
    </TouchableOpacity>
  );
}

const createStyles = (colors, spacing) =>
  StyleSheet.create({
    breathingText: {
      color: colors.text,
      fontSize: rs(26),
      fontWeight: fontWeights.light,
      lineHeight: rs(38),
      textAlign: 'center',
      marginTop: rs(spacing.xl),
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
    logo: {
      opacity: 0.9,
    },
    tapHint: {
      bottom: rs(100),
      color: colors.textLight,
      fontSize: rs(14),
      position: 'absolute',
    },
  });
