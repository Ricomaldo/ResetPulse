// src/constants/design.js

/**
 * Design system constants for SVG and UI elements
 * Centralized to avoid magic numbers in components
 */

// Timer circle SVG dimensions
export const TIMER_SVG = {
  PADDING: 50,          // Extra space for numbers outside circle
  RADIUS_OFFSET: 25,    // Offset for centering in larger SVG
  STROKE_WIDTH: 4.5,    // Circle border thickness
  SVG_OFFSET: 25        // Offset for centering
};

// Timer circle proportions (relative to radius)
export const TIMER_PROPORTIONS = {
  TICK_LONG: 0.08,      // Hour mark tick length (5min marks)
  TICK_SHORT: 0.04,     // Minute tick length
  CENTER_DOT_OUTER: 0.12, // Outer center dot radius
  CENTER_DOT_INNER: 0.08, // Inner center dot radius
  NUMBER_RADIUS: 18,    // Distance of numbers from circle edge
  NUMBER_FONT_RATIO: 0.045, // Font size relative to circle size
  MIN_NUMBER_FONT: 13   // Minimum font size for numbers
};

// Timer circle visual properties
export const TIMER_VISUAL = {
  TICK_WIDTH_MAJOR: 2.5,  // Major tick stroke width
  TICK_WIDTH_MINOR: 1.5,  // Minor tick stroke width
  TICK_OPACITY_MAJOR: 0.9, // Major tick opacity
  TICK_OPACITY_MINOR: 0.5  // Minor tick opacity
};

// Activity emoji sizing (relative to circle size)
export const ACTIVITY_DISPLAY = {
  EMOJI_SIZE_RATIO: 0.2,     // Emoji size relative to circle
  GLOW_SIZE_RATIO: 0.35,      // Glow effect size
  GLOW_INNER_RATIO: 0.2,      // Inner glow size
  GLOW_OPACITY_BASE: 0.8,     // Base glow opacity
  GLOW_OPACITY_INNER: 1.2,    // Inner glow opacity multiplier
  EMOJI_OPACITY: 0.9          // Emoji display opacity
};

// Timer durations (in seconds)
export const TIMER_DURATIONS = {
  MIN: 60,              // Minimum timer duration (1 minute)
  MAX_25MIN_MODE: 1500, // Maximum for 25min mode (25 minutes)
  MAX_60MIN_MODE: 3600, // Maximum for 60min mode (60 minutes)
  DEFAULT: 240          // Default timer duration (4 minutes)
};

// Colors
export const COLORS = {
  COMPLETION_GREEN: '#48BB78', // Timer completion color
  RIPPLE_ANDROID: 'rgba(0,0,0,0.1)' // Android ripple effect
};

// Layout breakpoints
export const BREAKPOINTS = {
  SMALL: 360,
  MEDIUM: 390,
  LARGE: 428,
  XLARGE: 768
};