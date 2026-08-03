// src/config/testMode.js

/**
 * Configuration pour le mode développement/test
 */

// Active le mode développement général
// Dérivé de __DEV__ (globale React Native : true en dev, false en build
// release) — plus de bascule manuelle, donc plus d'oubli possible avant
// publication (P0-1, review Claude design).
export const DEV_MODE = __DEV__;

// Affiche le FAB wrench pour contrôle dev (premium, onboarding reset, etc.)
// Note: Nécessite DEV_MODE = true pour fonctionner (ici toujours vrai en
// même temps que DEV_MODE puisque dérivé de la même globale __DEV__).
export const SHOW_DEV_FAB = __DEV__;

// État premium par défaut au lancement
// true = premium (tout débloqué), false = freemium (4 activités + bouton +)
export const DEFAULT_PREMIUM = false;

// Config timer par défaut en mode dev
// Utilisé pour forcer un état initial connu (20min méditation)
export const DEV_DEFAULT_TIMER_CONFIG = {
  activity: 'meditation', // 20 minutes par défaut
  duration: 1200, // 20 minutes en secondes
  // scaleMode retiré (hotfix-porte-1 B2) : '25min' était une échelle
  // DÉPRÉCIÉE (absente de DIAL_MODES) — le scaleMode est désormais toujours
  // dérivé de `duration` (deriveScaleMode), plus jamais choisi ici.
};

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
