// src/services/analytics.js
/**
 * Mixpanel Analytics Service - ResetPulse
 *
 * 6 events critiques:
 * - app_opened (attribution baseline)
 * - onboarding_completed (funnel top)
 * - paywall_viewed (reach measurement)
 * - trial_started (intention achat)
 * - purchase_completed (revenue tracking)
 * - purchase_failed (friction debug)
 *
 * @see docs/development/MIXPANEL_IMPLEMENTATION.md
 * @see docs/decisions/analytics-strategy.md
 */

import { Mixpanel } from 'mixpanel-react-native';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { MIXPANEL_TOKEN } from '@env';
import {
  onboardingEvents,
  timerEvents,
  conversionEvents,
  settingsEvents,
  customActivitiesEvents,
} from './analytics/index';

// Mixpanel token loaded from .env (fallback for development)
if (!MIXPANEL_TOKEN) {
  console.warn('[Analytics] MIXPANEL_TOKEN not configured in .env');
}

class AnalyticsService {
  constructor() {
    this.mixpanel = null;
    this.isInitialized = false;

    // Bind feature modules to this instance
    this._bindModules();
  }

  /**
   * Bind all feature module methods to the singleton instance
   * @private
   */
  _bindModules() {
    const modules = [
      onboardingEvents,
      timerEvents,
      conversionEvents,
      settingsEvents,
      customActivitiesEvents,
    ];

    modules.forEach((module) => {
      Object.keys(module).forEach((methodName) => {
        // Bind the module method to this instance
        this[methodName] = module[methodName].bind(this);
      });
    });
  }

  /**
   * Initialize Mixpanel SDK
   * À appeler dans App.js au startup
   */
  async init() {
    console.log('🔄 [Analytics] Initializing Mixpanel SDK...');
    console.log(`   Token: ${MIXPANEL_TOKEN.substring(0, 8)}...`);

    try {
      // Mixpanel v3+ API: new Mixpanel() then .init()
      // Ref: https://github.com/mixpanel/mixpanel-react-native
      const trackAutomaticEvents = false; // Manual tracking only
      const useNative = true; // Use native module (required for device builds)

      this.mixpanel = new Mixpanel(MIXPANEL_TOKEN, trackAutomaticEvents, useNative);

      // Configure EU data residency (RGPD compliance)
      // Ref: https://docs.mixpanel.com/docs/tracking-methods/sdks/react-native#eu-data-residency
      await this.mixpanel.init();
      this.mixpanel.setServerURL('https://api-eu.mixpanel.com'); // EU servers

      this.isInitialized = true;

      // Super properties (persistent toutes sessions)
      const appVersion = Constants.expoConfig?.version || '1.1.7';
      const platformName = Platform.OS === 'ios' ? 'iOS' : 'Android';
      this.setSuperProperties({
        platform: platformName,
        app_version: appVersion,
      });

      console.log('✅ [Analytics] Mixpanel initialized successfully');
      console.log(`   Platform: ${Platform.OS}`);
      console.log(`   App Version: ${appVersion}`);
      console.log(`   Token: ${MIXPANEL_TOKEN.substring(0, 12)}...`);
      console.log('   Server URL: https://api-eu.mixpanel.com');
      console.log('   Ready to track events');
    } catch (error) {
      // Graceful fallback for Expo Go (native module unavailable)
      if (error.message?.includes('initialize') && __DEV__) {
        console.warn('⚠️ [Analytics] Mixpanel unavailable in Expo Go');
        console.warn('   → Use Development Build: npx expo run:ios');
        console.warn('   → Or build production: eas build --profile preview');
        console.warn('   → Analytics will work in production builds');
      } else {
        console.error('❌ [Analytics] Mixpanel init failed:', error);
        console.error('   Error details:', error.message);
      }
      this.isInitialized = false;
    }
  }

  /**
   * Track event générique (internal use)
   */
  track(eventName, properties = {}) {
    if (!this.isInitialized || !this.mixpanel) {
      if (__DEV__) {
        console.warn('⚠️ [Analytics] Not initialized, event ignored:', eventName);
      }
      return;
    }

    // Enrichir avec timestamp
    const enrichedProperties = {
      ...properties,
      timestamp: new Date().toISOString(),
    };

    this.mixpanel.track(eventName, enrichedProperties);

    // Flush immediately in dev for debugging
    if (__DEV__) {
      this.mixpanel.flush();
      console.log('📊 [Analytics]', eventName, enrichedProperties);
      console.log('   ✈️  Event flushed to server');
    }
  }

  /**
   * Identify user (après purchase RevenueCat)
   * @param {string} userId - RevenueCat customerInfo.originalAppUserId
   */
  identify(userId) {
    if (!this.isInitialized || !this.mixpanel) {return;}

    this.mixpanel.identify(userId);

    if (__DEV__) {
      console.log('👤 [Analytics] User identified:', userId);
    }
  }

  /**
   * Set super properties (persistent)
   * @param {Object} properties - Key-value pairs
   */
  setSuperProperties(properties) {
    if (!this.isInitialized || !this.mixpanel) {return;}
    this.mixpanel.registerSuperProperties(properties);
  }

  // ============================================
  // CRITICAL EVENT - App Lifecycle
  // ============================================

  /**
   * Event 1: App Opened
   * Trigger: App.js useEffect (first launch + subsequent)
   *
   * @param {boolean} isFirstLaunch - True si premier démarrage app
   */
  trackAppOpened(isFirstLaunch = false) {
    this.track('app_opened', {
      is_first_launch: isFirstLaunch,
    });
  }

  // All other tracking methods are injected from feature modules via _bindModules()
  // See ./analytics/* for method implementations:
  // - onboarding-events.js (17 methods)
  // - timer-events.js (3 methods)
  // - conversion-events.js (11 methods)
  // - settings-events.js (1 method)
  // - custom-activities-events.js (6 methods)
}

// Singleton export
export default new AnalyticsService();
