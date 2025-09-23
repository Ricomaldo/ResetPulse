// src/screens/TimerScreen.jsx
import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, PanResponder, Animated } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeProvider';
import { TimerOptionsProvider, useTimerOptions } from '../contexts/TimerOptionsContext';
import ActivityCarousel from '../components/ActivityCarousel';
import PaletteCarousel from '../components/PaletteCarousel';
import TimeTimer from '../components/TimeTimer';
import SettingsModal from '../components/SettingsModal';
import { SettingsIcon } from '../components/Icons';
import { rs, getLayout, getDeviceInfo } from '../styles/responsive';

function TimerScreenContent() {
  const theme = useTheme();
  const { showActivities } = useTimerOptions();
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const timerRef = useRef(null);
  const { isLandscape } = getDeviceInfo();
  const layout = getLayout();

  // Animation values for staggered entrance
  const headerAnim = useRef(new Animated.Value(0)).current;
  const activityAnim = useRef(new Animated.Value(0)).current;
  const timerAnim = useRef(new Animated.Value(0)).current;
  const timerScaleAnim = useRef(new Animated.Value(0.8)).current;
  const paletteAnim = useRef(new Animated.Value(0)).current;

  // Staggered entrance animations
  useEffect(() => {
    const animations = [
      // Header slides down
      Animated.timing(headerAnim, {
        toValue: 1,
        duration: 400,
        delay: 200,
        useNativeDriver: true,
      }),
      // Activities slide in from left
      Animated.timing(activityAnim, {
        toValue: 1,
        duration: 400,
        delay: 400,
        useNativeDriver: true,
      }),
      // Timer fades and scales in
      Animated.parallel([
        Animated.timing(timerAnim, {
          toValue: 1,
          duration: 600,
          delay: 600,
          useNativeDriver: true,
        }),
        Animated.spring(timerScaleAnim, {
          toValue: 1,
          tension: 40,
          friction: 7,
          delay: 600,
          useNativeDriver: true,
        }),
      ]),
      // Palette slides up
      Animated.timing(paletteAnim, {
        toValue: 1,
        duration: 400,
        delay: 800,
        useNativeDriver: true,
      }),
    ];

    Animated.stagger(0, animations).start();
  }, []);

  // Swipe to exit zen mode (when timer is running)
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => isTimerRunning,
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        // Only respond to vertical swipes when timer is running
        return isTimerRunning && Math.abs(gestureState.dy) > Math.abs(gestureState.dx) && Math.abs(gestureState.dy) > 10;
      },
      onPanResponderRelease: (evt, gestureState) => {
        // Pause timer on significant vertical swipe
        if (Math.abs(gestureState.dy) > 50 && timerRef.current) {
          timerRef.current.toggleRunning();
        }
      },
    })
  ).current;

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: rs(20),
    },

    header: {
      height: rs(50, 'height'),
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      paddingHorizontal: rs(10),
      zIndex: 100,
    },

    settingsButton: {
      width: rs(44),
      height: rs(44),
      borderRadius: rs(22),
      alignItems: 'center',
      justifyContent: 'center',
      ...theme.shadows.md,
    },

    activitySection: {
      height: rs(65, 'height'),
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 0,
      overflow: 'visible', // Permet le d\u00e9bordement si n\u00e9cessaire
    },

    timerSection: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      marginVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
    },

    paletteSection: {
      height: rs(65, 'height'),
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 0,
      marginBottom: rs(10, 'height'),
    },

    paletteContainer: {
      backgroundColor: theme.isDark ? theme.colors.brand.deep : theme.colors.brand.neutral,
      paddingVertical: rs(8),
      paddingHorizontal: rs(20),
      borderRadius: rs(35),
      borderWidth: 1,
      borderColor: theme.colors.brand.primary,
      ...theme.shadows.lg,
    },
  });

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={['top', 'bottom']}
      {...panResponder.panHandlers}>
      {/* Header with Settings Button */}
      <Animated.View
        style={[
          styles.header,
          {
            opacity: headerAnim,
            transform: [{
              translateY: headerAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [-20, 0]
              })
            }]
          }
        ]}>
        <View style={{ flex: 1 }} />
        <TouchableOpacity
          style={[styles.settingsButton, {
            backgroundColor: theme.colors.brand.neutral,
            borderWidth: 1,
            borderColor: theme.colors.brand.secondary
          }]}
          onPress={() => setSettingsVisible(true)}
          activeOpacity={0.7}
        >
          <SettingsIcon size={24} color={theme.colors.brand.primary} />
        </TouchableOpacity>
      </Animated.View>

      {/* Activities Section - Conditionnel */}
      {showActivities && (
        <Animated.View
          style={[
            styles.activitySection,
            {
              opacity: Animated.multiply(
                activityAnim,
                isTimerRunning ? 0.2 : 1
              ),
              transform: [{
                translateX: activityAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-30, 0]
                })
              }]
            }
          ]}>
          <ActivityCarousel isTimerRunning={isTimerRunning} />
        </Animated.View>
      )}

      {/* Timer Section - Flex to take available space */}
      <Animated.View
        style={[
          styles.timerSection,
          {
            opacity: timerAnim,
            transform: [{
              scale: timerScaleAnim
            }]
          }
        ]}>
        <TimeTimer
          onRunningChange={setIsTimerRunning}
          onTimerRef={(ref) => { timerRef.current = ref; }}
        />
      </Animated.View>

      {/* Palette Section */}
      <Animated.View style={[styles.paletteSection, {
        opacity: Animated.multiply(
          paletteAnim,
          isTimerRunning ? 0 : 1
        ),
        transform: [
          {
            translateY: Animated.add(
              paletteAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [30, 0]
              }),
              isTimerRunning ? 50 : 0
            )
          }
        ]
      }]}>
        <View style={styles.paletteContainer}>
          <PaletteCarousel isTimerRunning={isTimerRunning} />
        </View>
      </Animated.View>

      {/* Settings Modal */}
      <SettingsModal
        visible={settingsVisible}
        onClose={() => setSettingsVisible(false)}
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
