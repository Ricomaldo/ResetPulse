// src/components/Drawer.jsx
import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, Animated, PanResponder, TouchableOpacity, Dimensions, ScrollView } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { rs } from '../styles/responsive';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SWIPE_THRESHOLD = 50;

export default function Drawer({
  visible,
  onClose,
  children,
  direction = 'top', // 'top' or 'bottom'
  height = 0.5, // Percentage of screen height (collapsed)
  expandedHeight = 0.85, // Percentage when expanded
  onExpand, // Callback when drawer expands
}) {
  const theme = useTheme();
  const [isExpanded, setIsExpanded] = React.useState(false);
  const currentHeight = isExpanded ? expandedHeight : height;
  const drawerHeight = SCREEN_HEIGHT * currentHeight;
  const initialPosition = direction === 'top' ? -drawerHeight : drawerHeight;
  const translateY = useRef(new Animated.Value(initialPosition)).current;

  // Reset expanded state when drawer closes
  useEffect(() => {
    if (!visible) {
      setIsExpanded(false);
    }
  }, [visible]);

  // Animate drawer position based on visible and expanded state
  useEffect(() => {
    Animated.spring(translateY, {
      toValue: visible ? 0 : initialPosition,
      useNativeDriver: true,
      tension: 50,
      friction: 10,
    }).start();
  }, [visible, initialPosition, isExpanded]);

  // Handle-only PanResponder for swipe to expand/collapse/close
  const handlePanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dy) > 5;
      },
      onPanResponderRelease: (_, gestureState) => {
        if (direction === 'bottom') {
          // Swipe DOWN
          if (gestureState.dy > SWIPE_THRESHOLD) {
            if (isExpanded) {
              // Collapse to normal height
              setIsExpanded(false);
            } else {
              // Close drawer
              onClose();
            }
          }
          // Swipe UP
          else if (gestureState.dy < -SWIPE_THRESHOLD) {
            if (!isExpanded) {
              // Expand drawer
              setIsExpanded(true);
              if (onExpand) onExpand();
            }
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
