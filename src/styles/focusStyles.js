/**
 * @fileoverview Focus indicator styles for keyboard navigation (WCAG 2.4.7)
 * @created 2025-12-14
 *
 * Provides consistent focus styles for all interactive elements
 * when using keyboard navigation (e.g., on iPad with Bluetooth keyboard)
 */

/**
 * Creates a focus style object with visible border and shadow
 * @param {object} theme - Theme object with colors
 * @returns {object} Focus style object to apply via conditional styling
 */
export const createFocusStyle = (theme) => ({
  borderWidth: 3,
  borderColor: theme.colors.brand.primary,
  shadowColor: theme.colors.brand.primary,
  shadowOpacity: 0.5,
  shadowRadius: 4,
  shadowOffset: { width: 0, height: 0 },
  elevation: 5, // Android equivalent of shadow
});

/**
 * Creates a subtle focus style for smaller interactive elements
 * @param {object} theme - Theme object with colors
 * @returns {object} Subtle focus style object
 */
export const createSubtleFocusStyle = (theme) => ({
  borderWidth: 2,
  borderColor: theme.colors.brand.primary,
  shadowColor: theme.colors.brand.primary,
  shadowOpacity: 0.3,
  shadowRadius: 2,
  shadowOffset: { width: 0, height: 0 },
  elevation: 3,
});

export default { createFocusStyle, createSubtleFocusStyle };
