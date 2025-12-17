// src/screens/TimerScreen.jsx
import { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, Animated, PanResponder, TouchableOpacity } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeProvider';
import { TimerOptionsProvider, useTimerOptions } from '../contexts/TimerOptionsContext';
import { useTimerPalette } from '../contexts/TimerPaletteContext';
import { useTimerKeepAwake } from '../hooks/useTimerKeepAwake';
import { useScreenOrientation } from '../hooks/useScreenOrientation';
import { Drawer } from '../components/layout';
import { TimeTimer, ActivityLabel, DigitalTimer } from '../components/dial';
import { CommandBar, CarouselBar } from '../components/bars';
import OptionsDrawerContent from '../components/drawers/OptionsDrawerContent';
import SettingsButton from '../components/drawers/SettingsButton';
import useAnimatedDots from '../hooks/useAnimatedDots';
import { TwoTimersModal, PremiumModal, SettingsModal } from '../components/modals';
import { rs } from '../styles/responsive';
import analytics from '../services/analytics';
import { getDialMode } from '../components/dial/timerConstants';

const SWIPE_THRESHOLD = 50;

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
  const [optionsDrawerVisible, setOptionsDrawerVisible] = useState(false);
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);
  const [twoTimersModalVisible, setTwoTimersModalVisible] = useState(false);
  const [premiumModalVisible, setPremiumModalVisible] = useState(false);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerRemaining, setTimerRemaining] = useState(0);
  const [displayMessage, setDisplayMessage] = useState('');
  const [isTimerCompleted, setIsTimerCompleted] = useState(false);
  const timerRef = useRef(null);
  const dialWrapperRef = useRef(null);
  const dialLayoutRef = useRef(null);
  const pillBounceRef = useRef(new Animated.Value(0)).current;
  const animatedDots = useAnimatedDots(
    currentActivity?.pulseDuration || 800,
    displayMessage !== ''
  );

  // Micro-bounce animation on mount (once only)
  useEffect(() => {
    Animated.sequence([
      Animated.timing(pillBounceRef, {
        toValue: -15,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(pillBounceRef, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

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
    dialContainer: {
      alignItems: 'center',
      flex: 1, // Takes remaining space, centers dial naturally
      justifyContent: 'center',
    },
    digitalTimerContainer: {
      alignItems: 'center',
      alignSelf: 'center',
      bottom: rs(8),
      height: rs(48),
      justifyContent: 'center',
      position: 'absolute',
    },
    footerZone: {
      alignItems: 'center',
      height: rs(60, 'height'),
      justifyContent: 'center',
      position: 'relative',
      width: '100%',
    },
  });

  // Helper to check if touch is within dial bounds
  const isTouchInDial = (evt) => {
    if (!dialLayoutRef.current) {
      return false;
    }

    const { pageX, pageY } = evt.nativeEvent;
    const { x, y, width: dialWidth, height: dialHeight } = dialLayoutRef.current;

    return pageX >= x && pageX <= x + dialWidth && pageY >= y && pageY <= y + dialHeight;
  };

  // Swipe up gesture to reveal options drawer (but not when touching dial)
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: (evt) => {
        if (isTouchInDial(evt)) {
          return false; // Let dial handle its own gestures
        }
        return !isTimerRunning && !optionsDrawerVisible;
      },
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        if (isTouchInDial(evt)) {
          return false; // Let dial handle its own gestures
        }
        return !isTimerRunning && !optionsDrawerVisible && gestureState.dy < -10; // Swipe UP (negative dy)
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy < -SWIPE_THRESHOLD) {
          // Swipe UP
          setOptionsDrawerVisible(true);
        }
      },
    })
  ).current;

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

  // Capture dial wrapper layout for gesture detection
  const handleDialRef = (ref) => {
    dialWrapperRef.current = ref;
    if (ref) {
      ref.measureInWindow((x, y, width, height) => {
        dialLayoutRef.current = { x, y, width, height };
      });
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
      {...panResponder.panHandlers}
    >
      {/* LANDSCAPE MODE: ZEN ABSOLUTE - Only dial visible */}
      {!isLandscape && (
        <>
          {/* Activity Label - Top */}
          {currentActivity && currentActivity.id !== 'none' && (
            <ActivityLabel
              emoji={currentActivity.emoji}
              label={currentActivity.label}
              animatedDots={animatedDots}
              displayMessage={displayMessage}
              isCompleted={isTimerCompleted}
            />
          )}

          {/* Dial - Below label (flex: 1, centered) */}
          <View style={styles.dialContainer}>
            <TimeTimer
              onRunningChange={setIsTimerRunning}
              onTimerRef={(ref) => {
                timerRef.current = ref;
                if (ref) {
                  setTimerRemaining(ref.remaining || ref.duration || 0);
                }
              }}
              onDialRef={handleDialRef}
              onDialTap={handleDialTap}
              onTimerComplete={handleTimerComplete}
            />
          </View>

          {/* Command Bar - Below dial */}
          <CommandBar
            commandBarConfig={commandBarConfig}
            isTimerRunning={isTimerRunning}
            onPlayPause={handlePlayPause}
            onReset={handleReset}
            onSelectPreset={handlePresetSelect}
          />

          {/* Carousel Bar - Bottom */}
          <CarouselBar
            carouselBarConfig={carouselBarConfig}
            isTimerRunning={isTimerRunning}
            drawerVisible={optionsDrawerVisible}
          />

          {/* Digital Timer - Absolute bottom */}
          <View style={styles.footerZone}>
            {/* Digital Timer ou Mini Toggle */}
            <Animated.View
              style={[
                styles.digitalTimerContainer,
                {
                  transform: [{ translateY: pillBounceRef }],
                },
              ]}
            >
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
            </Animated.View>
          </View>
        </>
      )}

      {/* Options Drawer (from bottom) - 2 carousels + Settings footer */}
      {/* Hidden in landscape mode for zen experience */}
      {!isLandscape && (
        <Drawer
          visible={optionsDrawerVisible}
          onClose={() => setOptionsDrawerVisible(false)}
          direction="bottom"
          height={0.26}
          footerContent={
            <SettingsButton
              onPress={() => {
                setOptionsDrawerVisible(false);
                setSettingsModalVisible(true);
              }}
            />
          }
        >
          <OptionsDrawerContent
            onSelectPreset={handlePresetSelect}
            drawerVisible={optionsDrawerVisible}
          />
        </Drawer>
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
