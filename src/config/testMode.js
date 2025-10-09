// src/config/testMode.js

/**
 * Configuration pour le mode test
 * Active toutes les fonctionnalités premium pour les testeurs
 */

// Active le mode test pour débloquer tout le contenu premium
// Mettre à false pour tester le freemium réel
export const TEST_MODE = false;

// Simule l'état premium pour les tests
export const isTestPremium = () => {
  return TEST_MODE;
};

export default {
  TEST_MODE,
  isTestPremium,
};
