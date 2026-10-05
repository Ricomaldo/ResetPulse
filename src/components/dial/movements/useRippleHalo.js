/**
 * @fileoverview useRippleHalo — onde creuse du halo (T3-2), deux disques scalés.
 * Même mécanique que l'onde pleine (Reanimated, `scale` sur une View) — le
 * Circle SVG animé ne rendait rien dans ce projet.
 * Disque A (couleur, translucide) et disque B (couleur de la surface du
 * cadran, opaque, au-dessus). Boucle d'une période T :
 *   PHASE 1 (T/2) : A grandit du centre (0.02 → 1, out), B tenu petit.
 *   PHASE 2 (T/2) : A tenu à 1, B grandit (0.02 → 1, in) : il « vide » A
 *   depuis le centre ; l'anneau restant s'amincit vers la bordure et disparaît.
 *   Reset instantané des deux à 0.02 (invisible : B couvre alors tout A).
 */
import { useEffect } from 'react';
import {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  cancelAnimation,
  Easing,
} from 'react-native-reanimated';
import { useReducedMotion } from '../../../hooks/useReducedMotion';

const MIN_SCALE = 0.02;

/**
 * @param {Object} params
 * @param {boolean} params.active - Onde autorisée
 * @param {number} params.period - Période complète en ms
 * @returns {{styleA: Object, styleB: Object}} styles animés des deux disques
 */
export default function useRippleHalo({ active, period }) {
  const reduceMotionEnabled = useReducedMotion();
  const scaleA = useSharedValue(MIN_SCALE);
  const scaleB = useSharedValue(MIN_SCALE);
  const isActive = Boolean(active) && !reduceMotionEnabled;

  useEffect(() => {
    cancelAnimation(scaleA);
    cancelAnimation(scaleB);
    scaleA.value = MIN_SCALE;
    scaleB.value = MIN_SCALE;
    if (!isActive) {
      return undefined;
    }
    const half = period / 2;
    scaleA.value = withRepeat(
      withSequence(
        withTiming(MIN_SCALE, { duration: 0 }),
        withTiming(1, { duration: half, easing: Easing.out(Easing.quad) }),
        withTiming(1, { duration: half })
      ),
      -1,
      false
    );
    scaleB.value = withRepeat(
      withSequence(
        withTiming(MIN_SCALE, { duration: 0 }),
        withTiming(MIN_SCALE, { duration: half }),
        withTiming(1, { duration: half, easing: Easing.in(Easing.quad) })
      ),
      -1,
      false
    );
    return () => {
      cancelAnimation(scaleA);
      cancelAnimation(scaleB);
      scaleA.value = MIN_SCALE;
      scaleB.value = MIN_SCALE;
    };
  }, [isActive, period, scaleA, scaleB]);

  const styleA = useAnimatedStyle(() => ({ transform: [{ scale: scaleA.value }] }));
  const styleB = useAnimatedStyle(() => ({ transform: [{ scale: scaleB.value }] }));
  return { styleA, styleB };
}
