// __tests__/services/analytics.test.js
// Tests du service analytics (audit adversarial 06/08) — trois cibles :
// 1. trackAppOpened(isFirstLaunch) porte bien is_first_launch (App.js
//    appelait déjà avec un argument que la méthode ignorait).
// 2. trackCustomActivityUsed était appelée (useTimer.js) mais jamais
//    définie — avalée en silence par le Proxy no-op.
// 4. Gate DEV_MODE dans init() : aucun événement dev ne doit atteindre
//    PostHog prod, et les appels track* post-gate ne doivent jamais
//    crasher (isInitialized reste false → guards existants + Proxy).
// 6. trackRitualApplied gagne `mode` en plus de `source` (additif).
//
// Chaque test mocke posthog-react-native et src/config/test-mode via
// jest.doMock + resetModules pour obtenir une instance fraîche du service
// (singleton stateful) et contrôler DEV_MODE indépendamment de __DEV__.

describe('services/analytics', () => {
  let mockCapture;
  let mockIdentify;
  let mockRegister;
  let PostHogMock;

  const mockPostHogModule = () => {
    mockCapture = jest.fn();
    mockIdentify = jest.fn();
    mockRegister = jest.fn();
    PostHogMock = jest.fn().mockImplementation(() => ({
      capture: mockCapture,
      identify: mockIdentify,
      register: mockRegister,
    }));
    jest.doMock('posthog-react-native', () => ({
      PostHog: PostHogMock,
    }));
  };

  const loadAnalytics = ({ devMode = false, apiKey = 'phc_test_key' } = {}) => {
    jest.doMock('../../src/config/test-mode', () => ({ DEV_MODE: devMode }));
    jest.doMock('../../src/config/posthog', () => ({
      POSTHOG_API_KEY: apiKey,
      POSTHOG_HOST: 'https://eu.i.posthog.com',
    }));
    mockPostHogModule();
    // eslint-disable-next-line global-require
    return require('../../src/services/analytics').default;
  };

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  describe('trackAppOpened(isFirstLaunch)', () => {
    it('transmet is_first_launch=true (App.js: !hasLaunched au premier lancement)', async () => {
      const analytics = loadAnalytics({ devMode: false });
      await analytics.init();

      analytics.trackAppOpened(true);

      expect(mockCapture).toHaveBeenCalledWith('app_opened', { is_first_launch: true });
    });

    it('transmet is_first_launch=false aux lancements suivants', async () => {
      const analytics = loadAnalytics({ devMode: false });
      await analytics.init();

      analytics.trackAppOpened(false);

      expect(mockCapture).toHaveBeenCalledWith('app_opened', { is_first_launch: false });
    });
  });

  describe('trackCustomActivityUsed(activityId, timesUsed)', () => {
    it('est définie (n\'est plus avalée par le Proxy no-op) et émet custom_activity_used', async () => {
      const analytics = loadAnalytics({ devMode: false });
      await analytics.init();

      analytics.trackCustomActivityUsed('custom-42', 3);

      expect(mockCapture).toHaveBeenCalledWith('custom_activity_used', {
        activity_id: 'custom-42',
        times_used: 3,
      });
    });
  });

  describe('trackRitualApplied(source, mode)', () => {
    it('transmet mode=activity_only (branche moment-sale)', async () => {
      const analytics = loadAnalytics({ devMode: false });
      await analytics.init();

      analytics.trackRitualApplied('home_row', 'activity_only');

      expect(mockCapture).toHaveBeenCalledWith('ritual_applied', {
        source: 'home_row',
        mode: 'activity_only',
      });
    });

    it('transmet mode=full (branche propre / RitualsPanel)', async () => {
      const analytics = loadAnalytics({ devMode: false });
      await analytics.init();

      analytics.trackRitualApplied('list', 'full');

      expect(mockCapture).toHaveBeenCalledWith('ritual_applied', {
        source: 'list',
        mode: 'full',
      });
    });
  });

  describe('trackCtaBuyTapped(source, productId)', () => {
    it('émet cta_buy_tapped avec source et product_id', async () => {
      const analytics = loadAnalytics({ devMode: false });
      await analytics.init();

      analytics.trackCtaBuyTapped('rituals_cap', 'ambiances.unlock');

      expect(mockCapture).toHaveBeenCalledWith('cta_buy_tapped', {
        source: 'rituals_cap',
        product_id: 'ambiances.unlock',
      });
    });

    it('product_id absent (offerings non résolues au moment du tap) → null explicite', async () => {
      const analytics = loadAnalytics({ devMode: false });
      await analytics.init();

      analytics.trackCtaBuyTapped('palettes');

      expect(mockCapture).toHaveBeenCalledWith('cta_buy_tapped', {
        source: 'palettes',
        product_id: null,
      });
    });
  });

  describe('trackPurchaseCancelled(productId)', () => {
    it('émet purchase_cancelled avec product_id', async () => {
      const analytics = loadAnalytics({ devMode: false });
      await analytics.init();

      analytics.trackPurchaseCancelled('premium_lifetime');

      expect(mockCapture).toHaveBeenCalledWith('purchase_cancelled', {
        product_id: 'premium_lifetime',
      });
    });
  });

  describe('trackSheetOpened(via)', () => {
    it("transmet via='tap' (poignée, AsideZone.jsx handleContainer.onPress)", async () => {
      const analytics = loadAnalytics({ devMode: false });
      await analytics.init();

      analytics.trackSheetOpened('tap');

      expect(mockCapture).toHaveBeenCalledWith('sheet_opened', { via: 'tap' });
    });

    it("transmet via='swipe' (pan gesture, AsideZone.jsx handleGestureEnd)", async () => {
      const analytics = loadAnalytics({ devMode: false });
      await analytics.init();

      analytics.trackSheetOpened('swipe');

      expect(mockCapture).toHaveBeenCalledWith('sheet_opened', { via: 'swipe' });

    });
  });

  describe('gate DEV_MODE dans init()', () => {
    it('ne crée pas de client PostHog quand DEV_MODE=true, même clé présente', async () => {
      const analytics = loadAnalytics({ devMode: true, apiKey: 'phc_test_key' });

      await analytics.init();

      expect(PostHogMock).not.toHaveBeenCalled();
      expect(analytics.isInitialized).toBe(false);
    });

    it("s'initialise normalement quand DEV_MODE=false et la clé est présente", async () => {
      const analytics = loadAnalytics({ devMode: false, apiKey: 'phc_test_key' });

      await analytics.init();

      expect(PostHogMock).toHaveBeenCalledTimes(1);
      expect(analytics.isInitialized).toBe(true);
    });

    it('les appels track* post-gate (DEV_MODE=true) ne crashent jamais et ne capturent rien', async () => {
      const analytics = loadAnalytics({ devMode: true });
      await analytics.init();

      expect(() => {
        analytics.trackAppOpened(true);
        analytics.trackTimerStarted(1200, { id: 'work' }, '#000', 'terre');
        analytics.trackCustomActivityUsed('custom-1', 1);
        analytics.trackRitualApplied('home_row', 'full');
        // Méthode jamais définie non plus (legacy) : doit rester absorbée
        // par le Proxy, jamais de throw, initialisé ou non.
        analytics.trackSomethingThatDoesNotExist?.();
      }).not.toThrow();

      expect(mockCapture).not.toHaveBeenCalled();
    });
  });
});
