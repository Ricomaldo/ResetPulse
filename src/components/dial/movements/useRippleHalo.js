/**
 * @fileoverview useRippleHalo — onde creuse du halo (T3-2), API `Animated` de
 * React Native (pilotée côté JS, useNativeDriver: false).
 * Pourquoi pas Reanimated : `useAnimatedProps` n'applique pas r/strokeWidth au
 * Circle de react-native-svg dans ce projet (rien ne s'affichait, vérifié au
 * simulateur). `Animated.createAnimatedComponent(Circle)` est la méthode
 * documentée de react-native-svg.
 *
 * Boucle d'une période T :
 *   PHASE 1 (T/2) : le disque plein grandit du centre (outer 0.5 → R, inner 0).
 *   PHASE 2 (T/2) : outer tenu à R, inner 0 → R (in) — le trou grandit depuis
 *   le centre, l'anneau s'amincit vers la bordure puis disparaît.
 *   Reset instantané (outer 0.5, inner 0) invisible : l'anneau est alors nul.
 * Planchers à 0.5 sur r et strokeWidth : à 0 ou NaN, RNSVGCircle produit une
 * géométrie NaN (crash CALayer).
 */
import { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';
import { useReducedMotion } from '../../../hooks/useReducedMotion';

const RIPPLE_MIN = 0.5;

/**
 * @param {Object} params
 * @param {boolean} params.active - Onde autorisée (haloRipple && halo actif)
 * @param {number} params.period - Période complète en ms
 * @param {number} params.radius - R (px) du cadran, > 0
 * @returns {{r: Animated.AnimatedInterpolation, strokeWidth: Animated.AnimatedInterpolation}}
 */
export default function useRippleHalo({ active, period, radius }) {
  const reduceMotionEnabled = useReducedMotion();
  const outer = useRef(new Animated.Value(RIPPLE_MIN)).current;
  const inner = useRef(new Animated.Value(0)).current;
  const R = Number.isFinite(radius) && radius > 0 ? radius : 1;
  const isActive = Boolean(active) && !reduceMotionEnabled;

  useEffect(() => {
    outer.setValue(RIPPLE_MIN);
    inner.setValue(0);
    if (!isActive) {
      return undefined;
    }
    const half = period / 2;
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(outer, {
          toValue: R,
          duration: half,
          easing: Easing.out(Easing.quad),
          useNativeDriver: false,
        }),
        Animated.timing(inner, {
          toValue: R,
          duration: half,
          easing: Easing.in(Easing.quad),
          useNativeDriver: false,
        }),
        Animated.parallel([
          Animated.timing(outer, { toValue: RIPPLE_MIN, duration: 0, useNativeDriver: false }),
          Animated.timing(inner, { toValue: 0, duration: 0, useNativeDriver: false }),
        ]),
      ])
    );
    animation.start();
    return () => {
      animation.stop();
      outer.setValue(RIPPLE_MIN);
      inner.setValue(0);
    };
  }, [isActive, period, R, outer, inner]);

  const clampRange = { inputRange: [0, R], outputRange: [RIPPLE_MIN, R], extrapolate: 'clamp' };
  return {
    r: Animated.divide(Animated.add(outer, inner), 2).interpolate(clampRange),
    strokeWidth: Animated.subtract(outer, inner).interpolate(clampRange),
  };
}
