// Tests for PurchaseContext.purchaseProduct — correctif audit fiabilité
// 06/08 : la garde « achat déjà en cours » (isPurchasing) renvoyait un
// objet non typé { success: false, error: '...' } — indiscernable d'une
// vraie erreur pour PremiumModalContent.handlePurchase, qui affichait une
// Alert d'échec pendant que le PREMIER achat (celui en vol) pouvait très
// bien réussir. La garde renvoie désormais { success: false,
// reason: 'already_in_flight' }, et l'appelant reste silencieux sur ce cas
// (comme pour un cancel utilisateur, déjà silencieux — vérifié ici aussi
// pour ne pas le casser).
//
// Pour que la garde se déclenche VRAIMENT (pas un faux positif où le
// deuxième appel réussirait simplement sans jamais toucher la garde), le
// premier appel est suspendu en plein vol sur Purchases.getOfferings (une
// promesse contrôlée à la main) et démarré dans un act() pour laisser le
// re-render (isPurchasing: false → true) se propager avant le second appel.
import React from 'react';
import { Alert } from 'react-native';
import { act } from 'react-test-renderer';
import Purchases from 'react-native-purchases';
import { renderHook } from '../test-utils';
import { PurchaseProvider, usePurchases } from '../../src/contexts/PurchaseContext';

const wrapper = ({ children }) => (
  <PurchaseProvider>{children}</PurchaseProvider>
);

describe('PurchaseContext.purchaseProduct — garde achat déjà en vol', () => {
  beforeEach(() => {
    jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  });

  afterEach(() => {
    Alert.alert.mockRestore();
    jest.restoreAllMocks();
  });

  it('deuxième appel concurrent → silencieux avec reason typée, le premier achat continue et réussit', async () => {
    const { result } = renderHook(() => usePurchases(), { wrapper });

    let releaseOfferings;
    Purchases.getOfferings.mockImplementationOnce(
      () => new Promise((resolve) => { releaseOfferings = resolve; })
    );

    let firstPurchase;
    await act(async () => {
      // Démarre le premier achat : il s'exécute jusqu'à l'await sur
      // getOfferings (suspendu), isPurchasing passe à true, et le
      // act() laisse ce re-render se propager avant qu'on continue.
      firstPurchase = result.current.purchaseProduct('premium_lifetime');
      await Promise.resolve();
    });

    // Le deuxième appel doit maintenant lire isPurchasing=true.
    let secondResult;
    await act(async () => {
      secondResult = await result.current.purchaseProduct('premium_lifetime');
    });

    expect(secondResult).toEqual({ success: false, reason: 'already_in_flight' });
    expect(Alert.alert).not.toHaveBeenCalled();

    // Le premier achat, lui, continue et réussit normalement.
    let firstResult;
    await act(async () => {
      releaseOfferings({ current: null });
      firstResult = await firstPurchase;
    });

    expect(firstResult.success).toBe(true);
  });
});
