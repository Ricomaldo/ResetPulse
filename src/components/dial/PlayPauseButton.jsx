/**
 * @fileoverview Play/Pause button icon for timer center
 * Displays context-aware Ionicons based on timer state
 * Supports tap and long-press for reset functionality
 * @created 2025-12-14
 * @updated 2025-12-16
 */
import PropTypes from 'prop-types';
import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { rs } from '../../styles/responsive';
import { useTheme } from '../../theme/ThemeProvider';
import haptics from '../../utils/haptics';

/**
 * PlayPauseButton - Shows play/pause/refresh icon based on timer state
 * - Tap: Play/Pause/Reset based on state
 * - Long-press (500ms): Reset timer (when running or paused)
 */
const PlayPauseButton = React.memo(function PlayPauseButton({
  isCompleted,
  isPaused,
  isRunning,
  onLongPress,
  onPress,
}) {
  const theme = useTheme();

  // Determine which icon and label to show
  let iconName = 'play';
  let label = 'Play';

  if (isRunning) {
    iconName = 'pause';
    label = 'Pause';
  } else if (isCompleted) {
    iconName = 'refresh';
    label = 'Reset';
  } else if (isPaused) {
    iconName = 'play';
    label = 'Play';
  }

  // Border color: primary brand color at 50% opacity
  const borderColorWithOpacity = theme.colors.brand.primary.includes('#')
    ? `${theme.colors.brand.primary}80`
    : theme.colors.brand.primary;

  // Handle long press with haptic feedback
  const handleLongPress = () => {
    if (onLongPress) {
      haptics.selection();
      onLongPress();
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      onLongPress={handleLongPress}
      delayLongPress={500}
      hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      style={[
        styles.button,
        {
          width: rs(56),
          height: rs(56),
          borderColor: borderColorWithOpacity,
        },
      ]}
      accessible
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Ionicons name={iconName} size={rs(28)} color={theme.colors.brand.primary} />
    </TouchableOpacity>
  );
});

PlayPauseButton.displayName = 'PlayPauseButton';
PlayPauseButton.propTypes = {
  isCompleted: PropTypes.bool,
  isPaused: PropTypes.bool,
  isRunning: PropTypes.bool.isRequired,
  onLongPress: PropTypes.func,
  onPress: PropTypes.func.isRequired,
};

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    borderRadius: 28,
    borderWidth: 2,
    justifyContent: 'center',
  },
});

export default PlayPauseButton;
