/**
 * @fileoverview MessageContent - Animated messages for timer states (REST/RUNNING/COMPLETE)
 * Handles all message animations, flash activity, and abandon shake
 * @created 2025-12-19
 */

import React, { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import PropTypes from 'prop-types';
import { useTheme } from '../../theme/ThemeProvider';
import { rs } from '../../styles/responsive';
import DotsAnimation from './DotsAnimation';

/**
 * MessageContent - Manages all message animations and state transitions
 *
 * States:
 * - REST: "···" (dots statique, opacity 0.5)
 * - RUNNING: displayMessage + DotsAnimation animés
 * - COMPLETE: displayMessage avec emphasis (scale 1.1)
 *
 * Special flows:
 * - FLASH activité: Temporary layer (2s) par-dessus le message d'état
 * - Abandon (RUNNING→REST): Shake subtle (4px, 200ms)
 *
 * @param {string} timerState - 'REST' | 'RUNNING' | 'COMPLETE'
 * @param {string} displayMessage - Message to display (for RUNNING/COMPLETE)
 * @param {boolean} isCompleted - True when timer completed (affects scale emphasis)
 * @param {Object} flashActivity - Flash object {emoji, label} when activity selected
 * @param {string} label - Activity label (shown in REST state)
 * @param {Function} onAbandon - Callback when abandon shake completes
 */
const MessageContent = forwardRef(function MessageContent(
  {
    timerState,
    displayMessage,
    isCompleted,
    flashActivity,
    label,
    onAbandon,
  },
  ref
) {
  const theme = useTheme();
  const [showFlash, setShowFlash] = useState(false);
  const prevTimerStateRef = useRef(null); // Start null to detect first render

  // Message animations - initialize based on initial timerState
  const getInitialOpacity = () => {
    if (timerState === 'REST') return 0.5;
    if (timerState === 'RUNNING' || timerState === 'COMPLETE') return 1;
    return 0;
  };

  const getInitialTranslateY = () => {
    if (timerState === 'REST') return 0;
    if (timerState === 'RUNNING' || timerState === 'COMPLETE') return 0;
    return 12;
  };

  const getInitialScale = () => {
    if (timerState === 'COMPLETE') return 1.1;
    if (timerState === 'RUNNING') return 1;
    return 1;
  };

  const messageOpacityRef = useRef(new Animated.Value(getInitialOpacity())).current;
  const messageTranslateYRef = useRef(new Animated.Value(getInitialTranslateY())).current;
  const messageScaleRef = useRef(new Animated.Value(getInitialScale())).current;
  const messageBounceScaleRef = useRef(new Animated.Value(1)).current;

  // Shake animation (abandon: 4px horizontal)
  const shakeTranslateXRef = useRef(new Animated.Value(0)).current;

  // Flash overlay animation
  const flashOpacityRef = useRef(new Animated.Value(0)).current;

  // Determine display text based on state
  const getDisplayText = () => {
    if (displayMessage && timerState !== 'REST') {
      // RUNNING or COMPLETE: show timer message
      return displayMessage;
    }
    // REST: show static dots
    return '···';
  };

  // ============================================
  // MAIN ANIMATION: State transitions (REST ↔ RUNNING ↔ COMPLETE)
  // ============================================

  useEffect(() => {
    const previousState = prevTimerStateRef.current;
    prevTimerStateRef.current = timerState;

    // Skip animation on first render - initial values are already set correctly
    if (previousState === null) {
      return;
    }

    if (timerState === 'RUNNING' && previousState !== 'RUNNING') {
      // ENTERING RUNNING: Smooth arrival with stagger
      // 1. Opacity fade in (300ms)
      // 2. TranslateY + Scale arrival (400ms)
      // 3. Micro-bounce (300ms)

      Animated.sequence([
        Animated.parallel([
          Animated.timing(messageOpacityRef, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(messageTranslateYRef, {
            toValue: 0, // Arrive from below
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(messageScaleRef, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
        ]),
        // Micro-bounce after arrival
        Animated.sequence([
          Animated.timing(messageBounceScaleRef, {
            toValue: 1.05,
            duration: 150,
            useNativeDriver: true,
          }),
          Animated.timing(messageBounceScaleRef, {
            toValue: 1,
            duration: 150,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    } else if (timerState === 'COMPLETE' && previousState === 'RUNNING') {
      // RUNNING → COMPLETE: Emphasis with larger scale
      Animated.parallel([
        Animated.timing(messageScaleRef, {
          toValue: 1.1, // Emphasis: slightly larger than normal RUNNING (1.0)
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();
    } else if (timerState === 'REST') {
      if (previousState === 'RUNNING') {
        // RUNNING → REST (normal reset): Smooth exit upward
        Animated.parallel([
          Animated.timing(messageOpacityRef, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(messageTranslateYRef, {
            toValue: -12, // Exit upward
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(messageScaleRef, {
            toValue: 0.9,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start(() => {
          // Reset for next message
          messageTranslateYRef.setValue(12);
          messageScaleRef.setValue(0.9);
          messageBounceScaleRef.setValue(1);
        });
      } else if (previousState === 'COMPLETE') {
        // COMPLETE → REST: Calm transition
        Animated.parallel([
          Animated.timing(messageOpacityRef, {
            toValue: 0.5, // REST is dimmer than RUNNING
            duration: 250,
            useNativeDriver: true,
          }),
          Animated.timing(messageScaleRef, {
            toValue: 1,
            duration: 250,
            useNativeDriver: true,
          }),
        ]).start(() => {
          messageBounceScaleRef.setValue(1);
        });
      }
    }
  }, [timerState, messageOpacityRef, messageTranslateYRef, messageScaleRef, messageBounceScaleRef]);

  // ============================================
  // FLASH ACTIVITY: Temporary layer (independent of timerState)
  // ============================================

  useEffect(() => {
    if (!flashActivity) return;

    // Show flash: fade in
    setShowFlash(true);
    Animated.timing(flashOpacityRef, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();

    // Hold for 2s, then fade out
    const holdTimer = setTimeout(() => {
      Animated.timing(flashOpacityRef, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        setShowFlash(false);
        flashOpacityRef.setValue(0);
      });
    }, 2000);

    return () => clearTimeout(holdTimer);
  }, [flashActivity, flashOpacityRef]);

  // ============================================
  // ABANDON SHAKE: Triggered when stopping timer (RUNNING → REST via stop)
  // ============================================

  // This effect triggers when user calls onStop (handled by parent)
  // For now, we pass the shake animation through onAbandon callback
  const triggerAbandonShake = () => {
    // 4px horizontal, 2 oscillations (200ms total)
    Animated.sequence([
      Animated.timing(shakeTranslateXRef, {
        toValue: 4,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeTranslateXRef, {
        toValue: -4,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeTranslateXRef, {
        toValue: 4,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeTranslateXRef, {
        toValue: 0,
        duration: 50,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (onAbandon) onAbandon();
    });
  };

  // Expose triggerAbandonShake to parent via ref
  useImperativeHandle(
    ref,
    () => ({
      triggerAbandonShake,
    }),
    [shakeTranslateXRef, onAbandon]
  );

  const displayText = getDisplayText();
  const isRestState = timerState === 'REST';

  const styles = StyleSheet.create({
    container: {
      alignItems: 'center',
      height: rs(40),
      justifyContent: 'center',
      width: '100%',
    },
    messageContainer: {
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'center',
      gap: rs(12),
      paddingHorizontal: rs(16),
    },
    message: {
      color: theme.colors.text,
      fontSize: rs(20),
      fontWeight: '600',
      includeFontPadding: false,
      letterSpacing: 0.5,
      lineHeight: rs(20),
    },
    flashContainer: {
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'center',
      gap: rs(8),
      paddingHorizontal: rs(16),
    },
    flashEmoji: {
      fontSize: rs(24),
    },
    flashLabel: {
      color: theme.colors.text,
      fontSize: rs(20),
      fontWeight: '600',
      includeFontPadding: false,
    },
    dotsContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      height: rs(24),
    },
  });

  return (
    <View style={styles.container}>
      {/* Main Message Layer - Always rendered, dimmed when flash is active */}
      <View style={styles.messageContainer}>
        {/* Message text with animations */}
        <Animated.Text
          style={[
            styles.message,
            {
              opacity: showFlash ? 0.2 : (isRestState ? 0.5 : messageOpacityRef),
              transform: [
                { translateY: messageTranslateYRef },
                { translateX: shakeTranslateXRef },
                {
                  scale: Animated.multiply(messageScaleRef, messageBounceScaleRef),
                },
              ],
            },
          ]}
        >
          {displayText}
        </Animated.Text>

        {/* Animated dots (RUNNING state only) */}
        {timerState === 'RUNNING' && (
          <Animated.View style={[styles.dotsContainer, { opacity: showFlash ? 0.2 : 1 }]}>
            <DotsAnimation isVisible={timerState === 'RUNNING'} />
          </Animated.View>
        )}
      </View>

      {/* Flash Activity Layer (temporary overlay) */}
      {showFlash && (
        <Animated.View
          style={[
            styles.flashContainer,
            {
              opacity: flashOpacityRef,
              position: 'absolute',
            },
          ]}
        >
          <Animated.Text style={styles.flashEmoji}>
            {flashActivity?.emoji}
          </Animated.Text>
          <Animated.Text style={styles.flashLabel}>
            {flashActivity?.label}
          </Animated.Text>
        </Animated.View>
      )}
    </View>
  );
});



MessageContent.propTypes = {
  timerState: PropTypes.oneOf(['REST', 'RUNNING', 'COMPLETE']).isRequired,
  displayMessage: PropTypes.string,
  isCompleted: PropTypes.bool,
  flashActivity: PropTypes.shape({
    emoji: PropTypes.string,
    label: PropTypes.string,
  }),
  label: PropTypes.string,
  onAbandon: PropTypes.func,
};

MessageContent.defaultProps = {
  displayMessage: '',
  isCompleted: false,
  flashActivity: null,
  label: '',
  onAbandon: null,
};

export default MessageContent;
