/**
 * @fileoverview Plus button for activity carousel (freemium discovery or premium creation)
 * @created 2025-12-14
 * @updated 2025-12-19 - Refactored to use IconButton
 */
import React from 'react';
import PropTypes from 'prop-types';
import { IconButton } from '../../buttons';

/**
 * PlusButton - Plus button for carousel (freemium discovery or premium creation)
 * Refactored to use IconButton for consistency and code reduction
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
  return (
    <IconButton
      icon="plus"
      variant={isPremium ? 'ghost' : 'primary'}
      size="large"
      shape="rounded"
      onPress={onPress}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
    />
  );
});

PlusButton.displayName = 'PlusButton';
PlusButton.propTypes = {
  accessibilityHint: PropTypes.string,
  accessibilityLabel: PropTypes.string,
  isPremium: PropTypes.bool,
  onPress: PropTypes.func.isRequired,
};

export default PlusButton;
