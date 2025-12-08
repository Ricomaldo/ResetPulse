import { renderHook } from '@testing-library/react-native';
import { useDialOrientation } from '../useDialOrientation';

describe('useDialOrientation', () => {
  describe('Core conversions - 25min mode', () => {
    it('should initialize with correct configuration for 25min mode', () => {
      const { result } = renderHook(() => useDialOrientation(true, '25min'));

      expect(result.current.config.maxMinutes).toBe(25);
      expect(result.current.config.degreesPerMinute).toBe(360 / 25);
    });

    it('should convert angles to minutes correctly (clockwise)', () => {
      const { result } = renderHook(() => useDialOrientation(true, '25min'));

      // Test key angles
      expect(result.current.angleToMinutes(0)).toBe(0);     // Top
      expect(result.current.angleToMinutes(90)).toBe(6);    // Right (~6.25 min)
      expect(result.current.angleToMinutes(180)).toBe(13);  // Bottom (~12.5 min)
      expect(result.current.angleToMinutes(270)).toBe(19);  // Left (~18.75 min)
      expect(result.current.angleToMinutes(360)).toBe(0);   // Full circle back to 0
    });

    it('should convert angles to minutes correctly (counter-clockwise)', () => {
      const { result } = renderHook(() => useDialOrientation(false, '25min'));

      // Counter-clockwise: minutes = (360 - angle) / degreesPerMinute
      // Note: 0° gives 25 which gets clamped to maxMinutes (25)
      expect(result.current.angleToMinutes(0)).toBe(25);    // Top = 360/14.4 = 25
      expect(result.current.angleToMinutes(90)).toBe(19);   // Right (reversed)
      expect(result.current.angleToMinutes(180)).toBe(13);  // Bottom
      expect(result.current.angleToMinutes(270)).toBe(6);   // Left (reversed)
      expect(result.current.angleToMinutes(360)).toBe(25);  // Full circle = 25 (clamped)
    });

    it('should convert minutes to angles correctly (clockwise)', () => {
      const { result } = renderHook(() => useDialOrientation(true, '25min'));

      expect(result.current.minutesToAngle(0)).toBe(0);
      expect(result.current.minutesToAngle(5)).toBe(72);    // 5 min = 72°
      expect(result.current.minutesToAngle(12.5)).toBe(180); // Half = 180°
      expect(result.current.minutesToAngle(25)).toBe(360);   // Full = 360°
    });

    it('should convert minutes to angles correctly (counter-clockwise)', () => {
      const { result } = renderHook(() => useDialOrientation(false, '25min'));

      expect(result.current.minutesToAngle(0)).toBe(360);    // Start at 360 for CCW
      expect(result.current.minutesToAngle(5)).toBe(288);    // 360 - 72
      expect(result.current.minutesToAngle(12.5)).toBe(180); // Half
      expect(result.current.minutesToAngle(25)).toBe(0);     // Full circle
    });
  });

  describe('Core conversions - 60min mode', () => {
    it('should initialize with correct configuration for 60min mode', () => {
      const { result } = renderHook(() => useDialOrientation(true, '60min'));

      expect(result.current.config.maxMinutes).toBe(60);
      expect(result.current.config.degreesPerMinute).toBe(6); // 360/60 = 6
    });

    it('should convert standard clock positions correctly (clockwise)', () => {
      const { result } = renderHook(() => useDialOrientation(true, '60min'));

      expect(result.current.angleToMinutes(0)).toBe(0);     // 12 o'clock
      expect(result.current.angleToMinutes(90)).toBe(15);   // 3 o'clock
      expect(result.current.angleToMinutes(180)).toBe(30);  // 6 o'clock
      expect(result.current.angleToMinutes(270)).toBe(45);  // 9 o'clock
    });

    it('should handle edge cases and boundaries', () => {
      const { result } = renderHook(() => useDialOrientation(true, '60min'));

      // Negative angles should normalize
      expect(result.current.angleToMinutes(-90)).toBe(45);  // -90° = 270°
      expect(result.current.angleToMinutes(-180)).toBe(30); // -180° = 180°

      // Over 360° should wrap
      expect(result.current.angleToMinutes(450)).toBe(15);  // 450° = 90°
      expect(result.current.angleToMinutes(720)).toBe(0);   // 720° = 0°
    });

    it('should clamp values to valid range', () => {
      const { result } = renderHook(() => useDialOrientation(true, '60min'));

      // Values should never exceed maxMinutes
      expect(result.current.angleToMinutes(365)).toBeLessThanOrEqual(60);
      expect(result.current.angleToMinutes(-5)).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Coordinate conversions', () => {
    it('should convert touch coordinates to minutes', () => {
      const { result } = renderHook(() => useDialOrientation(true, '60min'));
      const centerX = 100, centerY = 100;

      // Touch at top (12 o'clock) = 0 minutes
      expect(result.current.coordinatesToMinutes(100, 50, centerX, centerY)).toBe(0);

      // Touch at right (3 o'clock) = 15 minutes
      expect(result.current.coordinatesToMinutes(150, 100, centerX, centerY)).toBe(15);

      // Touch at bottom (6 o'clock) = 30 minutes
      expect(result.current.coordinatesToMinutes(100, 150, centerX, centerY)).toBe(30);

      // Touch at left (9 o'clock) = 45 minutes
      expect(result.current.coordinatesToMinutes(50, 100, centerX, centerY)).toBe(45);
    });
  });

  describe('SVG rendering helpers', () => {
    it('should return empty path for zero progress', () => {
      const { result } = renderHook(() => useDialOrientation(true, '60min'));
      const path = result.current.getProgressPath(0, 100, 100, 50);

      expect(path).toBe('');
    });

    it('should return null for full circle', () => {
      const { result } = renderHook(() => useDialOrientation(true, '60min'));
      const path = result.current.getProgressPath(1, 100, 100, 50);

      expect(path).toBeNull();
    });

    it('should generate valid number positions', () => {
      const { result } = renderHook(() => useDialOrientation(true, '25min'));
      const positions = result.current.getNumberPositions(80, 100, 100);

      // Should have 5 numbers for 25min mode (0, 5, 10, 15, 20)
      expect(positions).toHaveLength(5);
      expect(positions[0].value).toBe(0);
      expect(positions[1].value).toBe(5);
      expect(positions[4].value).toBe(20);

      // Each position should have x, y coordinates
      positions.forEach(pos => {
        expect(pos).toHaveProperty('x');
        expect(pos).toHaveProperty('y');
        expect(typeof pos.x).toBe('number');
        expect(typeof pos.y).toBe('number');
      });
    });

    it('should generate graduation marks', () => {
      const { result } = renderHook(() => useDialOrientation(true, '25min'));
      const marks = result.current.getGraduationMarks(100, 100, 100);

      // Should have 25 marks for 25min mode
      expect(marks).toHaveLength(25);

      // Check major marks (every 5 minutes)
      const majorMarks = marks.filter(m => m.isMajor);
      expect(majorMarks).toHaveLength(5); // 0, 5, 10, 15, 20

      // Each mark should have line coordinates
      marks.forEach(mark => {
        expect(mark).toHaveProperty('x1');
        expect(mark).toHaveProperty('y1');
        expect(mark).toHaveProperty('x2');
        expect(mark).toHaveProperty('y2');
        expect(mark).toHaveProperty('key');
      });
    });
  });

  describe('Mode switching', () => {
    it('should recalculate configuration when mode changes', () => {
      const { result, rerender } = renderHook(
        ({ isClockwise, scaleMode }) => useDialOrientation(isClockwise, scaleMode),
        { initialProps: { isClockwise: true, scaleMode: '25min' } }
      );

      expect(result.current.maxMinutes).toBe(25);

      // Switch to 60min mode
      rerender({ isClockwise: true, scaleMode: '60min' });
      expect(result.current.maxMinutes).toBe(60);
      expect(result.current.config.degreesPerMinute).toBe(6);
    });

    it('should maintain conversion accuracy when switching orientation', () => {
      const { result, rerender } = renderHook(
        ({ isClockwise, scaleMode }) => useDialOrientation(isClockwise, scaleMode),
        { initialProps: { isClockwise: true, scaleMode: '60min' } }
      );

      // Clockwise: 90° = 15 min
      expect(result.current.angleToMinutes(90)).toBe(15);

      // Switch to counter-clockwise
      rerender({ isClockwise: false, scaleMode: '60min' });
      // Counter-clockwise: 90° = 45 min (reversed)
      expect(result.current.angleToMinutes(90)).toBe(45);
    });
  });
});