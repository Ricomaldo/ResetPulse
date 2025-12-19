/**
 * @fileoverview DialZone - Self-contained dial area (62% screen height)
 * Pattern: Similar to AsideZone - encapsulates layout, rendering, and interactions
 * @created 2025-12-17
 * @updated 2025-12-18
 */
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { NativeViewGestureHandler } from 'react-native-gesture-handler';
import { ActivityLabel, TimeTimer } from '../dial';
import { useTimerOptions } from '../../contexts/TimerOptionsContext';
import useAnimatedDots from '../../hooks/useAnimatedDots';
import { rs } from '../../styles/responsive';

/**
 * DialZone - Vertical layout: ActivityLabel (top) + TimeTimer (center)
 *
 * @param {Object} props
 * @param {string} props.displayMessage - Display message (pause, playing, completed)
 * @param {boolean} props.isCompleted - Timer completed state
 * @param {Function} props.onRunningChange - Callback when running state changes
 * @param {Function} props.onTimerRef - Callback to expose timer ref to parent
 * @param {Function} props.onDialTap - Callback when dial is tapped (start/pause)
 * @param {Function} props.onTimerComplete - Callback when timer completes
 */
export default function DialZone({
  displayMessage,
  isCompleted,
  onRunningChange,
  onTimerRef,
  onDialTap,
  onTimerComplete,
}) {
  const { currentActivity } = useTimerOptions();

  // Animated dots for activity label (pulses when timer running)
  const animatedDots = useAnimatedDots(
    currentActivity?.pulseDuration || 800,
    displayMessage !== ''
  );

  return (
    <View style={styles.container}>
      {/* Zone ActivityLabel - Fixed height at top */}
      <View style={styles.activityLabelZone}>
        {currentActivity && currentActivity.id !== 'none' && (
          <ActivityLabel
            label={currentActivity.label}
            animatedDots={animatedDots}
            displayMessage={displayMessage}
            isCompleted={isCompleted}
          />
        )}
      </View>

      {/* Zone Dial - Centered, takes remaining space */}
      <View style={styles.dialCenteredZone}>
        <NativeViewGestureHandler disallowInterruption={true}>
          <View style={styles.dialContainer}>
            <TimeTimer
              onRunningChange={onRunningChange}
              onTimerRef={onTimerRef}
              onDialTap={onDialTap}
              onTimerComplete={onTimerComplete}
            />
          </View>
        </NativeViewGestureHandler>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  activityLabelZone: {
    alignItems: 'center',
    height: rs(64), // Dedicated zone for activityLabel (includes padding)
    justifyContent: 'center',
  },
  container: {
    alignItems: 'center',
    flexDirection: 'column', // Explicit vertical stacking
    height: '62%', // 62% to accommodate dial + numbers + activityLabel
    justifyContent: 'flex-start', // Vertical layout from top to bottom
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
