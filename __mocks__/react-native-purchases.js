// Mock for react-native-purchases (RevenueCat SDK)
// Used in component tests to avoid native module dependencies

const mockCustomerInfo = {
  entitlements: {
    active: {},
    all: {},
  },
  activeSubscriptions: [],
  allPurchasedProductIdentifiers: [],
  latestExpirationDate: null,
  firstSeen: new Date().toISOString(),
  originalAppUserId: 'test-user-id',
  requestDate: new Date().toISOString(),
  allExpirationDates: {},
  allPurchaseDates: {},
  originalApplicationVersion: '1.0.0',
  originalPurchaseDate: null,
  managementURL: null,
  nonSubscriptionTransactions: [],
};

const mockOfferings = {
  all: {},
  current: null,
  availablePackages: [
    {
      identifier: 'premium_monthly',
      packageType: 'MONTHLY',
      product: {
        identifier: 'premium_monthly',
        description: 'Premium Monthly Subscription',
        title: 'Premium (Monthly)',
        price: 4.99,
        priceString: '$4.99',
        currencyCode: 'USD',
        introPrice: null,
        discounts: [],
      },
      offeringIdentifier: 'default',
    },
  ],
};

const Purchases = {
  // Configuration
  configure: jest.fn(() => Promise.resolve()),
  setDebugLogsEnabled: jest.fn(),
  setLogLevel: jest.fn(),
  setLogHandler: jest.fn(),

  // Customer info
  getCustomerInfo: jest.fn(() => Promise.resolve(mockCustomerInfo)),

  // Offerings
  getOfferings: jest.fn(() => Promise.resolve(mockOfferings)),

  // Purchases
  purchasePackage: jest.fn(() => Promise.resolve({
    customerInfo: {
      ...mockCustomerInfo,
      entitlements: {
        active: {
          premium_access: {
            identifier: 'premium_access',
            isActive: true,
            willRenew: true,
            periodType: 'NORMAL',
            latestPurchaseDate: new Date().toISOString(),
            originalPurchaseDate: new Date().toISOString(),
            expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            store: 'APP_STORE',
            productIdentifier: 'premium_monthly',
            isSandbox: true,
            unsubscribeDetectedAt: null,
            billingIssueDetectedAt: null,
          },
        },
      },
    },
    productIdentifier: 'premium_monthly',
  })),

  purchaseProduct: jest.fn(() => Promise.resolve({
    customerInfo: mockCustomerInfo,
    productIdentifier: 'premium_monthly',
  })),

  // Restore
  restorePurchases: jest.fn(() => Promise.resolve(mockCustomerInfo)),

  // Other methods
  syncPurchases: jest.fn(() => Promise.resolve()),
  setAttributes: jest.fn(() => Promise.resolve()),
  setEmail: jest.fn(() => Promise.resolve()),
  setPhoneNumber: jest.fn(() => Promise.resolve()),
  setDisplayName: jest.fn(() => Promise.resolve()),
  setPushToken: jest.fn(() => Promise.resolve()),
  setAdjustID: jest.fn(() => Promise.resolve()),
  setAppsflyerID: jest.fn(() => Promise.resolve()),
  setFBAnonymousID: jest.fn(() => Promise.resolve()),
  setMparticleID: jest.fn(() => Promise.resolve()),
  setCleverTapID: jest.fn(() => Promise.resolve()),
  setMixpanelDistinctID: jest.fn(() => Promise.resolve()),
  setFirebaseAppInstanceID: jest.fn(() => Promise.resolve()),
  setMediaSource: jest.fn(() => Promise.resolve()),
  setCampaign: jest.fn(() => Promise.resolve()),
  setAdGroup: jest.fn(() => Promise.resolve()),
  setAd: jest.fn(() => Promise.resolve()),
  setKeyword: jest.fn(() => Promise.resolve()),
  setCreative: jest.fn(() => Promise.resolve()),
  collectDeviceIdentifiers: jest.fn(() => Promise.resolve()),

  // Listener
  addCustomerInfoUpdateListener: jest.fn(() => jest.fn()), // Returns unsubscribe function

  // Constants
  PURCHASE_TYPE: {
    SUBS: 'subs',
    INAPP: 'inapp',
  },
  PACKAGE_TYPE: {
    MONTHLY: 'MONTHLY',
    ANNUAL: 'ANNUAL',
    LIFETIME: 'LIFETIME',
  },
  PRORATION_MODE: {
    UNKNOWN_SUBSCRIPTION_UPGRADE_DOWNGRADE_POLICY: 0,
    IMMEDIATE_WITH_TIME_PRORATION: 1,
    IMMEDIATE_AND_CHARGE_PRORATED_PRICE: 2,
    IMMEDIATE_WITHOUT_PRORATION: 3,
    DEFERRED: 4,
  },
};

// Helper to set premium status in tests
Purchases.setMockPremiumStatus = (isPremium) => {
  if (isPremium) {
    mockCustomerInfo.entitlements.active.premium_access = {
      identifier: 'premium_access',
      isActive: true,
      willRenew: true,
      periodType: 'NORMAL',
      latestPurchaseDate: new Date().toISOString(),
      originalPurchaseDate: new Date().toISOString(),
      expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      store: 'APP_STORE',
      productIdentifier: 'premium_monthly',
      isSandbox: true,
      unsubscribeDetectedAt: null,
      billingIssueDetectedAt: null,
    };
  } else {
    mockCustomerInfo.entitlements.active = {};
  }
};

// Helper to simulate purchase error in tests
Purchases.setMockPurchaseError = (error) => {
  Purchases.purchasePackage.mockRejectedValueOnce(error);
};

// Helper to simulate restore error in tests
Purchases.setMockRestoreError = (error) => {
  Purchases.restorePurchases.mockRejectedValueOnce(error);
};

// Default export
export default Purchases;
