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

// Suppress console warnings during tests (optional - comment out for debugging)
// global.console.warn = jest.fn();