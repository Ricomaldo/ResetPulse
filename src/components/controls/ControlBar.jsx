/**
 * @fileoverview ControlBar - Barre de contrôle unifiée (ADR-004 v2)
 * @description Layout responsive avec/sans presets
 * @created 2025-12-19
 * @updated 2025-12-19
 */
import React from 'react';
import { View, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import { useTheme } from '../../theme/ThemeProvider';
import { useTimerOptions } from '../../contexts/TimerOptionsContext';
import { rs } from '../../styles/responsive';
import DurationPresets from './DurationPresets';
import DigitalTimer from './DigitalTimer';
import FitButton from './FitButton';
import { PulseButton } from '../buttons';
import CircularToggle from './CircularToggle';

/**
 * ControlBar - Barre de contrôle horizontale
 *
 * Layouts:
 * - showPresets=false: [−] 25:00 [+] [▶] [⊡] [↻]
 * - showPresets=true: [5][15][30][60] | [−] 25:00 [+] | [▶] [⊡] [↻]
 *
 * NOTE: Portrait vertical layout DISABLED (orientation bug)
 * TODO: Re-enable when orientation switching is fixed
 *
 * @param {boolean} showPresets - Afficher les presets durée (default: true)
 * @param {boolean} isRunning - Timer en cours
 * @param {boolean} isCompleted - Timer terminé
 * @param {function} onPlay - Callback start timer
 * @param {function} onStop - Callback stop timer (long press)
 * @param {function} onReset - Callback reset timer
 * @param {boolean} compact - Mode compact (tailles réduites)
 */
const ControlBar = React.memo(function ControlBar({
  showPresets = true,
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
    timerRemaining,
    scaleMode,
    setScaleMode,
    clockwise,
    setClockwise,
  } = useTimerOptions();

  // Convert scaleMode string ('30min') to number (30)
  const currentScaleMinutes = parseInt(scaleMode) || 30;
  const maxDuration = currentScaleMinutes * 60;

  // Layout: ALWAYS horizontal (portrait vertical layout disabled due to orientation bug)
  // TODO: Re-enable portrait layout when orientation switching is fixed
  const useVerticalLayout = false;

  // Handle preset selection: set duration
  const handlePresetSelect = (durationSeconds) => {
    setCurrentDuration(durationSeconds);
  };

  // Handle scale upgrade when incrementing at max
  const handleScaleUpgrade = () => {
    const scaleUpgrades = { 5: 15, 15: 30, 30: 60, 60: 60 };
    const nextScale = scaleUpgrades[currentScaleMinutes];
    if (nextScale && nextScale !== currentScaleMinutes) {
      setScaleMode(`${nextScale}min`);
      return true;
    }
    return false;
  };

  // Handle FIT: adapt scale to fit current duration
  const handleFit = () => {
    const durationMinutes = currentDuration / 60;
    let optimalScale = 60;
    if (durationMinutes <= 5) {
      optimalScale = 5;
    } else if (durationMinutes <= 15) {
      optimalScale = 15;
    } else if (durationMinutes <= 30) {
      optimalScale = 30;
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

  // Sizes (using theme tokens)
  const gap = compact ? theme.spacing.sm : theme.spacing.md;
  const pulseSize = compact ? rs(44) : rs(52);

  const styles = StyleSheet.create({
    container: {
      alignItems: 'center',
      backgroundColor: 'transparent', // Ghost mode: no fill, shows parent (surfaceElevated)
      borderRadius: theme.borderRadius.lg,
      flexDirection: useVerticalLayout ? 'column' : 'row',
      gap: gap,
      justifyContent: 'center',
      paddingHorizontal: compact ? theme.spacing.sm : theme.spacing.md,
      paddingVertical: compact ? theme.spacing.sm : theme.spacing.sm,
    },
    controlsRow: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: gap,
      justifyContent: 'center',
    },
    presetsRow: {
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'center',
    },
    separator: {
      backgroundColor: theme.colors.border,
      height: useVerticalLayout ? 1 : '60%',
      width: useVerticalLayout ? '80%' : 1,
    },
  });

  // Render controls (sans presets)
  const renderControls = () => (
    <>
      {/* Duration or Remaining: [−] 25:00 [+] */}
      <DigitalTimer
        duration={currentDuration}
        remaining={isRunning ? timerRemaining : undefined}
        maxDuration={maxDuration}
        showControls={!isRunning}
        scaleMode={scaleMode}
        onDurationChange={setCurrentDuration}
        onScaleUpgrade={handleScaleUpgrade}
        isRunning={isRunning}
        compact={compact}
      />

      {/* Run: [▶] - Mode simple (tap pour tout) */}
      <PulseButton
        state={getPulseState()}
        onTap={handlePulseTap}
        clockwise={clockwise}
        size={pulseSize}
        compact={compact}
        stopRequiresLongPress={false}
      />

      {/* Fit: [⊡] */}
      <FitButton onFit={handleFit} compact={compact} />

      {/* Rotate: [↻] */}
      <CircularToggle
        clockwise={clockwise}
        onToggle={setClockwise}
        size={compact ? 32 : 40}
      />
    </>
  );

  // Sans presets: une seule ligne
  if (!showPresets) {
    return (
      <View style={styles.container}>
        {renderControls()}
      </View>
    );
  }

  // DEAD CODE: Portrait 2-line layout (disabled due to orientation bug)
  // TODO: Re-enable when orientation switching is fixed
  // if (useVerticalLayout) {
  //   return (
  //     <View style={styles.container}>
  //       <View style={styles.controlsRow}>
  //         {renderControls()}
  //       </View>
  //       <View style={styles.presetsRow}>
  //         <DurationPresets
  //           currentDuration={currentDuration}
  //           onSelectDuration={handlePresetSelect}
  //           compact={compact}
  //         />
  //       </View>
  //     </View>
  //   );
  // }

  // Avec presets + landscape: 1 ligne
  return (
    <View style={styles.container}>
      <DurationPresets
        currentDuration={currentDuration}
        onSelectDuration={handlePresetSelect}
        compact={compact}
      />
      <View style={styles.separator} />
      {renderControls()}
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
  showPresets: PropTypes.bool,
};

export default ControlBar;
