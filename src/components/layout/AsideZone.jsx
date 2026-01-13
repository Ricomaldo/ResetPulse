/**
 * @fileoverview AsideZone V2 - BottomSheet 3-snap (ADR-005 v2)
 * Migration: PanResponder custom → @gorhom/bottom-sheet
 * Stack: @gorhom/bottom-sheet + react-native-reanimated (ADR-006)
 * @created 2025-12-19
 * @updated 2025-12-19
 */
import React, { useRef, useMemo, useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import BottomSheet, {
  BottomSheetScrollView,
  useBottomSheet,
  useBottomSheetSpringConfigs,
} from '@gorhom/bottom-sheet';
import Animated, { useAnimatedStyle, interpolate, Extrapolation } from 'react-native-reanimated';
import { useTheme } from '../../theme/ThemeProvider';
import { useTimerConfig } from '../../contexts/TimerConfigContext';
import { usePremiumStatus } from '../../hooks/usePremiumStatus';
import { MessageZone } from '../messaging';
import { FavoriteToolBox, ToolBox } from './aside-content';
import { SettingsPanel } from '../settings';

// Get screen height for responsive calculations
const SCREEN_HEIGHT = Dimensions.get('window').height;

// Calculate responsive heights based on snap points
// Note: Container heights are slightly smaller than snap points to account for handle + padding
const LAYER_1_HEIGHT = SCREEN_HEIGHT * 0.08; // Turquoise layer (fixed small height)
const CONTAINER_SNAP_1 = SCREEN_HEIGHT * 0.1; // Container at snap 0 (15% snap - 5% handle/padding)
const CONTAINER_SNAP_2 = SCREEN_HEIGHT * 0.32; // Container at snap 1 (38% snap - 6% handle/padding)
const CONTAINER_SNAP_3 = SCREEN_HEIGHT * 0.8; // Container at snap 2 (90% snap - 10% handle/padding)

/**
 * SheetContent - Internal component with access to BottomSheet context
 * Handles fade transitions between snap points
 */
function SheetContent({ currentSnapIndex, isTimerRunning, isTimerCompleted, onPlay, onReset, onStop, activityCarouselRef, paletteCarouselRef, isPremiumUser }) {
  const theme = useTheme();
  const { animatedIndex } = useBottomSheet();

  // Animate container height (responsive based on screen size)
  const containerHeightStyle = useAnimatedStyle(() => {
    const height = interpolate(
      animatedIndex.value,
      [0, 1, 2], // Snap 0 (15%), 1 (38%), 2 (90%)
      [CONTAINER_SNAP_1, CONTAINER_SNAP_2, CONTAINER_SNAP_3], // Responsive heights
      Extrapolation.CLAMP
    );
    return { height };
  });

  // Fade out FavoriteTool (turquoise) when moving from snap 0 (15%) to snap 1 (38%)
  const favoriteOpacityStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      animatedIndex.value,
      [0, 1, 2], // Snap 0 (15%), 1 (38%), 2 (90%)
      [1, 0, 0], // Opacity: visible → invisible → invisible
      Extrapolation.CLAMP
    );
    return { opacity };
  });

  // Fade in BaseCommands (pourpre) at snap 1 (38%), fade out at snap 2 (90%)
  const baseOpacityStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      animatedIndex.value,
      [0, 1, 2], // Snap 0 (15%), 1 (38%), 2 (90%)
      [0, 1, 0], // Opacity: invisible → visible → invisible
      Extrapolation.CLAMP
    );
    return { opacity };
  });

  // Fade in AllOptions (mandarine) at snap 2 (90%)
  const allOpacityStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      animatedIndex.value,
      [0, 1, 2], // Snap 0 (15%), 1 (38%), 2 (90%)
      [0, 0, 1], // Opacity: invisible → invisible → visible
      Extrapolation.CLAMP
    );
    return { opacity };
  });

  return (
    <BottomSheetScrollView
      contentContainerStyle={styles.scrollContent}
      scrollEnabled={currentSnapIndex >= 1} // Scroll disabled at snap 0 (15%), enabled at snap 1+ (38%, 90%)
    >
      {/* All layers superposed (FavoriteTool + BaseCommands + AllOptions) */}
      <Animated.View style={[styles.layerContainer, containerHeightStyle]}>
        {/* Snap 15%: FavoriteToolBox */}
        <Animated.View
          style={[
            styles.layerAbsolute,
            { backgroundColor: theme.colors.fixed.transparent, height: LAYER_1_HEIGHT },
            favoriteOpacityStyle,
          ]}
        >
          <FavoriteToolBox
            isTimerRunning={isTimerRunning}
            isTimerCompleted={isTimerCompleted}
            onPlay={onPlay}
            onReset={onReset}
            onStop={onStop}
          />
        </Animated.View>

        {/* Snap 38%: ToolBox (all 3 tools) */}
        <Animated.View
          style={[
            styles.layerAbsolute,
            { backgroundColor: theme.colors.fixed.transparent },
            baseOpacityStyle,
          ]}
        >
          <ToolBox
            isTimerRunning={isTimerRunning}
            isTimerCompleted={isTimerCompleted}
            onPlay={onPlay}
            onReset={onReset}
            onStop={onStop}
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
        >
          <SettingsPanel isPremiumUser={isPremiumUser} />
        </Animated.View>
      </Animated.View>
    </BottomSheetScrollView>
  );
}

/**
 * AsideZone - BottomSheet 3-snap (0=favorite, 1=toolbox, 2=all) + MessageZone overlay
 *
 * @param {string} timerState - 'REST' | 'RUNNING' | 'COMPLETE' (source of truth for animations)
 */
export default function AsideZone({ timerState, isTimerRunning, isTimerCompleted, onPlay, onReset, onStop, onOpenSettings: _onOpenSettings, displayMessage, isCompleted, flashActivity, onSnapChange }) {
  const theme = useTheme();
  const bottomSheetRef = useRef(null);
  const { timer: { currentActivity } } = useTimerConfig();
  const { isPremium: isPremiumUser } = usePremiumStatus();

  // Refs for carousels (for simultaneousHandlers)
  const activityCarouselRef = useRef(null);
  const paletteCarouselRef = useRef(null);

  // 3 snap points: 15% (favorite) / 38% (toolbox) / 90% (all)
  const snapPoints = useMemo(() => ['15%', '38%', '90%'], []);

  // Track current snap index (0=favorite, 1=toolbox, 2=all)
  const [currentSnapIndex, setCurrentSnapIndex] = useState(0); // Default: 15% (favorite)

  // Dynamic background based on snap index (no animation to avoid frozen object error)
  // Snap 0-1: surface | Snap 2 (expanded): surfaceElevated
  const dynamicBackgroundStyle = {
    backgroundColor: currentSnapIndex === 2 ? theme.colors.surfaceElevated : theme.colors.surface,
  };

  // Custom spring animation (smooth, less bouncy)
  const animationConfigs = useBottomSheetSpringConfigs({
    damping: 90,
    stiffness: 450,
    overshootClamping: true,
    restDisplacementThreshold: 0.01,
    restSpeedThreshold: 0.01,
  });

  // Auto-collapse to snap 0 (favorite) when timer is running
  useEffect(() => {
    if (isTimerRunning && bottomSheetRef.current) {
      bottomSheetRef.current.snapToIndex(0); // Collapse to 15% (favorite tool visible)
    }
  }, [isTimerRunning]);

  return (
    <View style={styles.asideContainer}>
      {/* MessageZone positioned at ~28% from bottom (absolute, outside BottomSheet) */}
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

      {/* BottomSheet */}
      <BottomSheet
        ref={bottomSheetRef}
        snapPoints={snapPoints}
        index={0} // Start at 15% (favorite)
        enablePanDownToClose={false} // Drawer permanent (no close state)
        enableDynamicSizing={false} // Force snap points to be respected
        onChange={(index) => {
          setCurrentSnapIndex(index);
          onSnapChange?.();
        }}
        handleIndicatorStyle={{
          backgroundColor: theme.colors.textSecondary,
          width: 50,
          height: 5,
        }}
        backgroundStyle={dynamicBackgroundStyle}
        style={{
          ...theme.shadow('xl'),
        }}
        animationConfigs={animationConfigs}
        simultaneousHandlers={[activityCarouselRef, paletteCarouselRef]}
      >
        <SheetContent
          currentSnapIndex={currentSnapIndex}
          isTimerRunning={isTimerRunning}
          isTimerCompleted={isTimerCompleted}
          onPlay={onPlay}
          onReset={onReset}
          onStop={onStop}
          activityCarouselRef={activityCarouselRef}
          paletteCarouselRef={paletteCarouselRef}
          isPremiumUser={isPremiumUser}
        />
      </BottomSheet>
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
    zIndex: 50, // Above DialZone (which has no zIndex = default 0)
    pointerEvents: 'box-none', // Let touches pass through to DialZone underneath
  },
  labelOverlay: {
    alignItems: 'center',
    bottom: SCREEN_HEIGHT * 0.28, // 28% from bottom (balanced between 25% too low, 32% too high)
    justifyContent: 'center',
    pointerEvents: 'none', // Don't capture touches (label is display-only)
    position: 'absolute',
    width: '100%',
    zIndex: 0, // Behind BottomSheet (appears as background)
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
    // Height animated: responsive based on screen size
    position: 'relative',
  },
  scrollContent: {
    paddingBottom: 16,
    paddingHorizontal: 16,
    paddingTop: 0,  // Toolbox/FavoriteToolBox containers control their own top padding (rs(4))
  },
});
