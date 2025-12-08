// src/components/timer/timerConstants.js
// Constantes centralisées pour le Timer (fusionnées depuis constants/)

// ============================================
// DIAL MODES (from dialModes.js)
// ============================================

export const DIAL_MODES = {
  '1min': {
    maxMinutes: 1,
    label: '1 minute',
    description: 'Quick timer',
    graduationInterval: 1,
    majorTickInterval: 1,
    numberInterval: 1,
    defaultDuration: 60,
    useSeconds: true,
  },
  '5min': {
    maxMinutes: 5,
    label: '5 minutes',
    description: 'Short timer',
    graduationInterval: 1,
    majorTickInterval: 1,
    numberInterval: 1,
    defaultDuration: 5 * 60,
  },
  '10min': {
    maxMinutes: 10,
    label: '10 minutes',
    description: 'Medium timer',
    graduationInterval: 1,
    majorTickInterval: 2,
    numberInterval: 2,
    defaultDuration: 10 * 60,
  },
  '25min': {
    maxMinutes: 25,
    label: 'Pomodoro',
    description: '25 minutes focus',
    graduationInterval: 1,
    majorTickInterval: 5,
    numberInterval: 5,
    defaultDuration: 25 * 60,
  },
  '60min': {
    maxMinutes: 60,
    label: '1 heure',
    description: 'Full hour timer',
    graduationInterval: 1,
    majorTickInterval: 5,
    numberInterval: 5,
    defaultDuration: 30 * 60,
  }
};

export function getDialMode(mode) {
  return DIAL_MODES[mode] || DIAL_MODES['60min'];
}

export const DIAL_INTERACTION = {
  SNAP_THRESHOLD: 2,
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
  RADIUS_OFFSET: 25,
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
  GRADUATION_SNAP_THRESHOLD: 0.5,
  MESSAGE_DISPLAY_DURATION: 2000,
  DEFAULT_DURATION: 5 * 60,
  MODES: {
    POMODORO: 25,
    STANDARD: 60,
  },
};

export const DRAG = {
  BASE_RESISTANCE: 0.85,
  VELOCITY_THRESHOLD: 50,
  VELOCITY_REDUCTION: 0.3,
  WRAP_THRESHOLD: 0.4,
};

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
