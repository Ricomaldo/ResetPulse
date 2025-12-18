/**
 * @fileoverview Layer 1 Content - Favorite Tool (snap 15%)
 * Renders favorite tool based on user preference (managed by UserPreferencesContext)
 * @created 2025-12-19
 */
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useUserPreferences } from '../../../contexts/UserPreferencesContext';
import { useTimerOptions } from '../../../contexts/TimerOptionsContext';
import {
  ActivityCarousel,
  PaletteCarousel,
  ScaleButtons,
  DurationIncrementer,
  CommandBar,
} from '../../toolbox';

/**
 * Layer1Content - Renders the favorite tool based on user preference
 * Persistence handled by UserPreferencesContext
 */
export default function Layer1Content() {
  const { favoriteToolMode } = useUserPreferences();
  const { scaleMode, setScaleMode, currentDuration, setCurrentDuration } = useTimerOptions();

  return (
    <View style={styles.container}>
      {favoriteToolMode === 'colors' && (
        <View style={styles.toolContent}>
          <PaletteCarousel />
        </View>
      )}
      {favoriteToolMode === 'activities' && (
        <View style={styles.toolContent}>
          <ActivityCarousel />
        </View>
      )}
      {favoriteToolMode === 'presets' && (
        <View style={styles.toolContent}>
          <DurationIncrementer
            duration={currentDuration}
            maxDuration={scaleMode * 60}
            onDurationChange={setCurrentDuration}
          />
          <View style={styles.separator} />
          <ScaleButtons
            currentScale={scaleMode}
            onSelectScale={setScaleMode}
          />
        </View>
      )}
      {favoriteToolMode === 'controls' && (
        <View style={styles.toolContent}>
          <CommandBar
            commandBarConfig={['playPause', 'reset', 'rotation']}
            isTimerRunning={false}
            onPlayPause={() => console.log('[Layer1] Play/Pause')}
            onReset={() => console.log('[Layer1] Reset')}
          />
        </View>
      )}
      {favoriteToolMode === 'combo' && (
        <View style={styles.toolContent}>
          <DurationIncrementer
            duration={currentDuration}
            maxDuration={scaleMode * 60}
            onDurationChange={setCurrentDuration}
          />
          <ScaleButtons
            currentScale={scaleMode}
            onSelectScale={setScaleMode}
          />
          <View style={styles.separator} />
          <CommandBar
            commandBarConfig={['playPause', 'reset', 'rotation']}
            isTimerRunning={false}
            onPlayPause={() => console.log('[Layer1] Play/Pause')}
            onReset={() => console.log('[Layer1] Reset')}
          />
        </View>
      )}
      {favoriteToolMode === 'none' && null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  separator: {
    height: 8,
  },
  toolContent: {
    alignItems: 'center',
    width: '100%',
  },
});
