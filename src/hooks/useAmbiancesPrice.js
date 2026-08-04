// src/hooks/useAmbiancesPrice.js
/**
 * @fileoverview useAmbiancesPrice — prix dynamique du pack Ambiances
 * Même source RevenueCat que PremiumModalContent (`getOfferings()` →
 * `availablePackages[0].product.priceString`) : les nouvelles entrées
 * volontaires (guichet AsideZone, pieds de section Palettes/Sons, Lambda T)
 * ont besoin du même prix sans dupliquer trois fois le fetch+state. Ne
 * touche pas PremiumModalContent (mécanique achat/erreurs inchangée) —
 * simple extraction du bout « lecture du prix » pour les nouveaux appelants.
 * @created 2026-08-04
 */
import { useState, useEffect } from 'react';
import { usePurchases } from '../contexts/PurchaseContext';
import logger from '../utils/logger';

/**
 * @returns {string|null} Le prix formaté (ex. "4,99 €"), ou null tant que
 * l'offre RevenueCat n'a pas répondu — l'appelant applique son propre repli.
 */
export const useAmbiancesPrice = () => {
  const { getOfferings } = usePurchases();
  const [price, setPrice] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const fetchPrice = async () => {
      try {
        const offerings = await getOfferings();
        const priceString = offerings?.availablePackages?.[0]?.product?.priceString;
        if (priceString && !cancelled) {
          setPrice(priceString);
        }
      } catch (error) {
        logger.warn('Could not fetch dynamic price', error.message);
      }
    };

    fetchPrice();
    return () => {
      cancelled = true;
    };
  }, [getOfferings]);

  return price;
};

export default useAmbiancesPrice;
