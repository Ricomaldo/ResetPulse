// src/styles/responsive.js
import { Dimensions, Platform } from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Base dimensions (iPhone 13/14)
const BASE_WIDTH = 390;
const BASE_HEIGHT = 844;

// Get device info
export const getDeviceInfo = () => {
  const width = screenWidth;
  const height = screenHeight;
  const isLandscape = width > height;
  const aspectRatio = width / height;

  return {
    width,
    height,
    isLandscape,
    aspectRatio,
    isTablet: width >= 768,
    isSmallPhone: width < 375,
  };
};

// Responsive sizing based on both width and height
export const rs = (size, based = 'width') => {
  const { width, height } = getDeviceInfo();

  if (based === 'width') {
    return Math.round((size * width) / BASE_WIDTH);
  } else if (based === 'height') {
    return Math.round((size * height) / BASE_HEIGHT);
  } else if (based === 'min') {
    // Use the smaller dimension for consistent sizing
    const scale = Math.min(width / BASE_WIDTH, height / BASE_HEIGHT);
    return Math.round(size * scale);
  } else if (based === 'max') {
    // Use the larger dimension
    const scale = Math.max(width / BASE_WIDTH, height / BASE_HEIGHT);
    return Math.round(size * scale);
  }

  return size;
};

// Responsive font size (always based on width for consistency)
export const rf = (fontSize) => {
  const { width, isTablet } = getDeviceInfo();
  const scale = width / BASE_WIDTH;
  const newSize = fontSize * scale;

  if (isTablet) {
    // Limit font scaling on tablets
    return Math.round(Math.min(newSize, fontSize * 1.3));
  }

  return Math.round(newSize);
};

// Responsive spacing
export const spacing = {
  xs: rs(4, 'min'),
  sm: rs(8, 'min'),
  md: rs(13, 'min'),
  lg: rs(21, 'min'),
  xl: rs(34, 'min'),
  xxl: rs(55, 'min'),
};

// Layout helpers for orientation
export const getLayout = () => {
  const { isLandscape, width, height } = getDeviceInfo();

  if (isLandscape) {
    return {
      // Landscape layout
      activitySection: {
        flex: 0,
        width: width * 0.15,
        height: '100%',
      },
      timerSection: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
      },
      paletteSection: {
        flex: 0,
        width: width * 0.15,
        height: '100%',
      },
    };
  }

  // Portrait layout
  return {
    activitySection: {
      flex: 0,
      height: height * 0.12,
      width: '100%',
    },
    timerSection: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: height * 0.4,
    },
    paletteSection: {
      flex: 0,
      height: height * 0.08,
      width: '100%',
      alignItems: 'center',
    },
  };
};

// Safe area padding
export const getSafeAreaPadding = () => {
  const { isLandscape } = getDeviceInfo();

  // These values should come from react-native-safe-area-context
  // For now, using approximate values
  const statusBarHeight = Platform.OS === 'ios' ? 44 : 0;
  const bottomInset = Platform.OS === 'ios' ? 34 : 0;

  return {
    top: isLandscape ? 0 : statusBarHeight,
    bottom: isLandscape ? 0 : bottomInset,
    left: isLandscape ? 44 : 0,
    right: isLandscape ? 44 : 0,
  };
};

// Component size calculators
export const getComponentSizes = () => {
  const { width, height, isLandscape } = getDeviceInfo();

  return {
    // Timer circle size - MASSIVEMENT augmenté pour dominer l'écran
    timerCircle: rs(isLandscape ? Math.min(width * 0.5, height * 0.8) : width * 0.85, 'min'),

    // Activity button size
    activityButton: rs(isLandscape ? 60 : 65, 'min'),

    // Palette button size
    paletteButton: rs(40, 'min'),

    // Settings button
    settingsButton: rs(44, 'min'),
  };
};

// Export old function name for backward compatibility
export const responsiveSize = (size) => rs(size, 'width');