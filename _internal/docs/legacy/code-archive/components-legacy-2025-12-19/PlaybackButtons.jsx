/**
 * @fileoverview PlaybackButtons - Timer playback controls (Play/Stop/Reset)
 * @description Configurable playback button group using PulseButton (ADR-007)
 * @created 2025-12-17
 * @updated 2025-12-19 (migrated to PulseButton)
 */
import React from 'react';
import PropTypes from 'prop-types';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { useTimerOptions } from '../../contexts/TimerOptionsContext';
import { rs } from '../../styles/responsive';
import { CircularToggle } from '../toolbox/controls';
import PulseButton from './PulseButton';
import { ResetIcon } from '../layout/Icons';
import haptics from '../../utils/haptics';

/**
 * PlaybackButtons - Configurable playback controls (ADR-007)
 * @param {Array<string>} commandBarConfig - Config des commandes à afficher
 * @param {boolean} isTimerRunning - Timer running state
 * @param {function} onPlayPause - Play callback (starts timer, ADR-007: no pause)
 * @param {function} onReset - Reset callback (COMPLETE → REST)
 * @param {function} onStop - Stop callback (RUNNING → REST via long press)
 * @param {function} onSelectPreset - Callback pour sélection preset
 * @param {string} variant - 'horizontal' (default) or 'vertical-compact' (for AsideZone)
 */
const PlaybackButtons = React.memo(function PlaybackButtons({
  commandBarConfig = [],
  isTimerRunning = false,
  onPlayPause,
  onReset,
  onStop,
  onSelectPreset: _onSelectPreset,
  variant = 'horizontal',
}) {
  const theme = useTheme();
  const { clockwise, setClockwise } = useTimerOptions();
  const isCompact = variant === 'vertical-compact';

  // Si config vide, ne rien afficher
  if (!commandBarConfig || commandBarConfig.length === 0) {
    return null;
  }

  const styles = StyleSheet.create({
    commandButton: {
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.border,
      borderRadius: isCompact ? rs(20, 'min') : rs(24, 'min'), // Smaller in compact
      borderWidth: 2,
      height: isCompact ? rs(38, 'min') : rs(48, 'min'), // Smaller in compact
      justifyContent: 'center',
      width: isCompact ? rs(38, 'min') : rs(48, 'min'), // Smaller in compact
      ...theme.shadow('sm'),
    },
    commandButtonSecondary: {
      backgroundColor: theme.colors.brand.secondary,
      borderColor: theme.colors.brand.secondary,
    },
    commandRow: {
      alignItems: 'center',
      flexDirection: 'row', // Always horizontal
      gap: isCompact ? 8 : theme.spacing.sm,
      justifyContent: 'center',
    },
    container: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: isCompact ? 8 : theme.spacing.md,
      justifyContent: isCompact ? 'center' : 'space-between',
      paddingHorizontal: isCompact ? 0 : theme.spacing.md,
      paddingVertical: 0,
      width: '100%',
    },
  });

  // ADR-007: Unified PulseButton for play/stop
  const renderPulseButton = () => {
    const hasPlayPause = commandBarConfig.includes('playPause');
    const hasStop = commandBarConfig.includes('stop');

    // Show PulseButton if either playPause or stop is in config
    if (!hasPlayPause && !hasStop) {
      return null;
    }

    // Determine state and callbacks based on timer state
    const state = isTimerRunning ? 'running' : 'rest';
    const buttonSize = isCompact ? rs(48, 'min') : rs(60, 'min');

    return (
      <PulseButton
        key="pulseButton"
        state={state}
        onTap={onPlayPause}
        onLongPressComplete={onStop}
        clockwise={clockwise}
        size={buttonSize}
        compact={isCompact}
      />
    );
  };

  const renderReset = () => {
    // ADR-007: Reset only shows when timer is NOT running
    if (!commandBarConfig.includes('reset') || isTimerRunning) {
      return null;
    }

    return (
      <TouchableOpacity
        key="reset"
        style={[styles.commandButton, styles.commandButtonSecondary]}
        onPress={() => {
          haptics.selection().catch(() => {
            /* Optional operation - failure is non-critical */
          });
          onReset?.();
        }}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel="Reset"
      >
        <ResetIcon size={isCompact ? rs(18, 'min') : rs(22, 'min')} color={theme.colors.fixed.white} />
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
    // Legacy: presets are now handled by ScaleButtons in CommandsPanel
    // This function is kept for backwards compatibility but returns null
    return null;
  };

  // Layout en 2 blocs: presets à gauche, boutons à droite
  const hasPresets = commandBarConfig.includes('presets');
  const otherCommands = commandBarConfig.filter((cmd) => cmd !== 'presets');

  return (
    <View style={styles.container}>
      {/* Bloc gauche: presets (flex: 1) */}
      {hasPresets && renderPresets()}
      {/* Bloc droit: commandes (reset, pulseButton, rotation) - ADR-007 */}
      {otherCommands.length > 0 && (
        <View style={styles.commandRow}>
          {renderReset()}
          {renderPulseButton()}
          {renderRotation()}
        </View>
      )}
    </View>
  );
});

PlaybackButtons.propTypes = {
  commandBarConfig: PropTypes.arrayOf(PropTypes.string),
  isTimerRunning: PropTypes.bool,
  onPlayPause: PropTypes.func,
  onReset: PropTypes.func,
  onStop: PropTypes.func, // ADR-007: long press stop
  onSelectPreset: PropTypes.func,
  variant: PropTypes.oneOf(['horizontal', 'vertical-compact']),
};

export default PlaybackButtons;
