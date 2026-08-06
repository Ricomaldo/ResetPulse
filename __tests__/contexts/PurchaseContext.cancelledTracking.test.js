// __tests__/contexts/PurchaseContext.cancelledTracking.test.js
// Lot funnel paiement (audit analytics 06/08, décision Eric 07/08) : entre
// paywall_viewed et purchase_completed, l'annulation sur la feuille de
// paiement native (result.cancelled, silencieuse par design côté UI) ne
// laissait aucune trace. purchase_cancelled comble ce trou — un SEUL point
// d'émission (le catch partagé par purchasePackage et purchaseProduct de
// repli, cf. commentaire au call site dans PurchaseContext.jsx).
//
// Le mock react-native-purchases n'exposait pas PURCHASES_ERROR_CODE avant
// ce lot (__mocks__/react-native-purchases.js) — ajouté pour permettre ces
// tests, ainsi que le test de non-régression purchase_failed ci-dessous.
import React from 'react';
import Purchases from 'react-native-purchases';
import { renderHook, act } from '../test-utils';
import { PurchaseProvider, usePurchases } from '../../src/contexts/PurchaseContext';

const mockTrackPurchaseCancelled = jest.fn();
const mockTrackPurchaseFailed = jest.fn();
const mockTrackPurchaseCompleted = jest.fn();
jest.mock('../../src/services/analytics', () => ({
  __esModule: true,
  default: {
    trackPurchaseCancelled: (...args) => mockTrackPurchaseCancelled(...args),
    trackPurchaseFailed: (...args) => mockTrackPurchaseFailed(...args),
    trackPurchaseCompleted: (...args) => mockTrackPurchaseCompleted(...args),
  },
}));

const wrapper = ({ children }) => (
  <PurchaseProvider>{children}</PurchaseProvider>
);

describe('PurchaseContext.purchaseProduct — purchase_cancelled', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('userCancelled (PURCHASE_CANCELLED_ERROR) → purchase_cancelled émis avec product_id, UI reste silencieuse', async () => {
    Purchases.purchaseProduct.mockRejectedValueOnce({
      code: Purchases.PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR,
      message: 'Purchase was cancelled',
    });

    const { result } = renderHook(() => usePurchases(), { wrapper });

    let purchaseResult;
    await act(async () => {
      purchaseResult = await result.current.purchaseProduct('premium_lifetime');
    });

    expect(purchaseResult).toEqual({ success: false, cancelled: true });
    expect(mockTrackPurchaseCancelled).toHaveBeenCalledTimes(1);
    expect(mockTrackPurchaseCancelled).toHaveBeenCalledWith('premium_lifetime');
    expect(mockTrackPurchaseFailed).not.toHaveBeenCalled();
  });

  it('already_in_flight (garde isPurchasing) → purchase_cancelled JAMAIS émis, ce n\'est pas une annulation utilisateur', async () => {
    const { result } = renderHook(() => usePurchases(), { wrapper });

    let releaseOfferings;
    Purchases.getOfferings.mockImplementationOnce(
      () => new Promise((resolve) => { releaseOfferings = resolve; })
    );

    let firstPurchase;
    await act(async () => {
      firstPurchase = result.current.purchaseProduct('premium_lifetime');
      await Promise.resolve();
    });

    let secondResult;
    await act(async () => {
      secondResult = await result.current.purchaseProduct('premium_lifetime');
    });

    expect(secondResult).toEqual({ success: false, reason: 'already_in_flight' });
    expect(mockTrackPurchaseCancelled).not.toHaveBeenCalled();

    await act(async () => {
      releaseOfferings({ current: null });
      await firstPurchase;
    });
  });

  it('non-régression : une vraie erreur (STORE_PROBLEM_ERROR) émet toujours purchase_failed, jamais purchase_cancelled', async () => {
    Purchases.purchaseProduct.mockRejectedValueOnce({
      code: Purchases.PURCHASES_ERROR_CODE.STORE_PROBLEM_ERROR,
      message: 'Store unavailable',
    });

    const { result } = renderHook(() => usePurchases(), { wrapper });

    let purchaseResult;
    await act(async () => {
      purchaseResult = await result.current.purchaseProduct('premium_lifetime');
    });

    expect(purchaseResult.success).toBe(false);
    expect(mockTrackPurchaseFailed).toHaveBeenCalledTimes(1);
    expect(mockTrackPurchaseFailed).toHaveBeenCalledWith(
      Purchases.PURCHASES_ERROR_CODE.STORE_PROBLEM_ERROR,
      'Store unavailable',
      'premium_lifetime'
    );
    expect(mockTrackPurchaseCancelled).not.toHaveBeenCalled();
  });
});
