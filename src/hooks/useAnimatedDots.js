import { useState, useEffect } from 'react';

/**
 * Hook for animated dots string
 * Returns a string of dots that cycles: "" → "." → ".." → "..." → repeat
 * Animation speed is tied to activity's pulseDuration
 * Animates when there's a display message (running or paused)
 */
export default function useAnimatedDots(pulseDuration = 500, shouldAnimate = false) {
  const [dotString, setDotString] = useState('');

  useEffect(() => {
    // Only animate when there's a message (running, paused, etc.)
    if (!shouldAnimate) {
      setDotString(''); // Reset to empty at rest
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
  }, [pulseDuration, shouldAnimate]);

  return dotString;
}
