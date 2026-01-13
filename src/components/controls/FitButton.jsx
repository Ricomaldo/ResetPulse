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
import { useTranslation } from '../../hooks/useTranslation';

/**
 * FitButton - Adapter le cadran à la durée actuelle
 * Refactored to use IconButton for consistency and code reduction
 * Toggle: active quand scaleMode === '60min'
 *
 * @param {function} onFit - Callback pour adapter le cadran (toggle 60min)
 * @param {boolean} compact - Mode compact
 * @param {boolean} active - État actif (échelle adaptée, pas 60min)
 * @param {string} label - Label text (default: "Adapter")
 */
const FitButton = React.memo(function FitButton({
  onFit,
  compact = false,
  active = false,
  label,
}) {
  const t = useTranslation();
  const displayLabel = label || t('controls.fit.label');

  const handlePress = () => {
    haptics.impact('medium');
    onFit?.();
  };

  return (
    <IconButton
      icon="circle-gauge"
      label={displayLabel}
      labelPosition="bottom"
      variant="ghost"
      size={compact ? 'small' : 'medium'}
      shape="rounded"
      active={active}
      onPress={handlePress}
      accessibilityLabel={t('controls.fit.accessibilityLabel')}
      accessibilityHint={t('controls.fit.accessibilityHint')}
    />
  );
});

FitButton.displayName = 'FitButton';
FitButton.propTypes = {
  active: PropTypes.bool,
  compact: PropTypes.bool,
  label: PropTypes.string,
  onFit: PropTypes.func.isRequired,
};

export default FitButton;
