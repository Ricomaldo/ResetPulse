// src/components/onboarding/HighlightOverlay.jsx
import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, Dimensions, Animated } from 'react-native';
import Svg, { Rect, Defs, Mask } from 'react-native-svg';
import { useTheme } from '../../theme/ThemeProvider';
import { TRANSITION } from '../timer/timerConstants';
import { getGridHeights } from '../../styles/gridLayout';
import { rs } from '../../styles/responsive';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

/**
 * HighlightOverlay using SVG Mask for rounded corners + invisible blocking Views
 *
 * Hybrid approach:
 * 1. SVG Mask creates visual overlay with rounded corners (pointerEvents="none")
 * 2. Invisible Views block touches in dark areas (pointerEvents="auto")
 * 3. Spotlight area is empty = fully interactive
 *
 * This gives us both: rounded corners AND working interactions
 */
export default function HighlightOverlay({ highlightedElement, targetBounds }) {
  const theme = useTheme();
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const previousElementRef = useRef(null);

  // Spotlight fade-in effect ONLY on first appearance
  useEffect(() => {
    if (highlightedElement && targetBounds && previousElementRef.current === null) {
      // First time showing overlay - fade in
      opacityAnim.setValue(0);
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: TRANSITION.MEDIUM,
        useNativeDriver: true,
      }).start();
      previousElementRef.current = highlightedElement;
    } else if (highlightedElement && targetBounds && previousElementRef.current !== highlightedElement) {
      // Switching tooltips - instant transition, no animation
      opacityAnim.setValue(1);
      previousElementRef.current = highlightedElement;
    }
  }, [highlightedElement, targetBounds]);

  // Special case: completion tooltip shows full overlay without cutout
  if (highlightedElement === 'completion') {
    return (
      <Animated.View
        style={[StyleSheet.absoluteFillObject, { opacity: opacityAnim }]}
        pointerEvents="none"
      >
        <View
          style={{
            ...StyleSheet.absoluteFillObject,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
          }}
        />
      </Animated.View>
    );
  }

  if (!highlightedElement) return null;

  // Use actual grid layout heights for accurate positioning
  const heights = getGridHeights();
  const horizontalPadding = rs(20);

  // Calculate bounds based on the actual layout structure
  let bounds = targetBounds;

  if (!bounds) {
    // Use the grid layout to calculate exact positions
    if (highlightedElement === 'activities') {
      // Activities is right after the header
      bounds = {
        top: heights.header,  // Exactly after header
        left: horizontalPadding,
        width: SCREEN_WIDTH - (horizontalPadding * 2),
        height: heights.activities
      };
    } else if (highlightedElement === 'palette') {
      // Palette is at the bottom, with a small margin
      const marginBottom = rs(10, 'height');
      bounds = {
        top: SCREEN_HEIGHT - heights.palette - marginBottom,
        left: horizontalPadding,
        width: SCREEN_WIDTH - (horizontalPadding * 2),
        height: heights.palette
      };
    } else if (highlightedElement === 'dial') {
      // Timer dial is in the flex:1 center area
      const dialSize = rs(280);
      const timerSectionTop = heights.header + heights.activities;
      const timerSectionBottom = SCREEN_HEIGHT - heights.palette - rs(10, 'height');
      const timerSectionHeight = timerSectionBottom - timerSectionTop;

      bounds = {
        top: timerSectionTop + (timerSectionHeight - dialSize) / 2,
        left: (SCREEN_WIDTH - dialSize) / 2,
        width: dialSize,
        height: dialSize
      };
    } else if (highlightedElement === 'controls') {
      // Controls are in the timer section, below the dial
      const controlsWidth = rs(200);
      const controlsHeight = rs(60);
      const timerSectionBottom = SCREEN_HEIGHT - heights.palette - rs(10, 'height');

      bounds = {
        top: timerSectionBottom - controlsHeight - rs(80, 'height'),  // Above palette with space
        left: (SCREEN_WIDTH - controlsWidth) / 2,
        width: controlsWidth,
        height: controlsHeight
      };
    }
  }

  // Add padding around spotlight for breathing room
  // Use larger padding on top for dial to accommodate duration indicator
  const verticalPadding = theme.spacing.sm;
  const spotlightHorizontalPadding = theme.spacing.lg; // Uniform horizontal padding for spotlight
  const topPadding = highlightedElement === 'dial' ? theme.spacing.lg : verticalPadding;
  const { top, left, width, height } = bounds;

  // Apply padding to create margin around highlighted element
  const paddedTop = top - topPadding;
  const paddedLeft = left - spotlightHorizontalPadding;
  const paddedWidth = width + (spotlightHorizontalPadding * 2);
  const paddedHeight = height + (topPadding + verticalPadding); // Top padding + bottom padding

  const right = paddedLeft + paddedWidth;
  const bottom = paddedTop + paddedHeight;

  // Border radius for spotlight - larger for dial (circular), smaller for others
  const borderRadius = highlightedElement === 'dial' ? paddedWidth / 2 : theme.borderRadius.xl;

  return (
    <Animated.View
      style={[StyleSheet.absoluteFillObject, { opacity: opacityAnim }]}
      pointerEvents="none"
    >
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
            {/* Black = cutout (transparent spotlight) with rounded corners */}
            <Rect
              x={paddedLeft}
              y={paddedTop}
              width={paddedWidth}
              height={paddedHeight}
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
    </Animated.View>
  );
}
