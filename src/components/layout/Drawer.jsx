/**
 * @fileoverview Animated drawer component with expand/collapse functionality
 * Features improved gesture handling for smooth swipe interactions
 * @created 2025-12-14
 * @updated 2025-12-14
 */
import React, { useRef, useEffect, useCallback } from 'react';
import { View, StyleSheet, Animated, PanResponder, TouchableOpacity, Dimensions, ScrollView } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { rs } from '../../styles/responsive';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SWIPE_THRESHOLD = 50;
const VELOCITY_THRESHOLD = 0.5; // Velocity for quick swipe detection

/**
 * Drawer component with smooth gesture-based expand/collapse
 * @param {boolean} visible - Whether drawer is visible
 * @param {function} onClose - Callback when drawer closes
 * @param {React.ReactNode} children - Drawer content
 * @param {string} direction - 'top' or 'bottom'
 * @param {number} height - Collapsed height as percentage (0-1)
 * @param {number} expandedHeight - Expanded height as percentage (0-1)
 * @param {function} onExpand - Callback when drawer expands
 */
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
  const [isExpanded, setIsExpanded] = React.useState(false);
  const currentHeight = isExpanded ? expandedHeight : height;
  const drawerHeight = SCREEN_HEIGHT * currentHeight;
  const collapsedHeight = SCREEN_HEIGHT * height;
  const expandedHeightPx = SCREEN_HEIGHT * expandedHeight;
  const initialPosition = direction === 'top' ? -drawerHeight : drawerHeight;
  const translateY = useRef(new Animated.Value(initialPosition)).current;
  const gestureOffset = useRef(0);

  // Reset expanded state when drawer closes
  useEffect(() => {
    if (!visible) {
      setIsExpanded(false);
    }
  }, [visible]);

  // Animate drawer position based on visible state only (not expanded state)
  useEffect(() => {
    Animated.spring(translateY, {
      toValue: visible ? 0 : initialPosition,
      useNativeDriver: true,
      tension: 65,
      friction: 11,
      overshootClamping: false,
    }).start();
  }, [visible, initialPosition]); // Removed isExpanded to prevent re-animation on expand

  // Improved PanResponder with gesture tracking for fluid feel
  const handlePanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Respond to vertical gestures with higher sensitivity
        return Math.abs(gestureState.dy) > 3;
      },
      onPanResponderGrant: () => {
        // Store current position when gesture starts
        gestureOffset.current = 0;
      },
      onPanResponderMove: (_, gestureState) => {
        // Follow finger movement for responsive feel (bottom drawer)
        if (direction === 'bottom') {
          // Clamp movement based on current state
          let dy = gestureState.dy;
          if (!isExpanded) {
            // When collapsed, allow drag down (close) or up (expand)
            dy = Math.max(-100, dy); // Limit upward drag
          } else {
            // When expanded, only allow drag down
            dy = Math.max(0, dy);
          }
          translateY.setValue(dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (direction === 'bottom') {
          const { dy, vy } = gestureState;

          // Quick swipe detection using velocity
          const isQuickSwipeDown = vy > VELOCITY_THRESHOLD;
          const isQuickSwipeUp = vy < -VELOCITY_THRESHOLD;

          // Swipe DOWN or quick downward gesture
          if (dy > SWIPE_THRESHOLD || isQuickSwipeDown) {
            if (isExpanded) {
              // Collapse to normal height
              setIsExpanded(false);
              Animated.spring(translateY, {
                toValue: 0,
                useNativeDriver: true,
                tension: 65,
                friction: 11,
              }).start();
            } else {
              // Close drawer
              onClose();
            }
          }
          // Swipe UP or quick upward gesture
          else if (dy < -SWIPE_THRESHOLD || isQuickSwipeUp) {
            if (!isExpanded) {
              // Expand drawer
              setIsExpanded(true);
              if (onExpand) onExpand();
            }
            // Snap back to position
            Animated.spring(translateY, {
              toValue: 0,
              useNativeDriver: true,
              tension: 65,
              friction: 11,
            }).start();
          } else {
            // Snap back if not enough movement
            Animated.spring(translateY, {
              toValue: 0,
              useNativeDriver: true,
              tension: 65,
              friction: 11,
            }).start();
          }
        }
      },
    })
  ).current;


  const styles = StyleSheet.create({
    overlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.3)',
      zIndex: 1000,
    },
    drawer: {
      position: 'absolute',
      ...(direction === 'top' ? { top: 0 } : { bottom: 0 }),
      left: 0,
      right: 0,
      height: drawerHeight,
      backgroundColor: theme.colors.background,
      ...(direction === 'top'
        ? { borderBottomLeftRadius: rs(24), borderBottomRightRadius: rs(24) }
        : { borderTopLeftRadius: rs(24), borderTopRightRadius: rs(24) }
      ),
      paddingTop: direction === 'top' ? rs(50) : rs(8),
      paddingBottom: direction === 'bottom' ? rs(30) : rs(20),
      zIndex: 1001,
      ...theme.shadow('xl'),
    },
    handleContainer: {
      paddingVertical: rs(16),
      paddingHorizontal: rs(80),
      alignSelf: 'center',
      marginBottom: rs(8),
    },
    handle: {
      width: rs(40),
      height: rs(4),
      backgroundColor: theme.colors.border,
      borderRadius: rs(2),
    },
    contentWrapper: {
      flex: 1,
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
            transform: [{ translateY }],
          },
        ]}
        {...(!isExpanded ? handlePanResponder.panHandlers : {})}
      >
        <View style={styles.handleContainer} {...(isExpanded ? handlePanResponder.panHandlers : {})}>
          <View style={styles.handle} />
        </View>
        {isExpanded ? (
          <ScrollView
            style={styles.contentWrapper}
            showsVerticalScrollIndicator={false}
            bounces={true}
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
