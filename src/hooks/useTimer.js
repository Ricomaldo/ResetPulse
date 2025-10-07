// src/hooks/useTimer.js
import { useState, useEffect, useRef, useCallback } from 'react';
import { AppState } from 'react-native';
import haptics from '../utils/haptics';
import { TIMER } from '../constants/uiConstants';
import useSimpleAudio from './useSimpleAudio';
import useNotificationTimer from './useNotificationTimer';
import { useTimerOptions } from '../contexts/TimerOptionsContext';

export default function useTimer(initialDuration = 240, onComplete) {
  // Core timer states
  const [duration, setDuration] = useState(initialDuration);
  const [remaining, setRemaining] = useState(initialDuration);
  const [running, setRunning] = useState(false);
  const [startTime, setStartTime] = useState(null);

  // UI states
  const [isPaused, setIsPaused] = useState(false);
  const [showParti, setShowParti] = useState(false);
  const [showReparti, setShowReparti] = useState(false);
  const [hasCompleted, setHasCompleted] = useState(false);

  // Get selected sound and activity durations from context
  const { selectedSoundId, activityDurations, saveActivityDuration, currentActivity } = useTimerOptions();

  // Audio with selected sound - using simple audio hook
  const { playSound } = useSimpleAudio(selectedSoundId);
  const playSoundRef = useRef(playSound);
  useEffect(() => {
    playSoundRef.current = playSound;
  }, [playSound]);

  // Notifications pour background
  const { scheduleTimerNotification, cancelTimerNotification } = useNotificationTimer();

  // Refs
  const intervalRef = useRef(null);
  const isMountedRef = useRef(true);
  const hasTriggeredCompletion = useRef(false);

  // Timer update function with background support
  const updateTimer = useCallback(() => {
    if (!isMountedRef.current || !running || !startTime) return;

    const now = Date.now();
    const elapsed = Math.floor((now - startTime) / 1000);
    const newRemaining = Math.max(0, duration - elapsed);

    setRemaining(newRemaining);

    if (newRemaining > 0 && running) {
      // Use setTimeout for background support instead of requestAnimationFrame
      intervalRef.current = setTimeout(updateTimer, 100); // Update every 100ms
    } else if (newRemaining === 0) {
      // Timer finished - reset states properly
      setRunning(false);
      setStartTime(null);
      setIsPaused(false);

      // Trigger completion feedback (only once)
      if (!hasTriggeredCompletion.current) {
        hasTriggeredCompletion.current = true;
        setHasCompleted(true);

        // Feedback synchronisé : Audio + Haptic en parallèle
        // Priorité à l'audio (CRITICAL PATH) mais haptic améliore l'UX
        const feedbackPromises = [];

        // Audio feedback - PRIORITÉ ABSOLUE
        if (playSoundRef.current) {
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

        // Call completion callback if provided
        if (onComplete) {
          onComplete();
        }

        // Reset completion state after animation
        setTimeout(() => {
          if (isMountedRef.current) {
            setHasCompleted(false);
            hasTriggeredCompletion.current = false;
          }
        }, TIMER.MESSAGE_DISPLAY_DURATION);
      }
      // Log timer completion avec timecode
      if (__DEV__) {
        const now = new Date();
        const minutes = Math.floor(duration / 60);
        const secs = duration % 60;
        console.log(`⏰ [${now.toLocaleTimeString('fr-FR')}] Timer de ${minutes}min ${secs}s terminé!`);
      }
    }
  }, [startTime, duration, running, onComplete]);

  // Effect 1: Initialize startTime when starting
  useEffect(() => {
    if (running && !startTime && remaining > 0) {
      const now = Date.now();
      const alreadyElapsed = duration - remaining;
      setStartTime(now - alreadyElapsed * 1000);
    }
  }, [running, startTime, remaining, duration]);

  // Effect 2: Start/stop timer loop (with background support)
  useEffect(() => {
    if (running && startTime) {
      // Use setTimeout instead of requestAnimationFrame for background support
      intervalRef.current = setTimeout(updateTimer, 100);
    } else {
      if (intervalRef.current) {
        clearTimeout(intervalRef.current);
        intervalRef.current = null;
      }
      if (!running) {
        setStartTime(null);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearTimeout(intervalRef.current);
      }
    };
  }, [running, startTime, updateTimer]);

  // Update remaining when duration changes (only if not running and not paused)
  // BUT: Don't reset if timer just completed (remaining is already at 0)
  useEffect(() => {
    if (!running && !isPaused && remaining !== 0) {
      setRemaining(duration);
    }
  }, [duration, running, isPaused, remaining]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (intervalRef.current) {
        clearTimeout(intervalRef.current);
      }
    };
  }, []);

  // Display message logic
  const displayTime = () => {
    if (remaining === 0) {
      if (hasTriggeredCompletion.current && duration > 0) {
        return "C'est fini";
      }
      // If at zero without having completed, show ready state
      return "";
    }
    if (!running && isPaused) {
      return "Pause";
    }
    if (showParti) {
      return "C'est parti";
    }
    if (showReparti) {
      return "C'est reparti";
    }
    return "";
  };

  // Controls
  const toggleRunning = useCallback(() => {
    if (remaining === 0 && duration === 0) {
      // Timer at zero with no duration set - do nothing (user must use Reset or set duration)
      return;
    } else if (!running) {
      // Start or resume
      if (isPaused) {
        // Resume after pause
        setShowReparti(true);
        setShowParti(false);
        setTimeout(() => setShowReparti(false), TIMER.MESSAGE_DISPLAY_DURATION);

        // Re-programmer notification avec temps restant
        scheduleTimerNotification(remaining);
      } else {
        // First start
        setShowParti(true);
        setShowReparti(false);
        setTimeout(() => setShowParti(false), TIMER.MESSAGE_DISPLAY_DURATION);

        // Programmer notification pour la fin
        scheduleTimerNotification(remaining);

        // Sauvegarder la durée initiale si elle a changé
        if (currentActivity?.id && duration > 0 &&
            activityDurations[currentActivity.id] !== duration) {
          saveActivityDuration(currentActivity.id, duration);
        }

        if (__DEV__) {
          const now = new Date();
          const minutes = Math.floor(remaining / 60);
          const secs = remaining % 60;
          console.log(`⏱️ [${now.toLocaleTimeString('fr-FR')}] Timer démarré : ${minutes}min ${secs}s`);
        }
      }
      setIsPaused(false);
      setRunning(true);
    } else {
      // Pause
      setRunning(false);
      setIsPaused(true);
      setShowParti(false);
      setShowReparti(false);

      // Annuler la notification
      cancelTimerNotification();
    }
  }, [remaining, duration, isPaused, running, scheduleTimerNotification, cancelTimerNotification,
      currentActivity, activityDurations, saveActivityDuration]);

  const resetTimer = useCallback(() => {
    setRemaining(0); // Reset to ZERO, not duration
    setRunning(false);
    setStartTime(null);
    setIsPaused(false);
    setShowParti(false);
    setShowReparti(false);

    // Annuler notification si programmée
    cancelTimerNotification();
  }, [cancelTimerNotification]);

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
      // Allow updating remaining when paused or stopped
      setRemaining(newDuration);
    }
  }, [running]);

  return {
    // State
    duration,
    remaining,
    running,
    progress,
    displayMessage: displayTime(),
    isCompleted: hasCompleted,

    // Controls
    toggleRunning,
    resetTimer,
    setDuration: setDurationSync,
    setPresetDuration
  };
}