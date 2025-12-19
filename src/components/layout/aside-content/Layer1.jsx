/**
 * @fileoverview Layer 1 - Favorite Tool (snap 15%)
 * @description Renders only the favorite tool selected by user
 * @created 2025-12-19
 * @updated 2025-12-19 (ControlBar replaces CommandsPanel)
 */
import React from 'react';
import { View, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import { useUserPreferences } from '../../../contexts/UserPreferencesContext';
import { ActivityCarousel, PaletteCarousel } from '../../toolbox/carousels';
import { ControlBar } from '../../controls';

/**
 * Layer1 - Favorite tool selector (orchestrator)
 */
export default function Layer1({ isTimerRunning, isTimerCompleted, onPlay, onReset, onStop }) {
  const { favoriteToolMode } = useUserPreferences();

  // Map favorite modes to components (activities, colors, commands, none)
  const favoriteTools = {
    commands: (
      <ControlBar
        showPresets={false}
        isRunning={isTimerRunning}
        isCompleted={isTimerCompleted}
        onPlay={onPlay}
        onReset={onReset}
        onStop={onStop}
        compact
      />
    ),
    activities: <ActivityCarousel />,
    colors: <PaletteCarousel />,
    none: null,
  };

  return (
    <View style={styles.container}>
      {favoriteTools[favoriteToolMode] || favoriteTools.commands}
    </View>
  );
}

Layer1.propTypes = {
  isTimerCompleted: PropTypes.bool,
  isTimerRunning: PropTypes.bool.isRequired,
  onPlay: PropTypes.func.isRequired,
  onReset: PropTypes.func.isRequired,
  onStop: PropTypes.func,
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
});
