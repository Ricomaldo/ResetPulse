// __tests__/config/rituals.test.js
import {
  RITUAL_ID_PREFIX,
  getDefaultRituals,
  clampRitualDuration,
  resolveRitualActivity,
  deriveRitualName,
  buildRitualApplyPayload,
  suggestedColorIndexFor,
} from '../../src/config/rituals';
import { getActivityById, getDefaultActivity } from '../../src/config/activities';
import { MIN_DURATION, MAX_DURATION } from '../../src/config/durations';

describe('rituals Configuration', () => {
  describe('getDefaultRituals', () => {
    const rituals = getDefaultRituals();

    test('returns exactly 3 base rituals', () => {
      expect(rituals).toHaveLength(3);
    });

    test('each ritual references a free built-in activity', () => {
      rituals.forEach((ritual) => {
        const activity = getActivityById(ritual.activityId);
        expect(activity).toBeDefined();
        expect(activity.isPremium).toBe(false);
      });
    });

    test('each ritual has the full schema, steps always empty', () => {
      rituals.forEach((ritual) => {
        expect(ritual).toHaveProperty('id');
        expect(ritual).toHaveProperty('name');
        expect(ritual).toHaveProperty('activityId');
        expect(ritual).toHaveProperty('colorIndex');
        expect(ritual).toHaveProperty('duration');
        expect(ritual).toHaveProperty('soundId');
        expect(ritual.steps).toEqual([]);
      });
    });

    test('ids are stable and prefixed', () => {
      rituals.forEach((ritual) => {
        expect(ritual.id.startsWith(RITUAL_ID_PREFIX)).toBe(true);
      });
      // Deux appels successifs donnent les mêmes ids (rituels de base, pas d'horodatage)
      expect(getDefaultRituals().map((r) => r.id)).toEqual(rituals.map((r) => r.id));
    });

    test('durations match the brief (5 / 15 / 50 min)', () => {
      const byActivity = Object.fromEntries(rituals.map((r) => [r.activityId, r.duration]));
      expect(byActivity.meditation).toBe(300);
      expect(byActivity.break).toBe(900);
      expect(byActivity.work).toBe(3000);
    });

    test('names are non-empty strings', () => {
      rituals.forEach((ritual) => {
        expect(typeof ritual.name).toBe('string');
        expect(ritual.name.length).toBeGreaterThan(0);
      });
    });
  });

  describe('clampRitualDuration', () => {
    test('leaves in-range durations untouched', () => {
      expect(clampRitualDuration(900)).toBe(900);
    });

    test('clamps below MIN_DURATION', () => {
      expect(clampRitualDuration(10)).toBe(MIN_DURATION);
    });

    test('clamps above MAX_DURATION', () => {
      expect(clampRitualDuration(999999)).toBe(MAX_DURATION);
    });

    test('falls back to MIN_DURATION for falsy input', () => {
      expect(clampRitualDuration(0)).toBe(MIN_DURATION);
      expect(clampRitualDuration(undefined)).toBe(MIN_DURATION);
    });
  });

  describe('resolveRitualActivity', () => {
    test('resolves a built-in activity by id', () => {
      const ritual = { activityId: 'work' };
      expect(resolveRitualActivity(ritual, [])).toEqual(getActivityById('work'));
    });

    test('resolves a custom activity from the provided list', () => {
      const custom = { id: 'custom_123', emoji: '🎯', isCustom: true };
      const ritual = { activityId: 'custom_123' };
      expect(resolveRitualActivity(ritual, [custom])).toEqual(custom);
    });

    test('guard: falls back to the default activity when the custom activityId no longer resolves (deleted)', () => {
      const ritual = { activityId: 'custom_999' };
      expect(resolveRitualActivity(ritual, [])).toEqual(getDefaultActivity());
    });

    test('guard: falls back to the default activity for a null ritual', () => {
      expect(resolveRitualActivity(null, [])).toEqual(getDefaultActivity());
    });
  });

  describe('deriveRitualName', () => {
    test('uses the built-in activity label', () => {
      const activity = getActivityById('work');
      expect(deriveRitualName(activity)).toBe(activity.label);
    });

    test('falls back to a generic name for a custom (anonymous) activity', () => {
      const custom = { id: 'custom_1', emoji: '✨', isCustom: true };
      expect(typeof deriveRitualName(custom)).toBe('string');
      expect(deriveRitualName(custom).length).toBeGreaterThan(0);
    });

    test('falls back to a generic name when activity is missing', () => {
      expect(typeof deriveRitualName(null)).toBe('string');
    });
  });

  describe('suggestedColorIndexFor', () => {
    test('maps each suggestedColor type to its slot 0-3', () => {
      expect(suggestedColorIndexFor({ suggestedColor: 'energy' })).toBe(0);
      expect(suggestedColorIndexFor({ suggestedColor: 'focus' })).toBe(1);
      expect(suggestedColorIndexFor({ suggestedColor: 'calm' })).toBe(2);
      expect(suggestedColorIndexFor({ suggestedColor: 'deep' })).toBe(3);
    });

    test('defaults to 0 for an unknown or missing type', () => {
      expect(suggestedColorIndexFor({ suggestedColor: 'unknown' })).toBe(0);
      expect(suggestedColorIndexFor(null)).toBe(0);
    });
  });

  describe('buildRitualApplyPayload', () => {
    test('resolves activity, clamps duration and colorIndex', () => {
      const ritual = { activityId: 'break', duration: 999999, colorIndex: 9, soundId: 'bell_classic' };
      const payload = buildRitualApplyPayload(ritual, []);

      expect(payload.activity).toEqual(getActivityById('break'));
      expect(payload.duration).toBe(MAX_DURATION);
      expect(payload.colorIndex).toBe(3);
      expect(payload.soundId).toBe('bell_classic');
    });

    test('guard: a ritual pointing at a deleted custom activity still produces a valid payload', () => {
      const ritual = { activityId: 'custom_deleted', duration: 600, colorIndex: 1, soundId: 'timer_complete' };
      const payload = buildRitualApplyPayload(ritual, []);

      expect(payload.activity).toEqual(getDefaultActivity());
      expect(payload.duration).toBe(600);
    });

    test('falls back to the default sound when soundId is missing', () => {
      const ritual = { activityId: 'work', duration: 600, colorIndex: 0 };
      const payload = buildRitualApplyPayload(ritual, []);
      expect(typeof payload.soundId).toBe('string');
      expect(payload.soundId.length).toBeGreaterThan(0);
    });
  });
});
