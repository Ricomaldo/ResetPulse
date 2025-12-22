// src/services/analytics/conversion-events.js
/**
 * Conversion & Discovery Analytics Events
 * Tracks monetization funnel: Two Timers Milestone + Discovery Modals
 * Based on ADR-003 conversion strategy
 *
 * Methods: 8
 * - Two Timers Milestone tracking (4 events)
 * - Discovery Modals tracking (3 events)
 * - Paywall Viewed (1 event)
 *
 * @module conversion-events
 */

export const conversionEvents = {
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
  },

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
  },

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
  },

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
  },

  /**
   * Event: Purchase Restored
   * Trigger: RevenueCat restore purchases success
   * Tracks when user restores previously purchased premium access
   *
   * @param {string} packageIdentifier - Restored package ID
   */
  trackPurchaseRestored(packageIdentifier) {
    this.track('purchase_restored', {
      package_id: packageIdentifier,
    });
  },

  /**
   * Event: Two Timers Milestone Reached
   * Trigger: TimerScreen - When user completes 2nd timer
   * KPI: > 40% of users should reach this milestone
   */
  trackTwoTimersMilestone() {
    this.track('two_timers_milestone', {});
  },

  /**
   * Event: Two Timers Modal Shown
   * Trigger: TwoTimersModal - Modal displayed to user
   * KPI: Confirms reach of conversion trigger
   */
  trackTwoTimersModalShown() {
    this.track('two_timers_modal_shown', {});
  },

  /**
   * Event: Two Timers Modal Explore Clicked
   * Trigger: TwoTimersModal - User clicks "Explorer le premium"
   * KPI: > 15% conversion from shown to explore (ADR-003)
   */
  trackTwoTimersModalExploreClicked() {
    this.track('two_timers_modal_explore_clicked', {});
  },

  /**
   * Event: Two Timers Modal Dismissed
   * Trigger: TwoTimersModal - User clicks "Peut-être plus tard"
   * KPI: Track dismissal rate
   */
  trackTwoTimersModalDismissed() {
    this.track('two_timers_modal_dismissed', {});
  },

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
  },

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
  },

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
  },

  /**
   * Event: Paywall Skipped
   * Trigger: User skips paywall without purchasing
   * KPI: Track skip rate from different sources
   *
   * @param {string} source - Source of paywall ('onboarding', 'settings', etc.)
   */
  trackPaywallSkipped(source = 'unknown') {
    this.track('paywall_skipped', {
      source,
    });
  },
};
