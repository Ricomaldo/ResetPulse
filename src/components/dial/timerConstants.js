/**
 * @fileoverview Centralized timer constants for dial modes, animations, and interactions
 * @created 2025-12-14
 * @updated 2025-12-14
 */

// ============================================
// DIAL MODES (from dialModes.js)
// ============================================

/**
 * Dial modes configuration (ADR-004)
 * No magnetic snap - smooth exploration throughout all scales
 * Graduation marks are visual references only, not snap targets
 */
export const DIAL_MODES = {
  '5min': {
    maxMinutes: 5,
    label: '5 minutes',
    description: 'Micro-pauses',
    graduationInterval: 1,
    majorTickInterval: 1,
    numberInterval: 1,
    defaultDuration: 5 * 60,
  },
  '15min': {
    maxMinutes: 15,
    label: '15 minutes',
    description: 'Pomodoro court',
    graduationInterval: 1,
    majorTickInterval: 3,
    numberInterval: 3,
    defaultDuration: 15 * 60,
  },
  '30min': {
    maxMinutes: 30,
    label: '30 minutes',
    description: 'Pomodoro standard',
    graduationInterval: 1,
    majorTickInterval: 5,
    numberInterval: 5,
    defaultDuration: 25 * 60,
  },
  '60min': {
    maxMinutes: 60,
    label: '1 heure',
    description: 'Sessions longues',
    graduationInterval: 1,
    majorTickInterval: 5,
    numberInterval: 5,
    defaultDuration: 30 * 60,
  }
};

export function getDialMode(mode) {
  return DIAL_MODES[mode] || DIAL_MODES['30min'];
}

export const DIAL_INTERACTION = {
  WRAP_THRESHOLD: 0.5,
  DRAG_THROTTLE: 16,
  HAPTIC_DEBOUNCE: 100,
};

export const DIAL_VISUAL = {
  TICK_LONG: 0.08,
  TICK_SHORT: 0.04,
  NUMBER_DISTANCE: 1.15,
  STROKE_WIDTH: 4.5,
  CENTER_DOT: 0.08,
};

// ============================================
// TIMER SVG (from design.js)
// ============================================

export const TIMER_SVG = {
  PADDING: 50,
  RADIUS_OFFSET: 50, // Augmenté pour réduire le dial et laisser respirer les graduations (zen mode)
  STROKE_WIDTH: 4.5,
  SVG_OFFSET: 25
};

export const TIMER_PROPORTIONS = {
  TICK_LONG: 0.08,
  TICK_SHORT: 0.04,
  CENTER_DOT_OUTER: 0.12,
  CENTER_DOT_INNER: 0.08,
  NUMBER_RADIUS: 18,
  NUMBER_FONT_RATIO: 0.045,
  MIN_NUMBER_FONT: 13
};

export const TIMER_VISUAL = {
  TICK_WIDTH_MAJOR: 2.5,
  TICK_WIDTH_MINOR: 1.5,
  TICK_OPACITY_MAJOR: 0.9,
  TICK_OPACITY_MINOR: 0.5
};

export const ACTIVITY_DISPLAY = {
  EMOJI_SIZE_RATIO: 0.2,
  GLOW_SIZE_RATIO: 0.35,
  GLOW_INNER_RATIO: 0.2,
  GLOW_OPACITY_BASE: 0.8,
  GLOW_OPACITY_INNER: 1.2,
  EMOJI_OPACITY: 0.9
};

export const TIMER_DURATIONS = {
  MIN: 60,
  MAX_25MIN_MODE: 1500,
  MAX_60MIN_MODE: 3600,
  DEFAULT: 240
};

export const COLORS = {
  COMPLETION_GREEN: '#48BB78',
  RIPPLE_ANDROID: 'rgba(0,0,0,0.1)'
};

// ============================================
// UI CONSTANTS (from uiConstants.js)
// ============================================

export const TOUCH = {
  ACTIVE_OPACITY: 0.7,
  DOUBLE_TAP_DELAY: 300,
};

export const TIMER = {
  MESSAGE_DISPLAY_DURATION: 2000,
  DEFAULT_DURATION: 5 * 60,
  MODES: {
    POMODORO: 25,
    STANDARD: 60,
  },
};

/**
 * Drag interaction constants for arc manipulation
 * Tuned for smooth, responsive feel during drag gestures
 */
export const DRAG = {
  BASE_RESISTANCE: 0.9, // Higher = more responsive to touch (was 0.85)
  VELOCITY_THRESHOLD: 40, // Lower = slower movements feel more responsive (was 50)
  VELOCITY_REDUCTION: 0.25, // Lower = less reduction at high velocity (was 0.3)
  WRAP_THRESHOLD: 0.4,
};

/**
 * Snap intervals and function moved to config/snap-settings.js
 * for easier configuration and tuning.
 *
 * Re-exported here for backward compatibility with existing imports.
 */
export { SNAP_INTERVALS, snapToInterval } from '../../config/snap-settings';

export const VISUAL = {
  CENTER_DOT_OUTER_RATIO: 0.08,
  CENTER_DOT_INNER_RATIO: 0.04,
  CENTER_DOT_OUTER_OPACITY: 0.8,
  CENTER_DOT_INNER_OPACITY: 0.4,
  NUMBER_OPACITY: 0.9,
  GLOW_INITIAL: 0.3,
  GLOW_SIZE_MULTIPLIER: 0.8,
  GLOW_STATIC_OPACITY: 0.2,
  PULSE_OUTER_RATIO: 0.35,
  PULSE_INNER_RATIO: 0.2,
  PULSE_OUTER_OPACITY: 0.8,
  PULSE_INNER_OPACITY: 1.2,
  FULL_CIRCLE_THRESHOLD: 0.9999,
};

export const BUTTON = {
  RUNNING_OPACITY: 1,
  IDLE_OPACITY: 0.9,
  RESET_SCALE: 0.9,
};

export const TEXT = {
  LETTER_SPACING: 0.5,
};

// ============================================
// ANIMATIONS (from animations.js - timer specific)
// ============================================

export const PULSE_ANIMATION = {
  DURATION: 800,
  SCALE_MAX: 1.15,
  SCALE_MIN: 1,
  GLOW_MAX: 0.6,
  GLOW_MIN: 0.3
};

export const COMPLETION_ANIMATION = {
  COLOR_DURATION: 300,
  PULSE_DURATION: 200,
  PULSE_SCALES: [1.1, 1, 1.08, 1, 1.05, 1],
  RESET_DELAY: 500
};

export const CAROUSEL_ANIMATION = {
  FADE_IN_DURATION: 300,
  FADE_OUT_DURATION: 300,
  INITIAL_FADE_DELAY: 800
};

export const MESSAGE_DISPLAY = {
  PARTI_DURATION: 1500,
  PAUSE_DURATION: 2000
};

export const INTERACTION = {
  DOUBLE_TAP_DELAY: 300
};

// Screen entrance (used by TimerScreen)
export const ENTRANCE_ANIMATION = {
  HEADER_DELAY: 200,
  HEADER_DURATION: 400,
  ACTIVITY_DELAY: 400,
  ACTIVITY_DURATION: 400,
  TIMER_DELAY: 600,
  TIMER_DURATION: 600,
  PALETTE_DELAY: 800,
  PALETTE_DURATION: 400
};

export const TRANSITION = {
  SHORT: 200,
  MEDIUM: 300,
  LONG: 600
};

export const SPRING = {
  TENSION: 40,
  FRICTION: 7
};

// ============================================
// DIAL LAYOUT CONSTANTS
// ============================================

export const DIAL_LAYOUT = {
  BACKGROUND_OFFSET: 30, // Space between outer radius and background circle
  CENTER_ZONE_RATIO: 0.35, // 35% of dial = center tap zone
  OUTER_ZONE_MIN_RATIO: 0.65, // 65%+ = graduations tap zone
  HANDLE_SIZE: 10, // Outer handle circle radius
  HANDLE_INNER_SIZE: 4, // Inner handle dot radius
  HANDLE_GLOW_SIZE: 14, // Glow effect radius when dragging
};
