// Tests for PurchaseContext.purchaseProduct — correctif 4 du Lambda F1
// (audit fiabilité) : purchaseProduct affichait une Alert.alert de
// bienvenue sur achat réussi, PUIS PremiumModalContent.handlePurchase en
// affichait une seconde (elle porte onClose, conservée là-bas — inchangée
// par ce correctif). Le doublon dans le contexte est supprimé : ce test
// couvre la moitié que ce correctif possède, soit ZÉRO alerte depuis
// PurchaseContext (le repo n'a pas d'infra fireEvent/testing-library pour
// monter PremiumModalContent et vérifier l'appel UNIQUE bout-en-bout, cf.
// PaywallHero.test.js — le changement de ce correctif est de toute façon
// scopé à PurchaseContext seul).
//
// Le mock react-native-purchases (__mocks__/react-native-purchases.js) a
// offerings.current = null par défaut, donc purchaseProduct emprunte le
// chemin de repli Purchases.purchaseProduct (pas purchasePackage) — les deux
// chemins portaient le même doublon, un seul suffit à couvrir le correctif.
import React from 'react';
import { Alert } from 'react-native';
import { renderHook, act } from '../test-utils';
import { PurchaseProvider, usePurchases } from '../../src/contexts/PurchaseContext';

const wrapper = ({ children }) => (
  <PurchaseProvider>{children}</PurchaseProvider>
);

describe('PurchaseContext.purchaseProduct — doublon Alert.alert supprimé', () => {
  beforeEach(() => {
    jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  });

  afterEach(() => {
    Alert.alert.mockRestore();
  });

  it("achat réussi : n'affiche plus l'alerte de bienvenue depuis le contexte", async () => {
    const { result } = renderHook(() => usePurchases(), { wrapper });

    let purchaseResult;
    await act(async () => {
      purchaseResult = await result.current.purchaseProduct('premium_lifetime');
    });

    expect(purchaseResult.success).toBe(true);
    expect(Alert.alert).not.toHaveBeenCalled();
  });
});
