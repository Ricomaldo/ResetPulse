// src/components/onboarding/HighlightOverlay.jsx
import React from 'react';
import { StyleSheet, Dimensions } from 'react-native';
import Svg, { Rect, Defs, Mask } from 'react-native-svg';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

/**
 * HighlightOverlay using SVG Mask for perfect spotlight effect
 *
 * Technique: Mask with white background + black cutout
 * - White areas = overlay visible (dark)
 * - Black areas = overlay transparent (spotlight)
 */
export default function HighlightOverlay({ highlightedElement, targetBounds }) {
  if (!highlightedElement || !targetBounds) return null;

  const { top, left, width, height } = targetBounds;
  const borderRadius = 12; // Rounded corners for spotlight

  return (
    <Svg
      width={SCREEN_WIDTH}
      height={SCREEN_HEIGHT}
      style={StyleSheet.absoluteFillObject}
      pointerEvents="none"
    >
      <Defs>
        <Mask id="spotlight-mask">
          {/* White = overlay visible */}
          <Rect
            x="0"
            y="0"
            width={SCREEN_WIDTH}
            height={SCREEN_HEIGHT}
            fill="white"
          />
          {/* Black = cutout (transparent spotlight) */}
          <Rect
            x={left}
            y={top}
            width={width}
            height={height}
            rx={borderRadius}
            ry={borderRadius}
            fill="black"
          />
        </Mask>
      </Defs>

      {/* Semi-transparent overlay with mask applied */}
      <Rect
        x="0"
        y="0"
        width={SCREEN_WIDTH}
        height={SCREEN_HEIGHT}
        fill="rgba(0, 0, 0, 0.75)"
        mask="url(#spotlight-mask)"
      />
    </Svg>
  );
}
