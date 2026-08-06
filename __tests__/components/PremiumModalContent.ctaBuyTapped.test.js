// __tests__/components/PremiumModalContent.ctaBuyTapped.test.js
// Lot funnel paiement (audit analytics 06/08, décision Eric 07/08) : entre
// paywall_viewed et purchase_completed, aucun événement — le tap sur le CTA
// d'achat n'était pas tracé. cta_buy_tapped comble ce trou, ÉMIS AU TAP —
// avant même l'appel getOfferings — avec la MÊME `source` que
// trackPaywallViewed (jointure du funnel). product_id est encore inconnu à
// cet instant (offerings pas résolues) → null, conformément au mandat
// (« product_id si disponible au moment du tap »).
//
// Montage réel du composant (react-test-renderer + testID, pattern de
// TimerScreen.momentChip.test.js) — PaywallHero n'est pas mocké : aucun
// `hero` n'est transmis dans ces tests, la branche header générique ne le
// monte pas.
import React from 'react';
import { create, act } from 'react-test-renderer';
import PremiumModalContent from '../../src/components/modals/PremiumModalContent';

const mockTrackPaywallViewed = jest.fn();
const mockTrackCtaBuyTapped = jest.fn();
jest.mock('../../src/hooks/useAnalytics', () => ({
  useAnalytics: () => ({
    trackPaywallViewed: (...args) => mockTrackPaywallViewed(...args),
    trackCtaBuyTapped: (...args) => mockTrackCtaBuyTapped(...args),
  }),
}));

jest.mock('../../src/hooks/useTranslation', () => ({
  useTranslation: () => (key) => key,
}));

jest.mock('../../src/contexts/ModalStackContext', () => ({
  useModalStack: () => ({ push: jest.fn(), pop: jest.fn() }),
}));

const mockPurchaseProduct = jest.fn(() => Promise.resolve({ success: true }));
const mockGetOfferings = jest.fn(() =>
  Promise.resolve({
    availablePackages: [
      { product: { identifier: 'ambiances.unlock', priceString: '4,99 €' } },
    ],
  })
);
jest.mock('../../src/contexts/PurchaseContext', () => ({
  usePurchases: () => ({
    purchaseProduct: (...args) => mockPurchaseProduct(...args),
    restorePurchases: jest.fn(),
    getOfferings: (...args) => mockGetOfferings(...args),
    isPurchasing: false,
  }),
}));

const pressBuy = (renderer) => {
  const button = renderer.root.findByProps({ testID: 'premium.cta.buy' });
  return act(async () => {
    await button.props.onPress();
  });
};

describe('PremiumModalContent — cta_buy_tapped', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('émet cta_buy_tapped AU TAP (product_id encore inconnu), avant getOfferings ET purchaseProduct', async () => {
    let renderer;
    await act(async () => {
      renderer = create(
        <PremiumModalContent onClose={jest.fn()} source="rituals_cap" />
      );
    });

    // paywall_viewed déjà tiré au montage (M7.5) avec la même source.
    expect(mockTrackPaywallViewed).toHaveBeenCalledWith('rituals_cap');

    // Le montage déclenche déjà un premier getOfferings (fetch du prix
    // dynamique, effet séparé) — on isole l'appel déclenché par le tap.
    mockGetOfferings.mockClear();

    await pressBuy(renderer);

    expect(mockTrackCtaBuyTapped).toHaveBeenCalledWith('rituals_cap');

    // Jointure du funnel : LA MÊME valeur de source des deux côtés.
    expect(mockTrackCtaBuyTapped.mock.calls[0][0]).toBe(
      mockTrackPaywallViewed.mock.calls[0][0]
    );

    // Au tap, avant tout appel réseau : cta_buy_tapped précède aussi bien
    // getOfferings (déclenché par ce même tap) que purchaseProduct.
    const ctaCallOrder = mockTrackCtaBuyTapped.mock.invocationCallOrder[0];
    const offeringsCallOrder = mockGetOfferings.mock.invocationCallOrder[0];
    const purchaseCallOrder = mockPurchaseProduct.mock.invocationCallOrder[0];
    expect(ctaCallOrder).toBeLessThan(offeringsCallOrder);
    expect(ctaCallOrder).toBeLessThan(purchaseCallOrder);
  });

  it('replie sur highlightedFeature puis "unknown" quand source est absente — même valeur pour les deux événements', async () => {
    let renderer;
    await act(async () => {
      renderer = create(
        <PremiumModalContent onClose={jest.fn()} highlightedFeature="palettes" />
      );
    });

    await pressBuy(renderer);

    expect(mockTrackPaywallViewed).toHaveBeenCalledWith('palettes');
    expect(mockTrackCtaBuyTapped).toHaveBeenCalledWith('palettes');
  });
});
