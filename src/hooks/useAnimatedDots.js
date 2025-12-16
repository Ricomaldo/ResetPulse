import { useState, useEffect } from 'react';

/**
 * Hook for animated dots animation (like typing indicator)
 * Cycles through: · ·· ··· ·· · ·· ··· ...
 * Duration: ~2 seconds per cycle
 */
export default function useAnimatedDots() {
  const [dotCount, setDotCount] = useState(0);

  useEffect(() => {
    const cycle = [0, 1, 2, 3, 2, 1]; // 0 dots, 1, 2, 3, back to 2, 1
    let index = 0;

    const interval = setInterval(() => {
      setDotCount(cycle[index]);
      index = (index + 1) % cycle.length;
    }, 400); // 400ms per step = ~2.4s full cycle

    return () => clearInterval(interval);
  }, []);

  // Return string of dots (·) instead of periods for visual refinement
  const dots = '·'.repeat(dotCount);

  return dots;
}
