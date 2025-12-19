/**
 * @fileoverview Circular toggle button for clockwise/counter-clockwise rotation
 * @created 2025-12-14
 * @updated 2025-12-19 - Refactored to use IconButton
 */
import React from 'react';
import PropTypes from 'prop-types';
import { IconButton } from '../buttons';
import haptics from '../../utils/haptics';

/**
 * CircularToggle - Circular toggle button for rotation direction
 * Refactored to use IconButton for consistency and code reduction
 *
 * @param {boolean} clockwise - Current rotation direction
 * @param {function} onToggle - Callback when toggle is pressed
 * @param {number} size - Size of the toggle button (32, 40, 60)
 */
const CircularToggle = React.memo(function CircularToggle({ clockwise, onToggle, size = 40 }) {
  const handlePress = () => {
    haptics.selection().catch(() => { /* Optional operation - failure is non-critical */ });
    onToggle(!clockwise);
  };

  // Map numeric size to IconButton size preset
  const buttonSize = size < 35 ? 'small' : size < 50 ? 'medium' : 'large';

  return (
    <IconButton
      icon={clockwise ? 'rotateCw' : 'rotateCcw'}
      variant="ghost"
      size={buttonSize}
      shape="circular"
      onPress={handlePress}
      accessibilityLabel={clockwise ? 'Sens horaire' : 'Sens anti-horaire'}
    />
  );
});

CircularToggle.propTypes = {
  clockwise: PropTypes.bool.isRequired,
  onToggle: PropTypes.func.isRequired,
  size: PropTypes.number,
};

export default CircularToggle;
