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
import { useTimerOptions } from '../../contexts/TimerOptionsContext';
import { rs } from '../../styles/responsive';
import { harmonizedSizes } from '../../styles/harmonized-sizes';
import DigitalTimer from './DigitalTimer';
import FitButton from './FitButton';
import { PulseButton } from '../buttons';
import CircularToggle from './CircularToggle';

/**
 * ControlBar - Barre de contrôle horizontale
 *
 * Layout: [−] 25:00 [+] [▶] [⊡] [↻]
 *
 * NOTE: Les presets de durée et de scale sont maintenant extériorisés dans AsideZone
 * NOTE: Portrait vertical layout DISABLED (orientation bug)
 * TODO: Re-enable when orientation switching is fixed
 *
 * @param {boolean} isRunning - Timer en cours
 * @param {boolean} isCompleted - Timer terminé
 * @param {function} onPlay - Callback start timer
 * @param {function} onStop - Callback stop timer (long press)
 * @param {function} onReset - Callback reset timer
 * @param {boolean} compact - Mode compact (tailles réduites)
 */
const ControlBar = React.memo(function ControlBar({
  isRunning = false,
  isCompleted = false,
  onPlay,
  onStop,
  onReset,
  compact = false,
}) {
  const theme = useTheme();
  // TODO: Re-add useWindowDimensions when portrait layout is fixed
  // const { width, height } = useWindowDimensions();
  // const isLandscape = width > height;

  const {
    currentDuration,
    setCurrentDuration,
    currentActivity,
    timerRemaining,
    scaleMode,
    setScaleMode,
    clockwise,
    setClockwise,
    saveActivityDuration,
  } = useTimerOptions();

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

  // Layout: ALWAYS horizontal (portrait vertical layout disabled due to orientation bug)
  // TODO: Re-enable portrait layout when orientation switching is fixed
  const useVerticalLayout = false;


  // Handle scale upgrade when incrementing at max
  const handleScaleUpgrade = () => {
    const scaleUpgrades = { 1: 5, 5: 10, 10: 15, 15: 25, 25: 30, 30: 45, 45: 60, 60: 60 };
    const nextScale = scaleUpgrades[currentScaleMinutes];
    if (nextScale && nextScale !== currentScaleMinutes) {
      setScaleMode(`${nextScale}min`);
      return true;
    }
    return false;
  };

  // Handle FIT: toggle scale 60 / adapt scale to fit current duration
  const handleFit = () => {
    // Si scaleMode !== '60min', forcer à 60min
    if (scaleMode !== '60min') {
      setScaleMode('60min');
      return;
    }

    // Sinon, revenir à l'échelle optimale selon la durée
    const durationMinutes = currentDuration / 60;
    let optimalScale = 60;
    if (durationMinutes <= 1) {
      optimalScale = 1;
    } else if (durationMinutes <= 5) {
      optimalScale = 5;
    } else if (durationMinutes <= 10) {
      optimalScale = 10;
    } else if (durationMinutes <= 15) {
      optimalScale = 15;
    } else if (durationMinutes <= 25) {
      optimalScale = 25;
    } else if (durationMinutes <= 30) {
      optimalScale = 30;
    } else if (durationMinutes <= 45) {
      optimalScale = 45;
    }

    if (optimalScale !== currentScaleMinutes) {
      setScaleMode(`${optimalScale}min`);
    }
  };

  // Determine PulseButton state
  const getPulseState = () => {
    if (isRunning) {
      return 'running';
    }
    if (isCompleted) {
      return 'complete';
    }
    return 'rest';
  };

  // Handle PulseButton tap (mode simple: tap pour tout)
  const handlePulseTap = () => {
    if (isRunning) {
      onStop?.();
    } else if (isCompleted) {
      onReset?.();
    } else {
      onPlay?.();
    }
  };

  // Sizes (using harmonized responsive sizing)
  const sizes = harmonizedSizes.controlBar;
  const gap = compact ? rs(8) : rs(13);
  const pulseSize = compact ? sizes.pulseButton.compact : sizes.pulseButton.normal;

  const styles = StyleSheet.create({
    container: {
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'center',
      paddingHorizontal: sizes.containerPadding.horizontal,
      position: 'relative',
    },
    columnLeft: {
      position: 'absolute',
      left: 0,
      alignItems: 'flex-start',
      justifyContent: 'center',
      paddingLeft: sizes.containerPadding.horizontal,
    },
    columnCenter: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    columnRight: {
      position: 'absolute',
      right: 0,
      alignItems: 'flex-end',
      justifyContent: 'center',
      flexDirection: 'row',
      gap: gap,
      paddingRight: sizes.containerPadding.horizontal,
    },
  });

  // Toujours sans presets (extériorisés dans AsideZone)
  // 3-column layout: Left (time controls) | Center (pulse) | Right (fit + rotate)
  return (
    <View style={styles.container}>
      {/* LEFT: DigitalTimer [−] 25:00 [+] */}
      <View style={styles.columnLeft}>
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
      </View>

      {/* CENTER: PulseButton [▶] - Always centered, icons only (no emoji) */}
      <View style={styles.columnCenter}>
        <PulseButton
          state={getPulseState()}
          onTap={handlePulseTap}
          clockwise={clockwise}
          size={pulseSize}
          compact={compact}
          stopRequiresLongPress={false}
        />
      </View>

      {/* RIGHT: FitButton [⊡] + CircularToggle [↻] */}
      <View style={styles.columnRight}>
        <FitButton onFit={handleFit} compact={compact} active={scaleMode !== '60min'} />
        <CircularToggle
          clockwise={clockwise}
          onToggle={setClockwise}
          size={compact ? sizes.rotateToggle.compact : sizes.rotateToggle.normal}
        />
      </View>
    </View>
  );
});

ControlBar.displayName = 'ControlBar';
ControlBar.propTypes = {
  compact: PropTypes.bool,
  isCompleted: PropTypes.bool,
  isRunning: PropTypes.bool,
  onPlay: PropTypes.func,
  onReset: PropTypes.func,
  onStop: PropTypes.func,
};

export default ControlBar;
