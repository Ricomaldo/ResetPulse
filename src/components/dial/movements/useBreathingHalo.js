/**
 * @fileoverview useBreathingHalo - Le halo qui respire autour du centre
 * @description Restauration du pulse originel de l'app (Lot 3a, retour Eric) :
 * un anneau dans la couleur courante qui s'étend et s'estompe autour du hub —
 * l'invitation silencieuse. Optionnel mais standard : piloté par le toggle
 * `shouldPulse` existant, actif au repos ET en séance. Respecte reduce motion
 * sans exception (public TDAH/TSA).
 *
 * Cycle : scale 1 → HALO_SCALE + opacity HALO_OPACITY → 0, période = tempo × 2
 * (le même souffle que `breathe`), puis recommence — une onde qui part du
 * centre et se dissout.
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

const HALO_SCALE = 1.45;
const HALO_OPACITY = 0.35;
const DEFAULT_TEMPO = 800;

/**
 * @param {Object} params
 * @param {number} params.tempo - pulseDuration (ms) de l'Activité
 * @param {boolean} params.active - Halo autorisé (shouldPulse && état non-complete)
 * @returns {Object} Style animé à poser sur le View du halo (cercle absolu)
 */
export default function useBreathingHalo({ tempo, active }) {
  const reduceMotionEnabled = useReducedMotion();

  const scale = useSharedValue(1);
  const opacity = useSharedValue(0);

  const isActive = Boolean(active) && !reduceMotionEnabled;
  const safeTempo = tempo > 0 ? tempo : DEFAULT_TEMPO;

  useEffect(() => {
    cancelAnimation(scale);
    cancelAnimation(opacity);

    if (!isActive) {
      opacity.value = withTiming(0, { duration: 200 });
      scale.value = withTiming(1, { duration: 200 });
      return undefined;
    }

    const period = safeTempo * 2;
    // L'onde : apparaît au centre, s'étend en s'estompant, courte pause, repart.
    scale.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 0 }),
        withTiming(HALO_SCALE, { duration: period * 0.8, easing: Easing.out(Easing.ease) }),
        withTiming(HALO_SCALE, { duration: period * 0.2 })
      ),
      -1,
      false
    );
    opacity.value = withRepeat(
      withSequence(
        withTiming(HALO_OPACITY, { duration: period * 0.15, easing: Easing.out(Easing.ease) }),
        withTiming(0, { duration: period * 0.65, easing: Easing.in(Easing.ease) }),
        withTiming(0, { duration: period * 0.2 })
      ),
      -1,
      false
    );

    return () => {
      cancelAnimation(scale);
      cancelAnimation(opacity);
    };
    // Deps restreintes : scale/opacity sont des refs stables (useSharedValue).
  }, [safeTempo, isActive]);

  return useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));
}
