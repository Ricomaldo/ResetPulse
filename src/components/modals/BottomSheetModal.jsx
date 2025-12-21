/**
 * @fileoverview BottomSheetModal - Reusable modal wrapper
 * Consistent with AsideZone drawer pattern (unified bottom-sheet architecture)
 * @created 2025-12-21
 * @updated 2025-12-21
 */
import React, { useRef, useEffect } from 'react';
import BottomSheet, { useBottomSheetSpringConfigs } from '@gorhom/bottom-sheet';
import PropTypes from 'prop-types';
import { useTheme } from '../../theme/ThemeProvider';

/**
 * Generic BottomSheet modal wrapper
 *
 * Architecture:
 * - BottomSheetModal (this wrapper) = Infrastructure (config, animations, lifecycle)
 * - *ModalContent.jsx = Business logic (content, actions, state)
 *
 * Same pattern as AsideZone:
 * - AsideZone wrapper + FavoriteToolBox/ToolBox/SettingsPanel content
 * - BottomSheetModal wrapper + PremiumModalContent/DiscoveryModalContent
 *
 * @param {boolean} visible - Show/hide modal (declarative control)
 * @param {Function} onClose - Callback when modal closes (user swipe down or backdrop tap)
 * @param {React.Component} children - Modal content component
 * @param {Array<string>} snapPoints - Snap points (default: ['90%'] for full-height modal)
 * @param {number} initialSnapIndex - Initial snap index when opening (default: 0)
 * @param {boolean} enableDynamicSizing - Use content height instead of snap points (default: false)
 * @param {boolean} enablePanDownToClose - Allow swipe down to close (default: true)
 * @param {Object} restProps - Additional BottomSheet props (override defaults)
 */
export default function BottomSheetModal({
  visible,
  onClose,
  children,
  snapPoints = ['90%'], // Default: full-height modal
  initialSnapIndex = 0,
  enableDynamicSizing = false,
  enablePanDownToClose = true,
  ...restProps
}) {
  const theme = useTheme();
  const bottomSheetRef = useRef(null);

  // Custom spring animation (same as AsideZone for consistency)
  const animationConfigs = useBottomSheetSpringConfigs({
    damping: 90,
    stiffness: 450,
    overshootClamping: true,
    restDisplacementThreshold: 0.01,
    restSpeedThreshold: 0.01,
  });

  // Declarative control: visible prop → snapToIndex/close
  useEffect(() => {
    if (visible && bottomSheetRef.current) {
      bottomSheetRef.current.snapToIndex(initialSnapIndex);
    } else if (!visible && bottomSheetRef.current) {
      bottomSheetRef.current.close();
    }
  }, [visible, initialSnapIndex]);

  return (
    <BottomSheet
      ref={bottomSheetRef}
      snapPoints={snapPoints}
      index={-1} // Start closed (controlled by visible prop via useEffect)
      enablePanDownToClose={enablePanDownToClose}
      enableDynamicSizing={enableDynamicSizing}
      onClose={onClose}
      handleIndicatorStyle={{
        backgroundColor: theme.colors.textSecondary,
        width: 50,
        height: 5,
      }}
      backgroundStyle={{
        backgroundColor: theme.colors.surfaceElevated,
      }}
      style={{
        ...theme.shadow('xl'),
      }}
      animationConfigs={animationConfigs}
      detached={true} // Prevent peek bug (modal appears from bottom, not peeking)
      bottomInset={46}
      {...restProps}
    >
      {children}
    </BottomSheet>
  );
}

BottomSheetModal.propTypes = {
  visible: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
  snapPoints: PropTypes.arrayOf(PropTypes.string),
  initialSnapIndex: PropTypes.number,
  enableDynamicSizing: PropTypes.bool,
  enablePanDownToClose: PropTypes.bool,
};
