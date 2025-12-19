/**
 * @fileoverview Layer 2 - Complete Toolbox (snap 38%)
 * @description Renders all 3 tools with dynamic order based on FavoriteTool
 * @created 2025-12-19
 * @updated 2025-12-19 (Dynamic order for visual continuity with Layer1)
 */
import React from 'react';
import { View, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import { useUserPreferences } from '../../../contexts/UserPreferencesContext';
import { ActivityCarousel, PaletteCarousel } from '../../toolbox/carousels';
import { ControlBar } from '../../controls';

/**
 * Layer2 - Complete toolbox (snap 38%)
 * Dynamic order: favorite tool first for visual continuity with Layer1
 */
export default function Layer2({ isTimerRunning, isTimerCompleted, onPlay, onReset, onStop, activityCarouselRef, paletteCarouselRef }) {
  const { favoriteToolMode } = useUserPreferences();

  // Tool order based on favorite (favorite first for visual continuity)
  const toolOrder = {
    commands: ['commands', 'activities', 'colors'],
    activities: ['activities', 'commands', 'colors'],
    colors: ['colors', 'commands', 'activities'],
    none: ['commands', 'activities', 'colors'], // Default order
  };

  const order = toolOrder[favoriteToolMode] || toolOrder.commands;

  // Tool components map
  const toolComponents = {
    commands: (
      <ControlBar
        key="commands"
        showPresets
        isRunning={isTimerRunning}
        isCompleted={isTimerCompleted}
        onPlay={onPlay}
        onReset={onReset}
        onStop={onStop}
        compact
      />
    ),
    activities: <ActivityCarousel key="activities" ref={activityCarouselRef} />,
    colors: <PaletteCarousel key="colors" ref={paletteCarouselRef} />,
  };

  return (
    <View style={styles.container}>
      {order.map((tool, index) => (
        <React.Fragment key={tool}>
          {toolComponents[tool]}
          {index < order.length - 1 && <View style={styles.separator} />}
        </React.Fragment>
      ))}
    </View>
  );
}

Layer2.propTypes = {
  activityCarouselRef: PropTypes.object,
  isTimerCompleted: PropTypes.bool,
  isTimerRunning: PropTypes.bool.isRequired,
  onPlay: PropTypes.func.isRequired,
  onReset: PropTypes.func.isRequired,
  onStop: PropTypes.func,
  paletteCarouselRef: PropTypes.object,
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: '100%',
  },
  separator: {
    height: 8,
  },
});
