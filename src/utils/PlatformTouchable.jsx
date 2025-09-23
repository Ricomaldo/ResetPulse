// src/utils/PlatformTouchable.jsx
import React from 'react';
import {
  Platform,
  TouchableOpacity,
  TouchableNativeFeedback,
  View
} from 'react-native';

/**
 * Platform-specific touchable component that automatically selects
 * TouchableNativeFeedback for Android and TouchableOpacity for iOS
 * Eliminates code duplication across the app
 */
export default function PlatformTouchable({
  children,
  onPress,
  onLongPress,
  disabled,
  activeOpacity = 0.7,
  background = TouchableNativeFeedback.Ripple('rgba(0,0,0,0.1)', false),
  style,
  accessible,
  accessibilityLabel,
  accessibilityHint,
  accessibilityRole,
  ...props
}) {
  if (Platform.OS === 'android' && Platform.Version >= 21) {
    return (
      <TouchableNativeFeedback
        onPress={onPress}
        onLongPress={onLongPress}
        disabled={disabled}
        background={background}
        accessible={accessible}
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
        accessibilityRole={accessibilityRole}
        {...props}
      >
        <View style={style}>
          {children}
        </View>
      </TouchableNativeFeedback>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      onLongPress={onLongPress}
      disabled={disabled}
      activeOpacity={activeOpacity}
      style={style}
      accessible={accessible}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityRole={accessibilityRole}
      {...props}
    >
      {children}
    </TouchableOpacity>
  );
}