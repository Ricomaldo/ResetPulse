/**
 * @fileoverview AsideZone V3 - Custom drawer Reanimated 4
 * Migration: @gorhom/bottom-sheet → Gesture.Pan + Reanimated 4 (2026-05-01)
 * Reason: @gorhom/bottom-sheet v5.x incompatible with Reanimated 4.x (Expo SDK 55)
 * See devlog: _cockpit/devlogs/2026-05-01_aside-custom-drawer-reanimated4.md
 */
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { View, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  withSpring,
  runOnJS,
  Extrapolation,
} from 'react-native-reanimated';
import { useTheme } from '../../theme/ThemeProvider';
import { useTimerConfig } from '../../contexts/TimerConfigContext';
import { usePremiumStatus } from '../../hooks/usePremiumStatus';
import { MessageZone } from '../messaging';
import { FavoriteToolBox, ToolBox } from './aside-content';
import { SettingsPanel } from '../settings';

const SCREEN_HEIGHT = Dimensions.get('window').height;

// Container heights per snap (content area, slightly smaller than snap to account for handle)
const LAYER_1_HEIGHT = SCREEN_HEIGHT * 0.1;
const CONTAINER_SNAP_1 = SCREEN_HEIGHT * 0.13;
const CONTAINER_SNAP_2 = SCREEN_HEIGHT * 0.27;
const CONTAINER_SNAP_3 = SCREEN_HEIGHT * 0.8;

// Drawer translateY values per snap point
// Higher Y = more collapsed (less of drawer visible)
const SNAP_Y_0 = SCREEN_HEIGHT * 0.82; // snap 0: 18% visible
const SNAP_Y_1 = SCREEN_HEIGHT * 0.68; // snap 1: 32% visible
const SNAP_Y_2 = SCREEN_HEIGHT * 0.10; // snap 2: 90% visible
const SNAP_YS = [SNAP_Y_0, SNAP_Y_1, SNAP_Y_2];

// Opacity threshold: allOpacity starts at 80% of the way from snap 1 → snap 2
const SNAP_Y_ALL_THRESHOLD = SNAP_Y_1 + 0.8 * (SNAP_Y_2 - SNAP_Y_1);

const SPRING_CONFIG = {
  damping: 80,
  stiffness: 450,
  overshootClamping: true,
  restDisplacementThreshold: 0.01,
  restSpeedThreshold: 0.01,
};

// Worklet: find nearest snap index, with velocity bias (1 step in swipe direction)
// Index 0 = most collapsed (snap 18%), Index 2 = most expanded (snap 90%)
// velocityY > 0 → swiping down → collapse → lower snap index
// velocityY < 0 → swiping up → expand → higher snap index
function findNearestSnap(y, velocityY) {
  'worklet';
  let nearest = 0;
  let minDist = Infinity;
  for (let i = 0; i < SNAP_YS.length; i++) {
    const dist = Math.abs(SNAP_YS[i] - y);
    if (dist < minDist) {
      minDist = dist;
      nearest = i;
    }
  }
  if (velocityY > 500) return Math.max(0, nearest - 1);
  if (velocityY < -500) return Math.min(2, nearest + 1);
  return nearest;
}

function SheetContent({ currentSnapIndex, isTimerRunning, activityCarouselRef, paletteCarouselRef, isPremiumUser, onResetOnboarding, animatedTranslateY }) {
  const theme = useTheme();

  const containerHeightStyle = useAnimatedStyle(() => {
    const height = interpolate(
      animatedTranslateY.value,
      [SNAP_Y_2, SNAP_Y_1, SNAP_Y_0],
      [CONTAINER_SNAP_3, CONTAINER_SNAP_2, CONTAINER_SNAP_1],
      Extrapolation.CLAMP
    );
    return { height };
  });

  const favoriteOpacityStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      animatedTranslateY.value,
      [SNAP_Y_1, SNAP_Y_0],
      [0, 1],
      Extrapolation.CLAMP
    );
    return { opacity };
  });

  const baseOpacityStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      animatedTranslateY.value,
      [SNAP_Y_2, SNAP_Y_1, SNAP_Y_0],
      [0, 1, 0],
      Extrapolation.CLAMP
    );
    return { opacity };
  });

  const allOpacityStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      animatedTranslateY.value,
      [SNAP_Y_2, SNAP_Y_ALL_THRESHOLD, SNAP_Y_1, SNAP_Y_0],
      [1, 0, 0, 0],
      Extrapolation.CLAMP
    );
    return { opacity };
  });

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      scrollEnabled={currentSnapIndex === 2}
      bounces={currentSnapIndex === 2}
      overScrollMode="never"
      showsVerticalScrollIndicator={currentSnapIndex === 2}
      nestedScrollEnabled={true}
    >
      <Animated.View style={[styles.layerContainer, containerHeightStyle]}>
        {/* Snap 18%: FavoriteToolBox */}
        <Animated.View
          style={[
            styles.layerAbsolute,
            { backgroundColor: theme.colors.fixed.transparent, height: LAYER_1_HEIGHT },
            favoriteOpacityStyle,
          ]}
          pointerEvents={currentSnapIndex === 0 ? 'auto' : 'none'}
        >
          <FavoriteToolBox isTimerRunning={isTimerRunning} />
        </Animated.View>

        {/* Snap 32%: ToolBox */}
        <Animated.View
          style={[
            styles.layerAbsolute,
            { backgroundColor: theme.colors.fixed.transparent },
            baseOpacityStyle,
          ]}
          pointerEvents={currentSnapIndex === 1 ? 'auto' : 'none'}
        >
          <ToolBox
            isTimerRunning={isTimerRunning}
            activityCarouselRef={activityCarouselRef}
            paletteCarouselRef={paletteCarouselRef}
          />
        </Animated.View>

        {/* Snap 90%: SettingsPanel */}
        <Animated.View
          style={[
            styles.layerAbsolute,
            { backgroundColor: theme.colors.fixed.transparent },
            allOpacityStyle,
          ]}
          pointerEvents={currentSnapIndex === 2 ? 'auto' : 'none'}
        >
          <SettingsPanel
            isPremiumUser={isPremiumUser}
            resetOnboarding={onResetOnboarding}
            onClose={() => {}}
          />
        </Animated.View>
      </Animated.View>
    </ScrollView>
  );
}

export default function AsideZone({ timerState, isTimerRunning, onOpenSettings: _onOpenSettings, displayMessage, isCompleted, flashActivity, onResetOnboarding }) {
  const theme = useTheme();
  const { timer: { currentActivity } } = useTimerConfig();
  const { isPremium: isPremiumUser } = usePremiumStatus();

  const activityCarouselRef = useRef(null);
  const paletteCarouselRef = useRef(null);

  const [currentSnapIndex, setCurrentSnapIndex] = useState(0);

  const animatedTranslateY = useSharedValue(SNAP_Y_0);
  const startY = useSharedValue(SNAP_Y_0);

  const snapToIndex = (index) => {
    animatedTranslateY.value = withSpring(SNAP_YS[index], SPRING_CONFIG);
    setCurrentSnapIndex(index);
  };

  // Auto-collapse to snap 0 when timer starts
  useEffect(() => {
    if (isTimerRunning && currentSnapIndex !== 0) {
      snapToIndex(0);
    }
  }, [isTimerRunning]); // eslint-disable-line react-hooks/exhaustive-deps

  const panGesture = useMemo(() => Gesture.Pan()
    .activeOffsetY([-20, 20])
    .failOffsetX([-15, 15])
    .onBegin(() => {
      startY.value = animatedTranslateY.value;
    })
    .onUpdate((e) => {
      const newY = startY.value + e.translationY;
      animatedTranslateY.value = Math.max(SNAP_Y_2, Math.min(SNAP_Y_0, newY));
    })
    .onEnd((e) => {
      const snapIndex = findNearestSnap(animatedTranslateY.value, e.velocityY);
      animatedTranslateY.value = withSpring(SNAP_YS[snapIndex], SPRING_CONFIG);
      runOnJS(setCurrentSnapIndex)(snapIndex);
    }),
  [animatedTranslateY, startY]);

  const drawerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: animatedTranslateY.value }],
  }));

  const dynamicBackgroundStyle = {
    backgroundColor: currentSnapIndex === 2 ? theme.colors.surfaceElevated : theme.colors.surface,
  };

  return (
    <View style={styles.asideContainer}>
      {currentActivity && (
        <View style={styles.labelOverlay}>
          <MessageZone
            timerState={timerState}
            label={currentActivity.label}
            displayMessage={displayMessage}
            isCompleted={isCompleted}
            flashActivity={flashActivity}
            isTimerRunning={isTimerRunning}
          />
        </View>
      )}

      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.drawer, dynamicBackgroundStyle, drawerAnimatedStyle, theme.shadow('xl')]}>
          {/* Handle */}
          <View style={styles.handleContainer}>
            <View style={[styles.handleIndicator, { backgroundColor: theme.colors.textSecondary }]} />
          </View>

          {/* Content */}
          <SheetContent
            currentSnapIndex={currentSnapIndex}
            isTimerRunning={isTimerRunning}
            activityCarouselRef={activityCarouselRef}
            paletteCarouselRef={paletteCarouselRef}
            isPremiumUser={isPremiumUser}
            onResetOnboarding={onResetOnboarding}
            animatedTranslateY={animatedTranslateY}
          />
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  asideContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 50,
    pointerEvents: 'box-none',
  },
  labelOverlay: {
    alignItems: 'center',
    bottom: SCREEN_HEIGHT * 0.35,
    justifyContent: 'center',
    pointerEvents: 'none',
    position: 'absolute',
    width: '100%',
    zIndex: 0,
  },
  drawer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: SCREEN_HEIGHT,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  handleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  handleIndicator: {
    width: 50,
    height: 5,
    borderRadius: 3,
  },
  layerAbsolute: {
    borderRadius: 12,
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  layerContainer: {
    position: 'relative',
  },
  scrollContent: {
    paddingBottom: 16,
    paddingHorizontal: 16,
    paddingTop: 0,
  },
});
