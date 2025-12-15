/**
 * @fileoverview Button Component Library for ResetPulse
 * Centralized button styles for consistency across modals
 * @created 2025-12-14
 */

import React, { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { createFocusStyle } from '../../styles/focusStyles';
import { fontWeights } from '../../../theme/tokens';

/**
 * Primary Button - Brand color, filled
 */
export const PrimaryButton = ({
  label,
  onPress,
  disabled = false,
  loading = false,
  style,
  textStyle,
}) => {
  const { colors, borderRadius, spacing } = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  return (
    <TouchableOpacity
      style={[
        styles.base,
        {
          backgroundColor: colors.brand.primary,
          borderRadius: borderRadius.lg,
          paddingVertical: spacing.md,
          paddingHorizontal: spacing.lg,
        },
        disabled && styles.disabled,
        isFocused && createFocusStyle({ colors }),
        style,
      ]}
      onPress={onPress}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={colors.fixed.white} />
      ) : (
        <Text
          style={[
            styles.text,
            {
              color: colors.fixed.white,
            },
            textStyle,
          ]}
        >
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
};

/**
 * Secondary Button - Outlined with brand color
 */
export const SecondaryButton = ({
  label,
  onPress,
  disabled = false,
  style,
  textStyle,
}) => {
  const { colors, borderRadius, spacing } = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  return (
    <TouchableOpacity
      style={[
        styles.base,
        {
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: colors.brand.primary,
          borderRadius: borderRadius.lg,
          paddingVertical: spacing.md,
          paddingHorizontal: spacing.lg,
        },
        disabled && styles.disabled,
        isFocused && createFocusStyle({ colors }),
        style,
      ]}
      onPress={onPress}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <Text
        style={[
          styles.text,
          {
            color: colors.brand.primary,
          },
          textStyle,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
};

/**
 * Destructive Button - Error color for delete/dangerous actions
 */
export const DestructiveButton = ({
  label,
  onPress,
  disabled = false,
  style,
  textStyle,
}) => {
  const { colors, borderRadius, spacing } = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  return (
    <TouchableOpacity
      style={[
        styles.base,
        {
          backgroundColor: '#D94040', // Error red
          borderRadius: borderRadius.lg,
          paddingVertical: spacing.md,
          paddingHorizontal: spacing.lg,
        },
        disabled && styles.disabled,
        isFocused && createFocusStyle({ colors }),
        style,
      ]}
      onPress={onPress}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <Text
        style={[
          styles.text,
          {
            color: colors.fixed.white,
          },
          textStyle,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
};

/**
 * Text Button - Minimal, underlined text
 */
export const TextButton = ({
  label,
  onPress,
  disabled = false,
  style,
  textStyle,
}) => {
  const { colors } = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  return (
    <TouchableOpacity
      style={[
        styles.textButton,
        isFocused && createFocusStyle({ colors }),
        style,
      ]}
      onPress={onPress}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      disabled={disabled}
      activeOpacity={0.6}
    >
      <Text
        style={[
          styles.textButtonLabel,
          {
            color: colors.text.secondary,
          },
          disabled && styles.disabledText,
          textStyle,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  text: {
    fontSize: 16,
    fontWeight: fontWeights.semibold,
  },
  disabled: {
    opacity: 0.5,
  },
  textButton: {
    padding: 8,
    alignItems: 'center',
  },
  textButtonLabel: {
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  disabledText: {
    opacity: 0.5,
  },
});
