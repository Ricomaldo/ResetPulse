// __tests__/components/PremiumModalContent.restoreVisible.test.js
// Lot restore visible (audit fiabilité 06/08, décision Eric 07/08
// « impératif ») : sans compte ni logIn RevenueCat, « Restaurer mes achats »
// est l'UNIQUE chemin de récupération cross-device/réinstallation — il doit
// être visible SOUS le CTA d'achat, pas cherché tout en bas de la modale.
// Ce test vérifie juste sa présence (testID `premium.cta.restore`) et
// qu'il déclenche bien `restorePurchases` — même pattern de montage réel
// (react-test-renderer + testID) que ctaBuyTapped.test.js.
import React from 'react';
import { create, act } from 'react-test-renderer';
import PremiumModalContent from '../../src/components/modals/PremiumModalContent';

jest.mock('../../src/hooks/useAnalytics', () => ({
  useAnalytics: () => ({
    trackPaywallViewed: jest.fn(),
    trackCtaBuyTapped: jest.fn(),
  }),
}));

jest.mock('../../src/hooks/useTranslation', () => ({
  useTranslation: () => (key) => key,
}));

jest.mock('../../src/contexts/ModalStackContext', () => ({
  useModalStack: () => ({ push: jest.fn(), pop: jest.fn() }),
}));

const mockRestorePurchases = jest.fn(() =>
  Promise.resolve({ success: true, hasPremium: true })
);
const mockGetOfferings = jest.fn(() =>
  Promise.resolve({
    availablePackages: [
      { product: { identifier: 'ambiances.unlock', priceString: '4,99 €' } },
    ],
  })
);
jest.mock('../../src/contexts/PurchaseContext', () => ({
  usePurchases: () => ({
    purchaseProduct: jest.fn(),
    restorePurchases: (...args) => mockRestorePurchases(...args),
    getOfferings: (...args) => mockGetOfferings(...args),
    isPurchasing: false,
  }),
}));

describe('PremiumModalContent — restore visible', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('affiche le lien Restore (testID premium.cta.restore) et déclenche restorePurchases au tap', async () => {
    let renderer;
    await act(async () => {
      renderer = create(<PremiumModalContent onClose={jest.fn()} source="rituals_cap" />);
    });

    const restoreLink = renderer.root.findByProps({ testID: 'premium.cta.restore' });
    expect(restoreLink).toBeTruthy();

    await act(async () => {
      await restoreLink.props.onPress();
    });

    expect(mockRestorePurchases).toHaveBeenCalledTimes(1);
  });
});

// Unicité du Restore (un seul contrôle visible, plus de doublon en pied de
// liste) : pas testable proprement via findAllByProps — react-test-renderer
// remonte 5 instances imbriquées (TouchableOpacity → Animated(View) → View
// hôte) pour un SEUL bouton logique, `testID` étant transmis à chaque
// couche. Vérifié par lecture du JSX (un seul
// testID="premium.cta.restore" dans le fichier) — reste sujet à la QA
// visuelle d'Eric.
