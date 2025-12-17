// src/hooks/useScreenOrientation.js
import { useState, useEffect } from 'react';
import { useWindowDimensions } from 'react-native';

/**
 * Hook to detect screen orientation changes
 * @returns {Object} { isLandscape, isPortrait, width, height }
 */
export function useScreenOrientation() {
  const { width, height } = useWindowDimensions();
  const [orientation, setOrientation] = useState({
    isLandscape: width > height,
    isPortrait: width <= height,
    width,
    height,
  });

  useEffect(() => {
    const newIsLandscape = width > height;
    setOrientation({
      isLandscape: newIsLandscape,
      isPortrait: !newIsLandscape,
      width,
      height,
    });
  }, [width, height]);

  return orientation;
}
