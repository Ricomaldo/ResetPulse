/**
 * @fileoverview Modern draggable bottom sheet with real-time gesture tracking
 * Follows finger during drag (like Spotify/Google Maps), snaps to positions on release
 * Animation: ONLY translateY is animated (native driver)
 * Gesture model: Opening is via swipe-up on TimerScreen.
 * Drawer manages close gesture (swipe down).
 * Architecture: Header (optional) → Scrollable Content → Footer (optional)
 * @created 2025-12-14
 * @updated 2025-12-17
 */
import React, { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  StyleSheet,
  Animated,
  PanResponder,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  View,
  Platform,
} from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { rs } from '../../styles/responsive';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const VELOCITY_THRESHOLD = 0.5;
const SPRING_TENSION = 80; // More responsive
const SPRING_FRICTION = 10; // Snappier feel

export default function Drawer({
  visible,
  onClose,
  children,
  footerContent = null,
  direction = 'top',
  height = 0.5,
}) {
  const theme = useTheme();
  const scrollOffsetRef = useRef(0);
  const dragStartYRef = useRef(0);
  const isDraggingRef = useRef(false);

  // Height in pixels (calculated)
  const drawerHeightPx = SCREEN_HEIGHT * height;

  // Animate position (translateY) - native driver safe, ONLY animation
  const translateY = useRef(
    new Animated.Value(direction === 'bottom' ? SCREEN_HEIGHT : -SCREEN_HEIGHT)
  ).current;

  // Animate handle opacity for drag feedback
  const handleOpacity = useRef(new Animated.Value(1)).current;

  // Helper to animate to specific position
  const animateToPosition = (toValue, onComplete) => {
    Animated.spring(translateY, {
      toValue,
      useNativeDriver: true,
      tension: SPRING_TENSION,
      friction: SPRING_FRICTION,
    }).start(onComplete);
  };

  // Open/close animation - ONLY translateY (native driver)
  useEffect(() => {
    Animated.spring(translateY, {
      toValue: visible ? 0 : direction === 'bottom' ? SCREEN_HEIGHT : -SCREEN_HEIGHT,
      useNativeDriver: true,
      tension: SPRING_TENSION,
      friction: SPRING_FRICTION,
    }).start();
  }, [visible, direction, translateY]);

  // Reset on close
  useEffect(() => {
    if (!visible) {
      handleOpacity.setValue(1);
    }
  }, [visible]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        const { dy } = gestureState;
        const isScrolledDown = scrollOffsetRef.current > 0;

        // If scrolled down in content AND dragging down, let ScrollView handle it
        if (isScrolledDown && dy > 0) {
          return false;
        }

        // Otherwise, capture gesture if threshold met
        return Math.abs(dy) > 3;
      },
      onPanResponderGrant: () => {
        // Capture current position
        dragStartYRef.current = translateY._value;
        isDraggingRef.current = true;

        // Fade handle on drag start for visual feedback
        Animated.timing(handleOpacity, {
          toValue: 0.5,
          duration: 100,
          useNativeDriver: true,
        }).start();
      },
      onPanResponderMove: (_, gestureState) => {
        if (direction === 'bottom') {
          const { dy } = gestureState;
          const newTranslateY = dragStartYRef.current + dy;

          // Clamp between 0 (open) and SCREEN_HEIGHT (closed)
          const clampedY = Math.max(0, Math.min(SCREEN_HEIGHT, newTranslateY));

          // Update in real-time - drawer follows finger
          translateY.setValue(clampedY);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (direction === 'bottom') {
          const { vy } = gestureState;
          const finalY = translateY._value;
          const isQuickSwipeDown = vy > VELOCITY_THRESHOLD;

          isDraggingRef.current = false;

          // Restore handle opacity
          Animated.timing(handleOpacity, {
            toValue: 1,
            duration: 100,
            useNativeDriver: true,
          }).start();

          // Determine snap target based on final position and velocity
          if (finalY > SCREEN_HEIGHT * 0.5 || isQuickSwipeDown) {
            // Close drawer
            animateToPosition(SCREEN_HEIGHT, onClose);
          } else {
            // Snap back to open position
            animateToPosition(0);
          }
        }
      },
    })
  ).current;

  const styles = StyleSheet.create({
    contentWrapper: {
      flex: 1,
    },
    drawer: {
      ...(direction === 'top'
        ? { borderBottomLeftRadius: rs(20), borderBottomRightRadius: rs(20) }
        : { borderTopLeftRadius: rs(20), borderTopRightRadius: rs(20) }),
      backgroundColor: theme.colors.surface,
      bottom: direction === 'bottom' ? 0 : undefined,
      left: 0,
      overflow: 'hidden',
      paddingTop: direction === 'top' ? rs(50) : 0,
      position: 'absolute',
      right: 0,
      top: direction === 'top' ? 0 : undefined,
      zIndex: 1001,
      ...theme.shadow('xl'),
      // Brand-first border for visual distinction
      ...Platform.select({
        ios: {
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: theme.colors.border, // Now = brand.primary + '40' (coral)
        },
        android: {}, // Android relies on elevation/shadow only
      }),
    },
    footer: {
      alignItems: 'center',
      borderTopColor: theme.colors.divider, // Now = brand.neutral + '20' (subtle)
      borderTopWidth: StyleSheet.hairlineWidth,
      justifyContent: 'center',
      paddingBottom: theme.spacing.md, // 13px (Golden Ratio) - reduced from 20px
      paddingTop: theme.spacing.md, // 13px - reduced from 16px
    },
    overlay: {
      backgroundColor: theme.colors.overlay,
      bottom: 0,
      left: 0,
      position: 'absolute',
      right: 0,
      top: 0,
      zIndex: 1000,
    },
  });

  if (!visible) {
    return null;
  }

  return (
    <>
      {/* No overlay - drawer is non-modal, allows full interaction with dial */}
      <Animated.View
        style={[
          styles.drawer,
          {
            height: drawerHeightPx,
            transform: [{ translateY }],
          },
        ]}
        {...panResponder.panHandlers}
      >
        <ScrollView
          style={styles.contentWrapper}
          scrollEnabled={true}
          showsVerticalScrollIndicator={false}
          bounces={false}
          onScroll={(e) => {
            scrollOffsetRef.current = e.nativeEvent.contentOffset.y;
          }}
          scrollEventThrottle={16}
        >
          {children}
        </ScrollView>

        {/* Footer - Fixed at bottom if provided */}
        {footerContent && <View style={styles.footer}>{footerContent}</View>}
      </Animated.View>
    </>
  );
}

Drawer.propTypes = {
  children: PropTypes.node,
  direction: PropTypes.oneOf(['top', 'bottom']),
  footerContent: PropTypes.node,
  height: PropTypes.number,
  onClose: PropTypes.func.isRequired,
  visible: PropTypes.bool.isRequired,
};


