// src/screens/TimerScreen.jsx
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { View, StyleSheet, TouchableOpacity, PanResponder, Animated, Dimensions } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeProvider';
import { TimerOptionsProvider, useTimerOptions } from '../contexts/TimerOptionsContext';
import { useOnboarding, TOOLTIP_IDS } from '../components/onboarding/OnboardingController';
import { useTimerKeepAwake } from '../hooks/useTimerKeepAwake';
import { useTranslation } from '../hooks/useTranslation';
import ActivityCarousel from '../components/ActivityCarousel';
import PaletteCarousel from '../components/PaletteCarousel';
import TimeTimer from '../components/TimeTimer';
import { SettingsModal } from '../components/modals';
import { SettingsIcon } from '../components/Icons';
import { rs } from '../styles/responsive';
import { ENTRANCE_ANIMATION, SPRING } from '../constants/animations';
import { getGridHeights } from '../constants/gridLayout';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// Grid-based styles with Golden Ratio
const createStyles = (theme) => {
  const heights = getGridHeights();

  return StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: rs(20),
    },

    header: {
      height: heights.header,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      paddingHorizontal: rs(10),
      zIndex: 100,
    },

    settingsButton: {
      width: rs(44, 'min'),
      height: rs(44, 'min'),
      borderRadius: rs(22, 'min'),
      alignItems: 'center',
      justifyContent: 'center',
      ...theme.shadows.md,
    },

    activitySection: {
      height: heights.activities,
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'visible',
    },

    timerSection: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },

    paletteSection: {
      height: heights.palette,
      alignItems: 'center',
      justifyContent: 'center',
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
};

// Helper: Calculate smart tooltip position
const calculateTooltipPosition = (bounds, tooltipHeight = 120) => {
  const spacing = rs(20, 'height');
  const spaceAbove = bounds.top;
  const spaceBelow = SCREEN_HEIGHT - (bounds.top + bounds.height);

  // Try to place above first
  if (spaceAbove >= tooltipHeight + spacing) {
    return {
      top: bounds.top - tooltipHeight - spacing,
    };
  }
  // Then try below
  else if (spaceBelow >= tooltipHeight + spacing) {
    return {
      top: bounds.top + bounds.height + spacing,
    };
  }
  // Fallback: center vertically
  else {
    return {
      top: SCREEN_HEIGHT / 2 - tooltipHeight / 2,
    };
  }
};

function TimerScreenContent() {
  const theme = useTheme();
  const t = useTranslation();
  const { showActivities, showPalettes, useMinimalInterface } = useTimerOptions();
  const { registerTooltipTarget, onboardingCompleted } = useOnboarding();
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const timerRef = useRef(null);

  // Keep screen awake during timer (ON par défaut - timer visuel TDAH)
  useTimerKeepAwake();

  // Refs for measuring actual elements
  const activitiesRef = useRef(null);
  const dialRef = useRef(null);
  const controlsRef = useRef(null);
  const paletteRef = useRef(null);

  // Get styles with memoization to prevent recreation
  const styles = useMemo(() => createStyles(theme), [theme]);

  // Measure dial and controls after they're mounted
  useEffect(() => {
    const measureTimerElements = () => {
      // Dial - dialRef.current is the element directly
      if (dialRef.current && dialRef.current.measure) {
        dialRef.current.measure((x, y, width, height, pageX, pageY) => {
          const bounds = { top: pageY, left: pageX, width, height };
          const position = calculateTooltipPosition(bounds);
          registerTooltipTarget(TOOLTIP_IDS.DIAL, position, bounds);
        });
      }

      // Controls - controlsRef.current is the element directly
      if (controlsRef.current && controlsRef.current.measure) {
        controlsRef.current.measure((x, y, width, height, pageX, pageY) => {
          const bounds = { top: pageY, left: pageX, width, height };
          const position = calculateTooltipPosition(bounds);
          registerTooltipTarget(TOOLTIP_IDS.CONTROLS, position, bounds);
        });
      }
    };

    // Delay to ensure elements are rendered
    const timer = setTimeout(measureTimerElements, 600);
    return () => clearTimeout(timer);
  }, [registerTooltipTarget]);

  // Animation values for staggered entrance - start at 1 if onboarding not completed
  const initialValue = onboardingCompleted ? 0 : 1;
  const initialScale = onboardingCompleted ? 0.8 : 1;
  const headerAnim = useRef(new Animated.Value(initialValue)).current;
  const activityAnim = useRef(new Animated.Value(initialValue)).current;
  const timerAnim = useRef(new Animated.Value(initialValue)).current;
  const timerScaleAnim = useRef(new Animated.Value(initialScale)).current;
  const paletteAnim = useRef(new Animated.Value(initialValue)).current;

  // Staggered entrance animations - skip if onboarding is not completed
  useEffect(() => {
    // If onboarding not completed, instantly set all anims to 1 (no entrance animation)
    if (!onboardingCompleted) {
      headerAnim.setValue(1);
      activityAnim.setValue(1);
      timerAnim.setValue(1);
      timerScaleAnim.setValue(1);
      paletteAnim.setValue(1);
      return;
    }

    // Normal entrance animations for returning users
    const animations = [
      // Header slides down
      Animated.timing(headerAnim, {
        toValue: 1,
        duration: ENTRANCE_ANIMATION.HEADER_DURATION,
        delay: ENTRANCE_ANIMATION.HEADER_DELAY,
        useNativeDriver: true,
      }),
      // Activities slide in from left
      Animated.timing(activityAnim, {
        toValue: 1,
        duration: ENTRANCE_ANIMATION.ACTIVITY_DURATION,
        delay: ENTRANCE_ANIMATION.ACTIVITY_DELAY,
        useNativeDriver: true,
      }),
      // Timer fades and scales in
      Animated.parallel([
        Animated.timing(timerAnim, {
          toValue: 1,
          duration: ENTRANCE_ANIMATION.TIMER_DURATION,
          delay: ENTRANCE_ANIMATION.TIMER_DELAY,
          useNativeDriver: true,
        }),
        Animated.spring(timerScaleAnim, {
          toValue: 1,
          tension: SPRING.TENSION,
          friction: SPRING.FRICTION,
          delay: ENTRANCE_ANIMATION.TIMER_DELAY,
          useNativeDriver: true,
        }),
      ]),
      // Palette slides up
      Animated.timing(paletteAnim, {
        toValue: 1,
        duration: ENTRANCE_ANIMATION.PALETTE_DURATION,
        delay: ENTRANCE_ANIMATION.PALETTE_DELAY,
        useNativeDriver: true,
      }),
    ];

    Animated.stagger(0, animations).start();
  }, [onboardingCompleted]);

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
            transform: onboardingCompleted ? [{
              translateY: headerAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [-20, 0]
              })
            }] : []
          }
        ]}>
        <View style={{ flex: 1 }} />
        <TouchableOpacity
          accessible={true}
          accessibilityLabel={t('accessibility.settings')}
          accessibilityHint={t('accessibility.openSettings')}
          accessibilityRole="button"
          style={[styles.settingsButton, {
            backgroundColor: theme.colors.brand.neutral,
            borderWidth: 1,
            borderColor: theme.colors.brand.secondary
          }]}
          onPress={() => setSettingsVisible(true)}
          activeOpacity={0.7}
        >
          <SettingsIcon size={rs(24, 'min')} color={theme.colors.brand.primary} />
        </TouchableOpacity>
      </Animated.View>

      {/* Activities Section - Garde sa place pour stabilité du timer */}
      <Animated.View
        ref={activitiesRef}
        onLayout={() => {
          // Wait for entrance animations to complete before measuring
          // First launch (no animations): short delay
          // Returning users (with animations): longer delay to wait for animations
          const delay = onboardingCompleted ? 100 : 900;
          setTimeout(() => {
            activitiesRef.current?.measure((x, y, width, height, pageX, pageY) => {
              const bounds = { top: pageY, left: pageX, width, height };
              const position = calculateTooltipPosition(bounds);
              registerTooltipTarget(TOOLTIP_IDS.ACTIVITIES, position, bounds);
            });
          }, delay);
        }}
        style={[
          styles.activitySection,
          {
            opacity: (showActivities && !(useMinimalInterface && isTimerRunning)) ? 1 : 0,
            transform: onboardingCompleted ? [
              {
                translateX: activityAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-30, 0]
                })
              },
              {
                scale: activityAnim
              }
            ] : []
          }
        ]}
        pointerEvents={(showActivities && !(useMinimalInterface && isTimerRunning)) ? 'auto' : 'none'}
      >
        <ActivityCarousel isTimerRunning={isTimerRunning} />
      </Animated.View>

      {/* Timer Section - Flex to take available space */}
      <Animated.View
        style={[
          styles.timerSection,
          {
            opacity: timerAnim,
            transform: onboardingCompleted ? [{
              scale: timerScaleAnim
            }] : []
          }
        ]}>
        <TimeTimer
          onRunningChange={setIsTimerRunning}
          onTimerRef={(ref) => { timerRef.current = ref; }}
          onDialRef={(element) => { dialRef.current = element; }}
          onControlsRef={(element) => { controlsRef.current = element; }}
        />
      </Animated.View>

      {/* Palette Section - Garde sa place pour stabilité du timer */}
      <Animated.View
        ref={paletteRef}
        onLayout={() => {
          // Measure the parent Animated.View instead of inner container
          // First launch (no animations): short delay
          // Returning users (with animations): longer delay for physical devices
          const delay = onboardingCompleted ? 400 : 1300;
          setTimeout(() => {
            paletteRef.current?.measure((x, y, width, height, pageX, pageY) => {
              const bounds = { top: pageY, left: pageX, width, height };
              const position = calculateTooltipPosition(bounds);
              registerTooltipTarget(TOOLTIP_IDS.PALETTE, position, bounds);
            });
          }, delay);
        }}
        style={[styles.paletteSection, {
          opacity: (showPalettes && !(useMinimalInterface && isTimerRunning)) ? 1 : 0,
          transform: onboardingCompleted ? [
            {
              translateY: paletteAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [30, 0]
              })
            },
            {
              scale: paletteAnim
            }
          ] : []
        }]}
        pointerEvents={(showPalettes && !(useMinimalInterface && isTimerRunning)) ? 'auto' : 'none'}
      >
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
