// src/config/testMode.js

/**
 * Configuration pour le mode développement/test
 */

// Active le mode développement général
// true = mode dev, false = production
export const DEV_MODE = true;

// Affiche le FAB wrench pour contrôle dev (premium, onboarding reset, etc.)
// true = FAB visible, false = FAB caché
// Note: Nécessite DEV_MODE = true pour fonctionner
export const SHOW_DEV_FAB = true;

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
  SHOW_DEV_FAB,
  DEFAULT_PREMIUM,
  TEST_MODE,
  isTestPremium,
};
