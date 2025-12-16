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
  const React = require('react');
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

// Suppress console warnings during tests (optional - comment out for debugging)
// global.console.warn = jest.fn();