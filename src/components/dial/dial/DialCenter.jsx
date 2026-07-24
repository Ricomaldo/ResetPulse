/**
 * @fileoverview DialCenter - Centre du dial avec PulseButton (ADR-007)
 * @description Simplifié: utilise uniquement PulseButton pour tous les états
 * @created 2025-12-14
 * @updated 2026-07-25 (C6.2 fidélité au rendu : purement visuel, le tap
 * appartient au disque entier via TimerDial — `onTap` retiré)
 */
import PropTypes from 'prop-types';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { PulseButton } from '../../buttons';
import { useTimerConfig } from '../../../contexts/TimerConfigContext';

/**
 * DialCenter - Affiche PulseButton au centre du dial
 *
 * @param {Object} activity - Objet activité (contient emoji et propriétés)
 * @param {boolean} isRunning - Timer en cours
 * @param {boolean} isCompleted - Timer terminé
 * @param {string} color - Couleur courante du disque (suit la palette en direct)
 * @param {boolean} clockwise - Sens du timer (pour animation)
 * @param {number} size - Taille du bouton
 * @param {string|null} distractionMovement - Mouvement MOT-f (dé Distraction),
 *   override le mouvement courant de PulseButton quand non-null (Lot 3a)
 */
const DialCenter = React.memo(function DialCenter({
  activity,
  isRunning,
  isCompleted = false,
  color = null,
  clockwise = false,
  size = 72,
  distractionMovement = null,
}) {
  const { display: { shouldPulse } } = useTimerConfig();

  // Déterminer l'état du bouton
  const getState = () => {
    if (isRunning) {return 'running';}
    if (isCompleted) {return 'complete';}
    return 'rest';
  };

  return (
    <View style={styles.container}>
      <PulseButton
        state={getState()}
        // ✨ REJOINT l'emoji, ne le remplace pas — le compagnon reste jusqu'au
        // bout (verdicts CD Q5). Sans emoji d'activité : ✨ seul.
        emoji={isCompleted ? `${activity?.emoji ?? ''}✨` : null}
        activity={activity}
        color={color}
        clockwise={clockwise}
        size={size}
        shouldPulse={shouldPulse}
        distractionMovement={distractionMovement}
      />
    </View>
  );
});

DialCenter.displayName = 'DialCenter';
DialCenter.propTypes = {
  activity: PropTypes.shape({
    emoji: PropTypes.string,
    movement: PropTypes.string,
    pulseDuration: PropTypes.number,
  }),
  clockwise: PropTypes.bool,
  color: PropTypes.string,
  distractionMovement: PropTypes.string,
  isCompleted: PropTypes.bool,
  isRunning: PropTypes.bool.isRequired,
  size: PropTypes.number,
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    bottom: 0,
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
});

export default DialCenter;
