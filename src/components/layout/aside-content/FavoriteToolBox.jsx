/**
 * @fileoverview FavoriteToolBox - Snap 15% content
 * @description Renders only the favorite tool selected by user
 * @created 2025-12-19
 * @updated 2025-12-19
 */
import React from 'react';
import { View, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import { useUserPreferences } from '../../../contexts/TimerConfigContext';
import { ActivityCarousel, PaletteCarousel } from '../../carousels';
import { ControlBar } from '../../controls';
import { rs } from '../../../styles/responsive';
import ToolboxItem from './ToolboxItem';

/**
 * FavoriteToolBox - Snap 15% (favorite tool only)
 */
export default function FavoriteToolBox({ isTimerRunning, isTimerCompleted, onPlay, onReset, onStop }) {
  const { favoriteToolMode } = useUserPreferences();

  // Map favorite modes to components with visual hierarchy variants
  const favoriteTools = {
    commands: (
      <ToolboxItem variant="controlBar">
        <ControlBar
          isRunning={isTimerRunning}
          isCompleted={isTimerCompleted}
          onPlay={onPlay}
          onReset={onReset}
          onStop={onStop}
          compact
        />
      </ToolboxItem>
    ),
    activities: (
      <ToolboxItem variant="activityCarousel">
        <ActivityCarousel />
      </ToolboxItem>
    ),
    colors: (
      <ToolboxItem variant="paletteCarousel">
        <PaletteCarousel />
      </ToolboxItem>
    ),
    none: null,
  };

  return (
    <View style={styles.container}>
      {Object.prototype.hasOwnProperty.call(favoriteTools, favoriteToolMode) ? favoriteTools[favoriteToolMode] : favoriteTools.commands}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: '100%',
    paddingTop: rs(0),  // No padding - space controlled by scrollContent
  },
});

FavoriteToolBox.propTypes = {
  isTimerCompleted: PropTypes.bool,
  isTimerRunning: PropTypes.bool.isRequired,
  onPlay: PropTypes.func.isRequired,
  onReset: PropTypes.func.isRequired,
  onStop: PropTypes.func,
};
