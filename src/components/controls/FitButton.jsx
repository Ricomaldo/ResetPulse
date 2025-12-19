/**
 * @fileoverview FitButton - Adapter le cadran à la durée (ADR-004 révisé)
 * @description Bouton avec icône Focus pour synchroniser l'échelle
 * @created 2025-12-19
 * @updated 2025-12-19 - Refactored to use IconButton
 */
import React from 'react';
import PropTypes from 'prop-types';
import { IconButton } from '../buttons';
import haptics from '../../utils/haptics';

/**
 * FitButton - Adapter le cadran à la durée actuelle
 * Refactored to use IconButton for consistency and code reduction
 * Toggle: active quand scaleMode === '60min'
 *
 * @param {function} onFit - Callback pour adapter le cadran (toggle 60min)
 * @param {boolean} compact - Mode compact
 * @param {boolean} active - État actif (échelle 60 sélectionnée)
 */
const FitButton = React.memo(function FitButton({
  onFit,
  compact = false,
  active = false,
}) {
  const handlePress = () => {
    haptics.impact('medium');
    onFit?.();
  };

  return (
    <IconButton
      icon="focus"
      variant="ghost"
      size={compact ? 'small' : 'medium'}
      shape="circular"
      active={active}
      onPress={handlePress}
      accessibilityLabel="Adapter le cadran à la durée"
      accessibilityHint="Ajuste l'échelle du cadran pour correspondre à la durée sélectionnée"
    />
  );
});

FitButton.displayName = 'FitButton';
FitButton.propTypes = {
  active: PropTypes.bool,
  compact: PropTypes.bool,
  onFit: PropTypes.func.isRequired,
};

export default FitButton;
