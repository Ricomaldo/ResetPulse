import { useState, useEffect } from 'react';

/**
 * Hook for animated dots with show/hide states
 * Returns array of 4 opacity values that cycle sequentially
 * Each dot lights up one after another in infinite loop
 * Animation speed is tied to activity's pulseDuration (interval between each dot)
 */
export default function useAnimatedDots(pulseDuration = 800) {
  const [dotStates, setDotStates] = useState([1, 0, 0, 0]); // 4 dots, first one visible

  useEffect(() => {
    const cycle = [
      [1, 0, 0, 0], // dot 1 on
      [0, 1, 0, 0], // dot 2 on
      [0, 0, 1, 0], // dot 3 on
      [0, 0, 0, 1], // dot 4 on
    ];
    let index = 0;

    // pulseDuration is the interval between each dot
    const interval = setInterval(() => {
      setDotStates(cycle[index]);
      index = (index + 1) % cycle.length;
    }, pulseDuration);

    return () => clearInterval(interval);
  }, [pulseDuration]);

  // Return array of 4 opacity values for each dot
  return dotStates;
}
