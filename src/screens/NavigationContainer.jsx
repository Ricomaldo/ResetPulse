// src/screens/NavigationContainer.jsx
import React, { useRef, useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import PagerView from 'react-native-pager-view';
import { useTimerOptions } from '../contexts/TimerOptionsContext';
import TimerScreen from './TimerScreen';
import OptionsScreen from './OptionsScreen';
import SettingsScreen from './SettingsScreen';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function NavigationContainer() {
  const pagerRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerDuration, setTimerDuration] = useState(0);
  const timerRef = useRef(null);
  const dialLayoutRef = useRef(null);
  const { currentDuration } = useTimerOptions();

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

  const handlePageSelected = (e) => {
    setCurrentPage(e.nativeEvent.position);
  };

  const handlePresetSelect = (seconds) => {
    if (timerRef.current) {
      timerRef.current.setDuration(seconds);
      setTimerDuration(seconds);
    }
    // Return to timer screen
    pagerRef.current?.setPage(0);
  };

  const handleNavigateToSettings = () => {
    pagerRef.current?.setPage(2);
  };

  const handleTimerRef = (ref) => {
    timerRef.current = ref;
    if (ref) {
      setTimerDuration(ref.duration || 0);
    }
  };

  const handleDialRef = (ref) => {
    dialLayoutRef.current = ref;
  };

  const styles = StyleSheet.create({
    pager: {
      flex: 1,
    },
    page: {
      width: '100%',
      height: SCREEN_HEIGHT,
    },
  });

  return (
    <PagerView
      ref={pagerRef}
      style={styles.pager}
      initialPage={0}
      orientation="vertical"
      scrollEnabled={!isTimerRunning}
      onPageSelected={handlePageSelected}
      overdrag={false}
    >
      {/* Page 0: Timer */}
      <View key="0" style={styles.page} collapsable={false}>
        <TimerScreen
          onTimerRef={handleTimerRef}
          onRunningChange={setIsTimerRunning}
          onDialRef={handleDialRef}
          timerDuration={timerDuration}
          isTimerRunning={isTimerRunning}
        />
      </View>

      {/* Page 1: Options */}
      <View key="1" style={styles.page} collapsable={false}>
        <OptionsScreen
          currentDuration={timerDuration}
          onSelectPreset={handlePresetSelect}
          onNavigateToSettings={handleNavigateToSettings}
        />
      </View>

      {/* Page 2: Settings */}
      <View key="2" style={styles.page} collapsable={false}>
        <SettingsScreen />
      </View>
    </PagerView>
  );
}
