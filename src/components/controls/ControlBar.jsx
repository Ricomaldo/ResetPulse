/**
 * @fileoverview ControlBar - Barre de contrôle simplifiée
 * @description Affiche uniquement le DigitalTimer (durée avec +/-)
 * @created 2025-12-19
 * @updated 2026-01-16 - Removed presets (scale is now manual only)
 */
import React, { useEffect, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import { useTheme } from '../../theme/ThemeProvider';
import { useTimerConfig } from '../../contexts/TimerConfigContext';
import { rs } from '../../styles/responsive';
import DigitalTimer from './DigitalTimer';

/**
 * ControlBar - Affiche la durée du timer avec contrôles +/-
 *
 * Layout: [−] 25:00 [+]
 *
 * NOTE: Scale (dial range) is manual only - no auto-adjustment
 * NOTE: Presets removed - duration set via +/- buttons or dial drag
 *
 * @param {boolean} isRunning - Timer en cours
 * @param {boolean} compact - Mode compact (tailles réduites)
 */
const ControlBar = React.memo(function ControlBar({
  isRunning = false,
  compact = false,
}) {
  const theme = useTheme();
  // TODO: Re-add useWindowDimensions when portrait layout is fixed
  // const { width, height } = useWindowDimensions();
  // const isLandscape = width > height;

  const {
    timer: { currentDuration, currentActivity, scaleMode },
    setCurrentDuration,
    setScaleMode,
    transient: { timerRemaining },
    stats: { activityDurations },
    saveActivityDuration,
  } = useTimerConfig();

  // Save activity duration when it changes (ADR-007: remember user preferences)
  const previousDurationRef = useRef(currentDuration);
  useEffect(() => {
    if (currentDuration !== previousDurationRef.current && currentActivity?.id && !isRunning) {
      saveActivityDuration(currentActivity.id, currentDuration);
      previousDurationRef.current = currentDuration;
    }
  }, [currentDuration, currentActivity?.id, isRunning, saveActivityDuration]);

  // Convert scaleMode string ('25min') to number (25)
  const currentScaleMinutes = parseInt(scaleMode) || 25;
  const maxDuration = currentScaleMinutes * 60;

  const styles = StyleSheet.create({
    container: {
      width: '100%',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: rs(16), // Push digital timer down slightly
    },
  });

  return (
    <View style={styles.container}>
      {/* DigitalTimer [−] 25:00 [+] */}
      <DigitalTimer
        duration={currentDuration}
        remaining={isRunning ? timerRemaining : undefined}
        maxDuration={maxDuration}
        showControls={true}
        scaleMode={scaleMode}
        onDurationChange={setCurrentDuration}
        isRunning={isRunning}
        compact={compact}
      />
    </View>
  );
});

ControlBar.displayName = 'ControlBar';
ControlBar.propTypes = {
  compact: PropTypes.bool,
  isRunning: PropTypes.bool,
};

export default ControlBar;
