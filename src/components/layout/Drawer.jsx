/**
 * @fileoverview Modern draggable bottom sheet with real-time gesture tracking
 * Follows finger during drag (like Spotify/Google Maps), snaps to positions on release
 * Polish improvements: animated height, adaptive padding, handle feedback, responsive springs
 * @created 2025-12-14
 * @updated 2025-12-16
 */
import React, { useRef, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { View, StyleSheet, Animated, PanResponder, TouchableOpacity, Dimensions, ScrollView } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { rs } from '../../styles/responsive';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SWIPE_THRESHOLD = 50;
const VELOCITY_THRESHOLD = 0.5;
const EXPAND_ZONE_HEIGHT = 80; // Swipe-up zone height (handle + buffer)
const SPRING_TENSION = 80; // More responsive
const SPRING_FRICTION = 10; // Snappier feel

export default function Drawer({
  visible,
  onClose,
  children,
  direction = 'top',
  height = 0.5,
  expandedHeight = 0.85,
  onExpand,
}) {
  const theme = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);
  const scrollOffsetRef = useRef(0);
  const dragStartYRef = useRef(0);
  const touchStartYRef = useRef(0);
  const isDraggingRef = useRef(false);

  // Heights in pixels
  const collapsedHeightPx = SCREEN_HEIGHT * height;
  const expandedHeightPx = SCREEN_HEIGHT * expandedHeight;

  // Animate position (translateY) - native driver safe
  const translateY = useRef(new Animated.Value(direction === 'bottom' ? SCREEN_HEIGHT : -SCREEN_HEIGHT)).current;

  // Animate height smoothly - NOT native driver, but performant enough for height
  const animatedHeight = useRef(new Animated.Value(collapsedHeightPx)).current;

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

  // Animate height with spring
  const animateHeight = (toValue) => {
    Animated.spring(animatedHeight, {
      toValue,
      useNativeDriver: false,
      tension: SPRING_TENSION,
      friction: SPRING_FRICTION,
    }).start();
  };

  // Open/close animation - translateY + height
  useEffect(() => {
    Animated.spring(translateY, {
      toValue: visible ? 0 : (direction === 'bottom' ? SCREEN_HEIGHT : -SCREEN_HEIGHT),
      useNativeDriver: true,
      tension: SPRING_TENSION,
      friction: SPRING_FRICTION,
    }).start();
  }, [visible, direction, translateY]);

  // Animate height when expansion state changes
  useEffect(() => {
    const targetHeight = isExpanded ? expandedHeightPx : collapsedHeightPx;
    animateHeight(targetHeight);
  }, [isExpanded, collapsedHeightPx, expandedHeightPx]);

  // Reset on close
  useEffect(() => {
    if (!visible) {
      setIsExpanded(false);
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
      onPanResponderGrant: (evt) => {
        // Capture current position
        dragStartYRef.current = translateY._value;
        touchStartYRef.current = evt.nativeEvent.locationY;
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
          const { dy, vy } = gestureState;
          const finalY = translateY._value;
          const isQuickSwipeDown = vy > VELOCITY_THRESHOLD;
          const isInExpandZone = touchStartYRef.current < EXPAND_ZONE_HEIGHT;

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
          } else if (dy < -SWIPE_THRESHOLD && !isExpanded && isInExpandZone) {
            // Expand drawer only if gesture started in expansion zone (handle area)
            setIsExpanded(true);
            animateToPosition(0);
            if (onExpand) {
              onExpand();
            }
          } else if (dy > SWIPE_THRESHOLD && isExpanded) {
            // Collapse drawer (expanded → collapsed) - allowed anywhere
            setIsExpanded(false);
            animateToPosition(0);
          } else {
            // Snap back to current state position (0)
            animateToPosition(0);
          }
        }
      },
    })
  ).current;


  // Calculate adaptive padding based on expansion state
  const paddingBottomValue = isExpanded ? rs(20) : rs(12);
  const paddingTopValue = isExpanded ? rs(12) : rs(8);

  const styles = StyleSheet.create({
    contentWrapper: {
      flex: 1,
    },
    drawer: {
      ...(direction === 'top'
        ? { borderBottomLeftRadius: rs(20), borderBottomRightRadius: rs(20) }
        : { borderTopLeftRadius: rs(20), borderTopRightRadius: rs(20) }
      ),
      backgroundColor: theme.colors.background,
      bottom: direction === 'bottom' ? 0 : undefined,
      left: 0,
      overflow: 'hidden',
      paddingBottom: direction === 'bottom' ? paddingBottomValue : rs(20),
      paddingTop: direction === 'top' ? rs(50) : paddingTopValue,
      position: 'absolute',
      right: 0,
      top: direction === 'top' ? 0 : undefined,
      zIndex: 1001,
      ...theme.shadow('xl'),
    },
    handle: {
      backgroundColor: theme.colors.border,
      borderRadius: rs(2),
      height: rs(4),
      width: rs(40),
    },
    handleContainer: {
      alignSelf: 'center',
      marginBottom: rs(12),
      paddingHorizontal: rs(80),
      paddingVertical: rs(12),
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
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      />
      <Animated.View
        style={[
          styles.drawer,
          {
            height: animatedHeight,
            transform: [{ translateY }],
          },
        ]}
        {...panResponder.panHandlers}
      >
        <Animated.View
          style={[
            styles.handleContainer,
            {
              opacity: handleOpacity,
            },
          ]}
        >
          <View style={styles.handle} />
        </Animated.View>

        <ScrollView
          style={styles.contentWrapper}
          scrollEnabled={isExpanded}
          showsVerticalScrollIndicator={false}
          bounces={false}
          onScroll={(e) => {
            scrollOffsetRef.current = e.nativeEvent.contentOffset.y;
          }}
        >
          {React.isValidElement(children)
            ? React.cloneElement(children, { isExpanded })
            : children
          }
        </ScrollView>
      </Animated.View>
    </>
  );
}

Drawer.propTypes = {
  children: PropTypes.node,
  direction: PropTypes.oneOf(['top', 'bottom']),
  expandedHeight: PropTypes.number,
  height: PropTypes.number,
  onClose: PropTypes.func.isRequired,
  onExpand: PropTypes.func,
  visible: PropTypes.bool.isRequired,
};
