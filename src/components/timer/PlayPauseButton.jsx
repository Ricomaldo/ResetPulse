/**
 * @fileoverview Play/Pause button icon for timer center
 * Displays context-aware icon based on timer state
 */
import PropTypes from 'prop-types';
import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { rs } from '../../styles/responsive';

/**
 * PlayPauseButton - Shows play/pause/reset icon based on timer state
 */
const PlayPauseButton = React.memo(({
  isRunning,
  isCompleted,
  isPaused,
  onPress,
}) => {
  const theme = useTheme();

  const styles = StyleSheet.create({
    container: {
      alignItems: 'center',
      height: rs(44),
      justifyContent: 'center',
      width: rs(44),
    },
    icon: {
      color: theme.colors.brand.primary,
      fontSize: rs(36),
      textAlign: 'center',
      textAlignVertical: 'center',
    },
  });

  // Determine which icon to show
  let icon = '▶'; // Default: play
  if (isRunning) {
    icon = '⏸'; // Pause
  } else if (isCompleted) {
    icon = '↺'; // Reset
  } else if (isPaused) {
    icon = '▶'; // Play (resume)
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      hitSlop={{ top: 22, bottom: 22, left: 22, right: 22 }}
      style={styles.container}
      accessible
      accessibilityRole="button"
      accessibilityLabel={
        isRunning ? 'Pause' : isCompleted ? 'Reset' : 'Play'
      }
    >
      <Text style={styles.icon}>
        {icon}
      </Text>
    </TouchableOpacity>
  );
});

PlayPauseButton.displayName = 'PlayPauseButton';

PlayPauseButton.propTypes = {
  isCompleted: PropTypes.bool.isRequired,
  isPaused: PropTypes.bool.isRequired,
  isRunning: PropTypes.bool.isRequired,
  onPress: PropTypes.func,
};

PlayPauseButton.defaultProps = {
  onPress: null,
};

export default PlayPauseButton;
