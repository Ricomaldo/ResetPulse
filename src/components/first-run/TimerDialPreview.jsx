/**
 * @fileoverview TimerDialPreview — cadran non-interactif pour le seuil de
 * la Première fois (ADR-016 §1). Restauré depuis l'ancien namespace
 * `onboarding` (mort, machinerie 9 étapes) — chemin d'import vers TimerDial
 * inchangé (même profondeur : components/first-run/ comme components/
 * onboarding/). Aperçu figé, aucune interactivité.
 */
import React from 'react';
import PropTypes from 'prop-types';
import TimerDial from '../dial/TimerDial';
import { useTheme } from '../../theme/ThemeProvider';

export default function TimerDialPreview({
  progress = 0.42,
  duration = 3600,
  color,
  scaleMode = '60min',
  size,
  centerEmoji = null,
}) {
  const theme = useTheme();
  // Repli couleur de marque (P1-4, review design) : sans `color` explicite,
  // TimerDial retombait sur `theme.colors.energy` — token JAMAIS défini
  // (aucune occurrence dans theme/colors.js) — l'arc rendait donc en noir
  // SVG par défaut : quasi invisible en dark (noir sur fond quasi-noir), à
  // peine visible en light. Le seuil est la première rencontre avec le
  // produit : secteur ORANGE SIGNATURE imposé dans les deux thèmes, jamais
  // un défaut fantôme. Le bug plus profond (`theme.colors.energy`
  // manquant dans TimerDial.jsx/DialProgress.jsx) reste hors scope ici —
  // signalé au rapport, pas touché (pas le noyau du disque).
  const arcColor = color || theme.colors.brand.primary;
  // Fausse activité pour afficher l'emoji au centre
  const fakeActivity = centerEmoji ? { emoji: centerEmoji } : null;

  return (
    <TimerDial
      progress={progress}
      duration={duration}
      remaining={duration * progress}
      color={arcColor}
      size={size}
      scaleMode={scaleMode}
      showNumbers={true}
      showGraduations={true}
      showActivityEmoji={!!centerEmoji}
      showPlayButton={!!centerEmoji}
      showCenterDisk={!centerEmoji}
      centerImage={null}
      isRunning={false}
      currentActivity={fakeActivity}
      // Aucune interactivité
      onGraduationTap={null}
      onDialTap={null}
    />
  );
}

TimerDialPreview.propTypes = {
  progress: PropTypes.number,
  duration: PropTypes.number,
  color: PropTypes.string,
  scaleMode: PropTypes.string,
  size: PropTypes.number,
  centerEmoji: PropTypes.string,
};
