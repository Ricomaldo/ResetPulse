/**
 * @fileoverview useEmojiMovement - Anime l'emoji du centre du disque (Lot 3a)
 * @description Hook Reanimated 4 : retourne un style animé (`useAnimatedStyle`)
 * à poser sur l'`Animated.View` qui enveloppe le `Text` emoji dans PulseButton.
 * `tempo` = `pulseDuration` (ms) de l'Activité — rythme de base de tous les
 * Mouvements. Doux, jamais agressifs (public TDAH/TSA) — cf.
 * `_docs/specs/recentrage.md`, section « Mouvements ».
 *
 * Respecte le réglage système « réduire les animations » sans exception : le
 * hook consomme `useReducedMotion` (src/hooks/useReducedMotion.js, préexistant
 * — pas dupliqué ici) et neutralise tout mouvement, y compris la Distraction,
 * quand il est actif.
 *
 * Règles Reanimated 4 respectées :
 *   - shared values créées inconditionnellement (useSharedValue au top-level)
 *   - (re)lancement des animations dans un seul useEffect, dépendant de
 *     [movement, tempo, isActive]
 *   - cancelAnimation + reset à la valeur neutre à chaque changement/démontage
 *   - aucune fonction inline non-worklet dans useAnimatedStyle
 */
import { useEffect } from 'react';
import {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withSpring,
  cancelAnimation,
  Easing,
} from 'react-native-reanimated';
import { useReducedMotion } from '../../../hooks/useReducedMotion';

const NEUTRAL_RESET_DURATION = 200; // retour doux à l'identité, jamais un cut sec
const DEFAULT_TEMPO = 800; // repli si tempo absent/invalide (pulseDuration moyen)

/**
 * @param {Object} params
 * @param {string|null} params.movement - Un membre de MOVEMENTS, ou null/inconnu → neutre
 * @param {number} params.tempo - pulseDuration (ms) de l'Activité, rythme de base
 * @param {boolean} params.active - Mouvement autorisé dans l'état courant (REST/RUNNING)
 * @returns {Object} Style animé à poser sur l'Animated.View enveloppant l'emoji
 */
export default function useEmojiMovement({ movement, tempo, active }) {
  const reduceMotionEnabled = useReducedMotion();

  // Shared values — toujours créées, jamais conditionnelles (règle Reanimated).
  const scale = useSharedValue(1);
  const translateY = useSharedValue(0);
  const rotate = useSharedValue(0);
  const opacity = useSharedValue(1);

  // Reduce motion coupe TOUT mouvement, sans exception (public neuroatypique).
  const isActive = Boolean(active) && !reduceMotionEnabled;
  const safeTempo = tempo > 0 ? tempo : DEFAULT_TEMPO;

  useEffect(() => {
    // Toujours annuler avant de relancer — évite le chevauchement d'anim
    // quand movement/tempo/active changent en cours de boucle.
    cancelAnimation(scale);
    cancelAnimation(translateY);
    cancelAnimation(rotate);
    cancelAnimation(opacity);

    if (!isActive) {
      scale.value = withTiming(1, { duration: NEUTRAL_RESET_DURATION });
      translateY.value = withTiming(0, { duration: NEUTRAL_RESET_DURATION });
      rotate.value = withTiming(0, { duration: NEUTRAL_RESET_DURATION });
      opacity.value = withTiming(1, { duration: NEUTRAL_RESET_DURATION });
      return undefined;
    }

    switch (movement) {
    case 'breathe': {
      // scale 1 → 1.06 → 1, période = tempo × 2 (moitié montée, moitié descente)
      scale.value = withRepeat(
        withSequence(
          withTiming(1.06, { duration: safeTempo, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: safeTempo, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      );
      break;
    }
    case 'spin': {
      // Rotation continue linéaire, 360° en tempo × 8 — lente et régulière.
      rotate.value = 0;
      rotate.value = withRepeat(
        withTiming(360, { duration: safeTempo * 8, easing: Easing.linear }),
        -1,
        false
      );
      break;
    }
    case 'float': {
      // translateY 0 → −6 → 0 + fondu opacity 1 → 0.75 → 1, période = tempo × 3
      const half = (safeTempo * 3) / 2;
      translateY.value = withRepeat(
        withSequence(
          withTiming(-6, { duration: half, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: half, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      );
      opacity.value = withRepeat(
        withSequence(
          withTiming(0.75, { duration: half, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: half, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      );
      break;
    }
    case 'bounce': {
      // Rebond ressort (withSpring), amplitude ~5, un rebond par période tempo × 2.
      // Le repli (withDelay implicite via withTiming(0, ~30% de la période
      // restante)) laisse un temps de repos avant le rebond suivant — sans
      // dépendre d'une durée fixe de spring (physique, pas linéaire).
      const rest = Math.max(0, safeTempo * 2 * 0.5);
      translateY.value = withRepeat(
        withSequence(
          withSpring(-5, { damping: 6, stiffness: 180 }),
          withSpring(0, { damping: 8, stiffness: 160 }),
          withTiming(0, { duration: rest })
        ),
        -1,
        false
      );
      break;
    }
    case 'beat': {
      // Battement de cœur : double pulsation 1 → 1.1 → 1 → 1.06 → 1 puis repos,
      // période totale = tempo × 2. Les 4 transitions sont rapides (lub-dub),
      // le repos occupe le reste de la période.
      const beatUnit = safeTempo * 0.15;
      const restUnit = Math.max(0, safeTempo * 2 - beatUnit * 4);
      scale.value = withRepeat(
        withSequence(
          withTiming(1.1, { duration: beatUnit, easing: Easing.out(Easing.ease) }),
          withTiming(1, { duration: beatUnit, easing: Easing.in(Easing.ease) }),
          withTiming(1.06, { duration: beatUnit, easing: Easing.out(Easing.ease) }),
          withTiming(1, { duration: beatUnit, easing: Easing.in(Easing.ease) }),
          withTiming(1, { duration: restUnit })
        ),
        -1,
        false
      );
      break;
    }
    default: {
      // Movement inconnu : neutre, pas d'erreur silencieuse cachée.
      scale.value = withTiming(1, { duration: NEUTRAL_RESET_DURATION });
      translateY.value = withTiming(0, { duration: NEUTRAL_RESET_DURATION });
      rotate.value = withTiming(0, { duration: NEUTRAL_RESET_DURATION });
      opacity.value = withTiming(1, { duration: NEUTRAL_RESET_DURATION });
    }
    }

    return () => {
      cancelAnimation(scale);
      cancelAnimation(translateY);
      cancelAnimation(rotate);
      cancelAnimation(opacity);
    };
    // Deps volontairement restreintes à [movement, safeTempo, isActive] : les
    // shared values (scale/translateY/rotate/opacity) sont des refs stables
    // (useSharedValue), jamais recréées — les inclure ne changerait rien et
    // alourdirait la lecture (pas de plugin react-hooks/exhaustive-deps dans
    // ce projet pour l'imposer, cf. .eslintrc).
  }, [movement, safeTempo, isActive]);

  return useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { scale: scale.value },
      { translateY: translateY.value },
      { rotate: `${rotate.value}deg` },
    ],
  }));
}
