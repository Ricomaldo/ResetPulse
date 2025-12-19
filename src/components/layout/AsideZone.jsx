/**
 * @fileoverview AsideZone V2 - BottomSheet 3-snap (ADR-005 v2)
 * Migration: PanResponder custom → @gorhom/bottom-sheet
 * Stack: @gorhom/bottom-sheet + react-native-reanimated (ADR-006)
 * @created 2025-12-19
 * @updated 2025-12-19
 */
import React, { useRef, useMemo, useState, useEffect, useCallback } from 'react';
import { StyleSheet, Dimensions } from 'react-native';
import BottomSheet, {
  BottomSheetScrollView,
  useBottomSheet,
  useBottomSheetSpringConfigs,
} from '@gorhom/bottom-sheet';
import Animated, { useAnimatedStyle, interpolate, Extrapolation } from 'react-native-reanimated';
import { useTheme } from '../../theme/ThemeProvider';
import { Layer1, Layer2, Layer3 } from './aside-content';

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
function SheetContent({ currentSnapIndex, isTimerRunning, onPlayPause, onReset, activityCarouselRef, paletteCarouselRef }) {
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
        {/* Layer 1: FavoriteTool - behind, responsive height, dynamic content */}
        <Animated.View
          style={[
            styles.layerAbsolute,
            { backgroundColor: 'transparent', height: LAYER_1_HEIGHT },
            favoriteOpacityStyle,
          ]}
        >
          <Layer1
            isTimerRunning={isTimerRunning}
            onPlayPause={onPlayPause}
            onReset={onReset}
          />
        </Animated.View>

        {/* Layer 2: BaseCommands - middle, 100% container height */}
        <Animated.View
          style={[
            styles.layerAbsolute,
            { backgroundColor: 'transparent' },
            baseOpacityStyle,
          ]}
        >
          <Layer2
            isTimerRunning={isTimerRunning}
            onPlayPause={onPlayPause}
            onReset={onReset}
            activityCarouselRef={activityCarouselRef}
            paletteCarouselRef={paletteCarouselRef}
          />
        </Animated.View>

        {/* Layer 3: AllOptions - on top, 100% container height, scrollable content */}
        <Animated.View
          style={[
            styles.layerAbsolute,
            { backgroundColor: 'transparent' },
            allOpacityStyle,
          ]}
        >
          <Layer3 />
        </Animated.View>
      </Animated.View>
    </BottomSheetScrollView>
  );
}

/**
 * AsideZone - BottomSheet 3-snap (0=favorite, 1=toolbox, 2=all)
 */
export default function AsideZone({ isTimerRunning, onPlayPause, onReset, onOpenSettings }) {
  const theme = useTheme();
  const bottomSheetRef = useRef(null);

  // Refs for carousels (for simultaneousHandlers)
  const activityCarouselRef = useRef(null);
  const paletteCarouselRef = useRef(null);

  // 3 snap points: 15% (favorite) / 38% (toolbox) / 90% (all)
  const snapPoints = useMemo(() => ['15%', '38%', '90%'], []);

  // Track current snap index (0=favorite, 1=toolbox, 2=all)
  const [currentSnapIndex, setCurrentSnapIndex] = useState(0); // Default: 15% (favorite)

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
    <BottomSheet
      ref={bottomSheetRef}
      snapPoints={snapPoints}
      index={0} // Start at 15% (favorite)
      enablePanDownToClose={false} // Drawer permanent (no close state)
      enableDynamicSizing={false} // Force snap points to be respected
      onChange={(index) => {
        console.log('[AsideZone] Snap changed to index:', index);
        setCurrentSnapIndex(index);
      }}
      handleIndicatorStyle={{
        backgroundColor: theme.colors.textSecondary,
        width: 50,
        height: 5,
      }}
      backgroundStyle={{
        backgroundColor: theme.colors.surfaceElevated,
      }}
      style={{
        ...theme.shadow('xl'),
      }}
      animationConfigs={animationConfigs}
      simultaneousHandlers={[activityCarouselRef, paletteCarouselRef]}
    >
      <SheetContent
        currentSnapIndex={currentSnapIndex}
        isTimerRunning={isTimerRunning}
        onPlayPause={onPlayPause}
        onReset={onReset}
        activityCarouselRef={activityCarouselRef}
        paletteCarouselRef={paletteCarouselRef}
      />
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  layerContainer: {
    // Height animated: responsive based on screen size
    position: 'relative',
  },
  layerAbsolute: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 12,
  },
});
