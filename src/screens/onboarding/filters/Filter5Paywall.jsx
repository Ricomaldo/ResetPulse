// src/screens/onboarding/filters/Filter5Paywall.jsx
// Filtre 5 : Paywall soft (trial / skip)

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../../theme/ThemeProvider';
import { rs } from '../onboardingConstants';

export default function Filter5Paywall({ onComplete }) {
  const { colors, spacing, borderRadius } = useTheme();

  const handleTrial = () => {
    onComplete('trial');
  };

  const handleSkip = () => {
    onComplete('skipped');
  };

  const styles = createStyles(colors, spacing, borderRadius);

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.centerContent}>
        <Text style={styles.title}>Débloque tout</Text>

        <View style={styles.paywallFeatures}>
          <Text style={styles.paywallFeature}>Toutes les couleurs.</Text>
          <Text style={styles.paywallFeature}>Toutes les activités.</Text>
          <Text style={styles.paywallFeature}>Ton confort maximum.</Text>
        </View>

        <View style={styles.paywallBox}>
          <Text style={styles.paywallGift}>{'\u{1F381}'} 7 JOURS GRATUITS</Text>
          <Text style={styles.paywallPrice}>
            Puis 4,99€ une fois — à toi pour toujours.
          </Text>
        </View>

        <TouchableOpacity style={styles.button} onPress={handleTrial}>
          <Text style={styles.buttonText}>Essayer 7 jours gratuits</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipText}>Peut-être plus tard</Text>
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
    centerContent: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: rs(spacing.lg),
    },
    title: {
      fontSize: rs(28),
      fontWeight: '600',
      color: colors.text,
      textAlign: 'center',
      marginBottom: rs(spacing.lg),
    },
    paywallFeatures: {
      marginVertical: rs(spacing.xl),
    },
    paywallFeature: {
      fontSize: rs(20),
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: rs(spacing.md),
    },
    paywallBox: {
      backgroundColor: colors.surfaceElevated,
      borderRadius: borderRadius.xxl,
      padding: rs(spacing.lg),
      marginBottom: rs(spacing.xl),
      borderWidth: 2,
      borderColor: colors.primary,
      alignItems: 'center',
    },
    paywallGift: {
      fontSize: rs(22),
      color: colors.success,
      fontWeight: '700',
      marginBottom: rs(spacing.sm),
    },
    paywallPrice: {
      fontSize: rs(15),
      color: colors.textSecondary,
      textAlign: 'center',
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
    skipButton: {
      marginTop: rs(spacing.lg),
      padding: rs(spacing.md),
    },
    skipText: {
      color: colors.textTertiary,
      fontSize: rs(15),
    },
  });
