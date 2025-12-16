import { useState, useEffect } from 'react';

/**
 * Hook for animated dots with show/hide states
 * Returns array of 4 opacity values that cycle sequentially
 * Each dot lights up one after another in infinite loop
 * Duration: ~2 seconds per complete cycle
 */
export default function useAnimatedDots() {
  const [dotStates, setDotStates] = useState([1, 0, 0, 0]); // 4 dots, first one visible

  useEffect(() => {
    const cycle = [
      [1, 0, 0, 0], // dot 1 on
      [0, 1, 0, 0], // dot 2 on
      [0, 0, 1, 0], // dot 3 on
      [0, 0, 0, 1], // dot 4 on
    ];
    let index = 0;

    const interval = setInterval(() => {
      setDotStates(cycle[index]);
      index = (index + 1) % cycle.length;
    }, 500); // 500ms per dot = 2s full cycle

    return () => clearInterval(interval);
  }, []);

  // Return array of 4 opacity values for each dot
  return dotStates;
}
