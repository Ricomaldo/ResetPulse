// src/hooks/usePremiumStatus.js
// Phase 3 - Migration testMode → RevenueCat + DevMode override

import { useContext } from 'react';
import { usePurchases } from '../contexts/PurchaseContext';
import { DevPremiumContext } from '../dev/DevPremiumContext';
import { DEV_MODE } from '../config/testMode';

/**
 * Hook pour vérifier le statut premium de l'utilisateur
 *
 * En DEV_MODE: utilise l'override du DevFab si disponible
 * En production: utilise RevenueCat via PurchaseContext
 *
 * Usage:
 * const { isPremium, isLoading } = usePremiumStatus();
 */
export const usePremiumStatus = () => {
  const { isPremium: revenueCatPremium, isLoading } = usePurchases();

  // En mode dev, vérifier l'override
  const devContext = useContext(DevPremiumContext);

  // Si DEV_MODE et qu'on a un override défini, l'utiliser
  if (DEV_MODE && devContext && devContext.devPremiumOverride !== null) {
    return {
      isPremium: devContext.devPremiumOverride,
      isLoading: false,
    };
  }

  // Sinon, utiliser le vrai statut RevenueCat
  return {
    isPremium: revenueCatPremium,
    isLoading,
  };
};

export default usePremiumStatus;
