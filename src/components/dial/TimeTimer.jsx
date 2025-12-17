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
import TimerDial from './TimerDial';
import haptics from '../../utils/haptics';
import { TIMER, getDialMode } from './timerConstants';

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
   * Handle drag/tap on dial to set duration
   * Smooth drag during interaction, subtle snap on release
   * @param {number} minutes - Raw minutes value from dial interaction
   * @param {boolean} isRelease - True if this is the final value (release), false if dragging
   */
  const handleGraduationTap = useCallback((minutes, isRelease = false) => {
    if (timer.running) {return;}

    const dialMode = getDialMode(scaleMode);

    // Clamp to current scale mode's max (0 to maxMinutes)
    const clampedMinutes = Math.max(0, Math.min(dialMode.maxMinutes, minutes));

    // Convert to seconds (keep float precision during drag)
    let newDuration = clampedMinutes * 60;

    // On release: apply subtle snap to nearest interval
    // During drag: keep raw value for fluid motion
    if (isRelease) {
      const { snapToInterval } = require('./timerConstants');
      newDuration = snapToInterval(newDuration, scaleMode);
    } else {
      // During drag: round to nearest second for display consistency
      newDuration = Math.round(newDuration);
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
