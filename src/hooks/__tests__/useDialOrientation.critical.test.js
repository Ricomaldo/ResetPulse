import { renderHook } from '@testing-library/react-native';
import { useDialOrientation } from '../useDialOrientation';

/**
 * CRITICAL PATH TESTS - useDialOrientation
 * Tests essentiels pour les conversions angle/minutes
 * Focus sur les cas d'usage réels de l'interface
 */

describe('useDialOrientation - Critical Path Tests', () => {

  describe('🎯 Critical Path 1: Mode 25min (Pomodoro)', () => {

    it('should handle standard Pomodoro time points (clockwise)', () => {
      const { result } = renderHook(() => useDialOrientation(true, '25min'));

      // Key Pomodoro times
      expect(result.current.minutesToAngle(0)).toBe(0);      // Start
      expect(result.current.minutesToAngle(5)).toBe(72);     // 5 min mark
      expect(result.current.minutesToAngle(10)).toBe(144);   // 10 min mark
      expect(result.current.minutesToAngle(15)).toBe(216);   // 15 min mark
      expect(result.current.minutesToAngle(20)).toBe(288);   // 20 min mark
      expect(result.current.minutesToAngle(25)).toBe(360);   // Complete

      // Reverse: angle to minutes
      expect(result.current.angleToMinutes(0)).toBe(0);
      expect(result.current.angleToMinutes(72)).toBe(5);
      expect(result.current.angleToMinutes(144)).toBe(10);
      expect(result.current.angleToMinutes(216)).toBe(15);
      expect(result.current.angleToMinutes(288)).toBe(20);
      expect(result.current.angleToMinutes(360)).toBe(0); // Full circle
    });

    it('should handle user touch positions (25min mode)', () => {
      const { result } = renderHook(() => useDialOrientation(true, '25min'));
      const centerX = 150, centerY = 150;

      // User touches at cardinal points
      const topTouch = result.current.coordinatesToMinutes(150, 50, centerX, centerY);
      expect(topTouch).toBe(0); // Top = 0 minutes

      const rightTouch = result.current.coordinatesToMinutes(250, 150, centerX, centerY);
      expect(rightTouch).toBeCloseTo(6, 0); // Right ≈ 6.25 minutes

      const bottomTouch = result.current.coordinatesToMinutes(150, 250, centerX, centerY);
      expect(bottomTouch).toBeCloseTo(13, 0); // Bottom ≈ 12.5 minutes

      const leftTouch = result.current.coordinatesToMinutes(50, 150, centerX, centerY);
      expect(leftTouch).toBeCloseTo(19, 0); // Left ≈ 18.75 minutes
    });
  });

  describe('🎯 Critical Path 2: Mode 60min (Hour)', () => {

    it('should handle standard clock positions (clockwise)', () => {
      const { result } = renderHook(() => useDialOrientation(true, '60min'));

      // Clock positions
      expect(result.current.minutesToAngle(0)).toBe(0);      // 12 o'clock
      expect(result.current.minutesToAngle(15)).toBe(90);    // 3 o'clock
      expect(result.current.minutesToAngle(30)).toBe(180);   // 6 o'clock
      expect(result.current.minutesToAngle(45)).toBe(270);   // 9 o'clock
      expect(result.current.minutesToAngle(60)).toBe(360);   // Full hour

      // Reverse
      expect(result.current.angleToMinutes(0)).toBe(0);      // Top
      expect(result.current.angleToMinutes(90)).toBe(15);    // Right
      expect(result.current.angleToMinutes(180)).toBe(30);   // Bottom
      expect(result.current.angleToMinutes(270)).toBe(45);   // Left
    });

    it('should handle 5-minute increments (common timer setting)', () => {
      const { result } = renderHook(() => useDialOrientation(true, '60min'));

      // Every 5 minutes = 30 degrees
      for (let minutes = 0; minutes <= 60; minutes += 5) {
        const angle = result.current.minutesToAngle(minutes);
        expect(angle).toBe(minutes * 6); // 6 degrees per minute

        // Verify reverse conversion
        if (minutes < 60) { // Skip 60 as it wraps to 0
          expect(result.current.angleToMinutes(angle)).toBe(minutes);
        }
      }
    });
  });

  describe('🎯 Critical Path 3: Counter-Clockwise (Reverse)', () => {

    it('should reverse direction for counter-clockwise mode', () => {
      const { result: cw } = renderHook(() => useDialOrientation(true, '60min'));
      const { result: ccw } = renderHook(() => useDialOrientation(false, '60min'));

      // Clockwise: 15 min = 90° (right)
      expect(cw.current.minutesToAngle(15)).toBe(90);

      // Counter-clockwise: 15 min = 270° (left)
      expect(ccw.current.minutesToAngle(15)).toBe(270);

      // Verify angles map correctly
      expect(cw.current.angleToMinutes(90)).toBe(15);   // CW: right = 15
      expect(ccw.current.angleToMinutes(90)).toBe(45);  // CCW: right = 45
    });
  });

  describe('🎯 Critical Path 4: Progress Path Generation', () => {

    it('should generate correct SVG paths for progress', () => {
      const { result } = renderHook(() => useDialOrientation(true, '60min'));
      const centerX = 100, centerY = 100, radius = 50;

      // No progress
      const emptyPath = result.current.getProgressPath(0, centerX, centerY, radius);
      expect(emptyPath).toBe('');

      // Full progress (complete circle)
      const fullPath = result.current.getProgressPath(1, centerX, centerY, radius);
      expect(fullPath).toBeNull(); // Full circle returns null

      // Quarter progress
      const quarterPath = result.current.getProgressPath(0.25, centerX, centerY, radius);
      expect(quarterPath).toContain('M 100 100'); // Starts at center
      expect(quarterPath).toContain('L 100 50');  // Line to top
      expect(quarterPath).toContain('A 50 50');   // Arc with radius 50
    });
  });

  describe('🎯 Critical Path 5: Edge Cases & Boundaries', () => {

    it('should handle boundary values correctly', () => {
      const { result } = renderHook(() => useDialOrientation(true, '25min'));

      // Values at or beyond max should clamp
      expect(result.current.angleToMinutes(360)).toBe(0);   // Wraps to 0
      expect(result.current.angleToMinutes(361)).toBe(0);   // Just over
      expect(result.current.angleToMinutes(720)).toBe(0);   // Double rotation

      // Negative angles should normalize
      expect(result.current.angleToMinutes(-90)).toBe(19);  // -90° = 270°
      expect(result.current.angleToMinutes(-360)).toBe(0);  // Full negative rotation
    });

    it('should never return minutes outside valid range', () => {
      const { result } = renderHook(() => useDialOrientation(true, '25min'));

      // Test extreme values
      const testAngles = [-720, -360, -180, -90, 0, 90, 180, 270, 360, 450, 720, 1080];

      testAngles.forEach(angle => {
        const minutes = result.current.angleToMinutes(angle);
        expect(minutes).toBeGreaterThanOrEqual(0);
        expect(minutes).toBeLessThanOrEqual(25);
      });
    });
  });

  describe('🎯 Critical Path 6: UI Rendering Helpers', () => {

    it('should generate correct number positions for dial', () => {
      const { result } = renderHook(() => useDialOrientation(true, '25min'));
      const positions = result.current.getNumberPositions(80, 100, 100);

      // Should have numbers at 0, 5, 10, 15, 20 (not 25)
      expect(positions).toHaveLength(5);

      // Check values
      const values = positions.map(p => p.value);
      expect(values).toEqual([0, 5, 10, 15, 20]);

      // Verify positions are distributed around circle
      positions.forEach((pos, index) => {
        expect(pos.x).toBeDefined();
        expect(pos.y).toBeDefined();

        // First position (0) should be at top
        if (index === 0) {
          expect(pos.x).toBeCloseTo(100, 0); // Center X
          expect(pos.y).toBeCloseTo(20, 0);  // Top (100 - 80)
        }
      });
    });

    it('should generate graduation marks with major/minor distinction', () => {
      const { result } = renderHook(() => useDialOrientation(true, '25min'));
      const marks = result.current.getGraduationMarks(100, 100, 100);

      // 25 marks for 25 minutes
      expect(marks).toHaveLength(25);

      // Count major marks (every 5 minutes)
      const majorMarks = marks.filter(m => m.isMajor);
      expect(majorMarks).toHaveLength(5); // 0, 5, 10, 15, 20

      // Verify mark structure
      marks.forEach(mark => {
        expect(mark.key).toBeDefined();
        expect(mark.x1).toBeDefined();
        expect(mark.y1).toBeDefined();
        expect(mark.x2).toBeDefined();
        expect(mark.y2).toBeDefined();
        expect(mark.isMajor).toBeDefined();
      });
    });
  });

  describe('🎯 Mode Switching', () => {

    it('should update calculations when switching between modes', () => {
      const { result, rerender } = renderHook(
        ({ isClockwise, scaleMode }) => useDialOrientation(isClockwise, scaleMode),
        { initialProps: { isClockwise: true, scaleMode: '25min' } }
      );

      // 25min mode: 90° = ~6 minutes
      expect(result.current.angleToMinutes(90)).toBe(6);

      // Switch to 60min mode
      rerender({ isClockwise: true, scaleMode: '60min' });

      // 60min mode: 90° = 15 minutes
      expect(result.current.angleToMinutes(90)).toBe(15);
    });
  });
});