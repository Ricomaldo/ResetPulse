/**
 * @fileoverview Circular toggle button for clockwise/counter-clockwise rotation
 * @created 2025-12-14
 * @updated 2025-12-20 - Updated to handle responsive sizes
 */
import React from 'react';
import PropTypes from 'prop-types';
import { IconButton } from '../buttons';
import haptics from '../../utils/haptics';
import { useTranslation } from '../../hooks/useTranslation';

/**
 * CircularToggle - Circular toggle button for rotation direction
 * Refactored to use IconButton for consistency and code reduction
 *
 * @param {boolean} clockwise - Current rotation direction
 * @param {function} onToggle - Callback when toggle is pressed
 * @param {number} size - Size of the toggle button (32, 40, 60)
 */
const CircularToggle = React.memo(function CircularToggle({ clockwise, onToggle, size = 40 }) {
  const t = useTranslation();

  const handlePress = () => {
    haptics.selection().catch(() => { /* Optional operation - failure is non-critical */ });
    onToggle(!clockwise);
  };

  // Map numeric size to IconButton size preset
  const buttonSize = size < 35 ? 'small' : size < 50 ? 'medium' : 'large';

  // Icon shows current state (témoin): inverted because visual matches timer direction
  return (
    <IconButton
      icon={clockwise ? 'rotateCcw' : 'rotateCw'}
      variant="ghost"
      size={buttonSize}
      shape="circular"
      onPress={handlePress}
      accessibilityLabel={clockwise ? t('controls.rotation.clockwise') : t('controls.rotation.counterClockwise')}
    />
  );
});

CircularToggle.propTypes = {
  clockwise: PropTypes.bool.isRequired,
  onToggle: PropTypes.func.isRequired,
  size: PropTypes.number,
};

export default CircularToggle;
