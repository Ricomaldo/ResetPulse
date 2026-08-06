// Tests for PurchaseContext.purchaseProduct — correctif 3 du Lambda F1
// (audit fiabilité) : trackTrialStarted était appelé sur CHAQUE achat réussi
// alors que le produit est un lifetime unique (pas d'essai) — supprimé des
// deux chemins d'achat (purchasePackage et son repli purchaseProduct). La
// méthode reste dans analytics.js, orpheline. trackPurchaseCompleted reste
// l'unique tracking d'un achat réussi.
//
// Le mock react-native-purchases (__mocks__/react-native-purchases.js) a
// offerings.current = null par défaut, donc purchaseProduct emprunte le
// chemin de repli Purchases.purchaseProduct (pas purchasePackage) — les deux
// chemins portaient le même bug, un seul suffit à couvrir le correctif.
import React from 'react';
import { renderHook, act } from '../test-utils';
import { PurchaseProvider, usePurchases } from '../../src/contexts/PurchaseContext';

const mockTrackTrialStarted = jest.fn();
const mockTrackPurchaseCompleted = jest.fn();
jest.mock('../../src/services/analytics', () => ({
  __esModule: true,
  default: {
    trackTrialStarted: (...args) => mockTrackTrialStarted(...args),
    trackPurchaseCompleted: (...args) => mockTrackPurchaseCompleted(...args),
    trackPurchaseFailed: jest.fn(),
  },
}));

const wrapper = ({ children }) => (
  <PurchaseProvider>{children}</PurchaseProvider>
);

describe('PurchaseContext.purchaseProduct — trackTrialStarted supprimé', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("achat réussi : n'appelle jamais trackTrialStarted, appelle trackPurchaseCompleted", async () => {
    const { result } = renderHook(() => usePurchases(), { wrapper });

    let purchaseResult;
    await act(async () => {
      purchaseResult = await result.current.purchaseProduct('premium_lifetime');
    });

    expect(purchaseResult.success).toBe(true);
    expect(mockTrackTrialStarted).not.toHaveBeenCalled();
    // Lambda F2 (audit fiabilité 06/08) : ce test emprunte le chemin de
    // repli purchaseProduct (offerings.current = null dans le mock par
    // défaut) — sans package RevenueCat, pas de source fiable pour
    // price/currency (null explicite, plus de faux 4.99) ; le mock
    // purchaseProduct par défaut ne porte pas de champ transaction, donc
    // transaction_id est également null (plus de faux 'unknown').
    expect(mockTrackPurchaseCompleted).toHaveBeenCalledWith(
      'premium_lifetime',
      null,
      null,
      null
    );
  });
});
