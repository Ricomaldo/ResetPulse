// Minimaliste useDialOrientation tests for SDK 54
import { renderHook } from '../test-utils';
import { useDialOrientation } from '../../src/hooks/useDialOrientation';

describe('useDialOrientation - Core functionality', () => {

  describe('25min mode - Clockwise', () => {
    it('initializes with correct configuration', () => {
      const { result } = renderHook(() => useDialOrientation(true, '25min'));

      expect(result.current.config.maxMinutes).toBe(25);
      expect(result.current.config.degreesPerMinute).toBeCloseTo(14.4); // 360 / 25
    });

    it('converts angles to minutes correctly', () => {
      const { result } = renderHook(() => useDialOrientation(true, '25min'));

      // Key angles - clockwise
      expect(result.current.angleToMinutes(0)).toBe(0);     // Top
      expect(result.current.angleToMinutes(90)).toBe(6);    // Right
      expect(result.current.angleToMinutes(180)).toBe(13);  // Bottom
      expect(result.current.angleToMinutes(270)).toBe(19);  // Left
      expect(result.current.angleToMinutes(360)).toBe(0);   // Full circle
    });

    it('converts minutes to angles correctly', () => {
      const { result } = renderHook(() => useDialOrientation(true, '25min'));

      expect(result.current.minutesToAngle(0)).toBe(0);
      expect(result.current.minutesToAngle(5)).toBe(72);     // 5 * 14.4
      expect(result.current.minutesToAngle(12.5)).toBe(180); // Half
      expect(result.current.minutesToAngle(25)).toBe(360);   // Full
    });
  });

  describe('25min mode - Counter-clockwise', () => {
    it('converts angles to minutes correctly', () => {
      const { result } = renderHook(() => useDialOrientation(false, '25min'));

      // Counter-clockwise reverses the direction
      expect(result.current.angleToMinutes(0)).toBe(25);    // Top = max
      expect(result.current.angleToMinutes(90)).toBe(19);   // Right (reversed)
      expect(result.current.angleToMinutes(180)).toBe(13);  // Bottom
      expect(result.current.angleToMinutes(270)).toBe(6);   // Left (reversed)
    });

    it('converts minutes to angles correctly', () => {
      const { result } = renderHook(() => useDialOrientation(false, '25min'));

      expect(result.current.minutesToAngle(0)).toBe(360);    // Start at 360
      expect(result.current.minutesToAngle(5)).toBe(288);    // 360 - 72
      expect(result.current.minutesToAngle(12.5)).toBe(180); // Half
      expect(result.current.minutesToAngle(25)).toBe(0);     // Full = 0
    });
  });

  describe('60min mode', () => {
    it('initializes with correct configuration', () => {
      const { result } = renderHook(() => useDialOrientation(true, '60min'));

      expect(result.current.config.maxMinutes).toBe(60);
      expect(result.current.config.degreesPerMinute).toBe(6); // 360 / 60
    });

    it('converts angles to minutes correctly', () => {
      const { result } = renderHook(() => useDialOrientation(true, '60min'));

      expect(result.current.angleToMinutes(0)).toBe(0);     // Top
      expect(result.current.angleToMinutes(90)).toBe(15);   // Right
      expect(result.current.angleToMinutes(180)).toBe(30);  // Bottom
      expect(result.current.angleToMinutes(270)).toBe(45);  // Left
    });
  });

  describe('Edge cases - NaN prevention', () => {
    it('handles invalid angle inputs', () => {
      const { result } = renderHook(() => useDialOrientation(true, '25min'));

      // Test NaN, undefined, null inputs
      expect(result.current.angleToMinutes(NaN)).toBe(0);
      expect(result.current.angleToMinutes(undefined)).toBe(0);
      expect(result.current.angleToMinutes(null)).toBe(0);
      expect(result.current.angleToMinutes(Infinity)).toBe(0);
      expect(result.current.angleToMinutes(-Infinity)).toBe(0);
    });

    it('handles invalid minute inputs', () => {
      const { result } = renderHook(() => useDialOrientation(true, '25min'));

      expect(result.current.minutesToAngle(NaN)).toBe(0);
      expect(result.current.minutesToAngle(undefined)).toBe(0);
      expect(result.current.minutesToAngle(null)).toBe(0);
      expect(result.current.minutesToAngle(Infinity)).toBe(360);
      expect(result.current.minutesToAngle(-Infinity)).toBe(0);
    });

    it('handles negative angles', () => {
      const { result } = renderHook(() => useDialOrientation(true, '25min'));

      expect(result.current.angleToMinutes(-90)).toBe(19);  // Normalizes to 270
      expect(result.current.angleToMinutes(-180)).toBe(13); // Normalizes to 180
      expect(result.current.angleToMinutes(-360)).toBe(0);  // Full negative circle
    });

    it('handles angles > 360', () => {
      const { result } = renderHook(() => useDialOrientation(true, '25min'));

      expect(result.current.angleToMinutes(450)).toBe(6);   // 450 % 360 = 90
      expect(result.current.angleToMinutes(720)).toBe(0);   // Two full circles
      expect(result.current.angleToMinutes(540)).toBe(13);  // 540 % 360 = 180
    });

    it('clamps minutes to valid range', () => {
      const { result } = renderHook(() => useDialOrientation(true, '25min'));

      // Minutes should be clamped between 0 and maxMinutes
      expect(result.current.minutesToAngle(-10)).toBe(0);
      expect(result.current.minutesToAngle(30)).toBe(360);  // Clamped to 25
      expect(result.current.minutesToAngle(100)).toBe(360); // Clamped to 25
    });
  });

  describe('String/number handling', () => {
    it('handles string inputs for angles', () => {
      const { result } = renderHook(() => useDialOrientation(true, '25min'));

      expect(result.current.angleToMinutes('90')).toBe(6);
      expect(result.current.angleToMinutes('180')).toBe(13);
      expect(result.current.angleToMinutes('invalid')).toBe(0); // NaN fallback
    });

    it('handles string inputs for minutes', () => {
      const { result } = renderHook(() => useDialOrientation(true, '25min'));

      expect(result.current.minutesToAngle('5')).toBe(72);
      expect(result.current.minutesToAngle('12.5')).toBe(180);
      expect(result.current.minutesToAngle('invalid')).toBe(0); // NaN fallback
    });
  });

  describe('Precision and rounding', () => {
    it('rounds minutes to nearest integer', () => {
      const { result } = renderHook(() => useDialOrientation(true, '25min'));

      expect(result.current.angleToMinutes(89)).toBe(6);   // Round 6.18
      expect(result.current.angleToMinutes(91)).toBe(6);   // Round 6.32
      expect(result.current.angleToMinutes(93)).toBe(6);   // Round 6.46
      expect(result.current.angleToMinutes(95)).toBe(7);   // Round 6.6
    });

    it('handles floating point precision', () => {
      const { result } = renderHook(() => useDialOrientation(true, '25min'));

      // Test precise decimal values
      expect(result.current.minutesToAngle(6.25)).toBe(90);
      expect(result.current.minutesToAngle(12.5)).toBe(180);
      expect(result.current.minutesToAngle(18.75)).toBe(270);
    });
  });
});
