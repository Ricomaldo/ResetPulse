/**
 * @fileoverview IntentionPicker - Intention selector for onboarding
 * @description 6-button grid for quick activity intention selection
 * @created 2025-12-22
 */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import { useTheme } from '../../theme/ThemeProvider';
import { useTranslation } from '../../hooks/useTranslation';
import { getAllIntentions } from '../../config/activity-intentions';
import { rs } from '../../styles/responsive';
import { fontWeights, typography } from '../../theme/tokens';
import haptics from '../../utils/haptics';

/**
 * IntentionPicker - Grid selector for onboarding intentions
 *
 * @param {Function} onIntentionSelect - Callback when intention selected
 * @param {Object} selectedIntention - Currently selected intention
 * @param {Object} style - Additional styles
 */
export default function IntentionPicker({
  onIntentionSelect,
  selectedIntention,
  style,
}) {
  const theme = useTheme();
  const t = useTranslation();
  const intentions = getAllIntentions();

  const handleIntentionPress = (intention) => {
    haptics.selection().catch(() => {});
    onIntentionSelect(intention);
  };

  const styles = StyleSheet.create({
    container: {
      width: '100%',
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      gap: theme.spacing.md,
    },
    intentionButton: {
      width: '47%', // 2 columns
      aspectRatio: 1, // Square
      backgroundColor: theme.colors.surface,
      borderRadius: rs(16),
      borderWidth: 2,
      borderColor: theme.colors.border,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.md,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: rs(120),
      // Light shadow
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
    },
    intentionButtonSelected: {
      backgroundColor: theme.colors.brand.primary + '15',
      borderColor: theme.colors.brand.primary,
      borderWidth: 2,
    },
    emoji: {
      fontSize: rs(48),
      marginBottom: theme.spacing.sm,
    },
    label: {
      fontSize: rs(typography.md),
      fontWeight: fontWeights.medium,
      color: theme.colors.text,
      textAlign: 'center',
    },
    labelSelected: {
      color: theme.colors.brand.primary,
      fontWeight: fontWeights.bold,
    },
  });

  return (
    <View style={[styles.container, style]}>
      <View style={styles.grid}>
        {intentions.map((intention) => {
          const isSelected = selectedIntention?.id === intention.id;

          return (
            <TouchableOpacity
              key={intention.id}
              style={[
                styles.intentionButton,
                isSelected && styles.intentionButtonSelected,
              ]}
              onPress={() => handleIntentionPress(intention)}
              activeOpacity={0.7}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={t(intention.i18nKey)}
              accessibilityState={{ selected: isSelected }}
              accessibilityHint={`Select ${t(intention.i18nKey)} as your activity intention`}
            >
              <Text style={styles.emoji}>{intention.emoji}</Text>
              <Text style={[styles.label, isSelected && styles.labelSelected]}>
                {t(intention.i18nKey)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

IntentionPicker.propTypes = {
  onIntentionSelect: PropTypes.func.isRequired,
  selectedIntention: PropTypes.object,
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
};
