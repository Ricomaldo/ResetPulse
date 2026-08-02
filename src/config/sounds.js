// src/config/sounds.js
// Re-export depuis sounds-mapping pour compatibilité
import {
  getTimerSounds,
  getSoundById as _getSoundById,
  getNotificationSoundFile as _getNotificationSoundFile,
  DEFAULT_SOUND_ID as _DEFAULT_SOUND_ID,
  isSoundPremium as _isSoundPremium,
  resolveSoundOnLaunch as _resolveSoundOnLaunch
} from './sounds-mapping';

// Export la liste des sons
export const TIMER_SOUNDS = getTimerSounds();

// Son par défaut
export const DEFAULT_SOUND_ID = _DEFAULT_SOUND_ID;

// Helper pour récupérer un son par ID
export const getSoundById = _getSoundById;

// Helper pour récupérer le nom de fichier natif d'un son de notification
export const getNotificationSoundFile = _getNotificationSoundFile;

// Gating (Lambda L, miroir timer-palettes.js) : son premium ? / retour au
// lancement — cf. useSoundGating pour le déclenchement.
export const isSoundPremium = _isSoundPremium;
export const resolveSoundOnLaunch = _resolveSoundOnLaunch;