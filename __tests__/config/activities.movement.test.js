// __tests__/config/activities.movement.test.js
import { ACTIVITIES } from '../../src/config/activities';
import { MOVEMENTS } from '../../src/components/dial/movements/movements';

describe('activities — movement field (Lot 3a, MOT-a→e)', () => {
  test('every activity has a movement field that is a member of MOVEMENTS', () => {
    ACTIVITIES.forEach((activity) => {
      expect(typeof activity.movement).toBe('string');
      expect(MOVEMENTS).toContain(activity.movement);
    });
  });

  test('every activity keeps its existing pulseDuration (tempo) alongside movement', () => {
    ACTIVITIES.forEach((activity) => {
      expect(typeof activity.pulseDuration).toBe('number');
      expect(activity.pulseDuration).toBeGreaterThan(0);
    });
  });
});
