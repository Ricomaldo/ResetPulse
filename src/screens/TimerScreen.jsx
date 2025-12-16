// src/screens/TimerScreen.jsx
import { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, Animated, PanResponder, TouchableOpacity } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeProvider';
import { TimerOptionsProvider, useTimerOptions } from '../contexts/TimerOptionsContext';
import { useTimerPalette } from '../contexts/TimerPaletteContext';
import { useTimerKeepAwake } from '../hooks/useTimerKeepAwake';
import { TimeTimer, Drawer, CircularToggle } from '../components/layout';
import OptionsDrawerContent from '../components/drawers/OptionsDrawerContent';
import ActivityLabel from '../components/timer/ActivityLabel';
import DigitalTimer from '../components/timer/DigitalTimer';
import useAnimatedDots from '../hooks/useAnimatedDots';
import { TwoTimersModal, PremiumModal, SettingsModal } from '../components/modals';
import { rs } from '../styles/responsive';
import analytics from '../services/analytics';

const SWIPE_THRESHOLD = 50;

function TimerScreenContent() {
  const theme = useTheme();
  const {
    currentDuration,
    showDigitalTimer,
    setShowDigitalTimer,
    currentActivity,
    clockwise,
    setClockwise,
    showRotationToggle,
    incrementCompletedTimers,
    hasSeenTwoTimersModal,
    setHasSeenTwoTimersModal,
    setScaleMode,
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
  const animatedDots = useAnimatedDots(currentActivity?.pulseDuration || 800, displayMessage !== '');

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
    digitalTimerContainer: {
      alignItems: 'center',
      alignSelf: 'center',
      bottom: rs(50),
      height: rs(48),
      justifyContent: 'center',
      position: 'absolute',
    },
    drawerHandleContainer: {
      alignItems: 'center',
      bottom: rs(8),
      justifyContent: 'center',
      position: 'absolute',
      width: '100%',
    },
    drawerHandle: {
      backgroundColor: 'transparent', // Invisible affordance - structure only
      borderRadius: rs(2),
      height: rs(4),
      width: rs(36),
    },
    rotationToggleContainer: {
      alignSelf: 'center',
      position: 'absolute',
      top: '20%',
    },
    timerContainer: {
      alignItems: 'center',
      flex: 1,
      justifyContent: 'center',
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
  // Scale buttons ONLY change the dial's granularity. Duration is completely independent.
  // If duration > scale max, the dial shows maxed out and digital timer shows the overflow.
  const handlePresetSelect = (presetData) => {
    const { newScaleMode } = presetData;
    setScaleMode(newScaleMode);
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
      {/* Activity label - shows emoji+label at rest, message with dots during running */}
      {currentActivity && currentActivity.id !== 'none' && (
        <ActivityLabel
          emoji={currentActivity.emoji}
          label={currentActivity.label}
          animatedDots={animatedDots}
          displayMessage={displayMessage}
          isCompleted={isTimerCompleted}
        />
      )}

      {/* Timer - center, zen */}
      <View style={styles.timerContainer}>
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

      {/* Rotation Toggle - au-dessus du dial */}
      {showRotationToggle && !isTimerRunning && (
        <View style={styles.rotationToggleContainer}>
          <CircularToggle clockwise={clockwise} onToggle={setClockwise} size={50} />
        </View>
      )}

      {/* Digital Timer ou Mini Toggle - partie basse (même position) */}
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

      {/* Drawer Handle - Visual affordance for drawer at bottom */}
      <View style={styles.drawerHandleContainer}>
        <View style={styles.drawerHandle} />
      </View>

      {/* Options Drawer (from bottom) - 3 sections + Settings button */}
      <Drawer
        visible={optionsDrawerVisible}
        onClose={() => setOptionsDrawerVisible(false)}
        direction="bottom"
        height={0.5}
        expandedHeight={0.85}
      >
        <OptionsDrawerContent
          onSelectPreset={handlePresetSelect}
          drawerVisible={optionsDrawerVisible}
          onOpenSettings={() => {
            setOptionsDrawerVisible(false);
            setSettingsModalVisible(true);
          }}
        />
      </Drawer>

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
