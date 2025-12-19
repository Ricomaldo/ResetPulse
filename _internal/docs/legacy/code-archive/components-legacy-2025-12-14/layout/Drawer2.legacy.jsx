/**
 * @fileoverview Drawer V2 - Bottom sheet with @gorhom/bottom-sheet
 * Migration from custom PanResponder to industry-standard gesture library
 * Architecture: Header (optional) → Scrollable Content → Footer (optional)
 * @created 2025-12-17
 * @updated 2025-12-17
 */
import React, { useRef, useEffect, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, View, Platform, Dimensions } from 'react-native';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { useTheme } from '../../theme/ThemeProvider';

const SCREEN_HEIGHT = Dimensions.get('window').height;

export default function Drawer({
  visible,
  onClose,
  children,
  footerContent = null,
  direction = 'bottom',
  height = 0.5,
}) {
  const theme = useTheme();
  const bottomSheetRef = useRef(null);

  // Convert height ratio to percentage string for snapPoints
  const snapPoints = useMemo(() => [`${Math.round(height * 100)}%`], [height]);

  // Handle sheet changes (close when index becomes -1)
  const handleSheetChange = useCallback(
    (index) => {
      if (index === -1) {
        onClose();
      }
    },
    [onClose]
  );

  // Control open/close via visible prop
  useEffect(() => {
    if (bottomSheetRef.current) {
      if (visible) {
        bottomSheetRef.current.snapToIndex(0); // Open to first snap point
      } else {
        bottomSheetRef.current.close(); // Close (index = -1)
      }
    }
  }, [visible]);

  // Don't render if direction is not bottom (legacy support)
  if (direction !== 'bottom') {
    console.warn('[Drawer V2] Only direction="bottom" is supported. Use Drawer.legacy.jsx for top drawer.');
    return null;
  }

  const styles = StyleSheet.create({
    container: {
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      backgroundColor: theme.colors.surface,
      ...Platform.select({
        ios: {
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: theme.colors.border,
        },
        android: {},
      }),
    },
    contentContainer: {
      paddingHorizontal: theme.spacing.md,
    },
    footer: {
      alignItems: 'center',
      borderTopColor: theme.colors.divider,
      borderTopWidth: StyleSheet.hairlineWidth,
      justifyContent: 'center',
      paddingBottom: theme.spacing.md,
      paddingTop: theme.spacing.md,
      backgroundColor: theme.colors.surface,
    },
    handleIndicator: {
      backgroundColor: theme.colors.textSecondary,
      width: 40,
      height: 4,
      borderRadius: 2,
    },
  });

  if (!visible) {
    return null;
  }

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={visible ? 0 : -1}
      snapPoints={snapPoints}
      onChange={handleSheetChange}
      enablePanDownToClose={true}
      backgroundStyle={styles.container}
      handleIndicatorStyle={styles.handleIndicator}
      animateOnMount={true}
    >
      <BottomSheetScrollView
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {children}
      </BottomSheetScrollView>

      {/* Footer - Fixed at bottom if provided */}
      {footerContent && <View style={styles.footer}>{footerContent}</View>}
    </BottomSheet>
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


