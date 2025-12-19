/**
 * @fileoverview DialZone - Self-contained dial area (62% screen height)
 * Pattern: Similar to AsideZone - encapsulates layout, rendering, and interactions
 * @created 2025-12-17
 * @updated 2025-12-19 - Removed NativeViewGestureHandler (now using Gesture API in TimerDial)
 */
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { TimeTimer, ActivityBadgeOverlay } from '../dial';
import { useTimerOptions } from '../../contexts/TimerOptionsContext';

/**
 * DialZone - Solo dial display (centered)
 *
 * @param {Object} props
 * @param {Function} props.onRunningChange - Callback when running state changes
 * @param {Function} props.onTimerRef - Callback to expose timer ref to parent
 * @param {Function} props.onDialTap - Callback when dial is tapped (start/pause)
 * @param {Function} props.onTimerComplete - Callback when timer completes
 * @param {boolean} props.isLandscape - Landscape orientation (uses full screen)
 */
export default function DialZone({
  onRunningChange,
  onTimerRef,
  onDialTap,
  onTimerComplete,
  isLandscape = false,
}) {
  const { flashActivity } = useTimerOptions();

  // Dynamic container style based on orientation
  const containerStyle = [
    styles.container,
    isLandscape && styles.containerLandscape,
  ];

  return (
    <View style={containerStyle}>
      {/* Zone Dial - Centered, takes remaining space */}
      <View style={styles.dialCenteredZone}>
        <View style={styles.dialContainer}>
          <TimeTimer
            onRunningChange={onRunningChange}
            onTimerRef={onTimerRef}
            onDialTap={onDialTap}
            onTimerComplete={onTimerComplete}
          />
        </View>
      </View>

      {/* Activity Badge Overlay - Bottom of DialZone with negative margin to overlap AsideZone */}
      <ActivityBadgeOverlay flashActivity={flashActivity} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flexDirection: 'column', // Explicit vertical stacking
    height: '62%', // Portrait: 62% to accommodate dial + AsideZone below
    justifyContent: 'flex-start', // Vertical layout from top to bottom
  },
  containerLandscape: {
    flex: 1, // Landscape: take full remaining space (no AsideZone)
    height: '100%',
    justifyContent: 'center', // Center dial vertically in landscape
  },
  dialCenteredZone: {
    alignItems: 'center',
    flex: 1, // Takes remaining space in dialZone
    justifyContent: 'center',
  },
  dialContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
