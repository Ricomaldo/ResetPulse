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
  isSoundPremium,
  resolveSoundOnLaunch,
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

// Lambda L (mandat Eric) : miroir des tests resolvePaletteOnLaunch
// (__tests__/config/timerPalettes.test.js) — même grammaire « essai libre »
// (ADR-017 §6) appliquée aux sons.
describe('sounds-mapping — gating (Lambda L, miroir palettes)', () => {
  test('isSoundPremium correctly identifies premium (Ambiances) sounds', () => {
    expect(isSoundPremium('timer_complete')).toBe(false);
    expect(isSoundPremium('microwave_ping')).toBe(false);
    expect(isSoundPremium('singing_bowl')).toBe(false);
    expect(isSoundPremium('contrabass_pluck')).toBe(false);
    expect(isSoundPremium('toaster_bell')).toBe(true);
    expect(isSoundPremium('kalimba')).toBe(true);
  });

  test('isSoundPremium returns false for a non-existent sound (never throws)', () => {
    expect(isSoundPremium('nonExistent')).toBe(false);
    expect(isSoundPremium(undefined)).toBe(false);
  });

  describe('resolveSoundOnLaunch', () => {
    test('premium user: never forces a revert, keeps current sound', () => {
      expect(resolveSoundOnLaunch(true, 'kalimba', 'timer_complete')).toBe('kalimba');
      expect(resolveSoundOnLaunch(true, 'kalimba', null)).toBe('kalimba');
    });

    test('free user with an included current sound: nothing to do', () => {
      expect(resolveSoundOnLaunch(false, 'microwave_ping', 'singing_bowl')).toBe('microwave_ping');
      expect(resolveSoundOnLaunch(false, 'timer_complete', null)).toBe('timer_complete');
    });

    test('free user with a premium current sound: reverts to last included', () => {
      expect(resolveSoundOnLaunch(false, 'kalimba', 'singing_bowl')).toBe('singing_bowl');
    });

    test('free user with a premium current sound and no known last included: defaults to DEFAULT_SOUND_ID', () => {
      expect(resolveSoundOnLaunch(false, 'kalimba', null)).toBe(DEFAULT_SOUND_ID);
      expect(resolveSoundOnLaunch(false, 'kalimba', undefined)).toBe(DEFAULT_SOUND_ID);
    });
  });
});
