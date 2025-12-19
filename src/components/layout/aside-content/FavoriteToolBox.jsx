/**
 * @fileoverview FavoriteToolBox - Snap 15% content
 * @description Renders only the favorite tool selected by user
 * @created 2025-12-19
 * @updated 2025-12-19
 */
import React from 'react';
import PropTypes from 'prop-types';
import { useUserPreferences } from '../../../contexts/UserPreferencesContext';
import { ActivityCarousel, PaletteCarousel } from '../../carousels';
import { ControlBar } from '../../controls';
import ToolboxItem from './ToolboxItem';

/**
 * FavoriteToolBox - Snap 15% (favorite tool only)
 */
export default function FavoriteToolBox({ isTimerRunning, isTimerCompleted, onPlay, onReset, onStop }) {
  const { favoriteToolMode } = useUserPreferences();

  // Map favorite modes to components (activities, colors, commands, none)
  const favoriteTools = {
    commands: (
      <ToolboxItem>
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
      <ToolboxItem>
        <ActivityCarousel />
      </ToolboxItem>
    ),
    colors: (
      <ToolboxItem>
        <PaletteCarousel />
      </ToolboxItem>
    ),
    none: null,
  };

  return Object.prototype.hasOwnProperty.call(favoriteTools, favoriteToolMode) ? favoriteTools[favoriteToolMode] : favoriteTools.commands;
}

FavoriteToolBox.propTypes = {
  isTimerCompleted: PropTypes.bool,
  isTimerRunning: PropTypes.bool.isRequired,
  onPlay: PropTypes.func.isRequired,
  onReset: PropTypes.func.isRequired,
  onStop: PropTypes.func,
};
