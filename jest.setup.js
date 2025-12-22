// Minimal setup for SDK 54 - only essential mocks

// Mock expo-haptics (hardware dependent)
jest.mock('expo-haptics', () => ({
  notificationAsync: jest.fn(() => Promise.resolve()),
  impactAsync: jest.fn(() => Promise.resolve()),
  selectionAsync: jest.fn(() => Promise.resolve()),
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock Mixpanel (native module, requires mock)
jest.mock('mixpanel-react-native', () => ({
  Mixpanel: jest.fn().mockImplementation(() => ({
    init: jest.fn().mockResolvedValue(undefined),
    setServerURL: jest.fn(),
    track: jest.fn(),
    identify: jest.fn(),
    registerSuperProperties: jest.fn(),
    flush: jest.fn(),
  })),
}));

// Mock expo-constants
jest.mock('expo-constants', () => ({
  expoConfig: {
    version: '1.3.0',
  },
}));

// Mock expo-notifications (native module)
jest.mock('expo-notifications', () => ({
  setNotificationHandler: jest.fn(),
  scheduleNotificationAsync: jest.fn(() => Promise.resolve('notification-id')),
  cancelScheduledNotificationAsync: jest.fn(() => Promise.resolve()),
  cancelAllScheduledNotificationsAsync: jest.fn(() => Promise.resolve()),
  getPermissionsAsync: jest.fn(() => Promise.resolve({ granted: true })),
  requestPermissionsAsync: jest.fn(() => Promise.resolve({ granted: true })),
  setNotificationChannelAsync: jest.fn(() => Promise.resolve()),
  // Constants for notification triggers (SDK 54)
  SchedulableTriggerInputTypes: {
    TIME_INTERVAL: 'timeInterval',
  },
  AndroidImportance: {
    HIGH: 'high',
  },
}));

// Mock expo-audio (native module)
jest.mock('expo-audio', () => ({
  useAudioPlayer: jest.fn(() => ({ play: jest.fn(), stop: jest.fn() })),
  setAudioModeAsync: jest.fn(() => Promise.resolve()),
}));

// Mock haptics utility
jest.mock('./src/utils/haptics', () => ({
  __esModule: true,
  default: {
    notification: jest.fn(() => Promise.resolve()),
    selection: jest.fn(() => Promise.resolve()),
    success: jest.fn(() => Promise.resolve()),
    switchToggle: jest.fn(() => Promise.resolve()),
  },
}));

// Mock react-native-purchases (RevenueCat)
jest.mock('react-native-purchases');

// Mock React Native components that need special handling
// Note: NativeAnimatedHelper path changed in newer RN versions - removed to avoid import errors

// Mock ScrollView for component tests
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');

  // Override ScrollView to handle refs properly
  RN.ScrollView = jest.fn().mockImplementation(({ children, ...props }) => {
    return RN.View({ ...props, children });
  });

  // Add Animated mock for component tests
  const AnimatedValue = function(initialValue) {
    this.setValue = jest.fn();
    this.addListener = jest.fn();
    this.removeListener = jest.fn();
    this.__getValue = () => initialValue;
    this.interpolate = jest.fn((config) => ({
      __isAnimatedValue: true,
      __getValue: () => config.outputRange?.[0] || 0,
    }));
  };

  RN.Animated = {
    ...RN.Animated,
    Value: AnimatedValue,
    timing: jest.fn(() => ({
      start: jest.fn(),
      stop: jest.fn(),
    })),
  };

  return RN;
});

// Mock react-native-svg (used in timer dial)
jest.mock('react-native-svg', () => {
  return {
    Svg: 'Svg',
    Circle: 'Circle',
    Path: 'Path',
    G: 'G',
    Defs: 'Defs',
    LinearGradient: 'LinearGradient',
    Stop: 'Stop',
    Text: 'Text',
    TSpan: 'TSpan',
  };
});

// Mock react-native-reanimated (worklets not available in Jest)
// Use the official mock from react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const View = require('react-native').View;
  try {
    const mock = require('react-native-reanimated/mock');
    // Ensure createAnimatedComponent exists
    if (!mock.createAnimatedComponent) {
      mock.createAnimatedComponent = (component) => component;
    }
    // Add FadeIn and FadeOut for onboarding transitions
    if (!mock.FadeIn) {
      mock.FadeIn = {
        duration: () => ({
          delay: () => ({}),
        }),
      };
    }
    if (!mock.FadeOut) {
      mock.FadeOut = {
        duration: () => ({}),
      };
    }
    return mock;
  } catch (e) {
    // Fallback mock if official mock fails
    const createFadeAnimation = () => ({
      duration: () => ({
        delay: () => ({}),
      }),
    });
    
    return {
      default: {
        View: View,
        Text: View,
        Image: View,
        ScrollView: View,
        FlatList: View,
      },
      View: View,
      Text: View,
      Image: View,
      ScrollView: View,
      FlatList: View,
      createAnimatedComponent: (component) => component,
      useSharedValue: (init) => ({ value: init }),
      useAnimatedStyle: (callback) => callback(),
      useAnimatedProps: (callback) => callback(),
      withTiming: (value) => value,
      withSpring: (value) => value,
      withRepeat: (value) => value,
      withSequence: (...values) => values[values.length - 1],
      interpolate: (value, config) => config.outputRange?.[0] || 0,
      FadeIn: createFadeAnimation(),
      FadeOut: {
        duration: () => ({}),
      },
      Extrapolation: {
        IDENTITY: 'identity',
        CLAMP: 'clamp',
        EXTEND: 'extend',
      },
      Easing: {
        linear: () => 0,
        ease: () => 0,
        quad: () => 0,
        cubic: () => 0,
        poly: () => 0,
        sin: () => 0,
        circle: () => 0,
        exp: () => 0,
        elastic: () => 0,
        back: () => 0,
        bounce: () => 0,
        bezier: () => 0,
        in: () => 0,
        out: () => 0,
        inOut: () => 0,
      },
    };
  }
});

// Mock react-native-worklets (required by reanimated)
jest.mock('react-native-worklets', () => ({
  Worklets: {
    createRunOnJS: (fn) => fn,
  },
}));

// Mock react-native-gesture-handler (depends on reanimated)
jest.mock('react-native-gesture-handler', () => {
  const View = require('react-native').View;
  return {
    Gesture: {
      Tap: () => ({ onStart: () => ({}) }),
      LongPress: () => ({ onStart: () => ({}) }),
      Pan: () => ({ onStart: () => ({}) }),
    },
    GestureDetector: ({ children }) => children,
    GestureHandlerRootView: View,
    ScrollView: View,
    Swipeable: View,
    DrawerLayout: View,
    State: {},
    Directions: {},
  };
});

// Mock theme tokens
jest.mock('./src/theme/tokens', () => ({
  fontWeights: {
    light: '300',
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999,
  },
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 3.84,
      elevation: 2,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 5.46,
      elevation: 4,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.2,
      shadowRadius: 7.49,
      elevation: 6,
    },
  },
}));

// Mock ThemeProvider with complete theme structure
jest.mock('./src/theme/ThemeProvider', () => {
  const React = require('react');
  const mockTheme = {
    colors: {
      brand: {
        primary: '#C17A71',
        secondary: '#78716C',
        accent: '#D4A853',
        deep: '#5A5A5A',
        neutral: '#9CA3AF',
      },
      fixed: {
        white: '#FFFFFF',
        black: '#000000',
        red: '#FF3B30',
        transparent: 'transparent',
      },
      background: '#ebe8e3',
      surface: '#FFFFFF',
      surfaceElevated: '#F8F6F3',
      text: '#1F2937',
      textSecondary: '#5A5A5A',
      textLight: '#7A7A7A',
      border: '#C17A7140',
      divider: '#9CA3AF20',
      shadow: 'rgba(0, 0, 0, 0.08)',
      overlay: 'rgba(0, 0, 0, 0.5)',
      overlayDark: 'rgba(0, 0, 0, 0.85)',
      danger: '#D94040',
      brandAccent15: '#C17A7115',
      brandAccent20: '#C17A7120',
      brandAccent40: '#C17A7140',
    },
    spacing: {
      xs: 4,
      sm: 8,
      md: 12,
      lg: 16,
      xl: 24,
    },
    borderRadius: {
      sm: 4,
      md: 8,
      lg: 12,
      xl: 16,
      full: 9999,
    },
    shadow: () => ({}),
    isDark: false,
    mode: 'light',
  };

  return {
    ThemeProvider: ({ children }) => React.createElement(React.Fragment, null, children),
    useTheme: () => mockTheme,
  };
});

// Suppress console warnings during tests (optional - comment out for debugging)
// global.console.warn = jest.fn();