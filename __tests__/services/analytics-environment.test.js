// __tests__/services/analytics-environment.test.js
// Verrouille le contrat du repli réel (cf. commentaire de tête dans
// src/services/analytics-environment.js pour la justification complète :
// TestFlight indiscernable de l'App Store sans nouvelle dépendance).
// Les tests d'intégration (mock du seam) vivent dans analytics.test.js.

import { detectEnvironment } from '../../src/services/analytics-environment';

describe('services/analytics-environment', () => {
  it("résout 'prod' (repli assumé — TestFlight indiscernable sans nouvelle dépendance)", async () => {
    await expect(detectEnvironment()).resolves.toBe('prod');
  });
});
