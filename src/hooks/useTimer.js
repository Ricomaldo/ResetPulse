// src/hooks/useTimer.js
import { useState, useEffect, useRef, useCallback } from 'react';
import haptics from '../utils/haptics';

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

  // Refs
  const intervalRef = useRef(null);
  const isMountedRef = useRef(true);
  const hasTriggeredCompletion = useRef(false);

  // Timer update function with bug fix
  const updateTimer = useCallback(() => {
    if (!isMountedRef.current || !running || !startTime) return;

    const now = Date.now();
    const elapsed = Math.floor((now - startTime) / 1000);
    const newRemaining = Math.max(0, duration - elapsed);

    setRemaining(newRemaining);

    if (newRemaining > 0 && running) {
      intervalRef.current = requestAnimationFrame(updateTimer);
    } else if (newRemaining === 0) {
      // Timer finished - reset states properly
      setRunning(false);
      setStartTime(null);
      setIsPaused(false);

      // Trigger completion feedback (only once)
      if (!hasTriggeredCompletion.current) {
        hasTriggeredCompletion.current = true;
        setHasCompleted(true);

        // Haptic feedback
        haptics.notification('success').catch(() => {});

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
        }, 2000);
      }
      console.log('⏰ Timer terminé!');
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

  // Effect 2: Start/stop animation loop
  useEffect(() => {
    if (running && startTime) {
      intervalRef.current = requestAnimationFrame(updateTimer);
    } else {
      if (intervalRef.current) {
        cancelAnimationFrame(intervalRef.current);
        intervalRef.current = null;
      }
      if (!running) {
        setStartTime(null);
      }
    }

    return () => {
      if (intervalRef.current) {
        cancelAnimationFrame(intervalRef.current);
      }
    };
  }, [running, startTime, updateTimer]);

  // Update remaining when duration changes (only if not running and not paused)
  useEffect(() => {
    if (!running && !isPaused) {
      setRemaining(duration);
    }
  }, [duration, running, isPaused]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (intervalRef.current) {
        cancelAnimationFrame(intervalRef.current);
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
    if (remaining === 0) {
      // Start from zero - use last duration or default
      const durationToUse = duration > 0 ? duration : 5 * 60; // Default 5 min if no duration set
      setRemaining(durationToUse);
      setDuration(durationToUse); // Update duration for future use
      setStartTime(null);
      setIsPaused(false);
      setShowParti(true);
      setShowReparti(false);
      setTimeout(() => setShowParti(false), 2000);
      setRunning(true);
    } else if (!running) {
      // Start or resume
      if (isPaused) {
        // Resume after pause
        setShowReparti(true);
        setShowParti(false);
        setTimeout(() => setShowReparti(false), 2000);
      } else {
        // First start
        setShowParti(true);
        setShowReparti(false);
        setTimeout(() => setShowParti(false), 2000);
      }
      setIsPaused(false);
      setRunning(true);
    } else {
      // Pause
      setRunning(false);
      setIsPaused(true);
      setShowParti(false);
      setShowReparti(false);
    }
  }, [remaining, duration, isPaused, running]);

  const resetTimer = useCallback(() => {
    setRemaining(0); // Reset to ZERO, not duration
    setRunning(false);
    setStartTime(null);
    setIsPaused(false);
    setShowParti(false);
    setShowReparti(false);
  }, []);

  const setPresetDuration = useCallback((minutes) => {
    const newDuration = minutes * 60;
    setDuration(newDuration);
  }, []);

  // Progress calculation (1 = full at start, 0 = empty at end)
  const progress = duration > 0 ? remaining / duration : 0;

  // Override setDuration to sync remaining
  const setDurationSync = useCallback((newDuration) => {
    setDuration(newDuration);
    if (!running && !isPaused) {
      setRemaining(newDuration);
    }
  }, [running, isPaused]);

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