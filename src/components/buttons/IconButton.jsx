/**
 * @fileoverview IconButton Component for ResetPulse
 * Flexible icon button with optional label support for toolbar and inline actions
 * @created 2025-12-19
 */

import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { createFocusStyle } from '../../styles/focusStyles';
import { getButtonBaseStyles, getIconSize } from '../../styles/buttonStyles';
import { useTheme } from '../../theme/ThemeProvider';
import { fontWeights } from '../../theme/tokens';
import Icons from '../layout/Icons';

/**
 * IconButton - Flexible icon button with optional label
 *
 * Supports multiple variants (primary, secondary, ghost, destructive),
 * sizes (small, medium, large), and shapes (circular, rounded, square).
 * Can be icon-only or combined with a text label.
 *
 * @param {Object} props
 * @param {string} props.icon - Icon name from Icons.jsx (required)
 * @param {number} [props.iconSize] - Override default icon size
 * @param {string} [props.iconColor] - Override default icon color
 * @param {string} [props.label] - Optional text label
 * @param {'left'|'right'|'bottom'} [props.labelPosition='right'] - Label placement
 * @param {'primary'|'secondary'|'ghost'|'destructive'} [props.variant='secondary'] - Visual style
 * @param {'small'|'medium'|'large'} [props.size='medium'] - Button size preset
 * @param {'circular'|'rounded'|'square'} [props.shape='circular'] - Border radius style
 * @param {boolean} [props.disabled=false] - Disabled state
 * @param {boolean} [props.loading=false] - Loading state (shows spinner)
 * @param {boolean} [props.active=false] - Active/selected state
 * @param {Function} props.onPress - Press handler (required)
 * @param {Function} [props.onLongPress] - Long press handler
 * @param {Function} [props.onPressIn] - Press start handler
 * @param {Function} [props.onPressOut] - Press end handler
 * @param {Object|Array} [props.style] - Custom container styles
 * @param {Object|Array} [props.contentStyle] - Custom content wrapper styles
 * @param {Object|Array} [props.labelStyle] - Custom label styles
 * @param {string} [props.accessibilityLabel] - Accessibility label
 * @param {string} [props.accessibilityHint] - Accessibility hint
 */
const IconButton = React.memo(function IconButton({
  icon,
  iconSize,
  iconColor,
  label,
  labelPosition = 'right',
  variant = 'secondary',
  size = 'medium',
  shape = 'circular',
  disabled = false,
  loading = false,
  active = false,
  onPress,
  onLongPress,
  onPressIn,
  onPressOut,
  style,
  contentStyle,
  labelStyle,
  accessibilityLabel,
  accessibilityHint,
}) {
  const { colors, borderRadius, spacing } = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  // Get base button styles from utility
  const { styles: baseStyles, variantConfig } = getButtonBaseStyles(
    { colors, borderRadius, spacing },
    { variant, size, shape, disabled, active }
  );

  // Calculate icon size (use override or preset)
  const calculatedIconSize = getIconSize(size, iconSize);

  // Calculate icon color (use override or variant default)
  const calculatedIconColor = iconColor || variantConfig.textColor;

  // Determine layout direction based on label position
  const isVerticalLayout = label && labelPosition === 'bottom';
  const isHorizontalLayout = label && (labelPosition === 'left' || labelPosition === 'right');
  const isIconOnly = !label;

  // Build content layout styles
  const contentLayoutStyle = {
    flexDirection: isVerticalLayout
      ? 'column'
      : labelPosition === 'left'
        ? 'row-reverse'
        : 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: isHorizontalLayout ? spacing.xs : spacing.xxs,
  };

  // Override padding for labeled buttons
  const containerPaddingStyle = isIconOnly
    ? {} // Keep base padding from getButtonBaseStyles
    : {
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      width: 'auto',
      height: 'auto',
      minWidth: baseStyles.width,
      minHeight: baseStyles.height,
    };

  return (
    <TouchableOpacity
      style={[
        baseStyles,
        containerPaddingStyle,
        isFocused && createFocusStyle({ colors }),
        style,
      ]}
      onPress={onPress}
      onLongPress={onLongPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      disabled={disabled || loading}
      activeOpacity={0.7}
      accessibilityLabel={accessibilityLabel || label || icon}
      accessibilityHint={accessibilityHint}
      accessibilityRole="button"
      accessibilityState={{
        disabled: disabled || loading,
        selected: active,
        busy: loading,
      }}
    >
      <View style={[contentLayoutStyle, contentStyle]}>
        {loading ? (
          <ActivityIndicator
            size={calculatedIconSize}
            color={calculatedIconColor}
          />
        ) : (
          <Icons
            name={icon}
            size={calculatedIconSize}
            color={calculatedIconColor}
          />
        )}
        {label && (
          <Text
            style={[
              styles.label,
              {
                color: variantConfig.textColor,
                fontSize: size === 'small' ? 12 : size === 'large' ? 16 : 14,
              },
              labelStyle,
            ]}
            numberOfLines={1}
          >
            {label}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
});

IconButton.displayName = 'IconButton';

IconButton.propTypes = {
  accessibilityHint: PropTypes.string,
  accessibilityLabel: PropTypes.string,
  active: PropTypes.bool,
  contentStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  disabled: PropTypes.bool,
  icon: PropTypes.string.isRequired,
  iconColor: PropTypes.string,
  iconSize: PropTypes.number,
  label: PropTypes.string,
  labelPosition: PropTypes.oneOf(['left', 'right', 'bottom']),
  labelStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  loading: PropTypes.bool,
  onLongPress: PropTypes.func,
  onPress: PropTypes.func.isRequired,
  onPressIn: PropTypes.func,
  onPressOut: PropTypes.func,
  shape: PropTypes.oneOf(['circular', 'rounded', 'square']),
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  variant: PropTypes.oneOf(['primary', 'secondary', 'ghost', 'destructive']),
};

const styles = StyleSheet.create({
  label: {
    fontWeight: fontWeights.medium,
    textAlign: 'center',
  },
});

export default IconButton;
