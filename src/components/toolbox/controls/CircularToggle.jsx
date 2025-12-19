/**
 * @fileoverview Circular toggle button for clockwise/counter-clockwise rotation
 * @created 2025-12-14
 * @updated 2025-12-14
 */
import React from 'react';
import PropTypes from 'prop-types';
import { TouchableOpacity, StyleSheet, Text } from 'react-native';
import { useTheme } from '../../../theme/ThemeProvider';
import { rs } from '../../../styles/responsive';
import haptics from '../../../utils/haptics';
import Icons from '../../layout/Icons';

/**
 * CircularToggle - Circular toggle button for rotation direction
 * @param {boolean} clockwise - Current rotation direction
 * @param {function} onToggle - Callback when toggle is pressed
 * @param {number} size - Size of the toggle button
 */
const CircularToggle = React.memo(function CircularToggle({ clockwise, onToggle, size = 60 }) {
  const theme = useTheme();

  const handlePress = () => {
    haptics.selection().catch(() => { /* Optional operation - failure is non-critical */ });
    onToggle(!clockwise);
  };

  const styles = StyleSheet.create({
    container: {
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.border,
      borderRadius: rs(size / 2, 'min'),
      borderWidth: 2,
      height: rs(size, 'min'),
      justifyContent: 'center',
      width: rs(size, 'min'),
      ...theme.shadow('sm'),
    },
    icon: {
      color: theme.colors.textSecondary,
      fontSize: rs(size * 0.5, 'min'),
    },
  });

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.7}
      accessibilityRole="switch"
      accessibilityState={{ checked: clockwise }}
      accessibilityLabel={clockwise ? 'Sens horaire' : 'Sens anti-horaire'}
    >
      <Icons
        name={clockwise ? 'rotateCw' : 'rotateCcw'}
        size={rs(size * 0.5, 'min')}
        color={theme.colors.textSecondary}
      />
    </TouchableOpacity>
  );
});

CircularToggle.propTypes = {
  clockwise: PropTypes.bool.isRequired,
  onToggle: PropTypes.func.isRequired,
  size: PropTypes.number,
};

export default CircularToggle;
