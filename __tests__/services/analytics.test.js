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
// 7. Super-property `environment` (décision Eric 07/08) : posée à l'init,
//    corrigée si detectEnvironment() résout à autre chose que 'prod', jamais
//    de throw qui remonte. detectEnvironment est mocké (le seam), pas
//    l'API native sous-jacente — cf. analytics-environment.js pour le repli
//    réel assumé (TestFlight indiscernable sans nouvelle dépendance).
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

  const loadAnalytics = ({
    devMode = false,
    apiKey = 'phc_test_key',
    detectEnvironmentImpl = () => Promise.resolve('prod'),
  } = {}) => {
    jest.doMock('../../src/config/test-mode', () => ({ DEV_MODE: devMode }));
    jest.doMock('../../src/config/posthog', () => ({
      POSTHOG_API_KEY: apiKey,
      POSTHOG_HOST: 'https://eu.i.posthog.com',
    }));
    jest.doMock('../../src/services/analytics-environment', () => ({
      detectEnvironment: jest.fn(detectEnvironmentImpl),
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

    it('ne pose jamais la super-property environment quand DEV_MODE=true (non-régression)', async () => {
      const analytics = loadAnalytics({ devMode: true });

      await analytics.init();
      await analytics._environmentReady;

      expect(mockRegister).not.toHaveBeenCalled();
    });
  });

  describe('super-property environment (décision Eric 07/08)', () => {
    it("pose environment='prod' immédiatement à l'init (repli assumé, cf. analytics-environment.js)", async () => {
      const analytics = loadAnalytics({ detectEnvironmentImpl: () => Promise.resolve('prod') });

      await analytics.init();

      expect(mockRegister).toHaveBeenCalledWith({ environment: 'prod' });
    });

    it("corrige avec un second register() si detectEnvironment() résout 'testflight'", async () => {
      const analytics = loadAnalytics({ detectEnvironmentImpl: () => Promise.resolve('testflight') });

      await analytics.init();
      await analytics._environmentReady;

      expect(mockRegister).toHaveBeenNthCalledWith(1, { environment: 'prod' });
      expect(mockRegister).toHaveBeenNthCalledWith(2, { environment: 'testflight' });
    });

    it('reste sur le repli prod (aucun second appel) si detectEnvironment() throw', async () => {
      const analytics = loadAnalytics({
        detectEnvironmentImpl: () => Promise.reject(new Error('API indisponible')),
      });

      await analytics.init();
      await expect(analytics._environmentReady).resolves.toBeUndefined();

      expect(mockRegister).toHaveBeenCalledTimes(1);
      expect(mockRegister).toHaveBeenCalledWith({ environment: 'prod' });
    });

    it("n'attend pas detectEnvironment() pour résoudre init() (ne retarde jamais l'init)", async () => {
      let resolveDetection;
      const analytics = loadAnalytics({
        detectEnvironmentImpl: () => new Promise((resolve) => { resolveDetection = resolve; }),
      });

      await analytics.init();

      // init() est résolue alors que detectEnvironment() est toujours en
      // attente : la valeur immédiate ('prod') est déjà posée.
      expect(mockRegister).toHaveBeenCalledWith({ environment: 'prod' });
      expect(mockRegister).toHaveBeenCalledTimes(1);

      resolveDetection('prod');
      await analytics._environmentReady;
    });
  });
});
