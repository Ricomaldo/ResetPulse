import { useState, useEffect } from 'react';

/**
 * Hook for animated dots with show/hide states
 * Returns array of 3 opacity values that cycle sequentially with empty beat
 * Pattern: dot1 → dot2 → dot3 → (empty) → repeat
 * Animation speed is tied to activity's pulseDuration (interval between each dot)
 */
export default function useAnimatedDots(pulseDuration = 800) {
  const [dotStates, setDotStates] = useState([1, 0, 0]); // 3 dots, first one visible

  useEffect(() => {
    const cycle = [
      [1, 0, 0], // dot 1 on
      [0, 1, 0], // dot 2 on
      [0, 0, 1], // dot 3 on
      [0, 0, 0], // all off (breathing space)
    ];
    let index = 0;

    // pulseDuration is the interval between each beat (including the empty one)
    const interval = setInterval(() => {
      setDotStates(cycle[index]);
      index = (index + 1) % cycle.length;
    }, pulseDuration);

    return () => clearInterval(interval);
  }, [pulseDuration]);

  // Return array of 3 opacity values for each dot
  return dotStates;
}
