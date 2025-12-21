// src/hooks/useTimer.js
import { useState, useEffect, useRef, useCallback } from 'react';
import { AppState, AccessibilityInfo } from 'react-native';
import haptics from '../utils/haptics';
import { TIMER } from '../components/dial/timerConstants';
import useSimpleAudio from './useSimpleAudio';
import useNotificationTimer from './useNotificationTimer';
import { useTimerConfig } from '../contexts/TimerConfigContext';
import { useTranslation } from './useTranslation';
import analytics from '../services/analytics';

export default function useTimer(initialDuration = 240, onComplete) {
  // Translation hook for accessibility announcements
  const t = useTranslation();

  // Core timer states
  const [duration, setDuration] = useState(initialDuration);
  const [remaining, setRemaining] = useState(initialDuration);
  const [running, setRunning] = useState(false);
  const [startTime, setStartTime] = useState(null);

  // UI states
  const [hasCompleted, setHasCompleted] = useState(false);

  // Get selected sound, activity durations, and palette info from context
  const {
    timer: { selectedSoundId, currentActivity },
    stats: { activityDurations },
    saveActivityDuration,
    palette: { currentPalette, currentColor },
  } = useTimerConfig();

  // Audio with selected sound - using simple audio hook
  const { playSound } = useSimpleAudio(selectedSoundId);
  const playSoundRef = useRef(playSound);
  // Sync ref on every render (playSound changes when audio state changes)
  playSoundRef.current = playSound;

  // Use refs for values that don't affect timer calculation but are needed for callbacks/analytics
  const currentActivityRef = useRef(currentActivity);
  const onCompleteRef = useRef(onComplete);
  const currentPaletteRef = useRef(currentPalette);
  const currentColorRef = useRef(currentColor);

  // Sync refs directly (no effect needed - these don't trigger re-renders)
  currentActivityRef.current = currentActivity;
  onCompleteRef.current = onComplete;
  currentPaletteRef.current = currentPalette;
  currentColorRef.current = currentColor;

  // Notifications pour background
  const { scheduleTimerNotification, cancelTimerNotification } = useNotificationTimer();

  // Refs
  const intervalRef = useRef(null);
  const rafRef = useRef(null);
  const isMountedRef = useRef(true);
  const hasTriggeredCompletion = useRef(false);
  const appStateRef = useRef(AppState.currentState);
  const wasInBackgroundRef = useRef(false);
  const isInForegroundRef = useRef(AppState.currentState === 'active');

  // Timer update function with hybrid foreground/background support
  const updateTimer = useCallback(() => {
    if (!isMountedRef.current || !running || !startTime) {return;}

    const now = Date.now();
    const elapsed = Math.floor((now - startTime) / 1000);
    const newRemaining = Math.max(0, duration - elapsed);

    setRemaining(newRemaining);

    if (newRemaining > 0 && running) {
      // Hybrid approach: Use RAF for smooth foreground, setTimeout for battery-efficient background
      if (isInForegroundRef.current) {
        // Foreground: Use requestAnimationFrame for smooth 60Hz updates
        rafRef.current = requestAnimationFrame(updateTimer);
      } else {
        // Background: Use 1000ms setTimeout for battery efficiency
        intervalRef.current = setTimeout(updateTimer, 1000);
      }
    } else if (newRemaining === 0) {
      // Timer finished - reset states properly
      setRunning(false);
      setStartTime(null);

      // Trigger completion feedback (only once)
      if (!hasTriggeredCompletion.current) {
        hasTriggeredCompletion.current = true;
        setHasCompleted(true);

        // Track timer completion
        analytics.trackTimerCompleted(duration, currentActivityRef.current, 100);

        // Vérifier si l'app était en background (notification a déjà sonné)
        const skipSound = wasInBackgroundRef.current;

        if (__DEV__) {
          console.warn(`🔔 Timer terminé. App était en background: ${skipSound}`);
        }

        // Feedback synchronisé : Audio + Haptic en parallèle
        // IMPORTANT: Skip audio si l'app était en background (notification a déjà sonné)
        const feedbackPromises = [];

        // Audio feedback - PRIORITÉ ABSOLUE (skip si notification a déjà sonné)
        if (!skipSound && playSoundRef.current) {
          feedbackPromises.push(
            playSoundRef.current(selectedSoundId).catch(() => {
              // Silent fail for audio
            })
          );
        }

        // Haptic feedback - Enhancement
        feedbackPromises.push(
          haptics.notification('success').catch(() => {
            // Silently fail - haptic is nice to have
          })
        );

        // Exécuter en parallèle pour synchronisation parfaite
        Promise.all(feedbackPromises).catch(() => {
          // Au moins un feedback a fonctionné, on continue
        });

        // Accessibility announcement for screen readers
        const activityLabel = currentActivityRef.current?.label || t('activities.none');
        const completionMessage = currentActivityRef.current?.label
          ? t('accessibility.timer.activityCompleted', { activity: activityLabel })
          : t('accessibility.timer.timerCompleted');

        AccessibilityInfo.announceForAccessibility(completionMessage);

        // Reset flag
        wasInBackgroundRef.current = false;

        // Call completion callback if provided
        if (onCompleteRef.current) {
          onCompleteRef.current();
        }

        // Reset completion state after animation
        // First delay: show COMPLETE message and let user savor it
        setTimeout(() => {
          if (isMountedRef.current) {
            // Second delay: breathing room (blank state) before REST state
            setTimeout(() => {
              setHasCompleted(false);
              hasTriggeredCompletion.current = false;
            }, TIMER.COMPLETE_TO_REST_TRANSITION_DELAY);
          }
        }, TIMER.COMPLETE_MESSAGE_DISPLAY_DURATION);
      }
      // Log timer completion avec timecode
      if (__DEV__) {
        const now = new Date();
        const minutes = Math.floor(duration / 60);
        const secs = duration % 60;
        console.warn(`⏰ [${now.toLocaleTimeString('fr-FR')}] Timer de ${minutes}min ${secs}s terminé!`);
      }
    }
  }, [startTime, duration, running]);

  // Effect 1: Initialize startTime when starting
  useEffect(() => {
    if (running && !startTime && remaining > 0) {
      const now = Date.now();
      const alreadyElapsed = duration - remaining;
      setStartTime(now - alreadyElapsed * 1000);
    }
  }, [running, startTime, remaining, duration]);

  // Effect 2: Start/stop timer loop (with hybrid RAF/setTimeout support)
  useEffect(() => {
    if (running && startTime) {
      // Start with appropriate mechanism based on current app state
      if (isInForegroundRef.current) {
        rafRef.current = requestAnimationFrame(updateTimer);
      } else {
        intervalRef.current = setTimeout(updateTimer, 1000);
      }
    } else {
      // Clean up both RAF and setTimeout
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      if (intervalRef.current) {
        clearTimeout(intervalRef.current);
        intervalRef.current = null;
      }
      if (!running) {
        setStartTime(null);
      }
    }

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      if (intervalRef.current) {
        clearTimeout(intervalRef.current);
      }
    };
  }, [running, startTime, updateTimer]);

  // Update remaining when duration changes (only if not running)
  // BUT: Don't reset if timer just completed (remaining is already at 0)
  useEffect(() => {
    if (!running && remaining !== 0) {
      setRemaining(duration);
    }
  }, [duration, running, remaining]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      if (intervalRef.current) {
        clearTimeout(intervalRef.current);
      }
    };
  }, []);

  // Track app state to detect background/foreground transitions
  useEffect(() => {
    const handleAppStateChange = (nextAppState) => {
      const nowInForeground = nextAppState === 'active';

      // Update foreground state
      isInForegroundRef.current = nowInForeground;

      if (
        appStateRef.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        // App returned to foreground
        // Si le timer était running, on suppose qu'il a pu se terminer en background
        if (running && remaining <= 1) {
          wasInBackgroundRef.current = true;
        }

        // Switch from setTimeout to RAF if timer is running
        if (running && startTime) {
          // Cancel background setTimeout
          if (intervalRef.current) {
            clearTimeout(intervalRef.current);
            intervalRef.current = null;
          }
          // Start foreground RAF
          rafRef.current = requestAnimationFrame(updateTimer);
        }
      } else if (nextAppState.match(/inactive|background/)) {
        // App going to background
        if (running && remaining > 0) {
          wasInBackgroundRef.current = true;
        }

        // Switch from RAF to setTimeout if timer is running
        if (running && startTime) {
          // Cancel foreground RAF
          if (rafRef.current) {
            cancelAnimationFrame(rafRef.current);
            rafRef.current = null;
          }
          // Start background setTimeout (1000ms for battery efficiency)
          intervalRef.current = setTimeout(updateTimer, 1000);
        }
      }

      appStateRef.current = nextAppState;
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, [running, remaining, startTime, updateTimer]);

  // Display message logic (ADR-007: REST/RUNNING/COMPLETE only, no PAUSED)
  const getDisplayMessage = () => {
    const activityId = currentActivityRef.current?.id || 'none';

    // COMPLETE: Show completion message if timer finished
    if (remaining === 0 && hasTriggeredCompletion.current && duration > 0) {
      return t(`timerMessages.${activityId}.endMessage`);
    }

    // RUNNING: Show running message while timer is running
    if (running) {
      return t(`timerMessages.${activityId}.startMessage`);
    }

    // REST: Show invitation message
    return t('invitation'); // "Ready?", "Prêt?", etc.
  };

  // Controls (ADR-007: startTimer only starts, stopTimer for long-press abandon)
  const startTimer = useCallback(() => {
    // Can't start if already running or at zero
    if (running || remaining === 0) {
      return;
    }

    // Get endMessage for notification
    const currentActivityId = currentActivityRef.current?.id || 'none';
    const endMessage = t(`timerMessages.${currentActivityId}.endMessage`);

    // Schedule notification for completion
    scheduleTimerNotification(remaining, currentActivityRef.current, endMessage);

    // Save duration if changed
    if (currentActivityRef.current?.id && duration > 0 &&
        activityDurations[currentActivityRef.current.id] !== duration) {
      saveActivityDuration(currentActivityRef.current.id, duration);
    }

    // Track timer start
    analytics.trackTimerStarted(duration, currentActivityRef.current, currentColorRef.current, currentPaletteRef.current);

    // Track custom activity usage
    if (currentActivityRef.current?.isCustom) {
      analytics.trackCustomActivityUsed(
        currentActivityRef.current.id,
        (currentActivityRef.current.timesUsed || 0) + 1
      );
    }

    if (__DEV__) {
      if (__DEV__) {
        const now = new Date();
        const minutes = Math.floor(remaining / 60);
        const secs = remaining % 60;
        console.warn(`⏱️ [${now.toLocaleTimeString('fr-FR')}] Timer démarré : ${minutes}min ${secs}s`);
      }
    }

    setRunning(true);

    // Light haptic feedback on timer start
    haptics.timerStart();

    // Accessibility announcement
    const activityLabel = currentActivityRef.current?.label || t('activities.none');
    const startMessage = currentActivityRef.current?.label
      ? t('accessibility.timer.activityStarted', { activity: activityLabel })
      : t('accessibility.timer.timerRunning');
    AccessibilityInfo.announceForAccessibility(startMessage);
  }, [remaining, duration, running, scheduleTimerNotification,
    activityDurations, saveActivityDuration, t]);

  // stopTimer: Called by long-press "rewind" gesture (ADR-007)
  const stopTimer = useCallback(() => {
    // Can only stop if running
    if (!running) {
      return;
    }

    // Track timer abandoned
    const elapsed = duration - remaining;
    analytics.trackTimerAbandoned(duration, elapsed, 'reset', currentActivityRef.current);

    // Reset to initial state
    setRemaining(duration);
    setRunning(false);
    setStartTime(null);
    setHasCompleted(false);

    // Cancel notification
    cancelTimerNotification();

    // Heavy haptic feedback for abandon (ADR-007: warning feedback)
    haptics.notification('warning').catch(() => {});

    // Accessibility announcement
    AccessibilityInfo.announceForAccessibility(t('accessibility.timer.timerStopped'));

    if (__DEV__) {
      console.warn(`⏹️ [Stop] Timer abandonné après ${elapsed}s`);
    }
  }, [running, duration, remaining, cancelTimerNotification, t]);

  // resetTimer: Reset to initial state (used for COMPLETE → REST transition)
  const resetTimer = useCallback(() => {
    // Track timer reset only if was running
    if (running) {
      const elapsed = duration - remaining;
      analytics.trackTimerAbandoned(duration, elapsed, 'reset', currentActivityRef.current);
    }

    setRemaining(duration);
    setRunning(false);
    setStartTime(null);
    setHasCompleted(false);

    // Cancel notification if scheduled
    cancelTimerNotification();

    if (__DEV__) {
      console.warn('🔄 [Reset] Timer réinitialisé');
    }
  }, [cancelTimerNotification, running, duration, remaining]);

  const setPresetDuration = useCallback((minutes) => {
    const newDuration = minutes * 60;
    setDuration(newDuration);
  }, []);

  // Progress calculation (0 = empty at start, 1 = full when set)
  // For display: we want to show how much time is SET, not how much is REMAINING
  // When timer is running, progress decreases from 1 to 0
  const progress = duration > 0 ? remaining / duration : 0;

  // Override setDuration to sync remaining
  const setDurationSync = useCallback((newDuration) => {
    setDuration(newDuration);
    if (!running) {
      setRemaining(newDuration);
    }
  }, [running]);

  return {
    // State
    duration,
    remaining,
    running,
    progress,
    displayMessage: getDisplayMessage(),
    isCompleted: hasCompleted,

    // Controls (ADR-007: startTimer/stopTimer replace toggleRunning)
    startTimer,
    stopTimer,
    resetTimer,
    setDuration: setDurationSync,
    setPresetDuration,

    // Legacy alias for compatibility during migration
    toggleRunning: startTimer,
  };
}