import { useState, useEffect } from 'react';

/**
 * Hook for animated dots string
 * Returns a string of dots that cycles: "" → "." → ".." → "..." → repeat
 * Animation speed is tied to activity's pulseDuration
 * Resets to beginning of cycle when isRunning changes to true
 */
export default function useAnimatedDots(pulseDuration = 500, isRunning = false) {
  const [dotString, setDotString] = useState('');

  useEffect(() => {
    // Only animate when running
    if (!isRunning) {
      setDotString(''); // Reset to empty when paused
      return;
    }

    const cycle = ['', '.', '..', '...'];
    let index = 0;

    // Display first state immediately
    setDotString(cycle[index]);
    index = (index + 1) % cycle.length;

    const interval = setInterval(() => {
      setDotString(cycle[index]);
      index = (index + 1) % cycle.length;
    }, pulseDuration);

    return () => {
      clearInterval(interval);
      setDotString(''); // Reset when stopping
    };
  }, [pulseDuration, isRunning]);

  return dotString;
}
