// src/styles/layout.js
// Simplified version - only exports what's actually used

import { GOLDEN_RATIO } from '../theme/tokens';
import { rs } from './responsive';

// Export from responsive.js for backward compatibility
export const responsiveSize = (size) => rs(size, 'width');

// Golden dimensions calculator - used by TimeTimer
export const getGoldenDimensions = (baseSize, type = 'rectangle') => {
  if (type === 'rectangle') {
    return {
      width: baseSize,
      height: baseSize / GOLDEN_RATIO,
    };
  }
  return {
    width: baseSize,
    height: baseSize,
  };
};

// Note: All other layout utilities have been removed as they were unused
// and depended on the old theme system. If you need layout utilities,
// use the theme tokens directly from '../theme/tokens'