import { useState, useEffect } from 'react';

/**
 * Hook for animated dots string
 * Returns a string of dots that cycles: "" → "." → ".." → "..." → repeat
 * Animation speed is tied to activity's pulseDuration
 */
export default function useAnimatedDots(pulseDuration = 800) {
  const [dotString, setDotString] = useState('');

  useEffect(() => {
    const cycle = ['', '.', '..', '...'];
    let index = 0;

    const interval = setInterval(() => {
      setDotString(cycle[index]);
      index = (index + 1) % cycle.length;
    }, pulseDuration);

    return () => clearInterval(interval);
  }, [pulseDuration]);

  return dotString;
}
