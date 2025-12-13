// src/screens/TimerScreen.jsx
import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, Animated, PanResponder, Dimensions, TouchableOpacity, Text } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeProvider';
import { TimerOptionsProvider, useTimerOptions } from '../contexts/TimerOptionsContext';
import { useTimerPalette } from '../contexts/TimerPaletteContext';
import { useTimerKeepAwake } from '../hooks/useTimerKeepAwake';
import TimeTimer from '../components/TimeTimer';
import Drawer from '../components/Drawer';
import OptionsDrawerContent from '../components/OptionsDrawerContent';
import DigitalTimer from '../components/timer/DigitalTimer';
import { SettingsModal } from '../components/modals';
import { rs } from '../styles/responsive';

const SWIPE_THRESHOLD = 50;
const { width, height } = Dimensions.get('window');

const createStyles = (theme) => {
  return StyleSheet.create({
    container: {
      flex: 1,
    },

    timerContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },

    activityLabel: {
      position: 'absolute',
      top: rs(60),
      alignSelf: 'center',
      fontSize: rs(16),
      fontWeight: '500',
      color: theme.colors.textSecondary,
      letterSpacing: 0.5,
    },

    digitalTimerContainer: {
      position: 'absolute',
      bottom: rs(100),
      alignSelf: 'center',
      alignItems: 'center',
      justifyContent: 'center',
      height: rs(48),
    },
  });
};

function TimerScreenContent() {
  const theme = useTheme();
  const { currentDuration, showDigitalTimer, setShowDigitalTimer, currentActivity } = useTimerOptions();
  const { currentColor } = useTimerPalette();
  const [optionsDrawerVisible, setOptionsDrawerVisible] = useState(false);
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerDuration, setTimerDuration] = useState(0);
  const timerRef = useRef(null);
  const dialWrapperRef = useRef(null);
  const dialLayoutRef = useRef(null);

  // Keep screen awake during timer
  useTimerKeepAwake();

  const styles = createStyles(theme);

  // Helper to check if touch is within dial bounds
  const isTouchInDial = (evt) => {
    if (!dialLayoutRef.current) return false;

    const { pageX, pageY } = evt.nativeEvent;
    const { x, y, width: dialWidth, height: dialHeight } = dialLayoutRef.current;

    return (
      pageX >= x &&
      pageX <= x + dialWidth &&
      pageY >= y &&
      pageY <= y + dialHeight
    );
  };

  // Swipe up gesture to reveal options drawer (but not when touching dial)
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: (evt) => {
        if (isTouchInDial(evt)) return false; // Let dial handle its own gestures
        return !isTimerRunning && !optionsDrawerVisible;
      },
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        if (isTouchInDial(evt)) return false; // Let dial handle its own gestures
        return !isTimerRunning && !optionsDrawerVisible && gestureState.dy < -10; // Swipe UP (negative dy)
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy < -SWIPE_THRESHOLD) { // Swipe UP
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
      setTimerDuration(seconds);
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

  // Update timer duration for digital timer display
  useEffect(() => {
    if (timerRef.current) {
      setTimerDuration(timerRef.current.duration || 0);
    }
  }, [currentDuration]);

  // Update timer duration continuously (both when running and when dragging)
  useEffect(() => {
    const interval = setInterval(() => {
      if (timerRef.current) {
        const currentDur = timerRef.current.duration || 0;
        const currentProg = timerRef.current.progress || 1;
        const remaining = isTimerRunning
          ? Math.ceil(currentDur * currentProg)
          : currentDur;
        setTimerDuration(remaining);
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
      {/* Activity label - en haut */}
      {currentActivity && currentActivity.id !== 'none' && (
        <Text style={styles.activityLabel}>
          {currentActivity.emoji} {currentActivity.label}
        </Text>
      )}

      {/* Timer - center, zen */}
      <View style={styles.timerContainer}>
        <TimeTimer
          onRunningChange={setIsTimerRunning}
          onTimerRef={(ref) => {
            timerRef.current = ref;
            if (ref) {
              setTimerDuration(ref.duration || 0);
            }
          }}
          onDialRef={handleDialRef}
          onDialTap={handleDialTap}
        />
      </View>

      {/* Digital Timer ou Mini Toggle - partie basse (même position) */}
      <View style={styles.digitalTimerContainer}>
        <TouchableOpacity
          onPress={handleToggleDigitalTimer}
          activeOpacity={0.8}
          hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
        >
          <DigitalTimer
            remaining={timerDuration}
            isRunning={isTimerRunning}
            color={currentColor}
            mini={!showDigitalTimer}
          />
        </TouchableOpacity>
      </View>

      {/* Options Drawer (from bottom) */}
      <Drawer
        visible={optionsDrawerVisible}
        onClose={() => setOptionsDrawerVisible(false)}
        direction="bottom"
        height={0.5}
      >
        <OptionsDrawerContent
          currentDuration={currentDuration}
          onSelectPreset={handlePresetSelect}
          onOpenSettings={() => setSettingsModalVisible(true)}
        />
      </Drawer>

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
