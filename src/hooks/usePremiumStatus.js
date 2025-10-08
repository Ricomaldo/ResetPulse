// src/hooks/usePremiumStatus.js
// Phase 3 - Migration testMode → RevenueCat

import { usePurchases } from '../contexts/PurchaseContext';

/**
 * Hook pour vérifier le statut premium de l'utilisateur
 * Remplace isTestPremium() de testMode.js
 *
 * Usage:
 * const { isPremium, isLoading } = usePremiumStatus();
 *
 * Compatibilité legacy:
 * const isPremiumUser = usePremiumStatus().isPremium;
 */
export const usePremiumStatus = () => {
  const { isPremium, isLoading } = usePurchases();

  return {
    isPremium,
    isLoading,
  };
};

export default usePremiumStatus;
