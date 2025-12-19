/**
 * @fileoverview ToolboxItem - Unified wrapper for Toolbox components
 * @description Ensures consistent styling, spacing, and responsive sizing across
 *              ControlBar, ActivityCarousel, and PaletteCarousel
 * @created 2025-12-20
 */
import React from 'react';
import { View, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import { useTheme } from '../../../theme/ThemeProvider';
import { rs } from '../../../styles/responsive';

/**
 * ToolboxItem - Wrapper component for consistent Toolbox styling
 *
 * Provides:
 * - Uniform background (surfaceElevated)
 * - Consistent padding and border radius
 * - Responsive minimum height
 * - Safe spacing for all screen sizes
 *
 * @param {React.ReactNode} children - Content to wrap
 */
const ToolboxItem = React.memo(function ToolboxItem({ children }) {
  const theme = useTheme();

  const styles = StyleSheet.create({
    container: {
      backgroundColor: theme.colors.surfaceElevated,
      borderRadius: theme.borderRadius.lg,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.md,
      minHeight: rs(70, 'min'), // Consistent min height for all items
    },
  });

  return <View style={styles.container}>{children}</View>;
});

ToolboxItem.displayName = 'ToolboxItem';
ToolboxItem.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ToolboxItem;
