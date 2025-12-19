/**
 * @fileoverview Layer 2 - Complete Toolbox (snap 55%)
 * @description Renders favorite tool at top + 2 others below (dynamic sequence)
 * @created 2025-12-19
 */
import React from 'react';
import { View, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import { useUserPreferences } from '../../../contexts/UserPreferencesContext';
import { ActivityCarousel, PaletteCarousel } from '../../toolbox/carousels';
import { TimerPanel } from '../../toolbox/composed';

/**
 * Get tool sequence based on favorite mode
 * Favorite is always first, followed by the 2 others
 */
function getToolSequence(favoriteMode) {
  const sequences = {
    combo: ['combo', 'activities', 'colors'],
    activities: ['activities', 'colors', 'combo'],
    colors: ['colors', 'activities', 'combo'],
    none: ['combo', 'activities', 'colors'], // Default to combo first
  };

  return sequences[favoriteMode] || sequences.combo;
}

/**
 * Layer2 - Complete toolbox (orchestrator)
 * Displays all 3 tools in dynamic order (favorite first)
 */
export default function Layer2({ isTimerRunning, onPlayPause, onReset, activityCarouselRef, paletteCarouselRef }) {
  const { favoriteToolMode } = useUserPreferences();

  // Tool components map
  const tools = {
    combo: <TimerPanel isTimerRunning={isTimerRunning} onPlayPause={onPlayPause} onReset={onReset} />,
    colors: <PaletteCarousel ref={paletteCarouselRef} />,
    activities: <ActivityCarousel ref={activityCarouselRef} />,
  };

  // Get sequence (favorite first + 2 others)
  const sequence = getToolSequence(favoriteToolMode);

  return (
    <View style={styles.container}>
      {sequence.map((toolKey, index) => (
        <React.Fragment key={toolKey}>
          {tools[toolKey]}
          {index < sequence.length - 1 && <View style={styles.separator} />}
        </React.Fragment>
      ))}
    </View>
  );
}

Layer2.propTypes = {
  isTimerRunning: PropTypes.bool.isRequired,
  onPlayPause: PropTypes.func.isRequired,
  onReset: PropTypes.func.isRequired,
  activityCarouselRef: PropTypes.object,
  paletteCarouselRef: PropTypes.object,
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: '100%',
  },
  separator: {
    height: 16,
  },
});
