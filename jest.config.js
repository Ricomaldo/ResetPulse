// Minimaliste Jest config for SDK 54
// jest-expo handles 90% of the work

module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testMatch: [
    '**/__tests__/**/*.test.js'
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/archive-sdk51/'  // Ignore archived tests
  ]
};