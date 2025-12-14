// src/config/revenuecat.js

/**
 * Configuration RevenueCat pour ResetPulse v1.1.0
 * One-time purchase 4,99€ + Trial 7 jours
 *
 * ADR: docs/decisions/adr-monetization-v11.md
 */

// Clés API RevenueCat
export const REVENUECAT_CONFIG = {
  ios: {
    apiKey: "appl_NJoSzWzcoJXLiNDMTGKJShISApt",
  },
  android: {
    apiKey: "goog_URjPIqpNSxbyogfdststoCOmQRg",
  },
};

// Produit unique: one-time purchase
export const PRODUCT_IDS = {
  premium_lifetime: "com.irimwebforge.resetpulse.premium_lifetime_v2",
};

// Entitlement unique
export const ENTITLEMENTS = {
  premium_access: "premium_access",
};

// Configuration freemium (source de vérité)
// ADR ligne 127-138: 2 palettes + 4 activités
export const FREEMIUM_CONFIG = {
  free: {
    palettes: ["softLaser", "terre"], // 2 palettes UNIQUEMENT
    activities: ["none", "work", "break", "meditation"], // 4 activités
  },
  premium: {
    palettes: "all", // Débloquer 15 total
    activities: "all", // Débloquer 16 total
    price: "4.99",
    type: "one-time",
    trial: "7 days",
  },
};

export default {
  REVENUECAT_CONFIG,
  PRODUCT_IDS,
  ENTITLEMENTS,
  FREEMIUM_CONFIG,
};
