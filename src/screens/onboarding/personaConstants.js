/**
 * @fileoverview Persona detection constants and utilities (ADR-008)
 * @description Behavioral detection matrix for onboarding personalization
 */

// Timing thresholds (milliseconds)
export const START_THRESHOLD = 800;
export const STOP_THRESHOLD = 2500;
export const STOP_ANIMATION_DURATION = 5000;

// Persona definitions
export const PERSONAS = {
  veloce: {
    id: 'veloce',
    emoji: '⚡',
    labelKey: 'personas.veloce.label',
    descriptionKey: 'personas.veloce.description',
    // Timer config
    startRequiresLongPress: false,
    stopRequiresLongPress: false,
  },
  abandonniste: {
    id: 'abandonniste',
    emoji: '⚓',
    labelKey: 'personas.abandonniste.label',
    descriptionKey: 'personas.abandonniste.description',
    startRequiresLongPress: false,
    stopRequiresLongPress: true,
  },
  impulsif: {
    id: 'impulsif',
    emoji: '🎯',
    labelKey: 'personas.impulsif.label',
    descriptionKey: 'personas.impulsif.description',
    startRequiresLongPress: true,
    stopRequiresLongPress: false,
  },
  ritualiste: {
    id: 'ritualiste',
    emoji: '🧘',
    labelKey: 'personas.ritualiste.label',
    descriptionKey: 'personas.ritualiste.description',
    startRequiresLongPress: true,
    stopRequiresLongPress: true,
  },
};

/**
 * Determine persona from behavioral measurements
 * @param {number} startTiming - Press duration in ms (Filter-040)
 * @param {number} stopTiming - Release timing in ms (Filter-050)
 * @returns {Object} Persona object from PERSONAS
 */
export const detectPersona = (startTiming, stopTiming) => {
  const isRapidStart = startTiming < START_THRESHOLD;
  const isEarlyStop = stopTiming < STOP_THRESHOLD;

  if (isRapidStart && isEarlyStop) return PERSONAS.veloce;
  if (isRapidStart && !isEarlyStop) return PERSONAS.abandonniste;
  if (!isRapidStart && isEarlyStop) return PERSONAS.impulsif;
  return PERSONAS.ritualiste;
};

/**
 * Get persona by ID
 * @param {string} personaId
 * @returns {Object|null}
 */
export const getPersonaById = (personaId) => {
  return PERSONAS[personaId] || null;
};
