/**
 * @fileoverview Plus button for activity carousel (freemium discovery or premium creation)
 * @created 2025-12-14
 * @updated 2025-12-14
 */
import React from 'react';
import { Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../../theme/ThemeProvider';
import { rs } from '../../../styles/responsive';
import { fontWeights } from '../../../theme/tokens';

/**
 * PlusButton - Dumb component for "+" button in carousel
 *
 * @param {Object} props
 * @param {boolean} props.isPremium - Whether user is premium (affects styling)
 * @param {function} props.onPress - Handler for press event
 * @param {string} props.accessibilityLabel - Accessibility label
 * @param {string} props.accessibilityHint - Accessibility hint
 */
const PlusButton = React.memo(function PlusButton({
  isPremium,
  onPress,
  accessibilityLabel,
  accessibilityHint,
}) {
  const theme = useTheme();

  const styles = StyleSheet.create({
    createButton: {
      alignItems: 'center',
      backgroundColor: theme.colors.brand.primary + '15',
      borderColor: theme.colors.brand.primary + '40',
      borderRadius: theme.borderRadius.lg,
      borderStyle: 'dashed',
      borderWidth: 2,
      height: rs(60, 'min'),
      justifyContent: 'center',
      minHeight: 44,
      minWidth: 44,
      width: rs(60, 'min'),
      ...theme.shadows.sm,
    },
    createButtonText: {
      color: theme.colors.brand.primary,
      fontSize: rs(24, 'min'),
      fontWeight: fontWeights.light,
    },
    moreButton: {
      alignItems: 'center',
      backgroundColor: theme.colors.brand.primary,
      borderRadius: theme.borderRadius.lg,
      height: rs(60, 'min'),
      justifyContent: 'center',
      minHeight: 44,
      minWidth: 44,
      width: rs(60, 'min'),
      ...theme.shadows.md,
    },
    moreButtonText: {
      color: theme.colors.fixed.white,
      fontSize: rs(32, 'min'),
      fontWeight: fontWeights.semibold,
    },
  });

  return (
    <TouchableOpacity
      style={isPremium ? styles.createButton : styles.moreButton}
      onPress={onPress}
      activeOpacity={0.7}
      accessible={true}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
    >
      <Text style={isPremium ? styles.createButtonText : styles.moreButtonText}>
        +
      </Text>
    </TouchableOpacity>
  );
});

export default PlusButton;
