// src/styles/shadows.js
// Platform-adaptive shadow system for iOS and Android

import { Platform } from 'react-native';

// iOS Shadow presets (following iOS HIG)
const iosShadows = {
  // No shadow
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
  },

  // Subtle shadow for minimal elevation
  xs: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 1,
  },

  // Light shadow for cards and buttons
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },

  // Medium shadow for modals and popovers
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },

  // Strong shadow for elevated components
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
  },

  // Heavy shadow for overlays and sheets
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
  },

  // Dramatic shadow for high emphasis
  xxl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
  },

  // Custom colored shadows
  colored: (color, opacity = 0.3) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: opacity,
    shadowRadius: 8,
  }),

  // Inset shadow effect (simulated)
  inset: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
};

// Android elevation levels (Material Design 3)
const androidElevations = {
  none: 0,
  xs: 0.5,
  sm: 1,
  md: 3,
  lg: 6,
  xl: 12,
  xxl: 24,
};

// Unified shadow function with platform detection
export const shadow = (level = 'md', customColor = null) => {
  // Handle 'none' case
  if (level === 'none') {
    return Platform.select({
      ios: iosShadows.none,
      android: { elevation: androidElevations.none },
    });
  }

  // Handle colored shadows (iOS only, Android doesn't support colored elevation)
  if (customColor && Platform.OS === 'ios') {
    return iosShadows.colored(customColor);
  }

  // Return platform-specific shadow
  return Platform.select({
    ios: iosShadows[level] || iosShadows.md,
    android: { elevation: androidElevations[level] || androidElevations.md },
  });
};

// Dynamic shadow based on theme
export const themedShadow = (level = 'md', isDark = false) => {
  if (Platform.OS === 'ios') {
    const baseShadow = iosShadows[level] || iosShadows.md;

    // Adjust shadow for dark mode (lighter shadows)
    if (isDark) {
      return {
        ...baseShadow,
        shadowOpacity: baseShadow.shadowOpacity * 0.7,
        shadowColor: '#FFF',
      };
    }

    return baseShadow;
  }

  // Android elevation doesn't change with theme
  return { elevation: androidElevations[level] || androidElevations.md };
};

// Animated shadow helper (for hover/press states)
export const animatedShadow = (fromLevel = 'sm', toLevel = 'md') => ({
  from: shadow(fromLevel),
  to: shadow(toLevel),
});

// Component-specific shadow presets
export const componentShadows = {
  // Button shadows
  button: {
    default: shadow('sm'),
    pressed: shadow('xs'),
    elevated: shadow('md'),
  },

  // Card shadows
  card: {
    default: shadow('md'),
    hover: shadow('lg'),
    pressed: shadow('sm'),
  },

  // Modal/Sheet shadows
  modal: {
    backdrop: Platform.select({
      ios: {
        ...iosShadows.xxl,
        shadowOpacity: 0.25,
      },
      android: { elevation: androidElevations.xxl },
    }),
    content: shadow('xl'),
  },

  // Navigation shadows
  navigation: {
    header: shadow('sm'),
    tabBar: shadow('md'),
    drawer: shadow('lg'),
  },

  // Floating elements
  floating: {
    fab: shadow('lg'),
    tooltip: shadow('md'),
    snackbar: shadow('md'),
  },
};

// Utility to combine multiple shadows (iOS only)
export const combineShadows = (...shadows) => {
  if (Platform.OS !== 'ios') {
    // Android can't combine elevations, return the highest one
    const elevations = shadows.map(s => s.elevation || 0);
    return { elevation: Math.max(...elevations) };
  }

  // iOS can layer shadows
  return shadows.reduce((acc, shadow) => ({
    ...acc,
    ...shadow,
  }), {});
};

// Export all shadow utilities
export default {
  shadow,
  themedShadow,
  animatedShadow,
  componentShadows,
  combineShadows,

  // Direct access to platform-specific values
  ios: iosShadows,
  android: androidElevations,
};