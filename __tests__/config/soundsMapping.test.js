// __tests__/config/soundsMapping.test.js
// Garde-fou contre la régression du packaging custom-sound (finding C2,
// fix Lot 3e) : chaque son sélectionnable (SOUND_FILES) doit avoir un
// fichier de notification déclaré ET présent sur disque ET déclaré dans le
// plugin expo-notifications de app.json — sinon la notification de fin de
// séance (ou le rappel) échoue silencieusement pour ce son, comme constaté
// en C7 pour 9 sons sur 10.
const fs = require('fs');
const path = require('path');

import {
  SOUND_FILES,
  NOTIFICATION_SOUND_FILES,
  DEFAULT_SOUND_ID,
  getNotificationSoundFile,
} from '../../src/config/sounds-mapping';

const appJson = require('../../app.json');
const declaredNotificationSounds = appJson.expo.plugins
  .find((p) => Array.isArray(p) && p[0] === 'expo-notifications')[1].sounds
  .map((soundPath) => path.basename(soundPath));

const soundsAssetsDir = path.join(__dirname, '../../assets/sounds');

describe('sounds-mapping — notification packaging (Lot 3e, finding C2)', () => {
  test('every selectable sound has a notification filename mapped', () => {
    Object.keys(SOUND_FILES).forEach((soundId) => {
      expect(NOTIFICATION_SOUND_FILES[soundId]).toBeDefined();
    });
  });

  test('every mapped notification filename exists in assets/sounds/', () => {
    Object.values(NOTIFICATION_SOUND_FILES).forEach((filename) => {
      const filePath = path.join(soundsAssetsDir, filename);
      expect(fs.existsSync(filePath)).toBe(true);
    });
  });

  test('every mapped notification filename is declared in app.json (expo-notifications plugin)', () => {
    Object.values(NOTIFICATION_SOUND_FILES).forEach((filename) => {
      expect(declaredNotificationSounds).toContain(filename);
    });
  });

  test('getNotificationSoundFile returns the exact mapped filename for a valid id', () => {
    Object.entries(NOTIFICATION_SOUND_FILES).forEach(([soundId, filename]) => {
      expect(getNotificationSoundFile(soundId)).toBe(filename);
    });
  });

  test('getNotificationSoundFile falls back to the default sound for an invalid id (never throws)', () => {
    expect(getNotificationSoundFile('bogus')).toBe(NOTIFICATION_SOUND_FILES[DEFAULT_SOUND_ID]);
    expect(getNotificationSoundFile(undefined)).toBe(NOTIFICATION_SOUND_FILES[DEFAULT_SOUND_ID]);
    expect(getNotificationSoundFile(null)).toBe(NOTIFICATION_SOUND_FILES[DEFAULT_SOUND_ID]);
  });
});
