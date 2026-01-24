/**
 * @fileoverview AsideZone V2 - BottomSheet 3-snap (ADR-013)
 * Migration: PanResponder custom → @gorhom/bottom-sheet
 * Stack: @gorhom/bottom-sheet + react-native-reanimated (ADR-006)
 * @created 2025-12-19
 * @updated 2026-01-23 - Fixed scroll conflict at snap 2 (ADR-013: Option C - activeOffsetY + enableContentPanningGesture)
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
const LAYER_1_HEIGHT = SCREEN_HEIGHT * 0.1; // Turquoise layer (fixed small height)
const CONTAINER_SNAP_1 = SCREEN_HEIGHT * 0.13; // Container at snap 0 (18% snap - 5% handle/padding)
const CONTAINER_SNAP_2 = SCREEN_HEIGHT * 0.27; // Container at snap 1 (32% snap - 5% handle/padding)
const CONTAINER_SNAP_3 = SCREEN_HEIGHT * 0.8; // Container at snap 2 (90% snap - 10% handle/padding)

/**
 * SheetContent - Internal component with access to BottomSheet context
 * Handles fade transitions between snap points
 */
function SheetContent({ currentSnapIndex, isTimerRunning, activityCarouselRef, paletteCarouselRef, isPremiumUser, onResetOnboarding }) {
  const theme = useTheme();
  const { animatedIndex } = useBottomSheet();

  // Animate container height (responsive based on screen size)
  const containerHeightStyle = useAnimatedStyle(() => {
    const height = interpolate(
      animatedIndex.value,
      [0, 1, 2], // Snap 0 (18%), 1 (32%), 2 (90%)
      [CONTAINER_SNAP_1, CONTAINER_SNAP_2, CONTAINER_SNAP_3], // Responsive heights
      Extrapolation.CLAMP
    );
    return { height };
  });

  // Fade out FavoriteTool (turquoise) when moving from snap 0 (18%) to snap 1 (32%)
  const favoriteOpacityStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      animatedIndex.value,
      [0, 1, 2], // Snap 0 (18%), 1 (32%), 2 (90%)
      [1, 0, 0], // Opacity: visible → invisible → invisible
      Extrapolation.CLAMP
    );
    return { opacity };
  });

  // Fade in BaseCommands (pourpre) at snap 1 (32%), fade out at snap 2 (90%)
  const baseOpacityStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      animatedIndex.value,
      [0, 1, 2], // Snap 0 (18%), 1 (32%), 2 (90%)
      [0, 1, 0], // Opacity: invisible → visible → invisible
      Extrapolation.CLAMP
    );
    return { opacity };
  });

  // Fade in AllOptions (mandarine) at snap 2 (90%)
  // Only start fading when 80% of the way to snap 2 (prevents premature preview)
  const allOpacityStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      animatedIndex.value,
      [0, 1, 1.8, 2], // Snap 0, 1, threshold (80% to snap 2), snap 2
      [0, 0, 0, 1],   // Opacity stays 0 until threshold, then quick fade
      Extrapolation.CLAMP
    );
    return { opacity };
  });

  return (
    <BottomSheetScrollView
      contentContainerStyle={styles.scrollContent}
      scrollEnabled={true}
      bounces={currentSnapIndex === 2} // Only bounce at snap 2 (90%) where content scrolls
      overScrollMode="never"
      showsVerticalScrollIndicator={currentSnapIndex === 2}
    >
      {/* All layers superposed (FavoriteTool + BaseCommands + AllOptions) */}
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
          <FavoriteToolBox
            isTimerRunning={isTimerRunning}
          />
        </Animated.View>

        {/* Snap 32%: ToolBox (all 3 tools) */}
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
            onClose={() => {
              // Close settings (snap back to snap 0)
              // Note: We don't have a ref to BottomSheet here, so this is a no-op
              // The close is handled by the user swiping down
            }}
          />
        </Animated.View>
      </Animated.View>
    </BottomSheetScrollView>
  );
}

/**
 * AsideZone - BottomSheet 3-snap (0=favorite, 1=toolbox, 2=all) + MessageZone overlay
 *
 * @param {string} timerState - 'REST' | 'RUNNING' | 'COMPLETE' (source of truth for animations)
 * @param {boolean} isTimerRunning - Timer running state
 * @param {Function} onOpenSettings - Callback to open settings (unused, kept for API compatibility)
 * @param {string} displayMessage - Message to display in MessageZone
 * @param {boolean} isCompleted - Timer completion state (MessageZone)
 * @param {Object} flashActivity - Activity flash animation data
 * @param {Function} onResetOnboarding - Callback to reset onboarding
 */
export default function AsideZone({ timerState, isTimerRunning, onOpenSettings: _onOpenSettings, displayMessage, isCompleted, flashActivity, onResetOnboarding }) {
  const theme = useTheme();
  const bottomSheetRef = useRef(null);
  const { timer: { currentActivity } } = useTimerConfig();
  const { isPremium: isPremiumUser } = usePremiumStatus();

  // Refs for carousels (for simultaneousHandlers)
  const activityCarouselRef = useRef(null);
  const paletteCarouselRef = useRef(null);

  // 3 snap points: 18% (favorite) / 32% (toolbox) / 90% (all)
  const snapPoints = useMemo(() => ['18%', '32%', '90%'], []);

  // Track current snap index (0=favorite, 1=toolbox, 2=all)
  const [currentSnapIndex, setCurrentSnapIndex] = useState(0); // Default: 18% (favorite)

  // Dynamic background based on snap index (no animation to avoid frozen object error)
  // Snap 0-1: surface | Snap 2 (expanded): surfaceElevated
  const dynamicBackgroundStyle = {
    backgroundColor: currentSnapIndex === 2 ? theme.colors.surfaceElevated : theme.colors.surface,
  };

  // Custom spring animation (smooth, natural feel)
  const animationConfigs = useBottomSheetSpringConfigs({
    damping: 80,         // Less resistance for smoother feel
    stiffness: 450,      // Moderate speed
    overshootClamping: true,
    restDisplacementThreshold: 0.01,
    restSpeedThreshold: 0.01,
  });

  // Auto-collapse to snap 0 (favorite) when timer is running
  useEffect(() => {
    if (isTimerRunning && bottomSheetRef.current) {
      bottomSheetRef.current.snapToIndex(0); // Collapse to 18% (favorite tool visible)
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
        index={0} // Start at 18% (favorite)
        enablePanDownToClose={false} // Drawer permanent (no close state)
        enableDynamicSizing={false} // Force snap points to be respected
        activeOffsetY={[-20, 20]} // ADR-013: Increased threshold (10→20px) to fix scroll conflict at snap 2
        failOffsetX={[-10, 10]} // Allow horizontal scroll in carousels
        enableContentPanningGesture={currentSnapIndex !== 2} // ADR-013: Disable content pan at snap 2 (scroll vs drag conflict fix)
        onChange={(index) => {
          setCurrentSnapIndex(index);
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
          activityCarouselRef={activityCarouselRef}
          paletteCarouselRef={paletteCarouselRef}
          isPremiumUser={isPremiumUser}
          onResetOnboarding={onResetOnboarding}
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
    bottom: SCREEN_HEIGHT * 0.35, // 35% from bottom (in the 32-38% zone, above snap 1)
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
