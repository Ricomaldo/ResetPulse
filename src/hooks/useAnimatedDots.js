import { useState, useEffect } from 'react';

/**
 * Hook for subtle animated dots animation
 * Cycles through: (empty) · · · · · · · · · · · (empty) · · · ...
 * Slow breathing effect, barely perceptible
 * Duration: ~5 seconds per cycle
 */
export default function useAnimatedDots() {
  const [dotCount, setDotCount] = useState(0);

  useEffect(() => {
    const cycle = [0, 1, 2, 3, 4]; // 0 dots, then 1, 2, 3, 4, repeat
    let index = 0;

    const interval = setInterval(() => {
      setDotCount(cycle[index]);
      index = (index + 1) % cycle.length;
    }, 1000); // 1000ms per step = 5s full cycle (slow & subtle)

    return () => clearInterval(interval);
  }, []);

  // Return string of dots (·) with spaces between them for visual clarity
  const dotsArray = Array(dotCount).fill('·');
  const dots = dotsArray.join(' ');

  return dots;
}
