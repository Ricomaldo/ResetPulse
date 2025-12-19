/**
 * @fileoverview MessageZone - Communication hub for timer messages
 * Replaces ActivityLabel with enhanced animation system
 * Handles: timer state messages, flash activity, abandon feedback
 * @created 2025-12-19
 */

import React, { useRef, useEffect } from 'react';
import { View } from 'react-native';
import PropTypes from 'prop-types';
import MessageContent from './MessageContent';

/**
 * MessageZone - Container for all message communications
 *
 * Responsibilities:
 * 1. Render timer state messages (REST/RUNNING/COMPLETE)
 * 2. Display flash activity (temporary 2s overlay)
 * 3. Trigger abandon shake when user stops timer
 * 4. Manage animation flow based on timerState changes
 *
 * @param {string} timerState - 'REST' | 'RUNNING' | 'COMPLETE' (source of truth)
 * @param {string} displayMessage - Message from timer (for RUNNING/COMPLETE)
 * @param {boolean} isCompleted - True during COMPLETE state
 * @param {Object} flashActivity - {emoji, label} when activity selected
 * @param {string} label - Activity label (shown in REST state)
 * @param {boolean} isTimerRunning - Needed to detect stop action (RUNNING→REST)
 * @param {Function} onAbandon - Called when abandon shake completes
 */
function MessageZone({
  timerState,
  displayMessage,
  isCompleted,
  flashActivity,
  label,
  isTimerRunning,
  onAbandon,
}) {
  const messageContentRef = useRef(null);
  const prevIsRunningRef = useRef(isTimerRunning);

  // Detect when user stops timer (RUNNING → REST via stop action)
  // Trigger abandon shake animation
  useEffect(() => {
    const wasRunning = prevIsRunningRef.current;
    prevIsRunningRef.current = isTimerRunning;

    if (wasRunning && !isTimerRunning && timerState === 'REST') {
      // Timer was stopped (not paused, but actually stopped)
      // Trigger abandon shake if ref is available
      if (messageContentRef.current?.triggerAbandonShake) {
        messageContentRef.current.triggerAbandonShake();
      }
    }
  }, [isTimerRunning, timerState]);

  return (
    <View>
      <MessageContent
        ref={messageContentRef}
        timerState={timerState}
        displayMessage={displayMessage}
        isCompleted={isCompleted}
        flashActivity={flashActivity}
        label={label}
        onAbandon={onAbandon}
      />
    </View>
  );
}

MessageZone.propTypes = {
  timerState: PropTypes.oneOf(['REST', 'RUNNING', 'COMPLETE']).isRequired,
  displayMessage: PropTypes.string,
  isCompleted: PropTypes.bool,
  flashActivity: PropTypes.shape({
    emoji: PropTypes.string,
    label: PropTypes.string,
  }),
  label: PropTypes.string,
  isTimerRunning: PropTypes.bool,
  onAbandon: PropTypes.func,
};

MessageZone.defaultProps = {
  displayMessage: '',
  isCompleted: false,
  flashActivity: null,
  label: '',
  isTimerRunning: false,
  onAbandon: null,
};

export default MessageZone;
