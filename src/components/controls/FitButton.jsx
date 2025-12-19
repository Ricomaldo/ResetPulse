/**
 * @fileoverview FitButton - Adapter le cadran à la durée (ADR-004 révisé)
 * @description Bouton avec icône Focus pour synchroniser l'échelle
 * @created 2025-12-19
 */
import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import { Focus } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { rs } from '../../styles/responsive';
import haptics from '../../utils/haptics';

/**
 * FitButton - Adapter le cadran à la durée actuelle
 *
 * @param {function} onFit - Callback pour adapter le cadran
 * @param {boolean} compact - Mode compact
 */
const FitButton = React.memo(function FitButton({
  onFit,
  compact = false,
}) {
  const theme = useTheme();

  const handlePress = () => {
    haptics.impact('medium');
    onFit?.();
  };

  // Sizes
  const buttonSize = compact ? rs(32) : rs(40);
  const iconSize = compact ? rs(18) : rs(22);

  const styles = StyleSheet.create({
    button: {
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.border,
      borderRadius: buttonSize / 2,
      borderWidth: 1.5,
      height: buttonSize,
      justifyContent: 'center',
      width: buttonSize,
    },
  });

  return (
    <TouchableOpacity
      style={styles.button}
      onPress={handlePress}
      activeOpacity={0.7}
      accessible
      accessibilityRole="button"
      accessibilityLabel="Adapter le cadran à la durée"
      accessibilityHint="Ajuste l'échelle du cadran pour correspondre à la durée sélectionnée"
    >
      <Focus size={iconSize} color={theme.colors.textSecondary} />
    </TouchableOpacity>
  );
});

FitButton.displayName = 'FitButton';
FitButton.propTypes = {
  compact: PropTypes.bool,
  onFit: PropTypes.func.isRequired,
};

export default FitButton;
