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
const MIXPANEL_TOKEN = '4b1bd9b9a3be61afb7c19b40ad5a73de';

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
   * Trigger: OnboardingFlow.jsx - Onboarding V3 terminé
   * KPI target: > 65% completion rate
   *
   * @param {string} result - 'trial_started' | 'skipped'
   * @param {Array} needs - Besoins sélectionnés
   * @param {string} branch - 'discover' | 'personalize'
   */
  trackOnboardingCompleted(result = 'unknown', needs = [], branch = null) {
    this.track('onboarding_completed', {
      result,
      needs_selected: needs,
      needs_count: needs.length,
      branch,
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

  // ============================================
  // ONBOARDING V3 SPECIFIC - New Events
  // ============================================

  /**
   * Onboarding Notification Requested
   * Trigger: Filter3_5Notifications - Permission popup displayed
   * Mesure combien d'users voient la demande
   */
  trackOnboardingNotifRequested() {
    this.track('onboarding_notif_requested', {});
  }

  /**
   * Onboarding Notification Granted
   * Trigger: Filter3_5Notifications - User accepted permission
   * KPI: Permission grant rate
   */
  trackOnboardingNotifGranted() {
    this.track('onboarding_notif_granted', {});
  }

  /**
   * Onboarding Notification Skipped
   * Trigger: Filter3_5Notifications - User declined permission
   * Mesure friction point
   */
  trackOnboardingNotifSkipped() {
    this.track('onboarding_notif_skipped', {});
  }

  /**
   * Onboarding Branch Selected
   * Trigger: Filter4Branch - User chooses discover or personalize
   * KPI: Split measurement between paths
   *
   * @param {string} branch - 'discover' | 'personalize'
   */
  trackOnboardingBranchSelected(branch) {
    this.track('onboarding_branch_selected', {
      branch,
    });
  }

  /**
   * Onboarding Sound Selected
   * Trigger: Filter5bSound - User chooses completion sound (personalize path)
   * Analyse des préférences son
   *
   * @param {string} soundId - ID du son sélectionné
   */
  trackOnboardingSoundSelected(soundId) {
    this.track('onboarding_sound_selected', {
      sound_id: soundId,
    });
  }

  /**
   * Onboarding Interface Configured
   * Trigger: Filter5cInterface - User configures interface (personalize path)
   * Analyse des préférences UX
   *
   * @param {string} theme - 'light' | 'dark' | 'auto'
   * @param {boolean} minimalInterface - Interface minimale activée
   * @param {boolean} digitalTimer - Chrono digital activé
   */
  trackOnboardingInterfaceConfigured(theme, minimalInterface, digitalTimer) {
    this.track('onboarding_interface_configured', {
      theme,
      minimal_interface: minimalInterface,
      digital_timer: digitalTimer,
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

  // ============================================
  // CONVERSION ANALYTICS - ADR-003
  // ============================================

  /**
   * Event: Two Timers Milestone Reached
   * Trigger: TimerScreen - When user completes 2nd timer
   * KPI: > 40% of users should reach this milestone
   */
  trackTwoTimersMilestone() {
    this.track('two_timers_milestone', {});
  }

  /**
   * Event: Two Timers Modal Shown
   * Trigger: TwoTimersModal - Modal displayed to user
   * KPI: Confirms reach of conversion trigger
   */
  trackTwoTimersModalShown() {
    this.track('two_timers_modal_shown', {});
  }

  /**
   * Event: Two Timers Modal Explore Clicked
   * Trigger: TwoTimersModal - User clicks "Explorer le premium"
   * KPI: > 15% conversion from shown to explore (ADR-003)
   */
  trackTwoTimersModalExploreClicked() {
    this.track('two_timers_modal_explore_clicked', {});
  }

  /**
   * Event: Two Timers Modal Dismissed
   * Trigger: TwoTimersModal - User clicks "Peut-être plus tard"
   * KPI: Track dismissal rate
   */
  trackTwoTimersModalDismissed() {
    this.track('two_timers_modal_dismissed', {});
  }

  // ============================================
  // DISCOVERY MODALS ANALYTICS - ADR-003 Étape 5
  // ============================================

  /**
   * Event: Discovery Modal Shown
   * Trigger: MoreColorsModal or MoreActivitiesModal shown
   * KPI: Measure ongoing discovery engagement
   *
   * @param {string} type - 'colors' | 'activities'
   */
  trackDiscoveryModalShown(type) {
    this.track('discovery_modal_shown', {
      type,
    });
  }

  /**
   * Event: Discovery Modal Unlock Clicked
   * Trigger: User clicks "Débloquer tout" in discovery modal
   * KPI: > 20% conversion from shown to unlock (ADR-003)
   *
   * @param {string} type - 'colors' | 'activities'
   */
  trackDiscoveryModalUnlockClicked(type) {
    this.track('discovery_modal_unlock_clicked', {
      type,
    });
  }

  /**
   * Event: Discovery Modal Dismissed
   * Trigger: User closes discovery modal without action
   * KPI: Track dismissal patterns
   *
   * @param {string} type - 'colors' | 'activities'
   */
  trackDiscoveryModalDismissed(type) {
    this.track('discovery_modal_dismissed', {
      type,
    });
  }

  // ============================================
  // SETTINGS ANALYTICS
  // ============================================

  /**
   * Event: Setting Changed
   * Trigger: User changes any setting in app
   * KPI: Measure feature usage and preferences
   *
   * @param {string} settingName - Name of setting changed
   * @param {any} newValue - New value
   * @param {any} oldValue - Previous value (optional)
   */
  trackSettingChanged(settingName, newValue, oldValue = null) {
    this.track('setting_changed', {
      setting_name: settingName,
      new_value: newValue,
      old_value: oldValue,
    });
  }

  // ============================================
  // CUSTOM ACTIVITIES ANALYTICS - Premium Feature
  // ============================================

  /**
   * Event: Custom Activity Created
   * Trigger: User creates a new custom activity (premium only)
   * KPI: Feature adoption, customization engagement
   *
   * @param {string} emoji - Emoji selected for the activity
   * @param {number} nameLength - Length of activity name
   * @param {number} durationSeconds - Default duration in seconds
   */
  trackCustomActivityCreated(emoji, nameLength, durationSeconds) {
    this.track('custom_activity_created', {
      emoji,
      name_length: nameLength,
      duration_seconds: durationSeconds,
      duration_minutes: Math.round(durationSeconds / 60),
    });
  }

  /**
   * Event: Custom Activity Edited
   * Trigger: User modifies an existing custom activity
   * KPI: Feature engagement, user refinement
   *
   * @param {string} activityId - ID of the edited activity
   */
  trackCustomActivityEdited(activityId) {
    this.track('custom_activity_edited', {
      activity_id: activityId,
    });
  }

  /**
   * Event: Custom Activity Deleted
   * Trigger: User deletes a custom activity
   * KPI: Churn indicator, feature satisfaction
   *
   * @param {string} activityId - ID of the deleted activity
   * @param {number} timesUsed - How many times the activity was used before deletion
   */
  trackCustomActivityDeleted(activityId, timesUsed) {
    this.track('custom_activity_deleted', {
      activity_id: activityId,
      times_used: timesUsed,
    });
  }

  /**
   * Event: Custom Activity Used
   * Trigger: User starts a timer with a custom activity
   * KPI: Feature value, custom activity engagement
   *
   * @param {string} activityId - ID of the custom activity
   * @param {number} timesUsed - Updated usage count
   */
  trackCustomActivityUsed(activityId, timesUsed) {
    this.track('custom_activity_used', {
      activity_id: activityId,
      times_used: timesUsed,
    });
  }

  /**
   * Event: Custom Activity Create Attempt by Free User
   * Trigger: Free user tries to create a custom activity (premium gate)
   * KPI: Upsell opportunity, premium interest
   */
  trackCustomActivityCreateAttemptFreeUser() {
    this.track('custom_activity_create_attempt_free', {});
  }

  /**
   * Event: Custom Activities Exported
   * Trigger: User exports their custom activities (optional feature)
   * KPI: Data portability usage
   *
   * @param {number} count - Number of activities exported
   */
  trackCustomActivitiesExported(count) {
    this.track('custom_activities_exported', {
      activities_count: count,
    });
  }
}

// Singleton export
export default new AnalyticsService();
