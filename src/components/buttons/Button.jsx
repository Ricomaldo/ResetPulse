/**
 * @fileoverview Button Component Library for ResetPulse
 * Centralized button styles for consistency across modals
 * @created 2025-12-14
 */

import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { createFocusStyle } from '../../styles/focusStyles';
import { useTheme } from '../../theme/ThemeProvider';
import { fontWeights } from '../../theme/tokens';

// Couleurs extraites pour respecter la règle no-color-literals
const TRANSPARENT = 'transparent';

/**
 * Primary Button - Brand color, filled
 */
export const PrimaryButton = React.memo(function PrimaryButton({
  disabled = false,
  label,
  loading = false,
  onPress,
  style,
  textStyle,
}) {
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
        disabled && { borderWidth: 1, borderColor: colors.border }, // P1-2: visibility fix
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
});

PrimaryButton.displayName = 'PrimaryButton';
PrimaryButton.propTypes = {
  disabled: PropTypes.bool,
  label: PropTypes.string.isRequired,
  loading: PropTypes.bool,
  onPress: PropTypes.func.isRequired,
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  textStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
};

/**
 * Secondary Button - Outlined with brand color
 */
export const SecondaryButton = React.memo(function SecondaryButton({
  disabled = false,
  label,
  onPress,
  style,
  textStyle,
}) {
  const { colors, borderRadius, spacing } = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  return (
    <TouchableOpacity
      style={[
        styles.base,
        styles.outlined,
        {
          borderColor: colors.brand.secondary,
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
            color: colors.brand.secondary,
          },
          textStyle,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
});

SecondaryButton.displayName = 'SecondaryButton';
SecondaryButton.propTypes = {
  disabled: PropTypes.bool,
  label: PropTypes.string.isRequired,
  onPress: PropTypes.func.isRequired,
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  textStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
};

/**
 * Destructive Button - Error color for delete/dangerous actions
 */
export const DestructiveButton = React.memo(function DestructiveButton({
  disabled = false,
  label,
  onPress,
  style,
  textStyle,
}) {
  const { colors, borderRadius, spacing } = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  return (
    <TouchableOpacity
      style={[
        styles.base,
        {
          backgroundColor: colors.danger, // Error red
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
});

DestructiveButton.displayName = 'DestructiveButton';
DestructiveButton.propTypes = {
  disabled: PropTypes.bool,
  label: PropTypes.string.isRequired,
  onPress: PropTypes.func.isRequired,
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  textStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
};

/**
 * Text Button - Minimal, underlined text
 */
export const TextButton = React.memo(function TextButton({
  disabled = false,
  label,
  onPress,
  style,
  textStyle,
}) {
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
});

TextButton.displayName = 'TextButton';
TextButton.propTypes = {
  disabled: PropTypes.bool,
  label: PropTypes.string.isRequired,
  onPress: PropTypes.func.isRequired,
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  textStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
};

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  disabled: {
    opacity: 0.5,
  },
  disabledText: {
    opacity: 0.5,
  },
  outlined: {
    backgroundColor: TRANSPARENT,
    borderWidth: 1,
  },
  text: {
    fontSize: 16,
    fontWeight: fontWeights.semibold,
  },
  textButton: {
    alignItems: 'center',
    padding: 8,
  },
  textButtonLabel: {
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});
