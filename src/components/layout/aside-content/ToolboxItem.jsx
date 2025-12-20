/**
 * @fileoverview ToolboxItem - Unified wrapper for Toolbox components
 * @description Ensures consistent styling, spacing, and responsive sizing across
 *              ControlBar, ActivityCarousel, and PaletteCarousel
 * @created 2025-12-20
 * @updated 2025-12-20 - Harmonized responsive sizing
 */
import React from 'react';
import { View, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import { useTheme } from '../../../theme/ThemeProvider';
import { harmonizedSizes } from '../../../styles/harmonized-sizes';

/**
 * ToolboxItem - Wrapper component for visual hierarchy
 *
 * Solution B: Different variants create cognitive hierarchy:
 * - 'controlBar': Compact, informational (time display + controls)
 * - 'activityCarousel': DOMINANT, primary choice (semantic decision)
 * - 'paletteCarousel': Secondary, ambiance (light, optional)
 *
 * Each variant has different:
 * - Height (minHeight)
 * - Padding (horizontal/vertical)
 * - Visual weight
 *
 * @param {React.ReactNode} children - Content to wrap
 * @param {string} variant - One of: 'controlBar', 'activityCarousel', 'paletteCarousel'
 */
const ToolboxItem = React.memo(function ToolboxItem({ children, variant = 'default' }) {
  const theme = useTheme();

  // Select sizing based on variant
  let sizes;
  switch (variant) {
    case 'controlBar':
      sizes = harmonizedSizes.toolboxControlBar;
      break;
    case 'activityCarousel':
      sizes = harmonizedSizes.toolboxActivityCarousel;
      break;
    case 'paletteCarousel':
      sizes = harmonizedSizes.toolboxPaletteCarousel;
      break;
    default:
      sizes = harmonizedSizes.toolboxItem;
  }

  const styles = StyleSheet.create({
    container: {
      width: '100%',  // Critical: full width for layout calculations in children (esp. ControlBar with absolute positioning)
      backgroundColor: theme.colors.background,
      borderRadius: theme.borderRadius.lg,
      paddingHorizontal: sizes.padding.horizontal,
      paddingVertical: sizes.padding.vertical,
      minHeight: sizes.minHeight,
      overflow: 'hidden',  // Ensure rounded corners and clip children
    },
  });

  return <View style={styles.container}>{children}</View>;
});

ToolboxItem.displayName = 'ToolboxItem';
ToolboxItem.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['default', 'controlBar', 'activityCarousel', 'paletteCarousel']),
};

export default ToolboxItem;
