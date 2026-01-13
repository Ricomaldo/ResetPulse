// src/services/attribution.js
/**
 * Apple Search Ads Attribution Service
 *
 * Fetches attribution data on first launch to determine install source
 * for ROAS (Return On Ad Spend) tracking in Mixpanel.
 *
 * Uses @hexigames/react-native-apple-ads-attribution for iOS AdServices API.
 * Android users get source: 'organic' by default.
 *
 * @see https://developer.apple.com/documentation/adservices
 */

import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Analytics from './analytics';

// Only import on iOS to avoid Android crash
let AppleAdsAttribution = null;
if (Platform.OS === 'ios') {
  AppleAdsAttribution = require('@hexigames/react-native-apple-ads-attribution').default;
}

// Storage key for attribution data (fetch once, persist forever)
const ATTRIBUTION_KEY = '@ResetPulse:attribution';

/**
 * Normalize attribution data to flat super properties
 * @param {Object} rawData - Raw attribution response from Apple
 * @returns {Object} Flattened properties for Mixpanel
 */
function normalizeAttributionData(rawData) {
  // AdServices API response format (iOS 14.3+)
  if (rawData.attribution !== undefined) {
    return {
      source: rawData.attribution ? 'apple_search_ads' : 'organic',
      asa_attributed: rawData.attribution,
      asa_campaign_id: rawData.campaignId || null,
      asa_adgroup_id: rawData.adGroupId || null,
      asa_keyword_id: rawData.keywordId || null,
      asa_creative_set_id: rawData.creativeSetId || null,
      asa_org_id: rawData.orgId || null,
      asa_country: rawData.countryOrRegion || null,
      asa_conversion_type: rawData.conversionType || null,
      asa_click_date: rawData.clickDate || null,
    };
  }

  // iAd API response format (legacy, iOS < 14.3)
  const versionKey = Object.keys(rawData).find(k => k.startsWith('Version'));
  if (versionKey && rawData[versionKey]) {
    const iAdData = rawData[versionKey];
    return {
      source: iAdData['iad-attribution'] === 'true' ? 'apple_search_ads' : 'organic',
      asa_attributed: iAdData['iad-attribution'] === 'true',
      asa_campaign_id: iAdData['iad-campaign-id'] || null,
      asa_campaign_name: iAdData['iad-campaign-name'] || null,
      asa_adgroup_id: iAdData['iad-adgroup-id'] || null,
      asa_adgroup_name: iAdData['iad-adgroup-name'] || null,
      asa_keyword_id: iAdData['iad-keyword-id'] || null,
      asa_keyword: iAdData['iad-keyword'] || null,
      asa_org_id: iAdData['iad-org-id'] || null,
      asa_org_name: iAdData['iad-org-name'] || null,
      asa_country: iAdData['iad-country-or-region'] || null,
      asa_conversion_type: iAdData['iad-conversion-type'] || null,
      asa_click_date: iAdData['iad-click-date'] || null,
    };
  }

  // Unknown format
  return {
    source: 'organic',
    asa_attributed: false,
  };
}

/**
 * Attribution Service Singleton
 */
class AttributionService {
  constructor() {
    this.attributionData = null;
    this.isInitialized = false;
  }

  /**
   * Initialize attribution tracking
   * Should be called once on first app launch
   *
   * @returns {Object} Attribution data (cached or freshly fetched)
   */
  async init() {
    // Check if already initialized this session
    if (this.isInitialized && this.attributionData) {
      return this.attributionData;
    }

    try {
      // Check for cached attribution data
      const cached = await AsyncStorage.getItem(ATTRIBUTION_KEY);
      if (cached) {
        this.attributionData = JSON.parse(cached);
        this.isInitialized = true;
        this._registerSuperProperties();
        if (__DEV__) {
          console.log('[Attribution] Loaded cached data:', this.attributionData);
        }
        return this.attributionData;
      }

      // First launch - fetch attribution data
      this.attributionData = await this._fetchAttributionData();

      // Persist for all future sessions
      await AsyncStorage.setItem(ATTRIBUTION_KEY, JSON.stringify(this.attributionData));

      // Register as Mixpanel super properties
      this._registerSuperProperties();

      this.isInitialized = true;

      if (__DEV__) {
        console.log('[Attribution] Fresh data fetched and cached:', this.attributionData);
      }

      return this.attributionData;
    } catch (error) {
      console.warn('[Attribution] Init failed:', error.message);
      // Fallback to organic
      this.attributionData = {
        source: 'organic',
        asa_attributed: false,
        error: error.message,
      };
      this.isInitialized = true;
      this._registerSuperProperties();
      return this.attributionData;
    }
  }

  /**
   * Fetch attribution data from platform-specific APIs
   * @private
   */
  async _fetchAttributionData() {
    // Android: No Apple Search Ads, always organic
    if (Platform.OS !== 'ios') {
      if (__DEV__) {
        console.log('[Attribution] Android device - defaulting to organic');
      }
      return {
        source: 'organic',
        asa_attributed: false,
        platform: 'android',
      };
    }

    // iOS: Try AdServices API (iOS 14.3+), fallback to iAd
    if (!AppleAdsAttribution) {
      console.warn('[Attribution] AppleAdsAttribution module not available');
      return {
        source: 'organic',
        asa_attributed: false,
        error: 'module_unavailable',
      };
    }

    try {
      // getAttributionData() tries AdServices first, falls back to iAd
      const rawData = await AppleAdsAttribution.getAttributionData();

      if (__DEV__) {
        console.log('[Attribution] Raw Apple data:', rawData);
      }

      return normalizeAttributionData(rawData);
    } catch (error) {
      // Common errors:
      // - User opted out of tracking (ATT denied)
      // - Not installed via App Store (TestFlight, dev builds)
      // - Apple API timeout
      if (__DEV__) {
        console.warn('[Attribution] Apple API error:', error.message);
      }

      return {
        source: 'organic',
        asa_attributed: false,
        error: error.message,
      };
    }
  }

  /**
   * Register attribution as Mixpanel super properties
   * @private
   */
  _registerSuperProperties() {
    if (!this.attributionData) {return;}

    // Filter out null values and register
    const properties = Object.entries(this.attributionData)
      .filter(([, value]) => value !== null && value !== undefined)
      .reduce((acc, [key, value]) => {
        acc[key] = value;
        return acc;
      }, {});

    Analytics.setSuperProperties(properties);

    if (__DEV__) {
      console.log('[Attribution] Registered super properties:', Object.keys(properties));
    }
  }

  /**
   * Get current attribution data
   * @returns {Object|null} Attribution data or null if not initialized
   */
  getAttributionData() {
    return this.attributionData;
  }

  /**
   * Check if user came from Apple Search Ads
   * @returns {boolean} True if attributed to ASA
   */
  isFromSearchAds() {
    return this.attributionData?.asa_attributed === true;
  }

  /**
   * Get install source ('apple_search_ads' | 'organic')
   * @returns {string} Install source
   */
  getSource() {
    return this.attributionData?.source || 'organic';
  }
}

// Singleton export
export default new AttributionService();
