/**
 * @fileoverview PulseLogo — la marque ResetPulse dessinée en code (ADR-016,
 * retours Eric 31/07). Remplace `BrandLogo` (ancien lotus PNG, mort) sur le
 * seuil de la Première fois : un point plein + deux anneaux concentriques,
 * fidèle à `assets/icon.png` (point blanc, deux ondes, fond terracotta) —
 * ici en `theme.colors.brand.primary` sur le fond crème de l'écran.
 * @description Grammaire d'animation reprise telle quelle de
 * `dial/movements/useBreathingHalo.js` (withRepeat/withSequence/withTiming,
 * scale + opacity, cancelAnimation au cleanup) : SEUL le sujet qui doit
 * vivre ici change — pas un anneau unique qui respire (halo), mais deux
 * anneaux qui ÉMETTENT depuis le centre (naissent petits contre le point,
 * s'étendent à leur taille, s'estompent), décalés dans le temps pour un
 * effet d'onde successive. Jamais un scale du bloc entier (effet
 * hypnotique interdit, mandat ADR-016) : seuls les anneaux (fins, en
 * `borderWidth`, pas des disques pleins) bougent : le point reste fixe.
 * Reduce motion (`useReducedMotion`) : anneaux figés à leur taille et
 * opacité de repos — le logo reste un logo, jamais un point seul.
 */
import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withDelay,
  withTiming,
  cancelAnimation,
  Easing,
} from 'react-native-reanimated';
import { useTheme } from '../../theme/ThemeProvider';
import { useReducedMotion } from '../../hooks/useReducedMotion';

// Période de la boucle d'émission (mandat ADR-016 : ~2,2 s).
const PERIOD = 2200;
// Décalage entre les deux anneaux — la moitié de la période : le second
// anneau naît quand le premier est à mi-course de son estompement, effet
// d'onde successive plutôt que deux anneaux qui pulsent à l'unisson.
const RING_STAGGER = PERIOD / 2;
// Un anneau naît petit contre le point puis s'étend à sa taille de repos.
const RING_BORN_SCALE = 0.25;
const RING_FULL_SCALE = 1;

// Proportions du dessin, relatives à `size`.
const DOT_RATIO = 0.16;
const RING_1_RATIO = 0.55;
const RING_2_RATIO = 0.92;
const RING_BORDER_RATIO = 0.02;
const RING_BORDER_MIN = 1.5;

// Opacités : anneau intérieur plus présent que l'extérieur (fidèle au
// dégradé de l'icône), aussi bien au repos (reduce motion, statique) qu'au
// pic de l'animation.
const RING_1_STATIC_OPACITY = 0.5;
const RING_1_PEAK_OPACITY = 0.55;
const RING_2_STATIC_OPACITY = 0.25;
const RING_2_PEAK_OPACITY = 0.3;

/**
 * Un anneau qui émet : boucle scale (RING_BORN_SCALE → RING_FULL_SCALE) +
 * opacity (peak → 0), même charpente temporelle que useBreathingHalo
 * (0.8/0.2 pour le scale, 0.15/0.65/0.2 pour l'opacité), avec un délai de
 * démarrage propre à chaque anneau (`delayMs`) pour l'onde successive.
 * Reduce motion : figé à l'échelle pleine, opacité de repos.
 */
function useEmittingRing({ peakOpacity, staticOpacity, delayMs, reduceMotionEnabled }) {
  const scale = useSharedValue(reduceMotionEnabled ? RING_FULL_SCALE : RING_BORN_SCALE);
  const opacity = useSharedValue(reduceMotionEnabled ? staticOpacity : 0);

  useEffect(() => {
    cancelAnimation(scale);
    cancelAnimation(opacity);

    if (reduceMotionEnabled) {
      scale.value = withTiming(RING_FULL_SCALE, { duration: 200 });
      opacity.value = withTiming(staticOpacity, { duration: 200 });
      return undefined;
    }

    scale.value = withDelay(
      delayMs,
      withRepeat(
        withSequence(
          withTiming(RING_BORN_SCALE, { duration: 0 }),
          withTiming(RING_FULL_SCALE, { duration: PERIOD * 0.8, easing: Easing.out(Easing.ease) }),
          withTiming(RING_FULL_SCALE, { duration: PERIOD * 0.2 })
        ),
        -1,
        false
      )
    );
    opacity.value = withDelay(
      delayMs,
      withRepeat(
        withSequence(
          withTiming(peakOpacity, { duration: PERIOD * 0.15, easing: Easing.out(Easing.ease) }),
          withTiming(0, { duration: PERIOD * 0.65, easing: Easing.in(Easing.ease) }),
          withTiming(0, { duration: PERIOD * 0.2 })
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
  }, [reduceMotionEnabled, delayMs, peakOpacity, staticOpacity]);

  return useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));
}

export default function PulseLogo({ size = 120, style }) {
  const theme = useTheme();
  const reduceMotionEnabled = useReducedMotion();
  const brandColor = theme.colors.brand.primary;

  const dotDiameter = size * DOT_RATIO;
  const ring1Diameter = size * RING_1_RATIO;
  const ring2Diameter = size * RING_2_RATIO;
  const ringBorderWidth = Math.max(RING_BORDER_MIN, size * RING_BORDER_RATIO);

  const ring1Style = useEmittingRing({
    peakOpacity: RING_1_PEAK_OPACITY,
    staticOpacity: RING_1_STATIC_OPACITY,
    delayMs: 0,
    reduceMotionEnabled,
  });
  const ring2Style = useEmittingRing({
    peakOpacity: RING_2_PEAK_OPACITY,
    staticOpacity: RING_2_STATIC_OPACITY,
    delayMs: RING_STAGGER,
    reduceMotionEnabled,
  });

  const styles = StyleSheet.create({
    container: {
      alignItems: 'center',
      height: size,
      justifyContent: 'center',
      width: size,
    },
    dot: {
      backgroundColor: brandColor,
      borderRadius: dotDiameter / 2,
      height: dotDiameter,
      left: (size - dotDiameter) / 2,
      position: 'absolute',
      top: (size - dotDiameter) / 2,
      width: dotDiameter,
    },
    ring: {
      position: 'absolute',
    },
  });

  // Insets explicites (top/left) plutôt que compter sur le centrage Yoga
  // d'un enfant absolu plus petit que son parent — comportement non garanti
  // selon la version de RN. Le scale continue de partir du centre de sa
  // propre boîte (transform origin par défaut), donc l'effet d'émission
  // depuis le centre reste intact.
  return (
    <View style={[styles.container, style]} accessible={false} pointerEvents="none">
      <Animated.View
        style={[
          styles.ring,
          {
            borderColor: brandColor,
            borderRadius: ring2Diameter / 2,
            borderWidth: ringBorderWidth,
            height: ring2Diameter,
            left: (size - ring2Diameter) / 2,
            top: (size - ring2Diameter) / 2,
            width: ring2Diameter,
          },
          ring2Style,
        ]}
      />
      <Animated.View
        style={[
          styles.ring,
          {
            borderColor: brandColor,
            borderRadius: ring1Diameter / 2,
            borderWidth: ringBorderWidth,
            height: ring1Diameter,
            left: (size - ring1Diameter) / 2,
            top: (size - ring1Diameter) / 2,
            width: ring1Diameter,
          },
          ring1Style,
        ]}
      />
      <View style={styles.dot} />
    </View>
  );
}

PulseLogo.propTypes = {
  size: PropTypes.number,
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
};
