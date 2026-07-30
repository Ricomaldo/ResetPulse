/**
 * @fileoverview Main TimeTimer component - orchestrates timer dial and controls
 * @created 2025-12-14
 * @updated 2025-12-14
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import PropTypes from 'prop-types';
// theme provider not used in this component
import { useTimerConfig } from '../../contexts/TimerConfigContext';
import { useTimerRemaining } from '../../contexts/TimerRemainingContext';
import { useCustomActivities } from '../../hooks/useCustomActivities';
import { rs, getComponentSizes } from '../../styles/responsive';
import useTimer from '../../hooks/useTimer';
import TimerDial from './TimerDial';
import { TIMER, getDialMode } from './timerConstants';
// PROTO drag-échelle (branche proto-drag-echelle)
import { snapToInterval } from '../../config/snap-settings';
import haptics from '../../utils/haptics';
import {
  deriveScaleMode,
  modeToScale,
  scaleToMode,
  getNextScaleUp,
  shouldEscalateOnRelease,
  resolveScaleFloor,
} from '../../utils/scaleHelpers';
import { useDevDragScale, DRAG_SCALE_MECHANICS } from '../../dev/DevDragScaleContext';

// PROTO drag-échelle — mécanique B : durée de maintien continu à la butée
// avant escalade en plein geste (~400 ms au mandat).
const HOLD_AT_EDGE_MS = 400;
// Tolérance de butée (minutes) : la valeur clampée atteint exactement le max
// quand le doigt pousse au-delà — l'epsilon n'absorbe que le bruit flottant.
const EDGE_EPSILON_MINUTES = 0.001;

export default function TimeTimer({
  onRunningChange,
  onTimerRef,
  onDialRef,
  onDialTap,
  onTimerComplete,
  distraction = null,
}) {
  const {
    timer: { clockwise, scaleMode, currentActivity, currentDuration },
    setCurrentDuration,
    palette: { currentColor },
    mode: { current: currentMode },
  } = useTimerConfig();
  // C4 (hotfix-porte-1) : timerRemaining vit à part — écrit à 60 Hz, il ne
  // doit plus faire re-rendre tout consommateur de useTimerConfig().
  const { setTimerRemaining } = useTimerRemaining();

  // Get custom activities for incrementing usage
  const { incrementUsage } = useCustomActivities();

  // Track if we've already incremented for current timer session
  const hasIncrementedUsage = useRef(false);

  // Track last synced context duration to prevent drag reset
  const lastSyncedContextDurationRef = useRef(currentDuration);

  // ========== PROTO drag-échelle (branche proto-drag-echelle) ==========
  // Mécanique sélectionnée au DevFab : 'off' | 'release' (A) | 'hold' (B).
  const { dragScaleMechanic } = useDevDragScale();
  const mechanicActive = dragScaleMechanic !== DRAG_SCALE_MECHANICS.OFF;

  // « Plancher d'échelle » (minutes, null = aucun) : maintient le cadran sur
  // une échelle SUPÉRIEURE à celle que deriveScaleMode donnerait pour la
  // durée courante — c'est lui qui matérialise l'escalade. Reset : règle
  // resolveScaleFloor (durée sous le max de l'échelle précédente), évaluée
  // au relâcher et quand le contexte pose une durée (Rituel). Il survit
  // volontairement au start/reset du timer : le cadran ne se recompose
  // jamais tout seul, seulement quand la durée change.
  const [scaleFloor, setScaleFloor] = useState(null);

  // Échelle GELÉE pendant le geste (minutes, null hors geste) : posée au
  // premier événement de drag, elle fige le cadran pour toute la durée du
  // geste — la dérivation (qui redescendrait l'échelle en direct quand on
  // tire vers le bas) n'agit qu'au relâcher. Ref et non state : sa valeur au
  // gel == l'échelle déjà affichée, aucun re-rendu n'est nécessaire.
  const gestureScaleRef = useRef(null);

  // Mécanique B : timer de maintien à la butée (null = pas armé). Armé quand
  // la valeur clampée atteint le max de l'échelle du geste, désarmé dès que
  // la durée quitte la butée ou que le geste se termine.
  const holdTimerRef = useRef(null);
  const clearHoldTimer = useCallback(() => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
  }, []);
  useEffect(() => clearHoldTimer, [clearHoldTimer]); // cleanup au démontage

  // Animation « le cadran respire » : pulse ponctuel (jamais continu) quand
  // l'échelle se recompose au relâcher — contrainte sensorielle TDAH/TSA.
  const breatheAnim = useRef(new Animated.Value(1)).current;
  const runBreathe = useCallback(() => {
    Animated.sequence([
      Animated.timing(breatheAnim, { toValue: 0.96, duration: 120, useNativeDriver: true }),
      Animated.timing(breatheAnim, { toValue: 1, duration: 220, useNativeDriver: true }),
    ]).start();
  }, [breatheAnim]);

  // Échelle effective rendue : max(dérivée du contexte, plancher, gel du
  // geste). OFF : échelle du contexte, comportement actuel intact.
  const derivedScale = modeToScale(scaleMode);
  const effectiveScale = mechanicActive
    ? Math.max(derivedScale, scaleFloor || 0, gestureScaleRef.current || 0)
    : derivedScale;
  const effectiveScaleMode = scaleToMode(effectiveScale);
  // ======================================================================

  // Initialize timer with current duration or default
  const timer = useTimer(currentDuration || TIMER.DEFAULT_DURATION, onTimerComplete);

  // Refs for stable access to timer methods (avoid recreating callbacks on timer object changes)
  const timerRef = useRef(timer);
  // Sync timer ref on every render
  timerRef.current = timer;

  // Refs for onboarding
  const dialWrapperRef = useRef(null);

  // Pass timer ref to parent if needed
  useEffect(() => {
    if (onTimerRef) {
      onTimerRef(timer);
    }
  }, [onTimerRef, timer]); // Include timer to avoid stale references

  // Pass dial ref to parent (pass .current directly)
  useEffect(() => {
    if (onDialRef && dialWrapperRef.current) {
      onDialRef(dialWrapperRef.current);
    }
  }, [onDialRef]);

  // Update timer duration when currentDuration changes from context (NOT from drag)
  useEffect(() => {
    // Only sync if context duration changed since last sync (ignores local drag changes)
    if (currentDuration && currentDuration !== lastSyncedContextDurationRef.current) {
      timer.setDuration(currentDuration);
      lastSyncedContextDurationRef.current = currentDuration;
      // PROTO drag-échelle : une durée posée par le contexte (ex. Rituel)
      // ré-évalue le plancher — un Rituel de 10 min ne doit pas rester
      // affiché sur un cadran 45 min escaladé plus tôt.
      setScaleFloor((floor) => resolveScaleFloor(floor, currentDuration));
    }
  }, [currentDuration, timer.setDuration]); // REMOVED timer.duration to prevent drag reset

  // Notify parent of running state changes
  useEffect(() => {
    if (onRunningChange) {
      onRunningChange(timer.running);
    }
  }, [timer.running, onRunningChange]);

  // Publie timerRemaining (TimerRemainingContext, hotfix-porte-1 C4) — audit
  // 30/07 : aucun consommateur actuel ne LIT cette valeur (TopTime est
  // alimenté par le pont local timerRef/snapshot de TimerScreen depuis B3/D3,
  // pas par ce contexte). Gardé en écriture pour un futur consommateur ; le
  // point important du fix est qu'elle n'était plus dans le useMemo géant.
  useEffect(() => {
    setTimerRemaining(timer.remaining);
  }, [timer.remaining, setTimerRemaining]);

  // Increment custom activity usage when timer starts
  useEffect(() => {
    if (timer.running && currentActivity?.isCustom && !hasIncrementedUsage.current) {
      incrementUsage(currentActivity.id);
      hasIncrementedUsage.current = true;
    }

    // Reset flag when timer stops (not running and not paused)
    if (!timer.running && timer.remaining === 0) {
      hasIncrementedUsage.current = false;
    }
  }, [timer.running, timer.remaining, currentActivity, incrementUsage]);

  // Get responsive dimensions - zen mode: timer dominates. Le cadran ne se
  // remonte jamais au changement de mode (state machine préservée) — seule
  // sa taille varie (Focus C4 : dial seul, il respire davantage).
  const { timerCircle } = getComponentSizes(currentMode);
  const circleSize = timerCircle; // No max limit - let it breathe

  const styles = StyleSheet.create({
    container: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: rs(20, 'height'),
    },

    timerWrapper: {
      alignItems: 'center',
      height: circleSize,
      justifyContent: 'center',
      position: 'relative',
      width: circleSize,
    },
  });

  /**
   * Handle drag/tap on dial to set duration
   * Smooth drag during interaction, subtle snap on release
   * Allows adjustment even while running (user can "cheat" +/- time)
   * @param {number} minutes - Raw minutes value from dial interaction
   * @param {boolean} isRelease - True if this is the final value (release), false if dragging
   */
  const handleGraduationTap = useCallback((minutes, isRelease = false) => {
    // ========== OFF : comportement actuel (saturé), intact ==========
    // scaleMode vient du contexte, désormais DÉRIVÉ de currentDuration
    // (hotfix-porte-1 B2, deriveScaleMode). Limite structurelle : `minutes`
    // arrive déjà borné par TimerDial (handlePanUpdate clampe à
    // `dial.maxMinutes` de l'échelle EN COURS) — un drag continu sature au
    // max courant, impossible d'atteindre l'échelle supérieure. C'est
    // exactement ce que les deux mécaniques proto ci-dessous attaquent.
    if (!mechanicActive) {
      const dialMode = getDialMode(scaleMode);
      const clampedMinutes = Math.max(0, Math.min(dialMode.maxMinutes, minutes));
      let newDuration = clampedMinutes * 60;
      newDuration = isRelease
        ? snapToInterval(newDuration, scaleMode)
        : Math.round(newDuration);

      timerRef.current.setDuration(newDuration);
      setCurrentDuration(newDuration);
      lastSyncedContextDurationRef.current = newDuration;
      return;
    }

    // ========== PROTO drag-échelle (mécaniques A et B) ==========
    const baseScale = Math.max(modeToScale(scaleMode), scaleFloor || 0);

    if (!isRelease && gestureScaleRef.current == null) {
      // Gel : première frame du drag — l'échelle du début du geste tient
      // jusqu'au relâcher (hystérésis, la dérivation n'agit qu'à la fin).
      gestureScaleRef.current = baseScale;
    }
    // Échelle du geste : le gel, éventuellement relevé par un plancher posé
    // en plein geste (mécanique B). Pour un tap sec (jamais de gel), c'est
    // l'échelle affichée.
    const gestureScale = Math.max(gestureScaleRef.current || baseScale, scaleFloor || 0);
    const gestureScaleMode = scaleToMode(gestureScale);

    const clampedMinutes = Math.max(0, Math.min(gestureScale, minutes));
    let newDuration = clampedMinutes * 60;
    newDuration = isRelease
      ? snapToInterval(newDuration, gestureScaleMode)
      : Math.round(newDuration);

    timerRef.current.setDuration(newDuration);
    setCurrentDuration(newDuration);
    lastSyncedContextDurationRef.current = newDuration;

    if (!isRelease) {
      // ---------- Mécanique B « Maintien au bord » ----------
      // Le doigt tient la butée (valeur clampée == max du geste) pendant
      // HOLD_AT_EDGE_MS continus → escalade EN PLEIN GESTE : haptic net,
      // le cadran se recompose UNE fois (setScaleFloor → re-rendu), la durée
      // ne bouge pas — c'est l'angle qui se recale (ré-ancrage tactile côté
      // TimerDial, prop resyncTouchOnScaleChange). Le timer est désarmé dès
      // que la durée quitte la butée.
      if (dragScaleMechanic === DRAG_SCALE_MECHANICS.HOLD) {
        const atEdge = clampedMinutes >= gestureScale - EDGE_EPSILON_MINUTES;
        const next = getNextScaleUp(gestureScale);
        if (atEdge && next) {
          if (!holdTimerRef.current) {
            holdTimerRef.current = setTimeout(() => {
              holdTimerRef.current = null;
              gestureScaleRef.current = next;
              setScaleFloor(next);
              haptics.impact('medium').catch(() => {});
            }, HOLD_AT_EDGE_MS);
          }
        } else {
          clearHoldTimer();
        }
      }
      return;
    }

    // ---------- Relâcher ----------
    clearHoldTimer();
    const wasDrag = gestureScaleRef.current != null;
    let nextFloor = scaleFloor;

    // Mécanique A « Relâche et ça respire » : relâché au max de l'échelle du
    // geste → le plancher passe au cran supérieur. Seulement après un vrai
    // drag (un tap posé pile au max ne déclenche pas — mandat : pan end).
    if (
      dragScaleMechanic === DRAG_SCALE_MECHANICS.RELEASE &&
      wasDrag &&
      shouldEscalateOnRelease(newDuration, gestureScale)
    ) {
      nextFloor = getNextScaleUp(gestureScale);
    }

    // Reset du plancher (mandat) : la durée est descendue sous le max de
    // l'échelle précédente → le plancher saute, la dérivation reprend.
    nextFloor = resolveScaleFloor(nextFloor, newDuration);

    // Recomposition ponctuelle du cadran au relâcher (montée mécanique A,
    // redescente par dérivation, ou tap qui fait sauter le plancher) : une
    // respiration + un haptic doux — jamais pendant le geste.
    const finalScale = Math.max(
      modeToScale(deriveScaleMode(newDuration)),
      nextFloor || 0
    );
    if (finalScale !== gestureScale) {
      haptics.selection().catch(() => {});
      runBreathe();
    }

    if (nextFloor !== scaleFloor) {
      setScaleFloor(nextFloor);
    }
    gestureScaleRef.current = null;
  }, [mechanicActive, dragScaleMechanic, scaleMode, scaleFloor, setCurrentDuration, runBreathe, clearHoldTimer]);

  return (
    <View style={styles.container}>
      {/* Timer Circle — Animated.View : respiration ponctuelle du proto
          drag-échelle (scale 1 → 0.96 → 1 au recomposer, valeur fixe à 1
          hors événement, aucun redessin continu) */}
      <View ref={dialWrapperRef} style={styles.timerWrapper}>
        <Animated.View style={{ transform: [{ scale: breatheAnim }] }}>
          <TimerDial
            progress={timer.progress}
            duration={timer.duration}
            remaining={timer.remaining}
            color={currentColor}
            size={circleSize}
            clockwise={clockwise}
            scaleMode={effectiveScaleMode}
            activityEmoji={currentActivity?.emoji}
            isRunning={timer.running}
            onGraduationTap={handleGraduationTap}
            onDialTap={onDialTap}
            isCompleted={timer.isCompleted}
            currentActivity={currentActivity}
            showNumbers={true}
            showGraduations={true}
            distraction={distraction}
            resyncTouchOnScaleChange={mechanicActive}
          />
        </Animated.View>

        {/* Message Overlay - removed, icon in center replaces this info */}
      </View>
    </View>
  );
}

TimeTimer.propTypes = {
  onRunningChange: PropTypes.func,
  onTimerRef: PropTypes.func,
  onDialRef: PropTypes.func,
  onDialTap: PropTypes.func,
  onTimerComplete: PropTypes.func,
  distraction: PropTypes.shape({ movement: PropTypes.string, variant: PropTypes.object }),
};
