/**
 * @fileoverview AsideZone V2 - BottomSheet 3-snap (ADR-005 v2)
 * Migration: PanResponder custom → @gorhom/bottom-sheet
 * Stack: @gorhom/bottom-sheet + react-native-reanimated (ADR-006)
 * @created 2025-12-19
 * @updated 2025-12-19
 */
import React, { useRef, useMemo, useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions, Text } from 'react-native';
import BottomSheet, {
  BottomSheetView,
  BottomSheetScrollView,
  useBottomSheet,
} from '@gorhom/bottom-sheet';
import Animated, { useAnimatedStyle, interpolate, Extrapolation } from 'react-native-reanimated';
import { useTheme } from '../../theme/ThemeProvider';
import { Layer1Content } from './aside-content';

// Get screen height for responsive calculations
const SCREEN_HEIGHT = Dimensions.get('window').height;

// Calculate responsive heights based on snap points
// Note: Container heights are slightly smaller than snap points to account for handle + padding
const LAYER_1_HEIGHT = SCREEN_HEIGHT * 0.08; // Turquoise layer (fixed small height)
const CONTAINER_SNAP_1 = SCREEN_HEIGHT * 0.1; // Container at snap 1 (15% snap - 5% handle/padding)
const CONTAINER_SNAP_2 = SCREEN_HEIGHT * 0.32; // Container at snap 2 (38% snap - 6% handle/padding)
const CONTAINER_SNAP_3 = SCREEN_HEIGHT * 0.8; // Container at snap 3 (90% snap - 10% handle/padding)

/**
 * SheetContent - Internal component with access to BottomSheet context
 * Handles fade transitions between snap points
 */
function SheetContent({ currentSnapIndex }) {
  const theme = useTheme();
  const { animatedIndex } = useBottomSheet();

  // Animate container height (responsive based on screen size)
  const containerHeightStyle = useAnimatedStyle(() => {
    const height = interpolate(
      animatedIndex.value,
      [0, 1, 2, 3], // Snap 0 (5%), 1 (15%), 2 (38%), 3 (90%)
      [0, CONTAINER_SNAP_1, CONTAINER_SNAP_2, CONTAINER_SNAP_3], // Responsive heights
      Extrapolation.CLAMP
    );
    return { height };
  });

  // Fade out FavoriteTool (turquoise) when moving from snap 1 (15%) to snap 2 (38%)
  const favoriteOpacityStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      animatedIndex.value,
      [0, 1, 2, 3], // Snap 0 (5%), 1 (15%), 2 (38%), 3 (90%)
      [0, 1, 0, 0], // Opacity: invisible → visible → invisible → invisible
      Extrapolation.CLAMP
    );
    return { opacity };
  });

  // Fade in BaseCommands (pourpre) at snap 2 (38%), fade out at snap 3 (90%)
  const baseOpacityStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      animatedIndex.value,
      [0, 1, 2, 3], // Snap 0 (5%), 1 (15%), 2 (38%), 3 (90%)
      [0, 0, 1, 0], // Opacity: invisible → invisible → visible → invisible
      Extrapolation.CLAMP
    );
    return { opacity };
  });

  // Fade in AllOptions (mandarine) at snap 3 (90%)
  const allOpacityStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      animatedIndex.value,
      [0, 1, 2, 3], // Snap 0 (5%), 1 (15%), 2 (38%), 3 (90%)
      [0, 0, 0, 1], // Opacity: invisible → invisible → invisible → visible
      Extrapolation.CLAMP
    );
    return { opacity };
  });

  return (
    <BottomSheetScrollView
      contentContainerStyle={styles.scrollContent}
      scrollEnabled={currentSnapIndex >= 2} // Scroll disabled at snap 0 & 1
    >
      {/* All layers superposed (FavoriteTool + BaseCommands + AllOptions) */}
      <Animated.View style={[styles.layerContainer, containerHeightStyle]}>
        {/* Layer 1: FavoriteTool - behind, responsive height, dynamic content */}
        <Animated.View
          style={[
            styles.layerAbsolute,
            { backgroundColor: theme.colors.background, height: LAYER_1_HEIGHT },
            favoriteOpacityStyle,
          ]}
        >
          <Layer1Content />
        </Animated.View>

        {/* Layer 2: BaseCommands - middle, 100% container height */}
        <Animated.View
          style={[
            styles.layerAbsolute,
            { backgroundColor: theme.colors.background },
            baseOpacityStyle,
          ]}
        >
          <View style={styles.toolContent}>
            <Text style={{ color: theme.colors.text, fontSize: 16, fontWeight: '600' }}>
              🛠️ Toolbox
            </Text>
            <Text style={{ color: theme.colors.textSecondary, fontSize: 12, marginTop: 8 }}>
              (Layer 2 - Snap 38%)
            </Text>
          </View>
        </Animated.View>

        {/* Layer 3: AllOptions - on top, 100% container height, scrollable content */}
        <Animated.View
          style={[
            styles.layerAbsolute,
            { backgroundColor: theme.colors.background },
            allOpacityStyle,
          ]}
        >
          <View style={styles.toolContent}>
            <Text style={{ color: theme.colors.text, fontSize: 16, fontWeight: '600' }}>
              ⚙️ All Options
            </Text>
            <Text style={{ color: theme.colors.textSecondary, fontSize: 12, marginTop: 8 }}>
              (Layer 3 - Snap 90%)
            </Text>
          </View>
        </Animated.View>
      </Animated.View>
    </BottomSheetScrollView>
  );
}

/**
 * AsideZone - BottomSheet 4-snap (0=closed, 1=favorite, 2=toolbox, 3=all)
 */
export default function AsideZone({ isTimerRunning, onOpenSettings }) {
  const theme = useTheme();
  const bottomSheetRef = useRef(null);

  // 4 snap points: 5% (closed) / 15% (favorite) / 38% (toolbox) / 90% (all)
  const snapPoints = useMemo(() => ['5%', '15%', '38%', '90%'], []);

  // Track current snap index (0=closed, 1=favorite, 2=toolbox, 3=all)
  const [currentSnapIndex, setCurrentSnapIndex] = useState(1); // Default: 15% (favorite)

  // Auto-collapse to snap 0 (closed) when timer is running
  useEffect(() => {
    if (isTimerRunning && bottomSheetRef.current) {
      bottomSheetRef.current.snapToIndex(0); // Collapse to 5% (closed)
    }
  }, [isTimerRunning]);

  return (
    <BottomSheet
      ref={bottomSheetRef}
      snapPoints={snapPoints}
      index={1} // Start at 15% (favorite)
      enablePanDownToClose={false} // Always visible (snap 0 = closed state)
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
        backgroundColor: theme.colors.surface,
      }}
      style={{
        ...theme.shadow('xl'),
      }}
    >
      <SheetContent currentSnapIndex={currentSnapIndex} />
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
  toolContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
});
