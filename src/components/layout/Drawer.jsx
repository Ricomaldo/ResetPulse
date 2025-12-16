/**
 * @fileoverview Modern draggable bottom sheet with real-time gesture tracking
 * Follows finger during drag (like Spotify/Google Maps), snaps to positions on release
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

  // Heights in pixels (let React handle these, not animations)
  const collapsedHeightPx = SCREEN_HEIGHT * height;
  const expandedHeightPx = SCREEN_HEIGHT * expandedHeight;
  const currentHeightPx = isExpanded ? expandedHeightPx : collapsedHeightPx;

  // Only animate position (translateY) - native driver safe
  const translateY = useRef(new Animated.Value(direction === 'bottom' ? SCREEN_HEIGHT : -SCREEN_HEIGHT)).current;

  // Helper to animate to specific position
  const animateToPosition = (toValue, onComplete) => {
    Animated.spring(translateY, {
      toValue,
      useNativeDriver: true,
      tension: 65,
      friction: 11,
    }).start(onComplete);
  };

  // Open/close animation - ONLY translateY (native safe)
  useEffect(() => {
    Animated.spring(translateY, {
      toValue: visible ? 0 : (direction === 'bottom' ? SCREEN_HEIGHT : -SCREEN_HEIGHT),
      useNativeDriver: true,
      tension: 65,
      friction: 11,
    }).start();
  }, [visible, direction, translateY]);

  // Reset on close
  useEffect(() => {
    if (!visible) {
      setIsExpanded(false);
    }
  }, [visible]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        const { dy } = gestureState;
        const isScrolledDown = scrollOffsetRef.current > 0;

        // If scrolled down in content AND dragging down, let ScrollView handle it
        if (isScrolledDown && dy > 0) return false;

        // Otherwise, capture gesture if threshold met
        return Math.abs(dy) > 3;
      },
      onPanResponderGrant: () => {
        // Capture current position of translateY
        dragStartYRef.current = translateY._value;
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

          // Determine snap target based on final position and velocity
          if (finalY > SCREEN_HEIGHT * 0.5 || isQuickSwipeDown) {
            // Close drawer
            animateToPosition(SCREEN_HEIGHT, onClose);
          } else if (dy < -SWIPE_THRESHOLD && !isExpanded) {
            // Expand drawer (collapsed → expanded)
            setIsExpanded(true);
            animateToPosition(0);
            if (onExpand) onExpand();
          } else if (dy > SWIPE_THRESHOLD && isExpanded) {
            // Collapse drawer (expanded → collapsed)
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


  const styles = StyleSheet.create({
    contentWrapper: {
      flex: 1,
    },
    drawer: {
      ...(direction === 'top'
        ? { borderBottomLeftRadius: rs(24), borderBottomRightRadius: rs(24) }
        : { borderTopLeftRadius: rs(24), borderTopRightRadius: rs(24) }
      ),
      backgroundColor: theme.colors.background,
      bottom: direction === 'bottom' ? 0 : undefined,
      left: 0,
      overflow: 'hidden',
      paddingBottom: direction === 'bottom' ? rs(30) : rs(20),
      paddingTop: direction === 'top' ? rs(50) : rs(8),
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
      marginBottom: rs(8),
      paddingHorizontal: rs(80),
      paddingVertical: rs(16),
    },
    overlay: {
      // eslint-disable-next-line react-native/no-color-literals
      backgroundColor: 'rgba(0, 0, 0, 0.3)',
      bottom: 0,
      left: 0,
      position: 'absolute',
      right: 0,
      top: 0,
      zIndex: 1000,
    },
  });

  if (!visible) return null;

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
            height: currentHeightPx,
            transform: [{ translateY }],
          },
        ]}
        {...panResponder.panHandlers}
      >
        <View style={styles.handleContainer}>
          <View style={styles.handle} />
        </View>
        {isExpanded ? (
          <ScrollView
            style={styles.contentWrapper}
            scrollEnabled={true}
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
        ) : (
          <View style={styles.contentWrapper}>
            {React.isValidElement(children)
              ? React.cloneElement(children, { isExpanded })
              : children
            }
          </View>
        )}
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
