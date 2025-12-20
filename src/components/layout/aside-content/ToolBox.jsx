/**
 * @fileoverview ToolBox - Snap 38% content
 * @description Renders all 3 tools with dynamic order based on FavoriteTool
 * @created 2025-12-19
 * @updated 2025-12-19
 */
import React from 'react';
import { View, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import { useUserPreferences } from '../../../contexts/UserPreferencesContext';
import { useTheme } from '../../../theme/ThemeProvider';
import { ActivityCarousel, PaletteCarousel } from '../../carousels';
import { ControlBar } from '../../controls';
import { rs } from '../../../styles/responsive';
import ToolboxItem from './ToolboxItem';

/**
 * ToolBox - Snap 38% (all 3 tools)
 * Dynamic order: favorite tool first for visual continuity
 */
export default function ToolBox({
  isTimerRunning,
  isTimerCompleted,
  onPlay,
  onReset,
  onStop,
  activityCarouselRef,
  paletteCarouselRef,
}) {
  const { favoriteToolMode } = useUserPreferences();
  const theme = useTheme();

  // Tool order based on favorite (favorite first for visual continuity)
  const toolOrder = {
    commands: ['commands', 'activities', 'colors'],
    activities: ['activities', 'colors', 'commands'],
    colors: ['colors', 'activities', 'commands'],
    none: ['commands', 'activities', 'colors'], // Default order
  };

  const order = toolOrder[favoriteToolMode] || toolOrder.commands;

  // Tool components map with visual hierarchy variants
  const toolComponents = {
    commands: (
      <ToolboxItem key="commands" variant="controlBar">
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
      <ToolboxItem key="activities" variant="activityCarousel">
        <ActivityCarousel ref={activityCarouselRef} />
      </ToolboxItem>
    ),
    colors: (
      <ToolboxItem key="colors" variant="paletteCarousel">
        <View style={{
          backgroundColor: theme.colors.surfaceElevated,
          borderRadius: 999,
          overflow: 'hidden',
        }}>
          <PaletteCarousel ref={paletteCarouselRef} />
        </View>
      </ToolboxItem>
    ),
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

ToolBox.propTypes = {
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
    paddingTop: rs(0),  // No padding - space controlled by scrollContent
  },
  separator: {
    height: 8,
  },
});
