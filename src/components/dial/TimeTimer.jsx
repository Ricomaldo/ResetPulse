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
import { useCustomActivities } from '../../hooks/useCustomActivities';
import { useScreenOrientation } from '../../hooks/useScreenOrientation';
import { rs, getComponentSizes } from '../../styles/responsive';
import useTimer from '../../hooks/useTimer';
import TimerDial from './TimerDial';
import { TIMER } from './timerConstants';
import { snapToInterval } from '../../config/snap-settings';
import haptics from '../../utils/haptics';
import {
  modeToScale,
  scaleToMode,
  getNextScaleUp,
  shouldEscalateOnRelease,
} from '../../utils/scaleHelpers';

// Mandat P1 (2e tentative, crash « Maximum update depth exceeded » au drag) :
// chaque MOVE appelait setCurrentDuration → TimerConfigContext reconstruit
// tout son `value` (useMemo géant, ~15 consommateurs re-rendus) + un write
// AsyncStorage (usePersistedObject) — en drag rapide ces passes s'empilent
// plus vite que React ne les digère. Le commit vers le contexte est throttlé
// pendant le geste (cf. handleGraduationTap) ; l'arc, lui, reste fluide via
// l'état LOCAL de useTimer (timerRef.setDuration), appelé à chaque frame,
// jamais throttlé.
const CONTEXT_PUSH_THROTTLE_MS = 130;

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
  // Get custom activities for incrementing usage
  const { incrementUsage } = useCustomActivities();

  // Track if we've already incremented for current timer session
  const hasIncrementedUsage = useRef(false);

  // Track last synced context duration to prevent drag reset
  const lastSyncedContextDurationRef = useRef(currentDuration);
  // Horodatage du dernier commit vers le contexte (throttle MOVE, mandat P1)
  const lastContextPushTsRef = useRef(0);

  // ========== Drag-échelle « Relâcher » (porte-3 V3) ==========
  // Verdict Eric 30/07 soir, inversé en main : le Maintien (hold 400 ms à la
  // butée) se comportait bizarrement — le Relâcher (escalade au
  // relâcher-au-max, respiration + haptic doux) était la bonne. LA DESCENTE
  // AUTOMATIQUE RESTE MORTE — un cadran ne rétrécit jamais tout seul (15 min
  // sur un cadran d'une heure = un quart d'arc, fidèle à l'objet physique).
  //
  // « Plancher d'échelle » (minutes, null = aucun) : maintient le cadran sur
  // une échelle SUPÉRIEURE à celle que deriveScaleMode donnerait — posé par
  // l'escalade au relâcher, il ne redescend JAMAIS par le drag. Seul un
  // CHANGEMENT DE CONTEXTE le réinitialise : appliquer un Rituel (durée
  // posée par le contexte), changer d'Activité, relancer l'app (non
  // persisté). Chaque recomposition du cadran a une cause visible.
  const [scaleFloor, setScaleFloor] = useState(null);

  // Échelle GELÉE pendant le geste (minutes, null hors geste) : posée au
  // premier événement de drag, elle fige le cadran pour toute la durée du
  // geste — la dérivation (qui redescendrait l'échelle en direct quand on
  // tire vers le bas) n'agit qu'au relâcher. Ref et non state : sa valeur au
  // gel == l'échelle déjà affichée, aucun re-rendu n'est nécessaire.
  const gestureScaleRef = useRef(null);

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
  const effectiveScale = Math.max(derivedScale, scaleFloor || 0, gestureScaleRef.current || 0);
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

  // Pass timer ref to parent if needed.
  // Fix crash « Maximum update depth exceeded » (drag rapide, lot-fix-drag) :
  // dépendre de `timer` (objet neuf à CHAQUE render de useTimer) refirait cet
  // effet à chaque render — au repos, chaque tick de drag redéclenche
  // setCurrentDuration → resync remaining → nouvel objet timer → effet →
  // parent → setState, empilé plus vite que React ne digère en drag rapide.
  // On dépend des PRIMITIFS réellement consommés en aval (le parent ne lit
  // que running/remaining/isCompleted/displayMessage) : l'effet ne fire que
  // sur changement RÉEL. On notifie avec timerRef.current (déjà resynchronisé
  // chaque render, ligne 99) pour que le parent reçoive l'objet frais malgré
  // la dépendance restreinte.
  useEffect(() => {
    if (onTimerRef) {
      onTimerRef(timerRef.current);
    }
  }, [onTimerRef, timer.running, timer.remaining, timer.isCompleted, timer.displayMessage]);

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
      // Changement de contexte (Rituel qui pose sa durée) : SEUL cas où le
      // plancher saute — le cadran se recompose sur l'échelle dérivée de la
      // nouvelle durée. La descente automatique au drag est morte (porte-2).
      // La recomposition est un événement : respiration + haptic doux.
      if (scaleFloor != null) {
        haptics.selection().catch(() => {});
        runBreathe();
      }
      setScaleFloor(null);
    }
  }, [currentDuration, timer.setDuration, scaleFloor, runBreathe]); // REMOVED timer.duration to prevent drag reset

  // Notify parent of running state changes
  useEffect(() => {
    if (onRunningChange) {
      onRunningChange(timer.running);
    }
  }, [timer.running, onRunningChange]);

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

  // Continuité paysage (3c) : `getComponentSizes`/`rs` relisent
  // Dimensions.get('window') à CHAQUE appel (déjà vrai), mais rien ne
  // déclenchait de re-render à la rotation quand le timer est à l'arrêt
  // (running déclenche déjà un re-render ~1/s via useTimer). useWindowDimensions
  // (via useScreenOrientation, hook déjà présent mais orphelin) s'abonne aux
  // changements d'orientation — le disque suit la rotation même au repos.
  useScreenOrientation();

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
    // exactement ce que la mécanique « Relâcher » ci-dessous attaque.
    // ========== Drag-échelle « Relâcher » (porte-3 V3) ==========
    const baseScale = Math.max(modeToScale(scaleMode), scaleFloor || 0);

    if (!isRelease && gestureScaleRef.current == null) {
      // Gel : première frame du drag — l'échelle du début du geste tient
      // jusqu'au relâcher (hystérésis, la dérivation n'agit qu'à la fin).
      gestureScaleRef.current = baseScale;
    }
    // Échelle du geste : le gel. Pour un tap sec (jamais de gel), c'est
    // l'échelle affichée.
    const gestureScale = Math.max(gestureScaleRef.current || baseScale, scaleFloor || 0);
    const gestureScaleMode = scaleToMode(gestureScale);

    const clampedMinutes = Math.max(0, Math.min(gestureScale, minutes));
    let newDuration = clampedMinutes * 60;
    newDuration = isRelease
      ? snapToInterval(newDuration, gestureScaleMode)
      : Math.round(newDuration);

    // L'arc anime à CHAQUE frame via l'état LOCAL de useTimer — jamais
    // throttlé, c'est le geste que le doigt voit (mandat P1).
    timerRef.current.setDuration(newDuration);

    if (isRelease) {
      // Commit FINAL systématique vers le contexte — jamais avalé par le
      // throttle ci-dessous, sinon la dernière position du doigt ne
      // rejoindrait jamais TimerConfigContext. `lastSyncedContextDurationRef`
      // est mis à jour dans la MÊME passe (avant que le re-render du contexte
      // n'arrive) pour que l'effet de resync contexte→timer (l.~129, garde
      // `currentDuration !== lastSyncedContextDurationRef.current`) reconnaisse
      // ce changement comme le sien et ne le rejoue pas à contretemps.
      setCurrentDuration(newDuration);
      lastSyncedContextDurationRef.current = newDuration;
      lastContextPushTsRef.current = Date.now();
    } else {
      // MOVE : commit vers le contexte throttlé (~130 ms) — c'est
      // l'amplificateur (TimerConfigContext reconstruit tout son `value` +
      // write AsyncStorage à chaque appel). Le chiffre du haut (TopTime, lu
      // au repos) suit par crans plutôt que par frame ; le geste lui-même
      // reste fluide (ligne ci-dessus, jamais throttlée). Même règle que le
      // relâcher : `lastSyncedContextDurationRef` bouge SEULEMENT quand
      // setCurrentDuration est réellement appelé, jamais avant — sinon le
      // garde de resync (l.~129) désynchronise sa référence d'un contexte
      // qui n'a pas encore changé.
      const now = Date.now();
      if (now - lastContextPushTsRef.current >= CONTEXT_PUSH_THROTTLE_MS) {
        setCurrentDuration(newDuration);
        lastSyncedContextDurationRef.current = newDuration;
        lastContextPushTsRef.current = now;
      }
      // En plein geste : rien d'autre — le cadran ne se recompose JAMAIS
      // sous le doigt (le Maintien 400 ms est mort, porte-3 V3).
      return;
    }

    // ---------- Relâcher ----------
    // Mécanique « Relâche et ça respire » : relâché au max de l'échelle du
    // geste après un VRAI drag (un tap posé pile au max ne déclenche pas)
    // → le plancher passe au cran supérieur, le cadran se recompose UNE
    // fois — respiration + haptic doux, la durée ne bouge pas. Pas de
    // descente automatique : le plancher tient quelle que soit la durée
    // relâchée.
    const wasDrag = gestureScaleRef.current != null;
    if (wasDrag && shouldEscalateOnRelease(newDuration, gestureScale)) {
      const next = getNextScaleUp(gestureScale);
      setScaleFloor(next);
      haptics.selection().catch(() => {});
      runBreathe();
    }
    gestureScaleRef.current = null;
  }, [scaleMode, scaleFloor, setCurrentDuration, runBreathe]);

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
            resyncTouchOnScaleChange={true}
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
