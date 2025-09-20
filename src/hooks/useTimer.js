// src/hooks/useTimer.js
import { useState, useEffect, useRef, useCallback } from 'react';

export default function useTimer(initialDuration = 240) {
  // Core timer states
  const [duration, setDuration] = useState(initialDuration);
  const [remaining, setRemaining] = useState(initialDuration);
  const [running, setRunning] = useState(false);
  const [startTime, setStartTime] = useState(null);

  // UI states
  const [isPaused, setIsPaused] = useState(false);
  const [showParti, setShowParti] = useState(false);
  const [showReparti, setShowReparti] = useState(false);

  // Refs
  const intervalRef = useRef(null);
  const isMountedRef = useRef(true);

  // Timer update function with bug fix
  const updateTimer = useCallback(() => {
    if (!isMountedRef.current || !running || !startTime) return;

    const now = Date.now();
    const elapsed = Math.floor((now - startTime) / 1000);
    const newRemaining = Math.max(0, duration - elapsed);

    setRemaining(newRemaining);

    if (newRemaining > 0 && running) {
      intervalRef.current = requestAnimationFrame(updateTimer);
    } else {
      setRunning(false);
      setStartTime(null);
      if (newRemaining === 0) {
        // Timer finished - could trigger haptic/sound here
        console.log('⏰ Timer terminé!');
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

  // Effect 2: Start/stop animation loop (bug fix - no remaining in deps)
  useEffect(() => {
    if (running && remaining > 0 && startTime) {
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

  // Reset when duration changes
  useEffect(() => {
    setRemaining(duration);
    setRunning(false);
    setStartTime(null);
    setIsPaused(false);
    setShowParti(false);
    setShowReparti(false);
  }, [duration]);

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
    if (remaining === 0 && duration > 0) {
      return "C'est fini";
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
    setRunning((prev) => {
      const newRunning = !prev;

      if (newRunning) {
        if (remaining === 0) {
          // Restart after completion
          setRemaining(duration);
          setShowParti(true);
          setShowReparti(false);
          setTimeout(() => setShowParti(false), 2000);
        } else if (isPaused) {
          // Resume after pause
          setShowReparti(true);
          setShowParti(false);
          setTimeout(() => setShowReparti(false), 2000);
        } else {
          // First start or after reset
          setShowParti(true);
          setShowReparti(false);
          setTimeout(() => setShowParti(false), 2000);
        }
        setIsPaused(false);
      } else {
        // Pause
        setIsPaused(true);
        setShowParti(false);
        setShowReparti(false);
      }

      return newRunning;
    });
  }, [remaining, duration, isPaused]);

  const resetTimer = useCallback(() => {
    setRemaining(duration);
    setRunning(false);
    setStartTime(null);
    setIsPaused(false);
    setShowParti(false);
    setShowReparti(false);
  }, [duration]);

  const setPresetDuration = useCallback((minutes) => {
    const newDuration = minutes * 60;
    setDuration(newDuration);
  }, []);

  // Progress calculation (0 to 1)
  const progress = duration > 0 ? remaining / duration : 0;

  return {
    // State
    duration,
    remaining,
    running,
    progress,
    displayMessage: displayTime(),

    // Controls
    toggleRunning,
    resetTimer,
    setDuration,
    setPresetDuration
  };
}