/**
 * @fileoverview CommandsPanel - Timer commands panel
 * @description Combines playback, duration, and scale controls
 * @created 2025-12-19
 */
import React from 'react';
import { View, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import { useTimerOptions } from '../../../contexts/TimerOptionsContext';
import { DurationIncrementer, ScaleButtons } from '../controls';
import { PlaybackButtons } from '../../buttons';

/**
 * CommandsPanel - Timer commands interface
 * Layout: 40% playback controls (left) / 60% duration + scale (right)
 */
export default function CommandsPanel({ isTimerRunning, onPlayPause, onReset, onStop }) {
  const { scaleMode, setScaleMode, currentDuration, setCurrentDuration } = useTimerOptions();

  // Convert scaleMode string ('30min') to number (30)
  const currentScaleNumber = parseInt(scaleMode) || 30;

  // Convert number to scaleMode string format
  const setScaleModeFromNumber = (scaleNumber) => {
    setScaleMode(`${scaleNumber}min`);
  };

  // Auto-upgrade cadran when incrementing at max duration
  const handleScaleUpgrade = () => {
    const scaleUpgrades = {
      5: 15,
      15: 30,
      30: 60,
      60: 60, // Already at max
    };

    const nextScale = scaleUpgrades[currentScaleNumber];
    if (nextScale && nextScale !== currentScaleNumber) {
      setScaleModeFromNumber(nextScale);
      return true; // Upgrade successful
    }
    return false; // Already at max
  };

  // Adapt cadran to current duration (tap on duration display)
  const handleScaleAdaptToDuration = (durationSeconds) => {
    // Find optimal scale (smallest scale that fits duration)
    let optimalScale = 60; // Default to max
    if (durationSeconds <= 300) {
      optimalScale = 5;
    } else if (durationSeconds <= 900) {
      optimalScale = 15;
    } else if (durationSeconds <= 1800) {
      optimalScale = 30;
    }

    if (optimalScale !== currentScaleNumber) {
      setScaleModeFromNumber(optimalScale);
      return true; // Scale adapted
    }
    return false; // Already optimal
  };

  return (
    <View style={styles.container}>
      {/* LEFT COLUMN: Playback Controls (40%) */}
      <View style={styles.leftColumn}>
        <PlaybackButtons
          commandBarConfig={['playPause', 'reset', 'stop']}
          isTimerRunning={isTimerRunning}
          onPlayPause={onPlayPause}
          onReset={onReset}
          onStop={onStop}
          variant="vertical-compact"
        />
      </View>

      {/* RIGHT COLUMN: Duration + Scale (60%) */}
      <View style={styles.rightColumn}>
        <DurationIncrementer
          duration={currentDuration}
          maxDuration={currentScaleNumber * 60}
          onDurationChange={setCurrentDuration}
          onScaleUpgrade={handleScaleUpgrade}
          onScaleAdaptToDuration={handleScaleAdaptToDuration}
          compact
        />
        <View style={styles.smallSeparator} />
        <ScaleButtons
          currentScale={currentScaleNumber}
          onSelectScale={setScaleModeFromNumber}
          compact
        />
      </View>
    </View>
  );
}

CommandsPanel.propTypes = {
  isTimerRunning: PropTypes.bool.isRequired,
  onPlayPause: PropTypes.func.isRequired,
  onReset: PropTypes.func.isRequired,
  onStop: PropTypes.func,
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    width: '100%',
  },
  leftColumn: {
    alignItems: 'center',
    flex: 0.4, // 40% for playback controls
    justifyContent: 'center',
  },
  rightColumn: {
    alignItems: 'center',
    flex: 0.6, // 60% for duration + scale
    justifyContent: 'center',
  },
  smallSeparator: {
    height: 4,
  },
});
