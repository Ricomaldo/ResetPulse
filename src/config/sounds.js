// src/config/sounds.js
// Re-export depuis soundsMapping pour compatibilité
import {
  getTimerSounds,
  getSoundById as _getSoundById,
  DEFAULT_SOUND_ID as _DEFAULT_SOUND_ID
} from './soundsMapping';

// Export la liste des sons
export const TIMER_SOUNDS = getTimerSounds();

// Son par défaut
export const DEFAULT_SOUND_ID = _DEFAULT_SOUND_ID;

// Helper pour récupérer un son par ID
export const getSoundById = _getSoundById;