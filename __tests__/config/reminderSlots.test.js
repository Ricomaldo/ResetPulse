// __tests__/config/reminderSlots.test.js
import {
  REMINDER_SLOTS,
  REMINDER_SLOT_IDS,
  DEFAULT_REMINDER_SLOT,
  REMINDER_NOTIFICATION_ID,
  getReminderTime,
  normalizeReminderSlot,
} from '../../src/config/reminderSlots';

describe('reminderSlots (Lot 3e, rappel doux)', () => {
  test('exposes exactly 3 preset slots: morning, midday, evening', () => {
    expect(REMINDER_SLOT_IDS).toEqual(['morning', 'midday', 'evening']);
    expect(Object.keys(REMINDER_SLOTS).sort()).toEqual(['evening', 'midday', 'morning']);
  });

  test('slot times match spec (8:00 / 12:30 / 20:30)', () => {
    expect(REMINDER_SLOTS.morning).toEqual({ hour: 8, minute: 0 });
    expect(REMINDER_SLOTS.midday).toEqual({ hour: 12, minute: 30 });
    expect(REMINDER_SLOTS.evening).toEqual({ hour: 20, minute: 30 });
  });

  test('default slot is evening', () => {
    expect(DEFAULT_REMINDER_SLOT).toBe('evening');
    expect(REMINDER_SLOTS[DEFAULT_REMINDER_SLOT]).toBeDefined();
  });

  test('notification id is a stable, non-empty string', () => {
    expect(typeof REMINDER_NOTIFICATION_ID).toBe('string');
    expect(REMINDER_NOTIFICATION_ID.length).toBeGreaterThan(0);
  });

  describe('getReminderTime', () => {
    test('returns the exact time for each valid slot', () => {
      REMINDER_SLOT_IDS.forEach((slotId) => {
        expect(getReminderTime(slotId)).toEqual(REMINDER_SLOTS[slotId]);
      });
    });

    test('falls back to the default slot for an invalid id (never throws)', () => {
      expect(getReminderTime('bogus')).toEqual(REMINDER_SLOTS[DEFAULT_REMINDER_SLOT]);
      expect(getReminderTime(undefined)).toEqual(REMINDER_SLOTS[DEFAULT_REMINDER_SLOT]);
      expect(getReminderTime(null)).toEqual(REMINDER_SLOTS[DEFAULT_REMINDER_SLOT]);
    });
  });

  describe('normalizeReminderSlot', () => {
    test('returns valid slot ids unchanged', () => {
      REMINDER_SLOT_IDS.forEach((slotId) => {
        expect(normalizeReminderSlot(slotId)).toBe(slotId);
      });
    });

    test('falls back to the default slot for an invalid id', () => {
      expect(normalizeReminderSlot('bogus')).toBe(DEFAULT_REMINDER_SLOT);
      expect(normalizeReminderSlot(undefined)).toBe(DEFAULT_REMINDER_SLOT);
    });
  });
});
