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
    '/archive-sdk51/',  // Ignore archived tests
    '/.claude/worktrees/'  // Worktrees d'agents : leurs tests appartiennent à leur branche
  ],
  // testPathIgnorePatterns n'exclut que les FICHIERS DE TEST — le haste
  // module map de Jest scanne quand même les worktrees pour la résolution
  // de modules (__mocks__ compris), et une divergence de contenu entre deux
  // __mocks__/react-native-purchases.js de même basename (racine vs
  // worktree) fait résoudre silencieusement vers une copie périmée (trouvé
  // lot funnel paiement, 06/08 — mocks jusque-là identiques, la collision
  // ne se voyait pas).
  modulePathIgnorePatterns: [
    '/.claude/worktrees/'
  ],
};