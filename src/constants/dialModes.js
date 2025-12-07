// src/constants/dialModes.js

/**
 * Dial mode configurations
 */
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

/**
 * Get configuration for a dial mode
 * @param {string} mode - Mode identifier ('25min' or '60min')
 * @returns {Object} Mode configuration
 */
export function getDialMode(mode) {
  return DIAL_MODES[mode] || DIAL_MODES['60min'];
}

/**
 * Dial interaction settings
 */
export const DIAL_INTERACTION = {
  SNAP_THRESHOLD: 2,        // Snap to 0 if within 2 minutes
  WRAP_THRESHOLD: 0.5,      // Detect wrap-around if jump > 50% of max
  DRAG_THROTTLE: 16,        // Throttle drag updates to 60fps (16ms)
  HAPTIC_DEBOUNCE: 100,     // Debounce haptic feedback
};

/**
 * Dial visual settings (proportions relative to radius)
 */
export const DIAL_VISUAL = {
  TICK_LONG: 0.08,         // Major tick length (8% of radius)
  TICK_SHORT: 0.04,        // Minor tick length (4% of radius)
  NUMBER_DISTANCE: 1.15,    // Numbers at 115% of radius
  STROKE_WIDTH: 4.5,        // Border stroke width
  CENTER_DOT: 0.08,         // Center dot size
};