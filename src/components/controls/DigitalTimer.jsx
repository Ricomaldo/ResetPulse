/**
 * @fileoverview DigitalTimer - Affichage temps unifié (ADR-004 révisé)
 * @description Deux modes: duration (ControlBar) ou remaining (Dial zone)
 * @created 2025-12-19
 * @updated 2025-12-19
 */
import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { TouchableOpacity } from '@gorhom/bottom-sheet';
import PropTypes from 'prop-types';
import { useTheme } from '../../theme/ThemeProvider';
import { useTimerConfig } from '../../contexts/TimerConfigContext';
import { useTranslation } from '../../hooks/useTranslation';
import { rs } from '../../styles/responsive';
import haptics from '../../utils/haptics';
import Icons from '../layout/Icons';
import { IconButton } from '../buttons';

/**
 * Format time from seconds to MM:SS
 */
function formatTime(seconds) {
  const totalSeconds = Math.floor(seconds);
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

/**
 * DigitalTimer - Affichage temps avec contrôles optionnels
 *
 * Deux modes:
 * 1. Duration mode (ControlBar): affiche durée configurée avec +/-
 * 2. Remaining mode (Dial zone): affiche temps restant, display only
 *
 * @param {number} duration - Durée configurée en secondes (mode duration)
 * @param {number} remaining - Temps restant en secondes (mode remaining, prioritaire)
 * @param {number} maxDuration - Durée max (échelle cadran) en secondes
 * @param {boolean} showControls - Afficher les boutons +/- (default: true sauf si remaining)
 * @param {function} onDurationChange - Callback avec (newDuration)
 * @param {function} onScaleUpgrade - Callback pour upgrade cadran quand durée = max
 * @param {boolean} isRunning - Timer en cours (pour style)
 * @param {boolean} isCollapsed - Afficher icône au lieu du temps (mode remaining)
 * @param {boolean} compact - Mode compact
 */
const DigitalTimer = React.memo(function DigitalTimer({
  duration = 0,
  remaining,
  maxDuration = 3600,
  showControls,
  onDurationChange,
  onScaleUpgrade,
  isRunning = false,
  isCollapsed = false,
  compact = false,
  scaleMode: _scaleMode = '60min',
}) {
  const theme = useTheme();
  const t = useTranslation();
  const { display: { showTime }, setShowTime } = useTimerConfig();
  const intervalRef = useRef(null);
  const repeatCountRef = useRef(0);
  const tapSnapTimeoutRef = useRef(null);
  const isLongPressingRef = useRef(false);
  const pressStartTimeRef = useRef(null);
  const pressTimeoutRef = useRef(null);
  const currentDurationRef = useRef(duration);
  const isLongPressActiveRef = useRef(false);
  const longPressStartTimeRef = useRef(null);

  // Mettre à jour le ref à chaque changement de duration
  useEffect(() => {
    currentDurationRef.current = duration;
  }, [duration]);

  // Determine mode: remaining (display only) or duration (with controls)
  const isRemainingMode = remaining !== undefined;
  const displayValue = isRemainingMode ? remaining : duration;
  const shouldShowControls = showControls ?? !isRemainingMode;

  // Steps
  const tapStep = 1; // Tap simple = ±1s pour réglage fin
  // const minorStep = SNAP_INTERVALS[scaleMode] ?? 60; // Long-press base step (accéléré ensuite) - unused

  // Accélération long-press agressive
  // Plus on maintient, plus les incréments sont grands
  const getAcceleratedStep = () => {
    if (!longPressStartTimeRef.current) {
      return 1;
    }

    const elapsedSeconds = (Date.now() - longPressStartTimeRef.current) / 1000;

    // Phase 1 (0-0.5s): +1s réglage fin
    if (elapsedSeconds < 0.5) {
      return 1;
    }
    // Phase 2 (0.5-1.5s): +5s
    if (elapsedSeconds < 1.5) {
      return 5;
    }
    // Phase 3 (1.5-3s): +15s
    if (elapsedSeconds < 3) {
      return 15;
    }
    // Phase 4 (3-5s): +30s
    if (elapsedSeconds < 5) {
      return 30;
    }
    // Phase 5 (5s+): +60s
    return 60;
  };

  // Accélération de l'intervalle : plus on maintient, plus c'est rapide
  const getAcceleratedInterval = () => {
    const r = repeatCountRef.current || 0;

    // Accélération très agressive
    if (r < 3) return 60;  // Début rapide
    if (r < 8) return 40;  // Accélère vite
    if (r < 15) return 25; // Très rapide
    return 15;             // Ultra rapide
  };

  // Apply a change with clamp and optional haptic
  // Utilise currentDurationRef pour avoir la valeur actuelle même dans les closures
  const applyChange = (deltaSeconds, withHaptic = true) => {
    if (!onDurationChange) {
      return;
    }
    const current = currentDurationRef.current;
    const proposed = current + deltaSeconds;
    const clamped = Math.max(0, Math.min(maxDuration, proposed));
    if (clamped !== current) {
      currentDurationRef.current = clamped;
      onDurationChange(clamped);
      if (withHaptic) {
        haptics.selection();
      }
    }
  };

  // Note: Les fonctions de snap ont été retirées car le snap est réservé au drag du dial.
  // Les boutons +/- permettent un réglage fin seconde par seconde sans contrainte de snap.

  const handleIncrement = () => {
    if (!onDurationChange) {
      return;
    }

    if (duration >= maxDuration && onScaleUpgrade) {
      const upgraded = onScaleUpgrade();
      if (upgraded) {
        onDurationChange(duration + tapStep);
        haptics.selection();
      }
      return;
    }

    applyChange(tapStep, true);
    // Pas de snap : les boutons permettent un réglage fin seconde par seconde
  };

  const handleDecrement = () => {
    if (!onDurationChange) {
      return;
    }

    applyChange(-tapStep, true);
    // Pas de snap : les boutons permettent un réglage fin seconde par seconde
  };

  // Handle timer tap to toggle time visibility
  const handleTimerTap = () => {
    setShowTime(!showTime);
    haptics.selection();
  };

  // Silent variants for long-press auto repeat (haptics at finalize only)
  // Utilise getAcceleratedStep pour déterminer le pas d'incrémentation intelligent
  const handleIncrementSilent = () => {
    const step = getAcceleratedStep();
    applyChange(step, false);
  };
  const handleDecrementSilent = () => {
    const step = getAcceleratedStep();
    applyChange(-step, false);
  };

  const handlePressIn = (action, tapAction) => {
    pressStartTimeRef.current = Date.now();
    isLongPressingRef.current = false;

    // Démarrer un timer pour détecter le long press
    pressTimeoutRef.current = setTimeout(() => {
      // Long press détecté
      isLongPressingRef.current = true;
      pressTimeoutRef.current = null;
      startLongPress(action);
    }, 300);
  };

  const handlePressOut = (tapAction) => {
    const now = Date.now();
    const pressDuration = pressStartTimeRef.current ? now - pressStartTimeRef.current : 0;

    // Annuler le timer de long press s'il n'a pas encore été déclenché
    if (pressTimeoutRef.current) {
      clearTimeout(pressTimeoutRef.current);
      pressTimeoutRef.current = null;
    }

    // Si c'était un tap simple (moins de 300ms), déclencher l'action tap
    if (!isLongPressingRef.current && pressDuration < 300) {
      tapAction();
    }

    // Arrêter le long press si actif
    if (isLongPressingRef.current) {
      stopLongPress();
    }

    pressStartTimeRef.current = null;
  };

  const startLongPress = (action) => {
    repeatCountRef.current = 0;
    isLongPressActiveRef.current = true;
    longPressStartTimeRef.current = Date.now(); // Enregistrer le temps de début
    action(); // Première action immédiate
    
    // Fonction récursive pour gérer l'accélération progressive
    const scheduleNext = () => {
      if (!isLongPressActiveRef.current) {
        return; // Arrêté
      }
      
      repeatCountRef.current++;
      const interval = getAcceleratedInterval();
      
      intervalRef.current = setTimeout(() => {
        if (!isLongPressActiveRef.current) {
          return; // Arrêté entre-temps
        }
        action();
        scheduleNext(); // Programmer le suivant avec le nouvel intervalle
      }, interval);
    };
    
    // Démarrer la séquence
    scheduleNext();
  };

  const stopLongPress = () => {
    // Arrêter le timeout de répétition sans appliquer de snap
    // Le snap est réservé au drag du dial, pas aux boutons d'incrémentation
    isLongPressActiveRef.current = false;
    longPressStartTimeRef.current = null; // Réinitialiser le temps de début
    if (intervalRef.current) {
      clearTimeout(intervalRef.current);
      intervalRef.current = null;
      repeatCountRef.current = 0;
    }
    if (tapSnapTimeoutRef.current) {
      clearTimeout(tapSnapTimeoutRef.current);
      tapSnapTimeoutRef.current = null;
    }
    isLongPressingRef.current = false;
    
    // Haptique de confirmation à la fin du long press
    haptics.selection();
  };

  // Sizes
  const fontSize = compact ? rs(20) : rs(26);
  const gap = compact ? rs(4) : rs(6); // Rapproché pour resserrer -/+
  const pillHeight = isCollapsed ? rs(40) : rs(44);

  const styles = StyleSheet.create({
    collapsedContainer: {
      alignItems: 'center',
      backgroundColor: theme.colors.background,
      height: pillHeight,
      justifyContent: 'center',
      paddingHorizontal: rs(12),
    },
    container: {
      alignItems: 'center',
      flexDirection: 'row',
      flex: !shouldShowControls ? 1 : undefined,
      gap: gap,
      justifyContent: 'center', // Flex to center properly when buttons hidden
    },
    timeText: {
      color: isRemainingMode
        ? theme.colors.brand.secondary
        : theme.colors.textSecondary,
      fontFamily: Platform.select({
        ios: 'Menlo',
        android: 'monospace',
      }),
      fontSize: fontSize,
      fontVariant: ['tabular-nums'],
      fontWeight: '600',
      minWidth: compact ? rs(70) : rs(90),
      opacity: 1,
      textAlign: 'center',
    },
    timerWrapper: {
      minWidth: compact ? rs(70) : rs(90),
      alignItems: 'center',
      justifyContent: 'center',
    },
  });

  const formattedTime = formatTime(displayValue);

  // Collapsed mode (icon only) - for remaining mode
  if (isCollapsed) {
    return (
      <View style={styles.collapsedContainer} accessible accessibilityRole="timer">
        <Icons name="timer" size={rs(24)} color={theme.colors.brand.secondary} />
      </View>
    );
  }

  // Full mode with controls - always rendered to prevent layout shift
  // When showControls=false or showTime=false, buttons are invisible and non-interactive
  return (
    <View style={styles.container}>
      <IconButton
        icon="minus"
        variant="ghost"
        size={compact ? 'small' : 'medium'}
        shape="circular"
        onPressIn={() => handlePressIn(handleDecrementSilent, handleDecrement)}
        onPressOut={() => handlePressOut(handleDecrement)}
        onPress={() => {}} // No-op, actual action handled via press handlers
        disabled={!shouldShowControls || !showTime}
        accessibilityLabel={t('controls.digitalTimer.decreaseDuration')}
        style={(!shouldShowControls || !showTime) && { opacity: 0 }}
      />

      <TouchableOpacity
        onPress={handleTimerTap}
        accessible
        accessibilityRole="button"
        accessibilityLabel={showTime ? (isRemainingMode ? t('controls.digitalTimer.timeLabel', { time: formattedTime }) : t('controls.digitalTimer.durationLabel', { time: formattedTime })) : t('controls.digitalTimer.showTime')}
        accessibilityHint={showTime ? t('controls.digitalTimer.tapToHide') : t('controls.digitalTimer.tapToShow')}
        activeOpacity={0.7}
        style={styles.timerWrapper}
      >
        {showTime ? (
          <Text
            style={styles.timeText}
            accessible={false}
          >
            {formattedTime}
          </Text>
        ) : (
          <Icons
            name="eyeOff"
            size={rs(24)}
            color={theme.colors.textSecondary}
          />
        )}
      </TouchableOpacity>

      <IconButton
        icon="plus"
        variant="ghost"
        size={compact ? 'small' : 'medium'}
        shape="circular"
        onPressIn={() => handlePressIn(handleIncrementSilent, handleIncrement)}
        onPressOut={() => handlePressOut(handleIncrement)}
        onPress={() => {}} // No-op, actual action handled via press handlers
        disabled={!shouldShowControls || !showTime}
        accessibilityLabel={t('controls.digitalTimer.increaseDuration')}
        style={(!shouldShowControls || !showTime) && { opacity: 0 }}
      />
    </View>
  );
});

DigitalTimer.displayName = 'DigitalTimer';
DigitalTimer.propTypes = {
  scaleMode: PropTypes.string,
  compact: PropTypes.bool,
  duration: PropTypes.number,
  isCollapsed: PropTypes.bool,
  isRunning: PropTypes.bool,
  maxDuration: PropTypes.number,
  onDurationChange: PropTypes.func,
  onScaleUpgrade: PropTypes.func,
  remaining: PropTypes.number,
  showControls: PropTypes.bool,
};

export default DigitalTimer;
