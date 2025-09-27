// Dynamic approach to handle React Native/Expo ecosystem transformation
const packagesToTransform = [
  // Core React Native packages
  'react-native',
  '@react-native',
  '@react-native-community',

  // Expo ecosystem - using wildcards
  'expo',
  'expo-.*',
  '@expo',
  '@expo-google-fonts',
  '@unimodules',
  'unimodules',

  // Common RN packages pattern
  'react-native-.*',

  // Navigation
  '@react-navigation',

  // Add specific packages as needed
  'sentry-expo',
  'native-base'
];

module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testMatch: [
    '**/__tests__/**/*.test.js',
    '**/__tests__/**/*.test.jsx'
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/android/',
    '/ios/'
  ],
  collectCoverageFrom: [
    'src/hooks/**/*.{js,jsx}',
    '!src/hooks/index.js'
  ],
  // Coverage reports only, no hard thresholds - focus on critical paths
  coverageReporters: ['text', 'text-summary'],

  // Transform pattern built from array for maintainability
  transformIgnorePatterns: [
    `node_modules/(?!(${packagesToTransform.join('|')})/)`
  ],

  // Alternative: Ultra-permissive approach (transforms everything except specific exclusions)
  // transformIgnorePatterns: [
  //   'node_modules/(?!.*\\.(?:jsx?|tsx?|mjs|cjs)$)',
  //   'node_modules/(?!(jest-)?(@?react|@?expo|@?unimodules))',
  // ],

  // Mock static assets and modules that don't need transformation
  moduleNameMapper: {
    // Mock images and assets
    '\\.(jpg|jpeg|png|gif|webp|svg)$': '<rootDir>/__mocks__/fileMock.js',
    // Mock styles if needed
    '\\.(css|less|scss|sass)$': '<rootDir>/__mocks__/styleMock.js',
  },

  // Automatically clear mock calls and instances between every test
  clearMocks: true,
};