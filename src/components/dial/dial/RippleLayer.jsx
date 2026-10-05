/**
 * @fileoverview RippleLayer — onde creuse du halo (T3-2), derrière le secteur.
 * Deux disques ronds superposés (A couleur translucide, B surface opaque) ;
 * rendue entre DialBase et DialProgress : l'onde passe sous le secteur écoulé,
 * l'emoji et le pivot. Rend null hors ENOW_HALO_WAVE + shouldPulse + haloRipple
 * + séance en cours.
 */
import PropTypes from 'prop-types';
import React from 'react';
import { View, StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';
import { useTimerConfig } from '../../../contexts/TimerConfigContext';
import { ENOW_HALO_WAVE } from '../../../config/enow-sketch';
import useRippleHalo from '../movements/useRippleHalo';

const RIPPLE_OPACITY = 0.18;

export default function RippleLayer({ active, size, color, surfaceColor, centerX, centerY }) {
  const { display: { shouldPulse, haloRipple, haloPeriodSec } } = useTimerConfig();
  const enabled = ENOW_HALO_WAVE && shouldPulse && haloRipple && active && size > 0;
  const { styleA, styleB } = useRippleHalo({ active: enabled, period: haloPeriodSec * 1000 });

  if (!enabled) {
    return null;
  }

  const disc = { width: size, height: size, borderRadius: size / 2, position: 'absolute' };
  return (
    <View
      pointerEvents="none"
      style={[styles.layer, { left: centerX - size / 2, top: centerY - size / 2, width: size, height: size }]}
      accessible={false}
      importantForAccessibility="no"
    >
      <Animated.View style={[disc, { backgroundColor: color, opacity: RIPPLE_OPACITY }, styleA]} />
      <Animated.View style={[disc, { backgroundColor: surfaceColor, opacity: 1 }, styleB]} />
    </View>
  );
}

RippleLayer.propTypes = {
  active: PropTypes.bool,
  centerX: PropTypes.number.isRequired,
  centerY: PropTypes.number.isRequired,
  color: PropTypes.string,
  size: PropTypes.number.isRequired,
  surfaceColor: PropTypes.string,
};

const styles = StyleSheet.create({
  layer: {
    position: 'absolute',
  },
});
