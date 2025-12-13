// src/config/testMode.js

/**
 * Configuration pour le mode développement/test
 */

// Affiche le FAB wrench pour switcher Free/Premium dans l'app
// true = FAB visible, false = FAB caché (production)
export const DEV_MODE = true;

// État premium par défaut au lancement
// true = premium (tout débloqué), false = freemium (4 activités + bouton +)
export const DEFAULT_PREMIUM = false;

// Legacy export pour compatibilité
export const TEST_MODE = DEV_MODE;

export const isTestPremium = () => {
  return DEFAULT_PREMIUM;
};

export default {
  DEV_MODE,
  DEFAULT_PREMIUM,
  TEST_MODE,
  isTestPremium,
};
