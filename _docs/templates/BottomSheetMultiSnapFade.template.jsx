/**
 * @fileoverview BottomSheet Multi-Snap with Fade Transitions Template
 * @description Template pour BottomSheet @gorhom avec transitions fade entre snaps
 * @author Eric Zuber & Claude Sonnet 4.5
 * @created 2025-12-19
 * @pattern 3-layer system avec animations hauteur + opacity
 *
 * ARCHITECTURE:
 * - Multi-snap (4 points: closed / small / medium / large)
 * - Layers superposés avec fade transitions
 * - Container height animé pour effet "grandir depuis le bas"
 * - Scroll conditionnel (disabled aux petits snaps)
 *
 * STACK REQUIRED:
 * - @gorhom/bottom-sheet ^5.0.5
 * - react-native-reanimated ^4.1.6
 * - react-native-gesture-handler ^2.21.2
 *
 * USE CASES:
 * - Drawer avec changement de contenu fluide
 * - Navigation multi-niveau dans un sheet
 * - Toolbox progressive (favorite → tools → all options)
 */

import React, { useRef, useMemo, useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import BottomSheet, { BottomSheetScrollView, useBottomSheet } from '@gorhom/bottom-sheet';
import Animated, { useAnimatedStyle, interpolate, Extrapolation } from 'react-native-reanimated';

// =============================================================================
// RESPONSIVE HEIGHTS - Calculated from screen dimensions
// =============================================================================
const SCREEN_HEIGHT = Dimensions.get('window').height;

// Container heights are slightly smaller than snap points to account for handle + padding
// This ensures content fits within the visible area of each snap
const LAYER_1_HEIGHT = SCREEN_HEIGHT * 0.08; // Small layer (8% of screen)
const CONTAINER_SNAP_1 = SCREEN_HEIGHT * 0.10; // Snap 15% → container 10%
const CONTAINER_SNAP_2 = SCREEN_HEIGHT * 0.32; // Snap 38% → container 32%
const CONTAINER_SNAP_3 = SCREEN_HEIGHT * 0.80; // Snap 90% → container 80%

/**
 * RESPONSIVE RATIONALE:
 * - iPhone SE (667px): Layer1 = 53px, Snap1 = 67px, Snap2 = 213px, Snap3 = 534px
 * - iPhone 14 (844px): Layer1 = 68px, Snap1 = 84px, Snap2 = 270px, Snap3 = 675px
 * - iPhone 14 Pro Max (932px): Layer1 = 75px, Snap1 = 93px, Snap2 = 298px, Snap3 = 746px
 * - iPad (1366px): Layer1 = 109px, Snap1 = 137px, Snap2 = 437px, Snap3 = 1093px
 *
 * Benefits:
 * - No hardcoded pixel values
 * - Scales automatically to all screen sizes
 * - Maintains visual proportions across devices
 * - Works for both portrait and landscape (if needed)
 */

/**
 * SheetContent - Internal component with access to BottomSheet context
 *
 * PATTERN: Utiliser useBottomSheet() pour accéder à animatedIndex
 * Ce composant DOIT être enfant direct de <BottomSheet> pour avoir accès au context
 */
function SheetContent({ currentSnapIndex }) {
  const { animatedIndex } = useBottomSheet();

  // ==========================================================================
  // ANIMATION 1: Container Height (effet "grandir depuis le bas")
  // ==========================================================================
  const containerHeightStyle = useAnimatedStyle(() => {
    const height = interpolate(
      animatedIndex.value,
      [0, 1, 2, 3], // Snap indices
      [0, CONTAINER_SNAP_1, CONTAINER_SNAP_2, CONTAINER_SNAP_3], // Responsive heights
      Extrapolation.CLAMP
    );
    return { height };
  });

  // ==========================================================================
  // ANIMATION 2: Layer 1 Opacity (visible seulement au snap 1)
  // ==========================================================================
  const layer1OpacityStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      animatedIndex.value,
      [0, 1, 2, 3],
      [0, 1, 0, 0], // Opacity map: invisible → visible → invisible → invisible
      Extrapolation.CLAMP
    );
    return { opacity };
  });

  // ==========================================================================
  // ANIMATION 3: Layer 2 Opacity (visible seulement au snap 2)
  // ==========================================================================
  const layer2OpacityStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      animatedIndex.value,
      [0, 1, 2, 3],
      [0, 0, 1, 0], // Opacity map: invisible → invisible → visible → invisible
      Extrapolation.CLAMP
    );
    return { opacity };
  });

  // ==========================================================================
  // ANIMATION 4: Layer 3 Opacity (visible seulement au snap 3)
  // ==========================================================================
  const layer3OpacityStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      animatedIndex.value,
      [0, 1, 2, 3],
      [0, 0, 0, 1], // Opacity map: invisible → invisible → invisible → visible
      Extrapolation.CLAMP
    );
    return { opacity };
  });

  return (
    <BottomSheetScrollView
      contentContainerStyle={styles.scrollContent}
      scrollEnabled={currentSnapIndex >= 2} // Scroll disabled at snap 0 & 1, enabled at 2 & 3
    >
      {/* =================================================================== */}
      {/* LAYER STACK: All layers superposed in single animated container    */}
      {/* =================================================================== */}
      <Animated.View style={[styles.layerContainer, containerHeightStyle]}>

        {/* Layer 1: Small content (responsive height, visible snap 1) */}
        <Animated.View
          style={[
            styles.layerAbsolute,
            {
              backgroundColor: '#00CED1', // Turquoise (dev color)
              height: LAYER_1_HEIGHT, // Responsive height (~8% of screen)
            },
            layer1OpacityStyle
          ]}
        />

        {/* Layer 2: Medium content (100% container, visible snap 2) */}
        <Animated.View
          style={[
            styles.layerAbsolute,
            {
              backgroundColor: '#9932CC', // Purple (dev color)
              // No height specified = fills container (top:0, bottom:0)
            },
            layer2OpacityStyle
          ]}
        />

        {/* Layer 3: Large content (100% container, visible snap 3) */}
        <Animated.View
          style={[
            styles.layerAbsolute,
            {
              backgroundColor: '#FF8C00', // Orange (dev color)
              // No height specified = fills container (top:0, bottom:0)
            },
            layer3OpacityStyle
          ]}
        />
      </Animated.View>
    </BottomSheetScrollView>
  );
}

/**
 * BottomSheetMultiSnapFade - Main component
 *
 * PROPS:
 * @param {boolean} isCollapsed - External trigger to collapse (e.g., when timer running)
 * @param {function} onSnapChange - Callback when snap changes (optional)
 */
export default function BottomSheetMultiSnapFade({ isCollapsed = false, onSnapChange }) {
  const bottomSheetRef = useRef(null);

  // 4 snap points: 5% (closed) / 15% (small) / 38% (medium) / 90% (large)
  const snapPoints = useMemo(() => ['5%', '15%', '38%', '90%'], []);

  // Track current snap index for conditional logic (scroll enable/disable)
  const [currentSnapIndex, setCurrentSnapIndex] = useState(1); // Default: snap 1 (15%)

  // Auto-collapse to snap 0 (5% - closed) when external trigger
  useEffect(() => {
    if (isCollapsed && bottomSheetRef.current) {
      bottomSheetRef.current.snapToIndex(0);
    }
  }, [isCollapsed]);

  return (
    <BottomSheet
      ref={bottomSheetRef}
      snapPoints={snapPoints}
      index={1} // Start at snap 1 (15%)
      enablePanDownToClose={false} // Always visible (snap 0 = minimized state)
      enableDynamicSizing={false} // Force snap points to be respected
      onChange={(index) => {
        console.log('[BottomSheet] Snap changed to index:', index);
        setCurrentSnapIndex(index);
        onSnapChange?.(index);
      }}
      handleIndicatorStyle={{
        backgroundColor: '#888888',
        width: 50,
        height: 5,
      }}
      backgroundStyle={{
        backgroundColor: '#FFFFFF',
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
    // Height animated dynamically (see containerHeightStyle)
    // Responsive: 0 → 10% screen → 32% screen → 80% screen
    position: 'relative',
  },
  layerAbsolute: {
    // Absolute positioning fills parent container
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 12,
  },
});

// =============================================================================
// USAGE EXAMPLE
// =============================================================================
/**
 * import BottomSheetMultiSnapFade from './BottomSheetMultiSnapFade.template';
 *
 * function App() {
 *   const [isTimerRunning, setIsTimerRunning] = useState(false);
 *
 *   return (
 *     <GestureHandlerRootView style={{ flex: 1 }}>
 *       <BottomSheetMultiSnapFade
 *         isCollapsed={isTimerRunning}
 *         onSnapChange={(index) => console.log('Snap:', index)}
 *       />
 *     </GestureHandlerRootView>
 *   );
 * }
 */

// =============================================================================
// ARCHITECTURE DECISION RATIONALE
// =============================================================================
/**
 * POURQUOI CE PATTERN?
 *
 * 1. Single BottomSheetScrollView (pas de JSX conditionnel)
 *    → Doc Gorhom recommande de ne PAS changer le contenu dynamiquement
 *    → Tout le contenu est présent, les snaps gèrent la visibilité naturellement
 *
 * 2. Layers superposés avec position: absolute
 *    → Permet effet "recouvrir depuis le haut" au lieu de "stack vertical"
 *    → Layer 1 height fixe (8% screen), Layers 2 & 3 remplissent 100% du container
 *
 * 3. Container height animé (responsive)
 *    → Crée l'effet "grandir depuis le bas" pendant les transitions
 *    → Calculé en % de screen height (10% → 32% → 80%)
 *    → S'adapte automatiquement à tous les devices (iPhone SE → iPad)
 *
 * 4. Fade opacity + height animation combinés
 *    → Layer invisible fade out pendant que container rétrécit
 *    → Layer suivant fade in pendant que container grandit
 *    → Résultat: transition fluide sans saut visuel
 *
 * 5. scrollEnabled conditionnel
 *    → Snap 0 & 1: scroll disabled (contenu fixe, pas de scroll)
 *    → Snap 2 & 3: scroll enabled (contenu plus grand que viewport)
 *
 * 6. useBottomSheet() hook pour animations
 *    → Accès direct à animatedIndex.value (position sheet en temps réel)
 *    → Interpolation smooth sans state management manuel
 *    → Composant interne obligatoire pour accès au context
 */

// =============================================================================
// TROUBLESHOOTING
// =============================================================================
/**
 * PROBLÈME: Wrappers invisibles
 * SOLUTION: Vérifier que layerContainer a une hauteur (animée ou fixe)
 *
 * PROBLÈME: Contenu ne change pas au snap
 * SOLUTION: Ne PAS utiliser conditions (if currentSnapIndex === X)
 *           → Utiliser fade opacity à la place
 *
 * PROBLÈME: Scroll ne marche pas
 * SOLUTION: Vérifier scrollEnabled={currentSnapIndex >= 2}
 *
 * PROBLÈME: Gestures conflicts (dial, carousels)
 * SOLUTION: Wrapper conflicting components dans NativeViewGestureHandler
 *           <NativeViewGestureHandler disallowInterruption={true}>
 *
 * PROBLÈME: Animation saccadée
 * SOLUTION: Utiliser enableDynamicSizing={false}
 *           → Force snap points, pas de dynamic content sizing
 */
