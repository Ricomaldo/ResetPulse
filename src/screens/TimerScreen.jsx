// src/screens/TimerScreen.jsx
import { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { NativeViewGestureHandler } from 'react-native-gesture-handler';
import { useTheme } from '../theme/ThemeProvider';
import { TimerOptionsProvider, useTimerOptions } from '../contexts/TimerOptionsContext';
import { useTimerPalette } from '../contexts/TimerPaletteContext';
import { useTimerKeepAwake } from '../hooks/useTimerKeepAwake';
import { useScreenOrientation } from '../hooks/useScreenOrientation';
import { DialZone, AsideZone } from '../components/layout';
import { TimeTimer, ActivityLabel, DigitalTimer } from '../components/dial';
import { CommandBar, CarouselBar } from '../components/bars';
import useAnimatedDots from '../hooks/useAnimatedDots';
import { TwoTimersModal, PremiumModal, SettingsModal } from '../components/modals';
import { rs } from '../styles/responsive';
import analytics from '../services/analytics';
import { devColors } from '../theme/colors';
import { getDialMode } from '../components/dial/timerConstants';

function TimerScreenContent() {
  const theme = useTheme();
  const { isLandscape } = useScreenOrientation(); // Detect orientation changes
  const {
    currentDuration,
    setCurrentDuration,
    showDigitalTimer,
    setShowDigitalTimer,
    currentActivity,
    incrementCompletedTimers,
    hasSeenTwoTimersModal,
    setHasSeenTwoTimersModal,
    setScaleMode,
    commandBarConfig,
    carouselBarConfig,
  } = useTimerOptions();
  const { currentColor } = useTimerPalette();
  // Note: optionsDrawerVisible removed - BottomSheet manages its own state now
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);
  const [twoTimersModalVisible, setTwoTimersModalVisible] = useState(false);
  const [premiumModalVisible, setPremiumModalVisible] = useState(false);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerRemaining, setTimerRemaining] = useState(0);
  const [displayMessage, setDisplayMessage] = useState('');
  const [isTimerCompleted, setIsTimerCompleted] = useState(false);
  const timerRef = useRef(null);
  const animatedDots = useAnimatedDots(
    currentActivity?.pulseDuration || 800,
    displayMessage !== ''
  );

  // Keep screen awake during timer
  useTimerKeepAwake();

  // Sync timer state to local states for re-renders
  useEffect(() => {
    const interval = setInterval(() => {
      if (timerRef.current) {
        setDisplayMessage(timerRef.current.displayMessage || '');
        // isPaused isn't exposed, but we can check from displayMessage
        setIsTimerCompleted(timerRef.current.isCompleted || false);
      }
    }, 50);
    return () => clearInterval(interval);
  }, []);

  // Define styles (moved inside component so linter can track usage)
  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    digitalTimerZone: {
      height: rs(64), // Zone dédiée au digitalTimer (inclut padding)
      alignItems: 'center',
      justifyContent: 'center',
    },
    dialCenteredZone: {
      flex: 1, // Prend l'espace restant de dialZone
      alignItems: 'center',
      justifyContent: 'center',
    },
    dialContainer: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    messageZone: {
      height: rs(64), // Hauteur fixe pour ActivityLabel
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.background,
    },
  });

  // Handle dial tap = start/pause
  const handleDialTap = () => {
    if (timerRef.current) {
      timerRef.current.toggleRunning();
    }
  };

  // Handle preset selection from drawer
  // Tap preset → change scale mode
  // If duration > new scale max → cap duration to max
  // If duration <= new scale max → keep duration unchanged
  const handlePresetSelect = (presetData) => {
    const { newScaleMode } = presetData;

    // Get max duration for new scale mode
    const dialMode = getDialMode(newScaleMode);
    const maxSecondsForNewScale = dialMode.maxMinutes * 60;

    // Cap duration if it exceeds new scale max
    const cappedDuration = Math.min(currentDuration, maxSecondsForNewScale);

    // Update scale mode
    setScaleMode(newScaleMode);

    // Update duration if capped
    if (cappedDuration !== currentDuration) {
      setCurrentDuration(cappedDuration);

      // Also update the timer if it's running
      if (timerRef.current) {
        timerRef.current.setDuration(cappedDuration);
        setTimerRemaining(cappedDuration);
      }
    }
  };

  // Toggle digital timer visibility
  const handleToggleDigitalTimer = () => {
    setShowDigitalTimer(!showDigitalTimer);
  };

  // Handle play/pause from CommandBar
  const handlePlayPause = () => {
    if (timerRef.current) {
      timerRef.current.toggleRunning();
    }
  };

  // Handle reset from CommandBar
  const handleReset = () => {
    if (timerRef.current) {
      timerRef.current.resetTimer();
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

  // Update timer remaining for digital timer display
  useEffect(() => {
    if (timerRef.current) {
      setTimerRemaining(timerRef.current.remaining || timerRef.current.duration || 0);
    }
  }, [currentDuration]);

  // Update timer remaining continuously (both when running and when dragging)
  useEffect(() => {
    const interval = setInterval(() => {
      if (timerRef.current) {
        // Use timer.remaining directly - it's already calculated correctly in useTimer
        const remaining = timerRef.current.remaining || timerRef.current.duration || 0;
        // Only update if value actually changed to prevent unnecessary re-renders
        setTimerRemaining((prev) => (prev !== remaining ? remaining : prev));
      }
    }, 100); // Update every 100ms for smooth display

    return () => clearInterval(interval);
  }, [isTimerRunning]);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={['top', 'bottom']}
    >
        {/* LANDSCAPE MODE: ZEN ABSOLUTE - Only dial visible */}
        {!isLandscape && (
        <>
          {/* DIAL ZONE - Layout vertical : DigitalTimer (haut) + Dial (centre) */}
          <DialZone>
            {/* Zone DigitalTimer - Hauteur fixe */}
            <View style={styles.digitalTimerZone}>
              <TouchableOpacity
                onPress={handleToggleDigitalTimer}
                activeOpacity={0.8}
                hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
              >
                <DigitalTimer
                  remaining={timerRemaining}
                  isRunning={isTimerRunning}
                  color={currentColor}
                  isCollapsed={!showDigitalTimer}
                  pulseDuration={currentActivity?.pulseDuration || 800}
                />
              </TouchableOpacity>
            </View>

            {/* Zone Dial centré - Prend l'espace restant */}
            <View style={styles.dialCenteredZone}>
              <NativeViewGestureHandler disallowInterruption={true}>
                <View style={styles.dialContainer}>
                  <TimeTimer
                    onRunningChange={setIsTimerRunning}
                    onTimerRef={(ref) => {
                      timerRef.current = ref;
                      if (ref) {
                        setTimerRemaining(ref.remaining || ref.duration || 0);
                      }
                    }}
                    onDialTap={handleDialTap}
                    onTimerComplete={handleTimerComplete}
                  />
                </View>
              </NativeViewGestureHandler>
            </View>
          </DialZone>

          {/* MESSAGE ZONE - ActivityLabel permanente (ADR-005 v2) */}
          <View style={styles.messageZone}>
            {currentActivity && currentActivity.id !== 'none' && (
              <ActivityLabel
                emoji={currentActivity.emoji}
                label={currentActivity.label}
                animatedDots={animatedDots}
                displayMessage={displayMessage}
                isCompleted={isTimerCompleted}
              />
            )}
          </View>

          {/* ASIDE ZONE - BottomSheet 3-Snap (ADR-005 v2) */}
          <AsideZone
            isTimerRunning={isTimerRunning}
            onOpenSettings={() => setSettingsModalVisible(true)}
          />
        </>
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
