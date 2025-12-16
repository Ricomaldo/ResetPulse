import { useState, useEffect } from 'react';

/**
 * Hook for subtle animated dots animation
 * Cycles through: · ·· ··· · ·· ··· ...
 * Slow breathing effect, barely perceptible
 * Duration: ~3 seconds per cycle
 */
export default function useAnimatedDots() {
  const [dotCount, setDotCount] = useState(1);

  useEffect(() => {
    const cycle = [1, 2, 3]; // Simple 1-2-3 cycle, no going back
    let index = 0;

    const interval = setInterval(() => {
      setDotCount(cycle[index]);
      index = (index + 1) % cycle.length;
    }, 1000); // 1000ms per step = 3s full cycle (slow & subtle)

    return () => clearInterval(interval);
  }, []);

  // Return string of dots (·) for visual refinement
  const dots = '·'.repeat(dotCount);

  return dots;
}
