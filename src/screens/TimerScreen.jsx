// src/screens/TimerScreen.jsx
import { useState, useRef, useEffect, useCallback } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import * as StoreReview from 'expo-store-review';
import { useTheme } from '../theme/ThemeProvider';
import { useTimerConfig } from '../contexts/TimerConfigContext';
import { useTimerKeepAwake } from '../hooks/useTimerKeepAwake';
import { useScreenOrientation } from '../hooks/useScreenOrientation';
import { useTranslation } from '../hooks/useTranslation';
import { useModalStack } from '../contexts/ModalStackContext';
import { DialZone, AsideZone } from '../components/layout';
import { getActivityStartMessage, getActivityEndMessage } from '../config/activityMessages';
import analytics from '../services/analytics';

function TimerScreenContent({ autoStart = false, onAutoStartConsumed }) {
  const theme = useTheme();
  const t = useTranslation();
  const { isLandscape } = useScreenOrientation(); // Detect orientation changes
  const modalStack = useModalStack();
  const {
    incrementCompletedTimers,
    stats: { hasSeenTwoTimersModal, hasSeenReviewRequest },
    setHasSeenTwoTimersModal,
    setHasSeenReviewRequest,
    transient: { flashActivity },
    timer: { currentActivity },
  } = useTimerConfig();
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [displayMessage, setDisplayMessage] = useState('');
  const [isTimerCompleted, setIsTimerCompleted] = useState(false);
  const [timerState, setTimerState] = useState('REST'); // 'REST' | 'RUNNING' | 'COMPLETE'
  const timerRef = useRef(null);
  const autoStartConsumed = useRef(false);

  // Keep screen awake during timer
  useTimerKeepAwake();

  // Auto-start timer after onboarding if requested
  useEffect(() => {
    if (!autoStart || autoStartConsumed.current) return;

    // Poll until timerRef is ready (max 2 seconds)
    let attempts = 0;
    const maxAttempts = 20;
    const interval = setInterval(() => {
      attempts++;
      if (timerRef.current && !timerRef.current.running) {
        timerRef.current.startTimer();
        autoStartConsumed.current = true;
        clearInterval(interval);
        if (onAutoStartConsumed) {
          onAutoStartConsumed();
        }
      } else if (attempts >= maxAttempts) {
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [autoStart, onAutoStartConsumed]);

  // Helper to compute display message dynamically (avoids stale message issue)
  // Uses explicit activity message linkage (see src/config/activityMessages.js)
  // Passes full activity object to support intentionId mapping for custom activities
  const computeDisplayMessage = useCallback((running, isComplete) => {
    if (isComplete) {
      return getActivityEndMessage(currentActivity, t);
    }
    if (running) {
      return getActivityStartMessage(currentActivity, t);
    }
    return t('invitation');
  }, [currentActivity, t]);

  // Sync timer state to local states for re-renders (ADR-007: no PAUSED state)
  useEffect(() => {
    const interval = setInterval(() => {
      if (timerRef.current) {
        const running = timerRef.current.running || false;
        const isCompleted = timerRef.current.isCompleted || false;

        setIsTimerRunning(running);
        setIsTimerCompleted(isCompleted);
        // Compute message freshly each interval to avoid stale translation
        setDisplayMessage(computeDisplayMessage(running, isCompleted));
      }
    }, 50);
    return () => clearInterval(interval);
  }, [computeDisplayMessage]);

  // Update timerState based on isTimerRunning and isTimerCompleted (source of truth for animations)
  useEffect(() => {
    if (isTimerCompleted) {
      setTimerState('COMPLETE');
    } else if (isTimerRunning) {
      setTimerState('RUNNING');
    } else {
      setTimerState('REST');
    }
  }, [isTimerRunning, isTimerCompleted]);

  // Update displayMessage when activity changes (flashActivity changes)
  useEffect(() => {
    if (flashActivity && timerRef.current) {
      // Recalculate message immediately with NEW activity (flashActivity)
      const running = timerRef.current.running || false;
      const isCompleted = timerRef.current.isCompleted || false;

      // Use flashActivity directly to avoid stale currentActivity
      if (isCompleted) {
        setDisplayMessage(getActivityEndMessage(flashActivity, t));
      } else if (running) {
        setDisplayMessage(getActivityStartMessage(flashActivity, t));
      } else {
        setDisplayMessage(t('invitation'));
      }
    }
  }, [flashActivity, t]);

  // Define styles (moved inside component so linter can track usage)
  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
  });

  // Handle dial tap (REST→START, RUNNING→toggle stop, COMPLETE→RESET)
  const handleDialTap = () => {
    if (!timerRef.current) {
      return;
    }

    const { running, isCompleted } = timerRef.current;

    if (isCompleted) {
      // COMPLETE → RESET
      timerRef.current.resetTimer();
    } else if (running) {
      // RUNNING → STOP (toggle behavior: tap = stop when stopRequiresLongPress = true)
      timerRef.current.stopTimer();
    } else {
      // REST → START
      timerRef.current.startTimer();
    }
  };

  // Handle play from controls (REST→START, RUNNING→toggle stop, COMPLETE→RESET)
  const handlePlayPause = () => {
    if (!timerRef.current) {
      return;
    }

    const { running, isCompleted } = timerRef.current;

    if (isCompleted) {
      timerRef.current.resetTimer();
    } else if (running) {
      // RUNNING → STOP (toggle behavior)
      timerRef.current.stopTimer();
    } else {
      timerRef.current.startTimer();
    }
  };

  // Handle reset from controls (COMPLETE → REST)
  const handleReset = () => {
    if (timerRef.current) {
      timerRef.current.resetTimer();
    }
  };

  // Handle stop from long press (ADR-007: RUNNING → REST via rewind animation)
  const handleStop = () => {
    if (timerRef.current) {
      timerRef.current.stopTimer();
    }
  };

  // Handle timer completion (ADR-003: trigger after 2 timers)
  const handleTimerComplete = async () => {
    const newCount = incrementCompletedTimers();

    // Robust trigger: show at timer 2-3, with fallback at 5 if missed
    const shouldShowModal = !hasSeenTwoTimersModal && (
      (newCount >= 2 && newCount <= 3) || // Primary trigger
      (newCount === 5) // Fallback if modal was somehow skipped
    );

    if (shouldShowModal) {
      analytics.trackTwoTimersMilestone({ fallback: newCount === 5 });
      setHasSeenTwoTimersModal(true);

      // Push two timers modal to stack
      modalStack.push('twoTimers', {
        snapPoints: ['50%'],
        onExplore: () => {
          modalStack.push('premium', {
            highlightedFeature: 'toutes les couleurs et activités',
          });
        },
      });
    }

    // In-app review request at 5 timers (after two timers modal)
    if (!hasSeenReviewRequest && newCount === 5) {
      try {
        const isAvailable = await StoreReview.isAvailableAsync();
        if (isAvailable) {
          await StoreReview.requestReview();
          setHasSeenReviewRequest(true);
          analytics.track('app_review_requested', { timerCount: newCount });
        }
      } catch (error) {
        // Non-blocking: review request is nice-to-have
        console.warn('[TimerScreen] StoreReview error:', error.message);
      }
    }
  };

  // In landscape, don't apply top/bottom safe area (causes offset)
  const safeAreaEdges = isLandscape ? ['left', 'right'] : ['top', 'bottom'];

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={safeAreaEdges}
    >
      {/* DIAL ZONE - Always visible (portrait & landscape) */}
      <DialZone
        onRunningChange={setIsTimerRunning}
        onTimerRef={(ref) => {
          timerRef.current = ref;
        }}
        onDialTap={handleDialTap}
        onTimerComplete={handleTimerComplete}
        isLandscape={isLandscape}
      />

      {/* ASIDE ZONE - Portrait only (hidden in landscape for zen mode) */}
      {!isLandscape && (
        <AsideZone
          timerState={timerState}
          displayMessage={displayMessage}
          isCompleted={isTimerCompleted}
          flashActivity={flashActivity}
          isTimerRunning={isTimerRunning}
          onOpenSettings={() => setSettingsModalVisible(true)}
        />
      )}
    </SafeAreaView>
  );
}

export default function TimerScreen({ autoStart, onAutoStartConsumed }) {
  return (
    <SafeAreaProvider>
      <TimerScreenContent
        autoStart={autoStart}
        onAutoStartConsumed={onAutoStartConsumed}
      />
    </SafeAreaProvider>
  );
}
