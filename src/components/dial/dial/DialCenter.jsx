/**
 * @fileoverview DialCenter - Centre du dial avec PulseButton (ADR-007)
 * @description Simplifié: utilise uniquement PulseButton pour tous les états
 * @created 2025-12-14
 * @updated 2025-12-19 (ADR-007: simplifié avec PulseButton)
 */
import PropTypes from 'prop-types';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { PulseButton } from '../../buttons';
import { useTimerConfig } from '../../../contexts/TimerConfigContext';
import { getProfileConfig } from '../../../utils/interactionProfileConfig';

/**
 * DialCenter - Affiche PulseButton au centre du dial
 *
 * @param {Object} activity - Objet activité (contient emoji et propriétés)
 * @param {boolean} isRunning - Timer en cours
 * @param {boolean} isCompleted - Timer terminé
 * @param {function} onTap - Callback tap (REST → start, COMPLETE → reset)
 * @param {function} onLongPressComplete - Callback long press (RUNNING → stop)
 * @param {boolean} clockwise - Sens du timer (pour animation)
 * @param {number} size - Taille du bouton
 */
const DialCenter = React.memo(function DialCenter({
  activity,
  isRunning,
  isCompleted = false,
  onTap,
  onLongPressComplete,
  clockwise = false,
  size = 72,
}) {
  // Get pulse setting and interaction profile from context
  const { display: { shouldPulse }, interaction: { interactionProfile } } = useTimerConfig();
  const profileConfig = getProfileConfig(interactionProfile);

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
        activity={activity}
        onTap={onTap}
        onLongPressComplete={onLongPressComplete}
        clockwise={clockwise}
        size={size}
        stopRequiresLongPress={profileConfig.stopRequiresLongPress}
        startRequiresLongPress={profileConfig.startRequiresLongPress}
        shouldPulse={shouldPulse}
      />
    </View>
  );
});

DialCenter.displayName = 'DialCenter';
DialCenter.propTypes = {
  activity: PropTypes.shape({
    emoji: PropTypes.string,
  }),
  clockwise: PropTypes.bool,
  isCompleted: PropTypes.bool,
  isRunning: PropTypes.bool.isRequired,
  onLongPressComplete: PropTypes.func,
  onTap: PropTypes.func,
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
