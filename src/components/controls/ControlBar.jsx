/**
 * @fileoverview ControlBar - Barre de contrôle unifiée (ADR-004 v2)
 * @description Layout responsive avec/sans presets
 * @created 2025-12-19
 * @updated 2025-12-19
 */
import React, { useEffect, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import { useTheme } from '../../theme/ThemeProvider';
import { useTimerConfig } from '../../contexts/TimerConfigContext';
import { rs } from '../../styles/responsive';
import DigitalTimer from './DigitalTimer';
import PresetPills from './PresetPills';

/**
 * ControlBar - Barre de contrôle "Time Setup" (ADR-004 v3)
 *
 * Layout: [−] 25:00 [+]
 *         [5] [15] [25] [30] [45] [60]
 *
 * NOTE: PulseButton removed - dial center button handles play/pause/reset
 * NOTE: CircularToggle removed - available in Settings Panel
 * NOTE: PresetPills integrated (moved from ToolBox)
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

  // Handle scale upgrade when incrementing at max
  const handleScaleUpgrade = () => {
    const scaleUpgrades = { 5: 15, 15: 30, 30: 45, 45: 60, 60: 60 }; // 5 scales
    const nextScale = scaleUpgrades[currentScaleMinutes];
    if (nextScale && nextScale !== currentScaleMinutes) {
      setScaleMode(`${nextScale}min`);
      return true;
    }
    return false;
  };

  const styles = StyleSheet.create({
    // Vertical layout: DigitalTimer + PresetPills
    container: {
      width: '100%',
      alignItems: 'center',
      justifyContent: 'center',
      gap: compact ? rs(8) : rs(12),
    },
  });

  // Vertical layout: DigitalTimer + PresetPills
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
        onScaleUpgrade={handleScaleUpgrade}
        isRunning={isRunning}
        compact={compact}
      />

      {/* PresetPills [5] [15] [25] [30] [45] [60] */}
      <PresetPills compact={compact} />
    </View>
  );
});

ControlBar.displayName = 'ControlBar';
ControlBar.propTypes = {
  compact: PropTypes.bool,
  isRunning: PropTypes.bool,
};

export default ControlBar;
