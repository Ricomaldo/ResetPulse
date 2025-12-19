/**
 * @fileoverview Shared button styles utility for ResetPulse
 * Central location for button styling logic used by Button.jsx and IconButton.jsx
 * @created 2025-12-19
 */

import { rs } from './responsive';
import { fontWeights } from '../theme/tokens';

/**
 * Get base button styles with support for variants, sizes, shapes, and states
 *
 * @param {Object} theme - Theme object containing colors, spacing, borderRadius
 * @param {Object} options - Configuration options
 * @param {string} [options.variant='primary'] - Button variant: 'primary' | 'secondary' | 'ghost' | 'destructive'
 * @param {string} [options.size='medium'] - Button size: 'small' | 'medium' | 'large'
 * @param {string} [options.shape='rounded'] - Button shape: 'circular' | 'rounded' | 'square'
 * @param {boolean} [options.disabled=false] - Whether button is disabled
 * @param {boolean} [options.active=false] - Whether button is in active state
 *
 * @returns {Object} Object containing styles, sizeConfig, and variantConfig
 * @returns {Object} .styles - StyleSheet-compatible style object
 * @returns {Object} .sizeConfig - Size dimensions { width, height, padding }
 * @returns {Object} .variantConfig - Variant colors { backgroundColor, borderColor, textColor }
 *
 * @example
 * const { colors, borderRadius, spacing } = useTheme();
 * const { styles, sizeConfig, variantConfig } = getButtonBaseStyles(
 *   { colors, borderRadius, spacing },
 *   { variant: 'primary', size: 'medium', shape: 'rounded' }
 * );
 */
export const getButtonBaseStyles = (theme, options = {}) => {
  const {
    variant = 'primary',
    size = 'medium',
    shape = 'rounded',
    disabled = false,
    active = false,
  } = options;

  const { colors, borderRadius, spacing } = theme;

  // Size configuration map
  const sizeMap = {
    small: {
      width: rs(32, 'min'),
      height: rs(32, 'min'),
      padding: spacing.xs,
      minHeight: rs(32, 'min'),
    },
    medium: {
      width: rs(40, 'min'),
      height: rs(40, 'min'),
      padding: spacing.sm,
      minHeight: rs(40, 'min'),
    },
    large: {
      width: rs(52, 'min'),
      height: rs(52, 'min'),
      padding: spacing.md,
      minHeight: rs(52, 'min'),
    },
  };

  // Shape configuration map
  const shapeMap = {
    circular: {
      borderRadius: rs(999, 'min'),
    },
    rounded: {
      borderRadius: borderRadius.lg,
    },
    square: {
      borderRadius: borderRadius.sm,
    },
  };

  // Variant configuration map
  const variantMap = {
    primary: {
      backgroundColor: active ? colors.brand.primary : colors.brand.primary,
      borderColor: active ? colors.brand.primary : 'transparent',
      borderWidth: active ? 2 : 0,
      textColor: colors.fixed.white,
      overlayColor: 'rgba(0, 0, 0, 0.15)',
    },
    secondary: {
      backgroundColor: colors.brand.secondary,
      borderColor: active ? colors.text : 'transparent',
      borderWidth: active ? 2 : 0,
      textColor: colors.text,
      overlayColor: colors.brand.secondary + '10',
    },
    ghost: {
      backgroundColor: 'transparent',
      borderColor: active ? colors.text : 'transparent',
      borderWidth: active ? 2 : 0,
      textColor: colors.textSecondary,
      overlayColor: colors.text + '10',
    },
    destructive: {
      backgroundColor: colors.danger,
      borderColor: colors.danger,
      borderWidth: 0,
      textColor: colors.fixed.white,
      overlayColor: 'rgba(0, 0, 0, 0.15)',
    },
  };

  const sizeConfig = sizeMap[size] || sizeMap.medium;
  const shapeConfig = shapeMap[shape] || shapeMap.rounded;
  const variantConfig = variantMap[variant] || variantMap.primary;

  // Build base styles
  const styles = {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: variantConfig.backgroundColor,
    borderColor: variantConfig.borderColor,
    borderWidth: variantConfig.borderWidth,
    ...shapeConfig,
    ...sizeConfig,
  };

  // Apply disabled state
  if (disabled) {
    styles.opacity = 0.5;
  }

  return {
    styles,
    sizeConfig,
    variantConfig,
  };
};

/**
 * Get icon size based on button size preset or explicit override
 *
 * Provides responsive icon sizing that scales with device dimensions
 *
 * @param {string} [size='medium'] - Button size preset: 'small' | 'medium' | 'large'
 * @param {number} [override] - Explicit icon size in pixels (takes precedence over preset)
 *
 * @returns {number} Icon size in pixels
 *
 * @example
 * const iconSize = getIconSize('medium');        // Returns ~20px (responsive)
 * const customSize = getIconSize('medium', 24);  // Returns 24px (explicit)
 */
export const getIconSize = (size = 'medium', override) => {
  if (override !== undefined) {
    return override;
  }

  const iconSizeMap = {
    small: rs(16, 'min'),
    medium: rs(20, 'min'),
    large: rs(24, 'min'),
  };

  return iconSizeMap[size] || iconSizeMap.medium;
};

/**
 * Get text button styles for minimal, underlined text buttons
 *
 * Text buttons have minimal styling with optional underline and disabled opacity
 *
 * @param {Object} theme - Theme object containing colors
 * @param {boolean} [disabled=false] - Whether button is disabled
 *
 * @returns {Object} Object containing containerStyle and textStyle
 * @returns {Object} .containerStyle - Style for TouchableOpacity wrapper
 * @returns {Object} .textStyle - Style for Text component
 *
 * @example
 * const { colors } = useTheme();
 * const { containerStyle, textStyle } = getTextButtonStyles({ colors }, false);
 */
export const getTextButtonStyles = (theme, disabled = false) => {
  const { colors } = theme;

  const containerStyle = {
    alignItems: 'center',
    padding: 8,
  };

  const textStyle = {
    fontSize: 14,
    color: colors.text.secondary,
    textDecorationLine: 'underline',
  };

  if (disabled) {
    textStyle.opacity = 0.5;
  }

  return {
    containerStyle,
    textStyle,
  };
};
