// modules/timer-activity — API JS du pont Live Activity (mission 3d).
// Le module natif n'existe qu'après rebuild du dev client (prebuild +
// Xcode) : require paresseux + repli no-op, même pattern que les modules
// natifs précédents — le bundle ne crashe JAMAIS sur un client pas à jour,
// et Jest ne voit aucun code natif.

import { Platform } from 'react-native';

let nativeModule = null;
if (Platform.OS === 'ios') {
  try {
    // eslint-disable-next-line global-require
    const { requireNativeModule } = require('expo-modules-core');
    nativeModule = requireNativeModule('TimerActivity');
  } catch (error) {
    nativeModule = null; // client pas rebuildé — repli silencieux
  }
}

export const isLiveActivitySupported = () => {
  try {
    return Boolean(nativeModule?.isSupported());
  } catch (error) {
    return false;
  }
};

/**
 * Démarre l'écho de séance (écran verrouillé + Dynamic Island).
 * @param {string} colorHex - couleur du rituel (ex. '#E89665')
 * @param {string} emoji - emoji compagnon
 * @param {number} durationSeconds - durée totale de la séance
 */
export const startLiveActivity = async (colorHex, emoji, durationSeconds) => {
  if (!nativeModule) {return null;}
  try {
    return await nativeModule.start(colorHex || '#E89665', emoji || '⏳', durationSeconds);
  } catch (error) {
    return null;
  }
};

/**
 * Termine l'écho. done=true → « accompli ✨ » quelques minutes ;
 * done=false (rembobinage) → disparition immédiate.
 */
export const endLiveActivity = async (done) => {
  if (!nativeModule) {return;}
  try {
    await nativeModule.end(Boolean(done));
  } catch (error) {
    // jamais bloquant
  }
};
