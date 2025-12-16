// src/screens/TimerScreen.jsx
import { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  PanResponder,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeProvider';
import { TimerOptionsProvider, useTimerOptions } from '../contexts/TimerOptionsContext';
import { useTimerPalette } from '../contexts/TimerPaletteContext';
import { useTimerKeepAwake } from '../hooks/useTimerKeepAwake';
import { TimeTimer, Drawer, CircularToggle, SwipeUpHint } from '../components/layout';
import { ExpandableDrawerContent } from '../components/drawers';
import DigitalTimer from '../components/timer/DigitalTimer';
import useAnimatedDots from '../hooks/useAnimatedDots';
import { TwoTimersModal, PremiumModal } from '../components/modals';
import { rs } from '../styles/responsive';
import analytics from '../services/analytics';
import { fontWeights } from '../theme/tokens';

const SWIPE_THRESHOLD = 50;

function TimerScreenContent() {
  const theme = useTheme();
  const {
    currentDuration,
    setCurrentDuration,
    showDigitalTimer,
    setShowDigitalTimer,
    currentActivity,
    clockwise,
    setClockwise,
    showRotationToggle,
    incrementCompletedTimers,
    hasSeenTwoTimersModal,
    setHasSeenTwoTimersModal,
  } = useTimerOptions();
  const { currentColor } = useTimerPalette();
  const [optionsDrawerVisible, setOptionsDrawerVisible] = useState(false);
  const [twoTimersModalVisible, setTwoTimersModalVisible] = useState(false);
  const [premiumModalVisible, setPremiumModalVisible] = useState(false);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerRemaining, setTimerRemaining] = useState(0);
  const timerRef = useRef(null);
  const dialWrapperRef = useRef(null);
  const dialLayoutRef = useRef(null);
  const activityLabelAnimRef = useRef(new Animated.Value(0)).current;
  const animatedDots = useAnimatedDots(currentActivity?.pulseDuration || 800);

  // Animate activity label on timer start
  useEffect(() => {
    if (isTimerRunning && currentActivity && currentActivity.id !== 'none') {
      Animated.spring(activityLabelAnimRef, {
        toValue: 1,
        friction: 10,
        tension: 50,
        useNativeDriver: true,
      }).start();
    } else {
      activityLabelAnimRef.setValue(0);
    }
  }, [isTimerRunning, currentActivity]);

  // Keep screen awake during timer
  useTimerKeepAwake();

  // Define styles (moved inside component so linter can track usage)
  const styles = StyleSheet.create({
    activityLabel: {
      color: theme.colors.textSecondary,
      fontSize: rs(16),
      fontWeight: fontWeights.medium,
      letterSpacing: 0.5,
      minWidth: rs(100), // Reserve space so label doesn't shift
      textAlign: 'center',
    },
    activityLabelContainer: {
      alignItems: 'center',
      left: 0,
      position: 'absolute',
      right: 0,
      top: rs(80),
    },
    container: {
      flex: 1,
    },
    digitalTimerContainer: {
      alignItems: 'center',
      alignSelf: 'center',
      bottom: rs(100),
      height: rs(48),
      justifyContent: 'center',
      position: 'absolute',
    },
    rotationToggleContainer: {
      alignSelf: 'center',
      position: 'absolute',
      top: '20%',
    },
    swipeHintContainer: {
      alignSelf: 'center',
      position: 'absolute',
      top: rs(140),
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
  const handlePresetSelect = (seconds) => {
    if (timerRef.current) {
      timerRef.current.setDuration(seconds);
      setTimerRemaining(seconds);
      setCurrentDuration(seconds);
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
      {/* Activity label - en haut (dynamic based on timer state) */}
      <Animated.View
        style={[
          styles.activityLabelContainer,
          {
            transform: [
              {
                translateY: activityLabelAnimRef.interpolate({
                  inputRange: [0, 1],
                  outputRange: [10, 0],
                }),
              },
            ],
          },
        ]}
      >
        <Animated.Text
          style={[
            styles.activityLabel,
            {
              opacity: activityLabelAnimRef.interpolate({
                inputRange: [0, 1],
                outputRange: [1, 1],
              }),
            },
          ]}
        >
          {isTimerRunning && currentActivity && currentActivity.id !== 'none'
            ? `${currentActivity.emoji} ${currentActivity.label}${animatedDots}`
            : 'Tap sur le cadran pour démarrer'}
        </Animated.Text>
      </Animated.View>

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
      <View style={styles.digitalTimerContainer}>
        <TouchableOpacity
          onPress={handleToggleDigitalTimer}
          activeOpacity={0.8}
          hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
        >
          <DigitalTimer
            remaining={timerRemaining}
            isRunning={isTimerRunning}
            color={currentColor}
            mini={!showDigitalTimer}
            pulseDuration={currentActivity?.pulseDuration || 800}
          />
        </TouchableOpacity>
      </View>

      {/* Swipe Up Hint - en bas */}
      {!isTimerRunning && !optionsDrawerVisible && (
        <View style={styles.swipeHintContainer}>
          <SwipeUpHint message="Glissez vers le haut" />
        </View>
      )}

      {/* Options Drawer (from bottom) - swipe up to expand for settings */}
      <Drawer
        visible={optionsDrawerVisible}
        onClose={() => setOptionsDrawerVisible(false)}
        direction="bottom"
        height={0.5}
        expandedHeight={0.85}
      >
        <ExpandableDrawerContent
          currentDuration={currentDuration}
          onSelectPreset={handlePresetSelect}
          drawerVisible={optionsDrawerVisible}
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
