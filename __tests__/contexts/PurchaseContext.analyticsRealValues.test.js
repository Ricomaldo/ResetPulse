// Tests for PurchaseContext.purchaseProduct — correctif audit fiabilité
// 06/08 : purchase_completed remontait un prix hardcodé 4.99 (faux hors
// zone euro, jamais réellement lu — cf. le calcul mort
// info.nonSubscriptionTransactions[0] || info.latestExpirationDate) et un
// transaction_id 'unknown' par défaut. Corrigé pour lire price/currencyCode
// depuis le package RevenueCat effectivement acheté (même source que le
// prix affiché au paywall) et transactionIdentifier depuis le résultat
// d'achat (MakePurchaseResult.transaction).
import React from 'react';
import Purchases from 'react-native-purchases';
import { renderHook, act } from '../test-utils';
import { PurchaseProvider, usePurchases } from '../../src/contexts/PurchaseContext';

const mockTrackPurchaseCompleted = jest.fn();
jest.mock('../../src/services/analytics', () => ({
  __esModule: true,
  default: {
    trackTrialStarted: jest.fn(),
    trackPurchaseCompleted: (...args) => mockTrackPurchaseCompleted(...args),
    trackPurchaseFailed: jest.fn(),
  },
}));

const wrapper = ({ children }) => (
  <PurchaseProvider>{children}</PurchaseProvider>
);

const packageAt599USD = {
  identifier: 'premium_lifetime_v2',
  packageType: 'LIFETIME',
  product: {
    identifier: 'premium_lifetime_v2',
    description: 'Ambiances lifetime',
    title: 'Ambiances',
    price: 5.99,
    priceString: '$5.99',
    currencyCode: 'USD',
    introPrice: null,
    discounts: [],
  },
  offeringIdentifier: 'default',
};

describe('PurchaseContext.purchaseProduct — analytics prix/devise/transaction réels', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('offering non-euro avec transaction → purchase_completed porte 5.99/USD et le transactionId réel', async () => {
    Purchases.getOfferings.mockResolvedValueOnce({
      all: {},
      current: { identifier: 'default', availablePackages: [packageAt599USD] },
    });
    Purchases.purchasePackage.mockResolvedValueOnce({
      customerInfo: { entitlements: { active: {}, all: {} }, nonSubscriptionTransactions: [] },
      transaction: { transactionIdentifier: 'txn-real-123', productIdentifier: 'premium_lifetime_v2', purchaseDate: new Date().toISOString() },
      productIdentifier: 'premium_lifetime_v2',
    });

    const { result } = renderHook(() => usePurchases(), { wrapper });

    let purchaseResult;
    await act(async () => {
      purchaseResult = await result.current.purchaseProduct('premium_lifetime_v2');
    });

    expect(purchaseResult.success).toBe(true);
    expect(mockTrackPurchaseCompleted).toHaveBeenCalledWith(
      'premium_lifetime_v2',
      5.99,
      'txn-real-123',
      'USD'
    );
  });

  it('achat sans transaction dans le résultat → transaction_id null (jamais la chaîne "unknown")', async () => {
    Purchases.getOfferings.mockResolvedValueOnce({
      all: {},
      current: { identifier: 'default', availablePackages: [packageAt599USD] },
    });
    Purchases.purchasePackage.mockResolvedValueOnce({
      customerInfo: { entitlements: { active: {}, all: {} }, nonSubscriptionTransactions: [] },
      // Pas de champ `transaction` — cas limite SDK.
      productIdentifier: 'premium_lifetime_v2',
    });

    const { result } = renderHook(() => usePurchases(), { wrapper });

    let purchaseResult;
    await act(async () => {
      purchaseResult = await result.current.purchaseProduct('premium_lifetime_v2');
    });

    expect(purchaseResult.success).toBe(true);
    expect(mockTrackPurchaseCompleted).toHaveBeenCalledWith(
      'premium_lifetime_v2',
      5.99,
      null,
      'USD'
    );
  });
});
