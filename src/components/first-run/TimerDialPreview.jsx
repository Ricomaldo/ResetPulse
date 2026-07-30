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

export default function TimerDialPreview({
  progress = 0.42,
  duration = 3600,
  color,
  scaleMode = '60min',
  size,
  centerEmoji = null,
}) {
  // Fausse activité pour afficher l'emoji au centre
  const fakeActivity = centerEmoji ? { emoji: centerEmoji } : null;

  return (
    <TimerDial
      progress={progress}
      duration={duration}
      remaining={duration * progress}
      color={color}
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
