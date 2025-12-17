// src/components/onboarding/StepIndicator.jsx
// Progress indicator for onboarding flow (dots or step count)

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import { useTheme } from '../../theme/ThemeProvider';
import { rs } from '../../screens/onboarding/onboardingConstants';
import { fontWeights } from '../../theme/tokens';

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

StepIndicator.propTypes = {
  current: PropTypes.number.isRequired,
  total: PropTypes.number.isRequired,
};

export default StepIndicator;

const createStyles = (colors, spacing) =>
  StyleSheet.create({
    container: {
      alignItems: 'center',
      paddingHorizontal: rs(spacing.md),
      paddingVertical: rs(spacing.lg),
    },
    dot: {
      backgroundColor: colors.border,
      borderRadius: rs(4),
      height: rs(8),
      width: rs(8),
    },
    dotActive: {
      backgroundColor: colors.brand.primary,
      borderRadius: rs(6),
      height: rs(12),
      width: rs(12),
    },
    dotCompleted: {
      backgroundColor: colors.brand.primary,
      opacity: 0.5,
    },
    dotsContainer: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: rs(spacing.sm),
      justifyContent: 'center',
      marginBottom: rs(spacing.md),
    },
    stepText: {
      color: colors.textSecondary,
      fontSize: rs(14),
      fontWeight: fontWeights.medium,
    },
  });
