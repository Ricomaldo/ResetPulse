/**
 * @fileoverview Hook to detect and respond to system reduce-motion preference
 * @created 2025-12-14
 *
 * WCAG 2.3.3: Animations triggered by interaction should respect prefers-reduced-motion.
 * Critical for users with vestibular disorders, photosensitivity, or motion sensitivity.
 */

import { useState, useEffect } from 'react';
import { AccessibilityInfo } from 'react-native';

/**
 * useReducedMotion - Detects system reduce-motion preference
 *
 * @returns {boolean} True if user has enabled reduce motion in accessibility settings
 *
 * Usage:
 * ```javascript
 * const reduceMotionEnabled = useReducedMotion();
 *
 * useEffect(() => {
 *   if (reduceMotionEnabled) {
 *     // Skip animation or use instant version
 *     return;
 *   }
 *   // Start normal animation
 * }, [reduceMotionEnabled]);
 * ```
 */
export const useReducedMotion = () => {
  const [reduceMotionEnabled, setReduceMotionEnabled] = useState(false);

  useEffect(() => {
    let mounted = true;

    // Get initial value from system settings
    const checkReduceMotion = async () => {
      try {
        const isReduceMotionEnabled = await AccessibilityInfo.isReduceMotionEnabled();
        if (mounted) {
          setReduceMotionEnabled(isReduceMotionEnabled);
        }
      } catch (error) {
        // Fallback: assume motion is not reduced
        if (mounted) {
          setReduceMotionEnabled(false);
        }
      }
    };

    checkReduceMotion();

    // Listen for changes to accessibility settings
    try {
      const subscription = AccessibilityInfo.addEventListener(
        'reduceMotionChanged',
        (enabled) => {
          if (mounted) {
            setReduceMotionEnabled(enabled);
          }
        }
      );

      return () => {
        mounted = false;
        if (subscription && subscription.remove) {
          subscription.remove();
        }
      };
    } catch (error) {
      // Event listener not available, just use initial value
      return () => {
        mounted = false;
      };
    }
  }, []);

  return reduceMotionEnabled;
};

export default useReducedMotion;
