/**
 * @fileoverview useBreathingHalo - Le halo qui respire autour du centre
 * @description Restauration du pulse originel de l'app (Lot 3a, retour Eric) :
 * un anneau dans la couleur courante qui s'étend et s'estompe autour du hub —
 * l'invitation silencieuse. Optionnel mais standard : piloté par le toggle
 * `shouldPulse` existant, actif en séance (RUNNING) — cf. PulseButton pour
 * les conditions d'activation, ce hook ne les porte pas. Respecte reduce
 * motion sans exception (public TDAH/TSA).
 *
 * Cycle réécrit (retour device Eric 05/08 : « ça s'accroît en douceur, puis
 * flash à grand rayon, puis ça repart petit »). Cause : l'ancien cycle
 * terminait le grow ET le fade EXACTEMENT au même instant, sans marge — le
 * grow utilisait un easing différent du fade (out vs in), donc l'anneau
 * atteignait sa taille quasi-max PENDANT que l'opacité restait encore haute
 * (ease-in retarde la chute), lu comme un flash à grand rayon ; puis le
 * reset de scale (1.45→1, duration 0) tombait sans filet de sécurité. 3
 * phases explicites désormais, scale et opacity strictement synchronisés
 * phase par phase :
 *   1. NAISSANCE (BIRTH_FRACTION) : l'anneau apparaît à sa taille de base
 *      (scale ne bouge pas), opacité monte.
 *   2. EXTENSION (EXTEND_FRACTION) : scale ET opacity animent sur EXACTEMENT
 *      la même durée et le même easing — grandir et s'estomper au même
 *      rythme, jamais l'un en avance sur l'autre.
 *   3. MORT (DEAD_FRACTION, ~18 % de la période) : opacité 0 TENUE
 *      explicitement — c'est PENDANT cette phase que le reset de scale se
 *      produit, invisible par construction (l'opacité y est à 0 avant,
 *      pendant et après le reset).
 * Période = tempo × 2 (le même souffle que `breathe`).
 *
 * Synchro avec l'emoji (PulseButton/useEmojiMovement, mouvement `breathe`,
 * même période tempo × 2) : l'emoji inspire (grossit) sur la 1re moitié de
 * sa période, expire sur la 2e — le halo doit émettre son onde au moment de
 * l'expiration, pas de l'inspiration (retour Eric : « l'anim de l'emoji et
 * celle du halo ne sont pas bien synchronisées »). Les deux hooks démarrent
 * au même render (mêmes deps state/shouldPulse dans PulseButton) : pas
 * besoin d'horloge/trigger partagé, un simple décalage de démarrage d'une
 * demi-période (HALO_START_DELAY_FRACTION) suffit à caler la naissance du
 * halo sur l'instant où l'emoji commence à expirer — géométrie la plus
 * simple, l'emoji pilote (non touché), le halo dérive.
 */
import { useEffect } from 'react';
import {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  cancelAnimation,
  Easing,
} from 'react-native-reanimated';
import { useReducedMotion } from '../../../hooks/useReducedMotion';

const HALO_SCALE = 1.45;
const HALO_OPACITY = 0.35;
const DEFAULT_TEMPO = 800;

// Fractions de la période (safeTempo × 2) — doivent sommer à 1.
const BIRTH_FRACTION = 0.10;
const EXTEND_FRACTION = 0.72;
const DEAD_FRACTION = 0.18; // dans la fourchette demandée (~15-20 %)

// Décalage de démarrage : moitié de période, cale la naissance du halo sur
// l'expiration de l'emoji (cf. commentaire fileoverview).
const HALO_START_DELAY_FRACTION = 0.5;

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
    const birth = period * BIRTH_FRACTION;
    const extend = period * EXTEND_FRACTION;
    const dead = period * DEAD_FRACTION;
    const startDelay = period * HALO_START_DELAY_FRACTION;
    // Même easing sur scale ET opacity pendant EXTEND — garantit qu'à tout
    // instant la fraction de grandissement == la fraction d'estompage,
    // aucune fenêtre où l'anneau est déjà grand ET encore bien visible.
    const extendEasing = Easing.out(Easing.ease);

    scale.value = withDelay(
      startDelay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: birth }), // naît petit — taille figée, seule l'opacité bouge
          withTiming(HALO_SCALE, { duration: extend, easing: extendEasing }), // s'étend AU RYTHME de l'estompage (opacity, ci-dessous)
          withTiming(1, { duration: 0 }), // reset — invisible : tombe pile au début de la phase morte
          withTiming(1, { duration: dead }) // tenu jusqu'à la fin de la phase morte
        ),
        -1,
        false
      )
    );
    opacity.value = withDelay(
      startDelay,
      withRepeat(
        withSequence(
          withTiming(HALO_OPACITY, { duration: birth, easing: extendEasing }), // apparaît
          withTiming(0, { duration: extend, easing: extendEasing }), // s'estompe — même durée/easing que le grow de scale
          withTiming(0, { duration: dead }) // MORT tenue — le reset de scale ci-dessus s'y cache
        ),
        -1,
        false
      )
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
