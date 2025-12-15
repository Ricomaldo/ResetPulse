// src/components/onboarding/StepIndicator.jsx
// Progress indicator for onboarding flow (dots or step count)

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { rs } from '../../screens/onboarding/onboardingConstants';
import { fontWeights } from '../../../theme/tokens';

/**
 * StepIndicator - Shows progress through onboarding
 * @param {number} current - Current step (0-indexed)
 * @param {number} total - Total steps
 */
const StepIndicator = React.memo(function StepIndicator({ current, total }) {
  const { colors, spacing } = useTheme();
  const styles = createStyles(colors, spacing);

  // Use dot style for better visual feedback
  return (
    <View style={styles.container}>
      <View style={styles.dotsContainer}>
        {Array.from({ length: total }).map((_, idx) => (
          <View
            key={idx}
            style={[
              styles.dot,
              idx === current && styles.dotActive,
              idx < current && styles.dotCompleted,
            ]}
          />
        ))}
      </View>
      <Text style={styles.stepText}>
        {current + 1} / {total}
      </Text>
    </View>
  );
});

export default StepIndicator;

const createStyles = (colors, spacing) =>
  StyleSheet.create({
    container: {
      alignItems: 'center',
      paddingVertical: rs(spacing.lg),
      paddingHorizontal: rs(spacing.md),
    },
    dotsContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: rs(spacing.sm),
      marginBottom: rs(spacing.md),
    },
    dot: {
      width: rs(8),
      height: rs(8),
      borderRadius: rs(4),
      backgroundColor: colors.border,
    },
    dotActive: {
      backgroundColor: colors.brand.primary,
      width: rs(12),
      height: rs(12),
      borderRadius: rs(6),
    },
    dotCompleted: {
      backgroundColor: colors.brand.primary,
      opacity: 0.5,
    },
    stepText: {
      fontSize: rs(14),
      color: colors.textSecondary,
      fontWeight: fontWeights.medium,
    },
  });
