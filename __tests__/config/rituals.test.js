// __tests__/config/rituals.test.js
import {
  RITUAL_ID_PREFIX,
  DEFAULT_RITUAL_COLOR,
  getDefaultRituals,
  clampRitualDuration,
  resolveRitualActivity,
  deriveRitualName,
  buildRitualApplyPayload,
  suggestedColorFor,
  shouldDeriveNameFromActivity,
  findRitualToKeep,
} from '../../src/config/rituals';
import { getActivityById, getDefaultActivity } from '../../src/config/activities';
import { MIN_DURATION, MAX_DURATION } from '../../src/config/durations';
import { getTimerColors } from '../../src/config/timer-palettes';

const SERENITY_COLORS = getTimerColors('serenity');

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
        expect(ritual).toHaveProperty('color');
        expect(ritual).toHaveProperty('duration');
        expect(ritual).toHaveProperty('soundId');
        expect(ritual.steps).toEqual([]);
      });
    });

    test('color is a hex value (in value, not a palette-relative index)', () => {
      rituals.forEach((ritual) => {
        expect(ritual.color).toMatch(/^#[0-9A-Fa-f]{6}$/);
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

  describe('shouldDeriveNameFromActivity (C1b, hotfix-porte-1)', () => {
    test('creation (no initialRitual) with an activity selected: derive', () => {
      expect(shouldDeriveNameFromActivity('work', null)).toBe(true);
    });

    test('creation with no activity selected: nothing to derive from', () => {
      expect(shouldDeriveNameFromActivity(null, null)).toBe(false);
    });

    test('edit, same built-in activity untouched: do NOT derive (bug regression)', () => {
      const initialRitual = { activityId: 'meditation', name: 'Nom custom conservé' };
      expect(shouldDeriveNameFromActivity('meditation', initialRitual)).toBe(false);
    });

    test('edit, user picks a different built-in activity: derive', () => {
      const initialRitual = { activityId: 'meditation', name: 'Nom custom conservé' };
      expect(shouldDeriveNameFromActivity('work', initialRitual)).toBe(true);
    });

    test('edit, custom-emoji ritual, no built-in selected: do NOT derive', () => {
      const initialRitual = { activityId: 'custom_42', name: 'Mon rituel' };
      expect(shouldDeriveNameFromActivity(null, initialRitual)).toBe(false);
    });
  });

  describe('suggestedColorFor', () => {
    test('maps each suggestedColor type to its serenity hex', () => {
      expect(suggestedColorFor({ suggestedColor: 'energy' })).toBe(SERENITY_COLORS.energy);
      expect(suggestedColorFor({ suggestedColor: 'focus' })).toBe(SERENITY_COLORS.focus);
      expect(suggestedColorFor({ suggestedColor: 'calm' })).toBe(SERENITY_COLORS.calm);
      expect(suggestedColorFor({ suggestedColor: 'deep' })).toBe(SERENITY_COLORS.deep);
    });

    test('defaults to DEFAULT_RITUAL_COLOR for an unknown or missing type', () => {
      expect(suggestedColorFor({ suggestedColor: 'unknown' })).toBe(DEFAULT_RITUAL_COLOR);
      expect(suggestedColorFor(null)).toBe(DEFAULT_RITUAL_COLOR);
    });
  });

  describe('buildRitualApplyPayload', () => {
    test('resolves activity, clamps duration, keeps the ritual color in value', () => {
      const ritual = { activityId: 'break', duration: 999999, color: '#6BC4C4', soundId: 'bell_classic' };
      const payload = buildRitualApplyPayload(ritual, []);

      expect(payload.activity).toEqual(getActivityById('break'));
      expect(payload.duration).toBe(MAX_DURATION);
      expect(payload.color).toBe('#6BC4C4');
      expect(payload.soundId).toBe('bell_classic');
    });

    test('falls back to DEFAULT_RITUAL_COLOR when the ritual has no color (legacy colorIndex ritual)', () => {
      const ritual = { activityId: 'break', duration: 600, soundId: 'bell_classic' };
      const payload = buildRitualApplyPayload(ritual, []);
      expect(payload.color).toBe(DEFAULT_RITUAL_COLOR);
    });

    test('guard: a ritual pointing at a deleted custom activity still produces a valid payload', () => {
      const ritual = { activityId: 'custom_deleted', duration: 600, color: '#C97070', soundId: 'timer_complete' };
      const payload = buildRitualApplyPayload(ritual, []);

      expect(payload.activity).toEqual(getDefaultActivity());
      expect(payload.duration).toBe(600);
    });

    test('falls back to the default sound when soundId is missing', () => {
      const ritual = { activityId: 'work', duration: 600, color: '#5A7BA8' };
      const payload = buildRitualApplyPayload(ritual, []);
      expect(typeof payload.soundId).toBe('string');
      expect(payload.soundId.length).toBeGreaterThan(0);
    });
  });

  describe('findRitualToKeep (ADR-016 §3)', () => {
    test('returns the ritual matching activityId', () => {
      const meditation = { id: 'ritual_meditation', activityId: 'meditation' };
      const rituals = [meditation, { id: 'ritual_break', activityId: 'break' }];

      expect(findRitualToKeep(rituals, 'meditation')).toBe(meditation);
    });

    test('returns null when no ritual matches the activityId', () => {
      const rituals = [{ id: 'ritual_break', activityId: 'break' }];

      expect(findRitualToKeep(rituals, 'meditation')).toBeNull();
    });

    test('returns null for an empty ritual list', () => {
      expect(findRitualToKeep([], 'meditation')).toBeNull();
    });

    test('prefers the base ritual (non-custom) among several matches', () => {
      const custom = { id: 'ritual_1690000000000', activityId: 'work' };
      const base = { id: 'ritual_work', activityId: 'work' };
      // Le custom apparaît AVANT le base dans le tableau : sans préférence
      // explicite, "le premier" renverrait le custom — ce n'est pas ce qu'on
      // veut (cf. décision ADR-016 §3, met à jour le rituel de base).
      const rituals = [custom, base];

      expect(findRitualToKeep(rituals, 'work')).toBe(base);
    });

    test('without a base ritual among several matches, returns the first one', () => {
      const first = { id: 'ritual_1690000000000', activityId: 'work' };
      const second = { id: 'ritual_1690000000001', activityId: 'work' };
      const rituals = [first, second];

      expect(findRitualToKeep(rituals, 'work')).toBe(first);
    });
  });
});
