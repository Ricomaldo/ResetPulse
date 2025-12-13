// src/screens/onboarding/filters/Filter3_5Notifications.jsx
// Filtre 3.5 : Permission notifications (pré-permission expliquée)

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Notifications from 'expo-notifications';
import { useTheme } from '../../../theme/ThemeProvider';
import { useTranslation } from '../../../hooks/useTranslation';
import { rs } from '../onboardingConstants';
import haptics from '../../../utils/haptics';

export default function Filter3_5Notifications({ onContinue }) {
  const { colors, spacing, borderRadius } = useTheme();
  const t = useTranslation();

  const handleRequestPermission = async () => {
    haptics.selection().catch(() => {});

    try {
      const { status } = await Notifications.requestPermissionsAsync();

      if (__DEV__) {
        console.log('[Filter3.5] Notification permission:', status);
      }

      // Continue regardless of permission granted/denied
      onContinue({ notificationPermission: status === 'granted' });
    } catch (error) {
      console.warn('[Filter3.5] Failed to request notification permission:', error);
      onContinue({ notificationPermission: false });
    }
  };

  const handleSkip = () => {
    haptics.selection().catch(() => {});
    onContinue({ notificationPermission: false });
  };

  const styles = createStyles(colors, spacing, borderRadius);

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.centerContent}>
        {/* Icon */}
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>🔔</Text>
        </View>

        {/* Title */}
        <Text style={styles.title}>
          {t('onboarding.v3.filter3_5.title')}
        </Text>

        {/* Body */}
        <Text style={styles.body}>
          {t('onboarding.v3.filter3_5.body')}
        </Text>

        <Text style={styles.bodySecondary}>
          {t('onboarding.v3.filter3_5.bodySecondary')}
        </Text>

        {/* CTA Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleRequestPermission}
            activeOpacity={0.7}
          >
            <Text style={styles.primaryButtonText}>
              {t('onboarding.v3.filter3_5.ctaPrimary')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleSkip}
            activeOpacity={0.7}
          >
            <Text style={styles.secondaryButtonText}>
              {t('onboarding.v3.filter3_5.ctaSecondary')}
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
      alignItems: 'center',
      paddingHorizontal: rs(spacing.xl),
    },
    iconContainer: {
      width: rs(100),
      height: rs(100),
      borderRadius: rs(50),
      backgroundColor: colors.brand.primary + '20',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: rs(spacing.xl),
    },
    icon: {
      fontSize: rs(50),
    },
    title: {
      fontSize: rs(28),
      fontWeight: '600',
      color: colors.text,
      textAlign: 'center',
      marginBottom: rs(spacing.lg),
    },
    body: {
      fontSize: rs(16),
      color: colors.text,
      textAlign: 'center',
      lineHeight: rs(24),
      marginBottom: rs(spacing.md),
    },
    bodySecondary: {
      fontSize: rs(14),
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: rs(20),
      marginBottom: rs(spacing.xl),
    },
    buttonContainer: {
      width: '100%',
      gap: rs(spacing.md),
      marginTop: rs(spacing.lg),
    },
    primaryButton: {
      backgroundColor: colors.brand.primary,
      paddingVertical: rs(spacing.md),
      paddingHorizontal: rs(spacing.xl),
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
    secondaryButton: {
      paddingVertical: rs(spacing.md),
      paddingHorizontal: rs(spacing.xl),
      borderRadius: borderRadius.xl,
      alignItems: 'center',
      minHeight: rs(56),
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: colors.border,
      backgroundColor: colors.surface,
    },
    secondaryButtonText: {
      color: colors.text,
      fontSize: rs(16),
      fontWeight: '600',
    },
  });
