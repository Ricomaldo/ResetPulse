// __tests__/dial/pickDistraction.test.js
import { pickDistraction } from '../../src/components/dial/movements/pickDistraction';
import { MOVEMENTS } from '../../src/components/dial/movements/movements';

describe('pickDistraction', () => {
  test('returns a member of MOVEMENTS on first tirage (no lastMovement)', () => {
    const result = pickDistraction(null, () => 0);
    expect(MOVEMENTS).toContain(result);
  });

  test('always returns a member of MOVEMENTS across the full random range', () => {
    for (let i = 0; i <= 10; i += 1) {
      const fraction = i / 10; // 0, 0.1, ..., 1 (edge cases included)
      const result = pickDistraction(null, () => Math.min(fraction, 0.999999));
      expect(MOVEMENTS).toContain(result);
    }
  });

  test('never returns lastMovement twice in a row, for every possible lastMovement', () => {
    MOVEMENTS.forEach((lastMovement) => {
      for (let i = 0; i <= 10; i += 1) {
        const fraction = Math.min(i / 10, 0.999999);
        const result = pickDistraction(lastMovement, () => fraction);
        expect(result).not.toBe(lastMovement);
        expect(MOVEMENTS).toContain(result);
      }
    });
  });

  test('is deterministic given an injected randomFn (testability)', () => {
    const a = pickDistraction('breathe', () => 0);
    const b = pickDistraction('breathe', () => 0);
    expect(a).toBe(b);
  });

  test('defaults to Math.random when no randomFn is injected', () => {
    const result = pickDistraction('spin');
    expect(MOVEMENTS).toContain(result);
    expect(result).not.toBe('spin');
  });

  test('excludes every movement of an array (ambient + last, finding Lot 3a)', () => {
    const excluded = ['spin', 'beat', 'breathe'];
    for (let i = 0; i <= 10; i += 1) {
      const fraction = Math.min(i / 10, 0.999999);
      const result = pickDistraction(excluded, () => fraction);
      expect(MOVEMENTS).toContain(result);
      expect(excluded).not.toContain(result);
    }
  });

  test('ignores null/undefined entries inside the exclusion array', () => {
    const result = pickDistraction([null, undefined, 'float'], () => 0);
    expect(MOVEMENTS).toContain(result);
    expect(result).not.toBe('float');
  });

  test('falls back to the full pool if exclusions would empty it (out of contract)', () => {
    const result = pickDistraction([...MOVEMENTS], () => 0);
    expect(MOVEMENTS).toContain(result);
  });
});
