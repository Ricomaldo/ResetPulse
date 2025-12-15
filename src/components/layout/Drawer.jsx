/**
 * @fileoverview Animated drawer component - clean two-state system
 * Position animation only (native) - height changes via React re-render
 * @created 2025-12-14
 * @updated 2025-12-14
 */
import React, { useRef, useEffect, useState } from 'react';
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

  // Heights in pixels (let React handle these, not animations)
  const collapsedHeightPx = SCREEN_HEIGHT * height;
  const expandedHeightPx = SCREEN_HEIGHT * expandedHeight;
  const currentHeightPx = isExpanded ? expandedHeightPx : collapsedHeightPx;

  // Only animate position (translateY) - native driver safe
  const translateY = useRef(new Animated.Value(direction === 'bottom' ? SCREEN_HEIGHT : -SCREEN_HEIGHT)).current;

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
      onMoveShouldSetPanResponder: (_, gestureState) => Math.abs(gestureState.dy) > 3,
      onPanResponderRelease: (_, gestureState) => {
        if (direction === 'bottom') {
          const { dy, vy } = gestureState;
          const isQuickSwipeDown = vy > VELOCITY_THRESHOLD;
          const isQuickSwipeUp = vy < -VELOCITY_THRESHOLD;
          const isAtTopOfScroll = scrollOffsetRef.current <= 0;

          // DOWN: collapse or close
          if (dy > SWIPE_THRESHOLD || isQuickSwipeDown) {
            if (isExpanded) {
              // If at top of scroll, collapse. If scrolled down, still collapse (not close)
              setIsExpanded(false);
            } else {
              // Collapsed: swipe down = close
              onClose();
            }
          }
          // UP: expand (only if collapsed)
          else if ((dy < -SWIPE_THRESHOLD || isQuickSwipeUp) && !isExpanded) {
            setIsExpanded(true);
            if (onExpand) onExpand();
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
      backgroundColor: theme.colors.background,
      ...(direction === 'top'
        ? { borderBottomLeftRadius: rs(24), borderBottomRightRadius: rs(24) }
        : { borderTopLeftRadius: rs(24), borderTopRightRadius: rs(24) }
      ),
      paddingTop: direction === 'top' ? rs(50) : rs(8),
      paddingBottom: direction === 'bottom' ? rs(30) : rs(20),
      zIndex: 1001,
      ...theme.shadow('xl'),
      overflow: 'hidden',
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
