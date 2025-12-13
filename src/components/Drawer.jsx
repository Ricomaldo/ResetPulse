// src/components/Drawer.jsx
import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, Animated, PanResponder, TouchableOpacity, Dimensions } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { rs } from '../styles/responsive';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SWIPE_THRESHOLD = 50;

export default function Drawer({
  visible,
  onClose,
  children,
  direction = 'top', // 'top' or 'bottom'
  height = 0.5, // Percentage of screen height
}) {
  const theme = useTheme();
  const drawerHeight = SCREEN_HEIGHT * height;
  const initialPosition = direction === 'top' ? -drawerHeight : drawerHeight;
  const translateY = useRef(new Animated.Value(initialPosition)).current;

  useEffect(() => {
    Animated.spring(translateY, {
      toValue: visible ? 0 : initialPosition,
      useNativeDriver: true,
      tension: 50,
      friction: 10,
    }).start();
  }, [visible, initialPosition]);

  // Handle-only PanResponder for swipe to close
  const handlePanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dy) > 5;
      },
      onPanResponderMove: (_, gestureState) => {
        // Allow movement in closing direction only
        if (direction === 'top' && gestureState.dy < 0) {
          // Top drawer can only move up (to close)
          translateY.setValue(gestureState.dy);
        } else if (direction === 'bottom' && gestureState.dy > 0) {
          // Bottom drawer can only move down (to close)
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        // Close if threshold exceeded in correct direction
        const shouldClose = direction === 'top'
          ? gestureState.dy < -SWIPE_THRESHOLD  // Swipe up to close top drawer
          : gestureState.dy > SWIPE_THRESHOLD;   // Swipe down to close bottom drawer

        if (shouldClose) {
          onClose();
        } else {
          // Spring back to open position
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            tension: 50,
            friction: 10,
          }).start();
        }
      },
    })
  ).current;

  // Full drawer PanResponder - only intercepts if starting from handle area
  const drawerPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: (evt) => {
        // Only capture if touch starts in handle area (top 60px for bottom drawer, top 60px for top drawer)
        const touchY = evt.nativeEvent.locationY;
        if (direction === 'bottom') {
          return touchY < 60; // First 60px from top of drawer
        }
        return false; // Top drawer uses handle only
      },
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        if (direction === 'bottom') {
          const touchY = evt.nativeEvent.locationY;
          return touchY < 60 && Math.abs(gestureState.dy) > 5;
        }
        return false;
      },
      onPanResponderMove: (_, gestureState) => {
        if (direction === 'bottom' && gestureState.dy > 0) {
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (direction === 'bottom' && gestureState.dy > SWIPE_THRESHOLD) {
          onClose();
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            tension: 50,
            friction: 10,
          }).start();
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
      paddingTop: direction === 'top' ? rs(50) : rs(12),
      paddingBottom: direction === 'bottom' ? rs(40) : rs(20),
      zIndex: 1001,
      ...theme.shadow('xl'),
    },
    handleContainer: {
      paddingVertical: rs(12),
      paddingHorizontal: rs(60),
      alignSelf: 'center',
      marginBottom: rs(4),
    },
    handle: {
      width: rs(40),
      height: rs(4),
      backgroundColor: theme.colors.border,
      borderRadius: rs(2),
    },
    contentWrapper: {
      flex: 1,
      overflow: 'hidden',
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
        {...drawerPanResponder.panHandlers}
      >
        <View style={styles.handleContainer} {...handlePanResponder.panHandlers}>
          <View style={styles.handle} />
        </View>
        <View style={styles.contentWrapper}>
          {children}
        </View>
      </Animated.View>
    </>
  );
}
