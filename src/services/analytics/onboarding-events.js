// src/services/analytics/onboarding-events.js
/**
 * Onboarding Analytics Events
 * All tracking methods related to onboarding flow (V2 & V3)
 *
 * Methods: 17
 * - Onboarding lifecycle (started, completed, abandoned)
 * - Step tracking (viewed, completed)
 * - Timer config saved
 * - Notification permission tracking
 * - Branch selection (discover/personalize)
 * - Sound & interface configuration
 *
 * @module onboarding-events
 */

export const onboardingEvents = {
  /**
   * Onboarding Started
   * Trigger: Filter0Opening mount
   * Baseline pour calcul drop-off
   */
  trackOnboardingStarted() {
    this.track('onboarding_started', {});
  },

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
  },

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
  },

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
  },

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
  },

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
  },

  /**
   * Onboarding Notification Requested
   * Trigger: Filter3_5Notifications - Permission popup displayed
   * Mesure combien d'users voient la demande
   */
  trackOnboardingNotifRequested() {
    this.track('onboarding_notif_requested', {});
  },

  /**
   * Onboarding Notification Granted
   * Trigger: Filter3_5Notifications - User accepted permission
   * KPI: Permission grant rate
   */
  trackOnboardingNotifGranted() {
    this.track('onboarding_notif_granted', {});
  },

  /**
   * Onboarding Notification Skipped
   * Trigger: Filter3_5Notifications - User declined permission
   * Mesure friction point
   */
  trackOnboardingNotifSkipped() {
    this.track('onboarding_notif_skipped', {});
  },

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
  },

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
  },

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
  },
};
