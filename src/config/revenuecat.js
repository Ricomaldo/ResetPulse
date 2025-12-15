// src/config/revenuecat.js

/**
 * Configuration RevenueCat pour ResetPulse v1.1.0
 * One-time purchase 4,99€ + Trial 7 jours
 *
 * ADR: docs/decisions/adr-monetization-v11.md
 *
 * Keys are loaded from app.json extras (environment-safe)
 */

import Constants from 'expo-constants';

// Load RevenueCat keys from app.json extras
const { revenueCat } = Constants.expoConfig?.extra || {};

export const REVENUECAT_CONFIG = {
  ios: {
    apiKey: revenueCat?.iosKey || '',
  },
  android: {
    apiKey: revenueCat?.androidKey || '',
  },
};

// Validation
if (!revenueCat?.iosKey || !revenueCat?.androidKey) {
  console.warn('[RevenueCat] API keys not configured in app.json extra');
}

// Produit unique: one-time purchase
export const PRODUCT_IDS = {
  premium_lifetime: "com.irimwebforge.resetpulse.premium_lifetime_v2",
};

// Entitlement unique
export const ENTITLEMENTS = {
  premium_access: "premium_access",
};

export default {
  REVENUECAT_CONFIG,
  PRODUCT_IDS,
  ENTITLEMENTS,
};
