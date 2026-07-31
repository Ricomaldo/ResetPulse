// __tests__/config/activities.test.js
// ADR-017 §4/§5 — la vitrine (FREE_ACTIVITY_IDS) + isActivityFree (grand-père).
import {
  ACTIVITIES,
  FREE_ACTIVITY_IDS,
  getActivityById,
  isActivityFree,
} from '../../src/config/activities';

describe('FREE_ACTIVITY_IDS — la vitrine (ADR-017 §4)', () => {
  test('contient work, break, meditation (contrainte dure — les 3 templates de base)', () => {
    expect(FREE_ACTIVITY_IDS).toEqual(
      expect.arrayContaining(['work', 'break', 'meditation'])
    );
  });

  test('chaque id référence une activité built-in existante', () => {
    FREE_ACTIVITY_IDS.forEach((id) => {
      expect(getActivityById(id)).toBeDefined();
    });
  });

  test('ne contient aucun doublon', () => {
    expect(new Set(FREE_ACTIVITY_IDS).size).toBe(FREE_ACTIVITY_IDS.length);
  });
});

describe('isActivityFree (ADR-017 §4/§5)', () => {
  test('renvoie true pour une activité built-in de la vitrine (id string)', () => {
    expect(isActivityFree('work')).toBe(true);
    expect(isActivityFree('break')).toBe(true);
    expect(isActivityFree('meditation')).toBe(true);
  });

  test('renvoie true pour une activité built-in de la vitrine (objet)', () => {
    expect(isActivityFree(getActivityById('sport'))).toBe(true);
  });

  test('renvoie false pour une activité built-in hors vitrine (ex. gaming, cas piège ADR-017)', () => {
    expect(isActivityFree('gaming')).toBe(false);
    expect(isActivityFree(getActivityById('gaming'))).toBe(false);
  });

  test('renvoie true pour une activité CUSTOM (grand-père — usage de l\'existant toujours libre)', () => {
    const customActivity = {
      id: 'custom_123456',
      emoji: '🎯',
      name: 'Mon rituel',
      isCustom: true,
    };
    expect(isActivityFree(customActivity)).toBe(true);
  });

  test('renvoie false pour un id inconnu / une entrée vide', () => {
    expect(isActivityFree('nonexistent-id')).toBe(false);
    expect(isActivityFree(null)).toBe(false);
    expect(isActivityFree(undefined)).toBe(false);
  });

  test('couvre tout le catalogue built-in sans exception (chaque activité classée libre ou non selon FREE_ACTIVITY_IDS)', () => {
    ACTIVITIES.forEach((activity) => {
      expect(isActivityFree(activity)).toBe(FREE_ACTIVITY_IDS.includes(activity.id));
    });
  });
});
