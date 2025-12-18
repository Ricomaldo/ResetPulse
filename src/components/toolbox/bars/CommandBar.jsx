/**
 * @fileoverview CommandBar - Zone de commandes configurables (haut du TimerScreen)
 * @description Affiche les commandes selon commandBarConfig (playPause, reset, rotation, presets)
 * @created 2025-12-17
 */
import React from 'react';
import PropTypes from 'prop-types';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { useTheme } from '../../../theme/ThemeProvider';
import { useTimerOptions } from '../../../contexts/TimerOptionsContext';
import { rs } from '../../../styles/responsive';
import { fontWeights } from '../../../theme/tokens';
import { CircularToggle } from '../controls';
import { PlayIcon, PauseIcon } from '../../layout/Icons';
import haptics from '../../../utils/haptics';

/**
 * CommandBar - Affiche les commandes selon configuration
 * @param {Array<string>} commandBarConfig - Config des commandes à afficher
 * @param {boolean} isTimerRunning - État du timer
 * @param {function} onPlayPause - Callback pour play/pause
 * @param {function} onReset - Callback pour reset
 * @param {function} onSelectPreset - Callback pour sélection preset
 */
const CommandBar = React.memo(function CommandBar({
  commandBarConfig = [],
  isTimerRunning = false,
  onPlayPause,
  onReset,
  onSelectPreset,
}) {
  const theme = useTheme();
  const { clockwise, setClockwise } = useTimerOptions();

  // Si config vide, ne rien afficher
  if (!commandBarConfig || commandBarConfig.length === 0) {
    return null;
  }

  const styles = StyleSheet.create({
    commandButton: {
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.border,
      borderRadius: rs(24, 'min'),
      borderWidth: 2,
      height: rs(48, 'min'),
      justifyContent: 'center',
      width: rs(48, 'min'),
      ...theme.shadow('sm'),
    },
    commandButtonIcon: {
      color: theme.colors.textSecondary,
      fontSize: rs(20, 'min'),
      fontWeight: fontWeights.semibold,
    },
    commandRow: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: theme.spacing.sm,
      justifyContent: 'center', // Center within its 50% zone
    },
    container: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: theme.spacing.md,
      justifyContent: 'space-between',
      paddingHorizontal: theme.spacing.md,
      paddingVertical: 0, // No vertical padding - let content define height
      width: '100%', // Full width for proper space-between distribution
    },
    presetsContainer: {
      alignItems: 'center', // Center presets horizontally within zone
      flex: 1,
      justifyContent: 'center', // Center presets within zone
      maxWidth: '50%', // Never exceed 50% of screen width
    },
  });

  const renderPlayPause = () => {
    if (!commandBarConfig.includes('playPause')) {
      return null;
    }

    const IconComponent = isTimerRunning ? PauseIcon : PlayIcon;

    return (
      <TouchableOpacity
        key="playPause"
        style={styles.commandButton}
        onPress={() => {
          haptics.selection().catch(() => {
            /* Optional operation - failure is non-critical */
          });
          onPlayPause?.();
        }}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={isTimerRunning ? 'Pause' : 'Play'}
      >
        <IconComponent size={rs(20, 'min')} color={theme.colors.textSecondary} />
      </TouchableOpacity>
    );
  };

  const renderReset = () => {
    if (!commandBarConfig.includes('reset')) {
      return null;
    }

    return (
      <TouchableOpacity
        key="reset"
        style={styles.commandButton}
        onPress={() => {
          haptics.selection().catch(() => {
            /* Optional operation - failure is non-critical */
          });
          onReset?.();
        }}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel="Stop"
      >
        <Text style={styles.commandButtonIcon}>■</Text>
      </TouchableOpacity>
    );
  };

  const renderRotation = () => {
    if (!commandBarConfig.includes('rotation')) {
      return null;
    }

    return (
      <CircularToggle key="rotation" clockwise={clockwise} onToggle={setClockwise} size={48} />
    );
  };

  const renderPresets = () => {
    if (!commandBarConfig.includes('presets')) {
      return null;
    }

    // TODO: Replace with ScaleButtons from toolbox/controls
    return (
      <View key="presets" style={styles.presetsContainer}>
        <Text style={{ color: 'gray', fontSize: 12 }}>Presets (legacy - use ScaleButtons)</Text>
      </View>
    );
  };

  // Layout en 2 blocs: presets à gauche, boutons à droite
  const hasPresets = commandBarConfig.includes('presets');
  const otherCommands = commandBarConfig.filter((cmd) => cmd !== 'presets');

  return (
    <View style={styles.container}>
      {/* Bloc gauche: presets (flex: 1) */}
      {hasPresets && renderPresets()}
      {/* Bloc droit: commandes (play, reset, rotation) */}
      {otherCommands.length > 0 && (
        <View style={styles.commandRow}>
          {renderPlayPause()}
          {renderReset()}
          {renderRotation()}
        </View>
      )}
    </View>
  );
});

CommandBar.propTypes = {
  commandBarConfig: PropTypes.arrayOf(PropTypes.string),
  isTimerRunning: PropTypes.bool,
  onPlayPause: PropTypes.func,
  onReset: PropTypes.func,
  onSelectPreset: PropTypes.func,
};

export default CommandBar;
