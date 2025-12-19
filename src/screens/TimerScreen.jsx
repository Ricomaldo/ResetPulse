// src/screens/TimerScreen.jsx
import { useState, useRef, useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeProvider';
import { TimerOptionsProvider, useTimerOptions } from '../contexts/TimerOptionsContext';
import { useTimerKeepAwake } from '../hooks/useTimerKeepAwake';
import { useScreenOrientation } from '../hooks/useScreenOrientation';
import { DialZone, AsideZone } from '../components/layout';
import { TwoTimersModal, PremiumModal, SettingsModal } from '../components/modals';
import analytics from '../services/analytics';

function TimerScreenContent() {
  const theme = useTheme();
  const { isLandscape } = useScreenOrientation(); // Detect orientation changes
  const {
    incrementCompletedTimers,
    hasSeenTwoTimersModal,
    setHasSeenTwoTimersModal,
    flashActivity,
  } = useTimerOptions();
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);
  const [twoTimersModalVisible, setTwoTimersModalVisible] = useState(false);
  const [premiumModalVisible, setPremiumModalVisible] = useState(false);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [displayMessage, setDisplayMessage] = useState('');
  const [isTimerCompleted, setIsTimerCompleted] = useState(false);
  const [timerState, setTimerState] = useState('REST'); // 'REST' | 'RUNNING' | 'COMPLETE'
  const timerRef = useRef(null);

  // Keep screen awake during timer
  useTimerKeepAwake();

  // Sync timer state to local states for re-renders (ADR-007: no PAUSED state)
  useEffect(() => {
    const interval = setInterval(() => {
      if (timerRef.current) {
        setDisplayMessage(timerRef.current.displayMessage || '');
        setIsTimerCompleted(timerRef.current.isCompleted || false);
      }
    }, 50);
    return () => clearInterval(interval);
  }, []);

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

  // Clear displayMessage when activity is selected (flashActivity changes)
  useEffect(() => {
    if (flashActivity) {
      setDisplayMessage('');
    }
  }, [flashActivity]);

  // Define styles (moved inside component so linter can track usage)
  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
  });

  // Handle dial tap (REST→START, RUNNING→toggle stop, COMPLETE→RESET)
  const handleDialTap = () => {
    if (!timerRef.current) {return;}

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
    if (!timerRef.current) {return;}

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
  const handleTimerComplete = () => {
    const newCount = incrementCompletedTimers();

    if (newCount === 2 && !hasSeenTwoTimersModal) {
      analytics.trackTwoTimersMilestone();
      setTwoTimersModalVisible(true);
      setHasSeenTwoTimersModal(true);
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={['top', 'bottom']}
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
          isTimerCompleted={isTimerCompleted}
          onPlay={handlePlayPause}
          onReset={handleReset}
          onStop={handleStop}
          onOpenSettings={() => setSettingsModalVisible(true)}
          onSnapChange={() => setDisplayMessage('')}
        />
      )}

      {/* Two Timers Reminder Modal (ADR-003) */}
      <TwoTimersModal
        visible={twoTimersModalVisible}
        onClose={() => setTwoTimersModalVisible(false)}
        onExplore={() => setPremiumModalVisible(true)}
      />

      {/* Premium Modal */}
      <PremiumModal
        visible={premiumModalVisible}
        onClose={() => setPremiumModalVisible(false)}
        highlightedFeature="toutes les couleurs et activités"
      />

      {/* Settings Modal */}
      <SettingsModal
        visible={settingsModalVisible}
        onClose={() => setSettingsModalVisible(false)}
      />
    </SafeAreaView>
  );
}

export default function TimerScreen() {
  return (
    <SafeAreaProvider>
      <TimerOptionsProvider>
        <TimerScreenContent />
      </TimerOptionsProvider>
    </SafeAreaProvider>
  );
}
