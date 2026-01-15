/**
 * @fileoverview FavoriteToolBox - Snap 18% content
 * @description Renders only the favorite tool selected by user
 * @created 2025-12-19
 * @updated 2025-12-19
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

  // Map favorite modes to components with visual hierarchy variants
  const favoriteTools = {
    commands: (
      <ToolboxItem variant="controlBar">
        <ControlBar
          isRunning={isTimerRunning}
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
  isTimerRunning: PropTypes.bool.isRequired,
};
