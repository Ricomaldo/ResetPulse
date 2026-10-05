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
  useAnimatedProps,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  cancelAnimation,
  Easing,
} from 'react-native-reanimated';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import { ENOW_HALO_WAVE } from '../../../config/enow-sketch';

const HALO_SCALE = 1.45;
const HALO_OPACITY = 0.35;
const DEFAULT_TEMPO = 800;

// Mode onde (ENOW_HALO_WAVE) : naît au centre, aller-retour = la période exacte.
const WAVE_MIN_SCALE = 0.05;
const WAVE_OPACITY = 0.18;
const DEFAULT_WAVE_PERIOD = 1000;
const DEFAULT_WAVE_MAX_SCALE = 3;

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
 * @param {number} [params.wavePeriod] - Période de l'onde en ms (ENOW_HALO_WAVE)
 * @param {number} [params.waveMaxScale] - Scale max de l'onde (ENOW_HALO_WAVE)
 * @param {boolean} [params.ripple] - Onde creuse (grandit puis se vide depuis le centre)
 * @param {number} [params.rippleRadius] - Rayon R (px) du cadran, extérieur final de l'onde creuse
 * @returns {{style: Object, animatedProps: Object}} style animé du View du halo
 *   (cercle absolu) et animatedProps du Circle SVG de l'onde creuse
 */
export default function useBreathingHalo({
  tempo,
  active,
  wavePeriod = DEFAULT_WAVE_PERIOD, // ms, aller-retour complet (mode onde)
  waveMaxScale = DEFAULT_WAVE_MAX_SCALE, // scale atteint à la bordure du cadran (mode onde)
  ripple = false, // onde creuse : le disque grandit puis se vide depuis le centre
  rippleRadius = 100, // rayon (px) du cadran : l'onde creuse y atteint son extérieur (R)
}) {
  const reduceMotionEnabled = useReducedMotion();

  const scale = useSharedValue(ENOW_HALO_WAVE ? WAVE_MIN_SCALE : 1);
  const opacity = useSharedValue(0);
  const outer = useSharedValue(0); // onde creuse : rayon extérieur (px), 0 → R
  const inner = useSharedValue(0); // onde creuse : rayon intérieur (px), 0 → R

  const isActive = Boolean(active) && !reduceMotionEnabled;
  const safeTempo = tempo > 0 ? tempo : DEFAULT_TEMPO;

  useEffect(() => {
    cancelAnimation(scale);
    cancelAnimation(opacity);

    if (!isActive) {
      opacity.value = withTiming(0, { duration: 200 });
      scale.value = withTiming(ENOW_HALO_WAVE ? WAVE_MIN_SCALE : 1, { duration: 200 });
      return undefined;
    }

    if (ENOW_HALO_WAVE && ripple) {
      const half = wavePeriod / 2;
      // Reset invisible en début de boucle : outer et inner repartent à 0.
      // PHASE 1 : le disque plein grandit du centre (outer 0 → R, inner 0).
      // PHASE 2 : outer tenu à R, inner 0 → R (in) — le trou grandit depuis
      // le centre, l'anneau s'amincit vers la bordure puis disparaît.
      outer.value = withRepeat(
        withSequence(
          withTiming(0, { duration: 0 }),
          withTiming(rippleRadius, { duration: half, easing: Easing.out(Easing.ease) }),
          withTiming(rippleRadius, { duration: half })
        ),
        -1,
        false
      );
      inner.value = withRepeat(
        withSequence(
          withTiming(0, { duration: 0 }),
          withTiming(0, { duration: half }),
          withTiming(rippleRadius, { duration: half, easing: Easing.in(Easing.ease) })
        ),
        -1,
        false
      );
      return () => {
        cancelAnimation(outer);
        cancelAnimation(inner);
      };
    }

    if (ENOW_HALO_WAVE) {
      scale.value = WAVE_MIN_SCALE;
      scale.value = withRepeat(
        withSequence(
          withTiming(waveMaxScale, { duration: wavePeriod / 2, easing: Easing.inOut(Easing.ease) }),
          withTiming(WAVE_MIN_SCALE, { duration: wavePeriod / 2, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      );
      opacity.value = withTiming(WAVE_OPACITY, { duration: 200 });
      return () => {
        cancelAnimation(scale);
        cancelAnimation(opacity);
      };
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
  }, [safeTempo, isActive, wavePeriod, waveMaxScale, ripple, rippleRadius]);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  // Onde creuse (SVG) : cercle dont le rayon médian et l'épaisseur dérivent
  // des rayons extérieur et intérieur.
  const animatedProps = useAnimatedProps(() => ({
    r: (outer.value + inner.value) / 2,
    strokeWidth: Math.max(outer.value - inner.value, 0),
  }));

  return { style, animatedProps };
}
