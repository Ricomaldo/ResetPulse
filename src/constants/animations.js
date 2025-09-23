// src/constants/animations.js

/**
 * Animation duration constants to avoid magic numbers
 * All durations are in milliseconds
 */

// Timer pulse animation
export const PULSE_ANIMATION = {
  DURATION: 800, // ~72 BPM heartbeat rhythm
  SCALE_MAX: 1.15,
  SCALE_MIN: 1,
  GLOW_MAX: 0.6,
  GLOW_MIN: 0.3
};

// Timer completion animation
export const COMPLETION_ANIMATION = {
  COLOR_DURATION: 300,
  PULSE_DURATION: 200,
  PULSE_SCALES: [1.1, 1, 1.08, 1, 1.05, 1],
  RESET_DELAY: 500
};

// Screen entrance animations
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

// Carousel animations
export const CAROUSEL_ANIMATION = {
  FADE_IN_DURATION: 300,
  FADE_OUT_DURATION: 300,
  INITIAL_FADE_DELAY: 800
};

// General transitions
export const TRANSITION = {
  SHORT: 200,
  MEDIUM: 300,
  LONG: 600
};

// Spring animations
export const SPRING = {
  TENSION: 40,
  FRICTION: 7
};

// Message display timers
export const MESSAGE_DISPLAY = {
  PARTI_DURATION: 1500, // "C'est parti" message
  PAUSE_DURATION: 2000  // "Pause" message
};

// Double tap
export const INTERACTION = {
  DOUBLE_TAP_DELAY: 300
};