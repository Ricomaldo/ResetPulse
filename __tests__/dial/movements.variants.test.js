// __tests__/dial/movements.variants.test.js
import {
  MOVEMENTS,
  MOVEMENT_VARIANTS,
  pickVariant,
} from '../../src/components/dial/movements/movements';

describe('MOVEMENT_VARIANTS', () => {
  test('every movement has at least two variants (the surprise needs a range)', () => {
    MOVEMENTS.forEach((movement) => {
      expect(MOVEMENT_VARIANTS[movement]).toBeDefined();
      expect(MOVEMENT_VARIANTS[movement].length).toBeGreaterThanOrEqual(2);
    });
  });
});

describe('pickVariant', () => {
  test('returns a registered variant for every movement, across the random range', () => {
    MOVEMENTS.forEach((movement) => {
      for (let i = 0; i <= 10; i += 1) {
        const fraction = Math.min(i / 10, 0.999999);
        const variant = pickVariant(movement, () => fraction);
        expect(MOVEMENT_VARIANTS[movement]).toContain(variant);
      }
    });
  });

  test('is deterministic given an injected randomFn', () => {
    const a = pickVariant('spin', () => 0.5);
    const b = pickVariant('spin', () => 0.5);
    expect(a).toBe(b);
  });

  test('returns null for an unknown movement (no silent surprise)', () => {
    expect(pickVariant('moonwalk', () => 0)).toBeNull();
  });

  test('defaults to Math.random when no randomFn is injected', () => {
    const variant = pickVariant('float');
    expect(MOVEMENT_VARIANTS.float).toContain(variant);
  });
});
