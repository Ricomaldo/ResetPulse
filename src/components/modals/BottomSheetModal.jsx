/**
 * @fileoverview BottomSheetModal - Sheet modal custom Reanimated 4
 * Remplace @gorhom/bottom-sheet (source de l'ERROR Worklets `addListener`
 * sur le UI thread — diagnostic P0, sorti par soustraction ADR-014).
 * Pattern AsideZone V3 : Gesture.Pan + withSpring, API conservée.
 *
 * Architecture:
 * - BottomSheetModal (this wrapper) = Infrastructure (config, animations, lifecycle)
 * - *ModalContent.jsx = Business logic (content, actions, state)
 */
import React, { useEffect, useMemo } from 'react';
import { StyleSheet, Dimensions, Pressable } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  withSpring,
  runOnJS,
  Extrapolation,
} from 'react-native-reanimated';
import PropTypes from 'prop-types';
import { useTheme } from '../../theme/ThemeProvider';

const SCREEN_HEIGHT = Dimensions.get('window').height;

// Seuils de fermeture au pan down (fraction de la hauteur du sheet / vélocité)
const CLOSE_DISTANCE_RATIO = 0.3;
const CLOSE_VELOCITY = 800;

/**
 * Generic bottom-sheet modal wrapper
 *
 * @param {boolean} visible - Show/hide modal (declarative control)
 * @param {Function} onClose - Callback when modal closes (swipe down or backdrop tap)
 * @param {React.Component} children - Modal content component
 * @param {Array<string>} snapPoints - Single snap point as percent (default: ['90%'])
 * @param {boolean} enablePanDownToClose - Allow swipe down to close (default: true)
 */
export default function BottomSheetModal({
  visible,
  onClose,
  children,
  snapPoints = ['90%'],
  enablePanDownToClose = true,
}) {
  const theme = useTheme();

  // Single snap point: '90%' → 0.9 * SCREEN_HEIGHT
  const sheetHeight = useMemo(() => {
    const pct = parseFloat(snapPoints[0]) / 100;
    return SCREEN_HEIGHT * (Number.isFinite(pct) ? pct : 0.9);
  }, [snapPoints]);

  // 0 = ouvert, sheetHeight = fermé (hors écran)
  const translateY = useSharedValue(sheetHeight);
  const startY = useSharedValue(0);

  useEffect(() => {
    translateY.value = withSpring(visible ? 0 : sheetHeight, {
      damping: 90,
      stiffness: 450,
      overshootClamping: true,
      restDisplacementThreshold: 0.01,
      restSpeedThreshold: 0.01,
    });
  }, [visible, sheetHeight, translateY]);

  const panGesture = useMemo(() => Gesture.Pan()
    .enabled(enablePanDownToClose)
    .activeOffsetY([-15, 15])
    .onBegin(() => {
      startY.value = translateY.value;
    })
    .onUpdate((e) => {
      translateY.value = Math.max(0, startY.value + e.translationY);
    })
    .onEnd((e) => {
      const shouldClose =
        translateY.value > sheetHeight * CLOSE_DISTANCE_RATIO ||
        e.velocityY > CLOSE_VELOCITY;
      if (shouldClose) {
        runOnJS(onClose)();
      } else {
        translateY.value = withSpring(0, {
          damping: 90,
          stiffness: 450,
          overshootClamping: true,
          restDisplacementThreshold: 0.01,
          restSpeedThreshold: 0.01,
        });
      }
    }),
  [enablePanDownToClose, sheetHeight, onClose, translateY, startY]);

  const sheetAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const backdropAnimatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateY.value,
      [0, sheetHeight],
      [1, 0],
      Extrapolation.CLAMP
    ),
  }));

  return (
    <Animated.View style={styles.overlay} pointerEvents={visible ? 'auto' : 'none'}>
      {/* Backdrop — tap to close */}
      <Animated.View style={[styles.backdrop, backdropAnimatedStyle]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>

      {/* Sheet — pan-to-close sur le handle uniquement (le contenu scrolle librement) */}
      <Animated.View
        style={[
          styles.sheet,
          {
            height: sheetHeight,
            backgroundColor: theme.colors.surfaceElevated,
            ...theme.shadow('xl'),
          },
          sheetAnimatedStyle,
        ]}
      >
        <GestureDetector gesture={panGesture}>
          <Animated.View style={styles.handleContainer}>
            <Animated.View
              style={[styles.handleIndicator, { backgroundColor: theme.colors.textSecondary }]}
            />
          </Animated.View>
        </GestureDetector>
        {children}
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  handleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  handleIndicator: {
    borderRadius: 3,
    height: 5,
    width: 50,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    zIndex: 100,
  },
  sheet: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    left: 0,
    right: 0,
  },
});

BottomSheetModal.propTypes = {
  visible: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
  snapPoints: PropTypes.arrayOf(PropTypes.string),
  enablePanDownToClose: PropTypes.bool,
};
