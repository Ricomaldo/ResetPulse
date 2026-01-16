/**
 * @fileoverview FavoriteToolBox - Snap 18% content
 * @description Renders only the favorite tool selected by user (activities, colors, or commands)
 * @created 2025-12-19
 * @updated 2026-01-16 - Simplified to 3 options (multitask, creative, precision)
 */
import React from 'react';
import { View, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import { useTimerConfig } from '../../../contexts/TimerConfigContext';
import { ActivityCarousel, PaletteCarousel } from '../../carousels';
import { ControlBar } from '../../controls';
import { rs } from '../../../styles/responsive';
import ToolboxItem from './ToolboxItem';

/**
 * FavoriteToolBox - Snap 18% (favorite tool only)
 */
export default function FavoriteToolBox({ isTimerRunning }) {
  const { layout: { favoriteToolMode } } = useTimerConfig();

  // Map favorite modes to components (3 options: activities, colors, commands)
  const favoriteTools = {
    activities: (
      <ToolboxItem variant="activityCarousel">
        <ActivityCarousel isRunning={isTimerRunning} />
      </ToolboxItem>
    ),
    colors: (
      <ToolboxItem variant="paletteCarousel">
        <PaletteCarousel />
      </ToolboxItem>
    ),
    commands: (
      <ToolboxItem variant="controlBar">
        <ControlBar
          isRunning={isTimerRunning}
          compact
        />
      </ToolboxItem>
    ),
  };

  return (
    <View style={styles.container}>
      {Object.prototype.hasOwnProperty.call(favoriteTools, favoriteToolMode) ? favoriteTools[favoriteToolMode] : favoriteTools.activities}
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
  isTimerRunning: PropTypes.bool.isRequired,
};
