/**
 * @fileoverview Step progress indicator for onboarding flow
 * Shows user progress through multi-step onboarding (prevents abandonment)
 * @created 2025-12-14
 */
import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { rs } from '../../styles/responsive';

/**
 * StepIndicator - Visual progress dots for onboarding steps
 * @param {number} current - Current step index (0-based)
 * @param {number} total - Total number of steps
 */
export default function StepIndicator({ current = 0, total = 8 }) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      {Array.from({ length: total }, (_, i) => {
        const isCompleted = i < current;
        const isCurrent = i === current;
        const isUpcoming = i > current;

        return (
          <View
            key={i}
            accessible={true}
            accessibilityRole="progressbar"
            accessibilityLabel={`Step ${i + 1} of ${total}`}
            accessibilityValue={{
              min: 1,
              max: total,
              now: current + 1,
            }}
            style={[
              styles.dot,
              {
                backgroundColor: isCompleted || isCurrent
                  ? theme.colors.brand.primary
                  : theme.colors.border,
                opacity: isUpcoming ? 0.3 : 0.7,
                width: isCurrent ? rs(12, 'min') : rs(8, 'min'),
                transform: [{ scale: isCurrent ? 1.3 : 1 }],
              },
            ]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: rs(16, 'min'),
    gap: rs(8, 'min'),
  },
  dot: {
    height: rs(8, 'min'),
    borderRadius: rs(4, 'min'),
  },
});
