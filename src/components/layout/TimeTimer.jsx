/**
 * @fileoverview Main TimeTimer component - orchestrates timer dial and controls
 * @created 2025-12-14
 * @updated 2025-12-14
 */
import React, { useCallback, useEffect, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
// theme provider not used in this component
import { useTimerOptions } from '../../contexts/TimerOptionsContext';
import { useTimerPalette } from '../../contexts/TimerPaletteContext';
import { useCustomActivities } from '../../hooks/useCustomActivities';
import { rs, getComponentSizes } from '../../styles/responsive';
import useTimer from '../../hooks/useTimer';
import TimerDial from '../timer/TimerDial';
import haptics from '../../utils/haptics';
import { TIMER, getDialMode } from '../timer/timerConstants';

export default function TimeTimer({
  onRunningChange,
  onTimerRef,
  onDialRef,
  onDialTap,
  onTimerComplete,
}) {
  const {
    shouldPulse,
    clockwise,
    scaleMode,
    currentActivity,
    currentDuration,
    showActivityEmoji,
  } = useTimerOptions();
  const { currentColor } = useTimerPalette();

  // Get custom activities for incrementing usage
  const { incrementUsage } = useCustomActivities();

  // Track if we've already incremented for current timer session
  const hasIncrementedUsage = useRef(false);

  // Track last synced context duration to prevent drag reset
  const lastSyncedContextDurationRef = useRef(currentDuration);

  // Initialize timer with current duration or default
  const timer = useTimer(currentDuration || TIMER.DEFAULT_DURATION, onTimerComplete);

  // Refs for onboarding
  const dialWrapperRef = useRef(null);

  // Pass timer ref to parent if needed
  useEffect(() => {
    if (onTimerRef) {
      onTimerRef(timer);
    }
  }, [onTimerRef, timer]); // Include timer to avoid stale references

  // Pass dial ref to parent (pass .current directly)
  useEffect(() => {
    if (onDialRef && dialWrapperRef.current) {
      onDialRef(dialWrapperRef.current);
    }
  }, [onDialRef]);

  // Update timer duration when currentDuration changes from context (NOT from drag)
  useEffect(() => {
    // Only sync if context duration changed since last sync (ignores local drag changes)
    if (currentDuration && currentDuration !== lastSyncedContextDurationRef.current) {
      timer.setDuration(currentDuration);
      lastSyncedContextDurationRef.current = currentDuration;
    }
  }, [currentDuration, timer.setDuration]); // REMOVED timer.duration to prevent drag reset

  // Notify parent of running state changes
  useEffect(() => {
    if (onRunningChange) {
      onRunningChange(timer.running);
    }
  }, [timer.running, onRunningChange]);

  // Increment custom activity usage when timer starts
  useEffect(() => {
    if (timer.running && currentActivity?.isCustom && !hasIncrementedUsage.current) {
      incrementUsage(currentActivity.id);
      hasIncrementedUsage.current = true;
    }

    // Reset flag when timer stops (not running and not paused)
    if (!timer.running && timer.remaining === 0) {
      hasIncrementedUsage.current = false;
    }
  }, [timer.running, timer.remaining, currentActivity, incrementUsage]);

  // Get responsive dimensions - zen mode: timer dominates
  const { timerCircle } = getComponentSizes();
  const circleSize = timerCircle; // No max limit - let it breathe

  const styles = StyleSheet.create({
    container: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: rs(20, 'height'),
    },

    timerWrapper: {
      alignItems: 'center',
      height: circleSize,
      justifyContent: 'center',
      position: 'relative',
      width: circleSize,
    },
  });

  /**
   * Handle tap/drag on graduation to set duration
   * Two modes: continuous drag (smooth) vs tap (snapped precision)
   * @param {number} minutes - Raw minutes value from dial interaction
   * @param {boolean} shouldSnap - If true, snap to nearest major mark; if false, use raw position
   */
  const handleGraduationTap = useCallback((minutes, shouldSnap = false) => {
    if (timer.running) {return;}

    const dialMode = getDialMode(scaleMode);

    // Apply magnetic snap only if requested (tap precision, not drag exploration)
    if (shouldSnap) {
      const magneticSnapMinutes = (dialMode.magneticSnapSeconds || 10) / 60;
      // Round to nearest snap increment
      minutes = Math.round(minutes / magneticSnapMinutes) * magneticSnapMinutes;
    }

    // Magnetic snap to 0 if very close
    if (minutes <= TIMER.GRADUATION_SNAP_THRESHOLD) {
      minutes = 0;
      haptics.impact('light').catch(() => { /* Optional operation - failure is non-critical */ }); // Light feedback for snap
    } else if (shouldSnap) {
      haptics.selection().catch(() => { /* Optional operation - failure is non-critical */ }); // Selection feedback for snap
    }

    // Convert minutes to seconds and handle 0 specially
    let newDuration;
    if (minutes === 0) {
      // Setting to 0 means reset state
      newDuration = 0;
    } else {
      // Clamp to current scale mode's max
      const clampedMinutes = Math.min(dialMode.maxMinutes, minutes);
      // Round to nearest second to avoid floating point precision issues
      newDuration = Math.round(clampedMinutes * 60);
    }

    timer.setDuration(newDuration);

    // Duration will be saved when user presses play (useTimer.js handles this)
  }, [timer, scaleMode]);

  return (
    <View style={styles.container}>
      {/* Timer Circle */}
      <View ref={dialWrapperRef} style={styles.timerWrapper}>
        <TimerDial
          progress={timer.progress}
          duration={timer.duration}
          remaining={timer.remaining}
          color={currentColor}
          size={circleSize}
          clockwise={clockwise}
          scaleMode={scaleMode}
          activityEmoji={
            currentActivity?.id === 'none' ? null : currentActivity?.emoji
          }
          isRunning={timer.running}
          shouldPulse={shouldPulse}
          showActivityEmoji={showActivityEmoji}
          onGraduationTap={handleGraduationTap}
          onDialTap={onDialTap}
          onDialLongPress={timer.resetTimer}
          isCompleted={timer.isCompleted}
          isPaused={!timer.running && timer.remaining > 0}
          currentActivity={currentActivity}
          showNumbers={true}
          showGraduations={true}
        />

        {/* Message Overlay - removed, icon in center replaces this info */}
      </View>
    </View>
  );
}

TimeTimer.propTypes = {
  onRunningChange: PropTypes.func,
  onTimerRef: PropTypes.func,
  onDialRef: PropTypes.func,
  onDialTap: PropTypes.func,
  onTimerComplete: PropTypes.func,
};
