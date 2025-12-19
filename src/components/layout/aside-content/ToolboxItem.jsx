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
 * ToolboxItem - Wrapper component for consistent Toolbox styling
 *
 * Provides:
 * - Uniform background (surfaceElevated)
 * - Consistent responsive padding
 * - Responsive minimum height matching carousel heights
 * - Safe spacing for all screen sizes
 *
 * Height calculation:
 * - Carousel scrollView: rs(70, 'min')
 * - Padding: 13px top + 13px bottom = 26px
 * - Total: rs(70, 'min') + 26px (naturally flowing)
 *
 * @param {React.ReactNode} children - Content to wrap
 */
const ToolboxItem = React.memo(function ToolboxItem({ children }) {
  const theme = useTheme();
  const sizes = harmonizedSizes.toolboxItem;

  const styles = StyleSheet.create({
    container: {
      backgroundColor: theme.colors.background,
      borderRadius: theme.borderRadius.lg,
      paddingHorizontal: sizes.padding.horizontal,
      paddingVertical: sizes.padding.vertical,
      minHeight: sizes.minHeight,
    },
  });

  return <View style={styles.container}>{children}</View>;
});

ToolboxItem.displayName = 'ToolboxItem';
ToolboxItem.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ToolboxItem;
