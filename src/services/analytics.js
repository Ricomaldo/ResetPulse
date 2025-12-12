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

// Mixpanel Project Token - ResetPulse Production
const MIXPANEL_TOKEN = '***REMOVED***';

class AnalyticsService {
  constructor() {
    this.mixpanel = null;
    this.isInitialized = false;
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
      console.log(`   Server URL: https://api-eu.mixpanel.com`);
      console.log(`   Ready to track events`);
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
    if (!this.isInitialized || !this.mixpanel) return;

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
    if (!this.isInitialized || !this.mixpanel) return;
    this.mixpanel.registerSuperProperties(properties);
  }

  // ============================================
  // EVENTS CRITIQUES - M7.5 + M8 Onboarding V2
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

  /**
   * Event 2: Onboarding Completed
   * Trigger: OnboardingFlow.jsx - Filter5Paywall terminé
   * KPI target: > 65% completion rate
   *
   * @param {string} result - 'trial_started' | 'skipped'
   * @param {Array} needs - Besoins sélectionnés
   */
  trackOnboardingCompleted(result = 'unknown', needs = []) {
    this.track('onboarding_completed', {
      result,
      needs_selected: needs,
      needs_count: needs.length,
    });
  }

  // ============================================
  // ONBOARDING V2 FUNNEL - M8
  // ============================================

  /**
   * Onboarding Started
   * Trigger: Filter0Opening mount
   * Baseline pour calcul drop-off
   */
  trackOnboardingStarted() {
    this.track('onboarding_started', {});
  }

  /**
   * Onboarding Step Viewed
   * Trigger: Chaque filtre mount
   * Mesure où les users décrochent
   *
   * @param {number} step - Index du filtre (0-5)
   * @param {string} stepName - Nom du filtre
   */
  trackOnboardingStepViewed(step, stepName) {
    this.track('onboarding_step_viewed', {
      step,
      step_name: stepName,
    });
  }

  /**
   * Onboarding Step Completed
   * Trigger: Transition vers filtre suivant
   * Mesure progression effective
   *
   * @param {number} step - Index du filtre complété (0-5)
   * @param {string} stepName - Nom du filtre
   * @param {Object} data - Données optionnelles (needs, config, etc.)
   */
  trackOnboardingStepCompleted(step, stepName, data = {}) {
    this.track('onboarding_step_completed', {
      step,
      step_name: stepName,
      ...data,
    });
  }

  /**
   * Onboarding Abandoned
   * Trigger: App close pendant onboarding (via AppState listener)
   * Friction critique à identifier
   *
   * @param {number} step - Dernier filtre vu
   * @param {string} stepName - Nom du dernier filtre
   */
  trackOnboardingAbandoned(step, stepName) {
    this.track('onboarding_abandoned', {
      step,
      step_name: stepName,
    });
  }

  /**
   * Timer Config Saved
   * Trigger: Fin Filter2Creation (config choisie)
   * Analyse des choix populaires
   *
   * @param {Object} config - Configuration timer
   * @param {string} config.activity - Activité sélectionnée
   * @param {string} config.palette - Palette sélectionnée
   * @param {number} config.duration - Durée en minutes
   */
  trackTimerConfigSaved(config) {
    this.track('timer_config_saved', {
      activity: config.activity,
      palette: config.palette,
      duration_minutes: config.duration,
    });
  }

  /**
   * Event 3: Paywall Viewed
   * Trigger: PaywallScreen.jsx - componentDidMount/useEffect
   *
   * @param {string} source - Origine affichage paywall
   *   - 'onboarding' : Flux onboarding initial
   *   - 'settings' : Click "Upgrade to Premium" Settings
   *   - 'palette_limit' : Tentative unlock palette premium
   *   - 'activity_limit' : Tentative ajout activité > 4
   */
  trackPaywallViewed(source = 'unknown') {
    this.track('paywall_viewed', {
      source,
    });
  }

  /**
   * Event 4: Trial Started
   * Trigger: RevenueCat purchase success (trial package)
   * KPI target: > 18% paywall viewers
   *
   * @param {string} packageIdentifier - RevenueCat package ID
   */
  trackTrialStarted(packageIdentifier) {
    this.track('trial_started', {
      package_id: packageIdentifier,
    });
  }

  /**
   * Event 5: Purchase Completed
   * Trigger: RevenueCat webhook + app-side confirmation
   * Cross-validation RevenueCat dashboard
   *
   * @param {string} packageIdentifier - Package acheté
   * @param {number} price - Prix en euros
   * @param {string} transactionId - Apple/Google transaction ID
   */
  trackPurchaseCompleted(packageIdentifier, price, transactionId) {
    this.track('purchase_completed', {
      package_id: packageIdentifier,
      price,
      currency: 'EUR',
      transaction_id: transactionId,
    });
  }

  /**
   * Event 6: Purchase Failed
   * Trigger: RevenueCat purchase error
   * Debug friction points funnel
   *
   * @param {string} errorCode - RevenueCat error code
   * @param {string} errorMessage - Message erreur
   * @param {string} packageIdentifier - Package tenté
   */
  trackPurchaseFailed(errorCode, errorMessage, packageIdentifier) {
    this.track('purchase_failed', {
      error_code: errorCode,
      error_message: errorMessage,
      package_id: packageIdentifier,
    });
  }

  // ============================================
  // USAGE ANALYTICS - Core Timer Events
  // ============================================

  /**
   * Event: Timer Started
   * Trigger: useTimer - when user starts a timer
   * KPI: Core engagement metric
   *
   * @param {number} duration - Duration in seconds
   * @param {Object} activity - Activity object with id, emoji, label
   * @param {string} color - Hex color selected
   * @param {string} palette - Palette name
   */
  trackTimerStarted(duration, activity, color, palette) {
    this.track('timer_started', {
      duration_seconds: duration,
      duration_minutes: Math.round(duration / 60),
      activity_id: activity?.id || 'none',
      activity_emoji: activity?.emoji || '⏱️',
      color_hex: color,
      palette_name: palette,
    });
  }

  /**
   * Event: Timer Completed
   * Trigger: useTimer - when timer reaches 0 and completes normally
   * KPI: Completion rate, core value delivery
   *
   * @param {number} duration - Original duration in seconds
   * @param {Object} activity - Activity object
   * @param {number} completionRate - Percentage completed (should be ~100)
   */
  trackTimerCompleted(duration, activity, completionRate = 100) {
    this.track('timer_completed', {
      duration_seconds: duration,
      duration_minutes: Math.round(duration / 60),
      activity_id: activity?.id || 'none',
      completion_rate: completionRate,
    });
  }

  /**
   * Event: Timer Abandoned
   * Trigger: useTimer - when user pauses, resets, or closes app before completion
   * KPI: Abandonment points, friction detection
   *
   * @param {number} duration - Original duration in seconds
   * @param {number} elapsedSeconds - Time elapsed before abandon
   * @param {string} reason - Reason for abandonment ('paused', 'reset', 'app_background')
   * @param {Object} activity - Activity object
   */
  trackTimerAbandoned(duration, elapsedSeconds, reason = 'unknown', activity = null) {
    const completionRate = Math.round((elapsedSeconds / duration) * 100);

    this.track('timer_abandoned', {
      duration_seconds: duration,
      elapsed_seconds: elapsedSeconds,
      completion_rate: completionRate,
      reason: reason,
      activity_id: activity?.id || 'none',
    });
  }
}

// Singleton export
export default new AnalyticsService();
