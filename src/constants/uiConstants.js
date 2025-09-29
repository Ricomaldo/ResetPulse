// src/constants/uiConstants.js

/**
 * UI Constants for consistent styling and behavior
 */

// Touch interactions
export const TOUCH = {
  ACTIVE_OPACITY: 0.7,
  DOUBLE_TAP_DELAY: 300,
};

// Timer specific
export const TIMER = {
  GRADUATION_SNAP_THRESHOLD: 0.5, // Snap to 0 when within 0.5 minutes (30 seconds)
  MESSAGE_DISPLAY_DURATION: 2000, // ms
  DEFAULT_DURATION: 5 * 60, // 5 minutes in seconds
  MODES: {
    POMODORO: 25,
    STANDARD: 60,
  },
};

// Drag interaction
export const DRAG = {
  BASE_RESISTANCE: 0.85, // 85% of movement
  VELOCITY_THRESHOLD: 50, // Speed threshold for dynamic resistance
  VELOCITY_REDUCTION: 0.3, // Max reduction at high speed
  WRAP_THRESHOLD: 0.4, // 40% of dial for wrap detection
};

// Visual elements
export const VISUAL = {
  // Center dot
  CENTER_DOT_OUTER_RATIO: 0.08,
  CENTER_DOT_INNER_RATIO: 0.04,
  CENTER_DOT_OUTER_OPACITY: 0.8,
  CENTER_DOT_INNER_OPACITY: 0.4,

  // Numbers
  NUMBER_OPACITY: 0.9,

  // Glow effects
  GLOW_INITIAL: 0.3,
  GLOW_SIZE_MULTIPLIER: 0.8,
  GLOW_STATIC_OPACITY: 0.2,

  // Pulse effects
  PULSE_OUTER_RATIO: 0.35,
  PULSE_INNER_RATIO: 0.2,
  PULSE_OUTER_OPACITY: 0.8,
  PULSE_INNER_OPACITY: 1.2,

  // Progress
  FULL_CIRCLE_THRESHOLD: 0.9999,
};

// Button states
export const BUTTON = {
  RUNNING_OPACITY: 1,
  IDLE_OPACITY: 0.9,
  RESET_SCALE: 0.9,
};

// Text styling
export const TEXT = {
  LETTER_SPACING: 0.5,
};