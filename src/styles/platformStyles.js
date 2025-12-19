// src/styles/platformStyles.js
// Platform-adaptive styles for iOS and Android

import { Platform, StyleSheet } from 'react-native';

// Platform detection helpers
export const isIOS = Platform.OS === 'ios';
export const isAndroid = Platform.OS === 'android';

// iOS Human Interface Guidelines values
const iOS = {
  // Shadows (subtle, layered)
  shadowLight: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  shadowMedium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  shadowStrong: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
  },
  shadowHeavy: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
  },

  // Touch feedback
  activeOpacity: 0.7,
  underlayColor: 'rgba(0, 0, 0, 0.05)',

  // Animations
  animationDuration: 250,
  animationEasing: 'ease-in-out',

  // Typography
  fontWeights: {
    ultraLight: '100',
    thin: '200',
    light: '300',
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    heavy: '800',
    black: '900',
  },

  // Blur effects
  blurType: 'light',
  blurAmount: 20,
};

// Material Design values for Android
const android = {
  // Elevation levels (Material Design 3)
  elevationLight: 1,
  elevationMedium: 3,
  elevationStrong: 6,
  elevationHeavy: 12,

  // Touch feedback
  rippleColor: 'rgba(0, 0, 0, 0.12)',
  pressedColor: 'rgba(0, 0, 0, 0.08)',

  // Animations
  animationDuration: 300,
  animationEasing: 'ease-out',

  // Typography (Roboto)
  fontWeights: {
    thin: '100',
    light: '300',
    regular: '400',
    medium: '500',
    bold: '700',
    black: '900',
  },
};

// Platform-adaptive shadow/elevation
export const createShadow = (level = 'medium') => {
  const levels = {
    light: Platform.select({
      ios: iOS.shadowLight,
      android: { elevation: android.elevationLight },
    }),
    medium: Platform.select({
      ios: iOS.shadowMedium,
      android: { elevation: android.elevationMedium },
    }),
    strong: Platform.select({
      ios: iOS.shadowStrong,
      android: { elevation: android.elevationStrong },
    }),
    heavy: Platform.select({
      ios: iOS.shadowHeavy,
      android: { elevation: android.elevationHeavy },
    }),
  };

  return levels[level] || levels.medium;
};

// Platform-adaptive button styles
export const createButtonStyle = (variant = 'primary', theme) => {
  const baseStyle = {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: Platform.select({
      ios: 10, // iOS prefers rounded corners
      android: 8, // Material Design uses slightly less rounding
    }),
    alignItems: 'center',
    justifyContent: 'center',
  };

  const variants = {
    primary: {
      ...baseStyle,
      backgroundColor: theme.colors.brand.primary,
      ...createShadow('medium'),
    },
    secondary: {
      ...baseStyle,
      backgroundColor: theme.colors.brand.secondary,
      ...createShadow('light'),
    },
    ghost: {
      ...baseStyle,
      backgroundColor: theme.colors.fixed.transparent,
      borderWidth: 1,
      borderColor: theme.colors.brand.primary,
    },
  };

  return variants[variant] || variants.primary;
};

// Platform-adaptive card styles
export const createCardStyle = (theme) => ({
  backgroundColor: theme.colors.surface,
  borderRadius: Platform.select({
    ios: 12,
    android: 8,
  }),
  padding: 16,
  ...createShadow('medium'),
  ...Platform.select({
    ios: {
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.brand.primary + '20',
    },
    android: {},
  }),
});

// Platform-adaptive modal styles
export const createModalStyle = (theme) => ({
  overlay: Platform.select({
    ios: {
      backgroundColor: 'rgba(0, 0, 0, 0.4)',
      backdropFilter: 'blur(20px)', // iOS vibrancy effect
    },
    android: {
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
  }),

  container: {
    backgroundColor: theme.colors.background,
    borderRadius: Platform.select({
      ios: 16,
      android: 12,
    }),
    ...createShadow('heavy'),
    ...Platform.select({
      ios: {
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: theme.colors.brand.primary + '30',
      },
      android: {},
    }),
  },

  presentationStyle: Platform.select({
    ios: 'overFullScreen',
    android: 'fade',
  }),
});

// Platform-adaptive input styles
export const createInputStyle = (theme, focused = false) => ({
  backgroundColor: theme.colors.inputBackground,
  borderRadius: Platform.select({
    ios: 10,
    android: 8,
  }),
  paddingHorizontal: 16,
  paddingVertical: Platform.select({
    ios: 14,
    android: 12,
  }),
  fontSize: 16,
  color: theme.colors.text,

  ...Platform.select({
    ios: {
      borderWidth: focused ? 2 : 1,
      borderColor: focused ? theme.colors.brand.primary : theme.colors.border,
      ...createShadow(focused ? 'light' : null),
    },
    android: {
      borderWidth: 0,
      ...createShadow(focused ? 'medium' : 'light'),
    },
  }),
});

// Platform-adaptive list item styles
export const createListItemStyle = (theme, pressed = false) => ({
  backgroundColor: pressed
    ? Platform.select({
      ios: theme.colors.surface + '80',
      android: theme.colors.surface,
    })
    : theme.colors.surface,

  paddingHorizontal: 16,
  paddingVertical: Platform.select({
    ios: 12,
    android: 14,
  }),

  ...Platform.select({
    ios: pressed ? {} : createShadow('light'),
    android: {}, // Android uses ripple effect instead
  }),
});

// Platform-adaptive switch styles
export const getSwitchProps = (theme, value) => ({
  ...Platform.select({
    ios: {
      trackColor: {
        false: theme.colors.border,
        true: theme.colors.brand.primary,
      },
      thumbColor: '#FFFFFF',
      ios_backgroundColor: theme.colors.border,
    },
    android: {
      trackColor: {
        false: theme.colors.brand.primary + '50',
        true: theme.colors.brand.primary + '50',
      },
      thumbColor: value ? theme.colors.brand.primary : '#FFFFFF',
    },
  }),
});

// Platform-adaptive animation configs
export const getAnimationConfig = () => ({
  duration: Platform.select({
    ios: iOS.animationDuration,
    android: android.animationDuration,
  }),

  useNativeDriver: true,

  easing: Platform.select({
    ios: 'ease-in-out',
    android: 'ease-out',
  }),
});

// Platform-adaptive touch feedback props
export const getTouchableProps = () => ({
  activeOpacity: Platform.select({
    ios: iOS.activeOpacity,
    android: 0.9,
  }),

  // Note: TouchableNativeFeedback ripple must be handled in the component
  // where it's imported, not here in the styles file
});

// Platform-adaptive icon sizes
export const getIconSize = (size = 'medium') => {
  const sizes = {
    small: Platform.select({ ios: 18, android: 20 }),
    medium: Platform.select({ ios: 24, android: 24 }),
    large: Platform.select({ ios: 32, android: 36 }),
  };

  return sizes[size] || sizes.medium;
};

// Platform-adaptive spacing
export const getSpacing = () => ({
  // iOS prefers tighter spacing, Android needs more breathing room
  xs: Platform.select({ ios: 4, android: 4 }),
  sm: Platform.select({ ios: 8, android: 8 }),
  md: Platform.select({ ios: 12, android: 16 }),
  lg: Platform.select({ ios: 20, android: 24 }),
  xl: Platform.select({ ios: 32, android: 40 }),
});

// Export convenience object with all platform values
export const platformValues = {
  ios: iOS,
  android,
  isIOS,
  isAndroid,
};

export default {
  createShadow,
  createButtonStyle,
  createCardStyle,
  createModalStyle,
  createInputStyle,
  createListItemStyle,
  getSwitchProps,
  getAnimationConfig,
  getTouchableProps,
  getIconSize,
  getSpacing,
  platformValues,
};