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

  /**
   * Tool Selected (Onboarding V2.1)
   * @deprecated Filter-020 is now a preview screen - tool selection removed
   * Kept for backwards compatibility with analytics data
   *
   * @param {string} tool - Tool selected ('creative' | 'minimalist' | 'multitask' | 'rational')
   */
  trackToolSelected(tool) {
    this.track('tool_selected', {
      tool,
    });
  },

  /**
   * Intention Selected (Onboarding V2.1 Dual-Mode)
   * Trigger: Filter-030-creation - User selects intention from IntentionPicker
   * Mesure distribution des intentions (relax, work, create, learn, move, other)
   *
   * @param {string} intentionId - Intention ID selected
   * @param {string} emoji - Auto-populated emoji
   * @param {number} duration - Auto-populated duration in seconds
   */
  trackIntentionSelected(intentionId, emoji, duration) {
    this.track('intention_selected', {
      intention_id: intentionId,
      emoji,
      duration_seconds: duration,
    });
  },

  /**
   * Custom Activity Created During Onboarding (V2.1)
   * Trigger: Filter-030-creation - User creates their first custom activity
   * Mesure engagement freemium (1 activité custom gratuite)
   *
   * @param {string} emoji - Emoji selected
   * @param {number} nameLength - Name length
   * @param {number} duration - Duration in seconds
   * @param {string} intentionId - Optional intention ID if using intention-based flow
   */
  trackCustomActivityCreatedOnboarding(emoji, nameLength, duration, intentionId = null) {
    this.track('custom_activity_created_onboarding', {
      emoji,
      name_length: nameLength,
      duration_seconds: duration,
      ...(intentionId && { intention_id: intentionId }),
    });
  },

  /**
   * Behavior Start Measured (Onboarding V2.1 Phase 2)
   * Trigger: Filter-040-test-start - User press duration measured
   * Behavioral detection for persona identification
   *
   * @param {number} timingMs - Press duration in milliseconds
   */
  trackBehaviorStartMeasured(timingMs) {
    const behavior = timingMs < 800 ? 'rapid' : 'deliberate';
    this.track('behavior_start_measured', {
      timing_ms: timingMs,
      behavior,
    });
  },

  /**
   * Behavior Stop Measured (Onboarding V2.1 Phase 2)
   * Trigger: Filter-050-test-stop - User release timing measured
   * Behavioral detection for persona identification
   *
   * @param {number} timingMs - Release timing in milliseconds
   */
  trackBehaviorStopMeasured(timingMs) {
    const behavior = timingMs < 2500 ? 'early' : 'patient';
    this.track('behavior_stop_measured', {
      timing_ms: timingMs,
      behavior,
    });
  },

  /**
   * Persona Detected (Onboarding V2.1 Phase 2)
   * Trigger: Filter-050-test-stop - Persona detection complete
   * Maps to ADR-008 persona matrix (veloce, abandonniste, impulsif, ritualiste)
   *
   * @param {string} personaId - Detected persona ID
   */
  trackPersonaDetected(personaId) {
    this.track('persona_detected', {
      persona: personaId,
    });
  },

  /**
   * Intentions Completed (Onboarding V2.1 Filter-025)
   * Trigger: Filter-025-intentions - User completes 2-question multi-select
   * Replaces behavioral testing (Filter-040/050)
   *
   * @param {Object} data - Intentions and challenges data
   * @param {Array<string>} data.intentions - Q1 selections (focus, launch, breathe, children, other)
   * @param {Array<string>} data.challenges - Q2 selections (starting, finishing, staying, managing)
   * @param {boolean} data.hasOther - Whether "other" was selected in Q1
   * @param {string|null} data.otherText - Custom text if "other" selected
   * @param {Object} data.calculatedProfile - Calculated interaction profile
   * @param {boolean} data.calculatedProfile.startRequiresLongPress - Start requires long press
   * @param {boolean} data.calculatedProfile.stopRequiresLongPress - Stop requires long press
   */
  trackIntentionsCompleted(data) {
    this.track('intentions_completed', {
      intentions: data.intentions,
      intentions_count: data.intentions.length,
      challenges: data.challenges,
      challenges_count: data.challenges.length,
      has_other: data.hasOther,
      other_text: data.otherText,
      start_long_press: data.calculatedProfile.startRequiresLongPress,
      stop_long_press: data.calculatedProfile.stopRequiresLongPress,
    });
  },
};
