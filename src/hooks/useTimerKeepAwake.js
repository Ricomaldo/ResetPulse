// src/hooks/useTimerKeepAwake.js
/**
 * Hook pour maintenir l'écran allumé pendant le timer
 *
 * Comportement:
 * - Activé uniquement si timer running ET setting enabled
 * - Cleanup automatique au unmount
 * - App-scoped uniquement (pas système)
 *
 * @see docs/decisions/keep-awake-strategy.md
 * @see docs/decisions/keep-awake-technical-behavior.md
 */

import { useEffect } from 'react';
import { activateKeepAwake, deactivateKeepAwake } from 'expo-keep-awake';
import useTimer from './useTimer';
import { useTimerConfig } from '../contexts/TimerConfigContext';
import logger from '../utils/logger';

export const useTimerKeepAwake = () => {
  const { isRunning } = useTimer();
  const { system: { keepAwakeEnabled } } = useTimerConfig();

  useEffect(() => {
    // Activer keep awake uniquement si timer running ET setting enabled
    if (isRunning && keepAwakeEnabled) {
      activateKeepAwake('timer');

      logger.log('KeepAwake activated');
    } else {
      deactivateKeepAwake('timer');
      // Deactivation silencieuse (pas de log, comportement normal)
    }

    // Cleanup: Garantit désactivation si component unmount
    return () => {
      try {
        deactivateKeepAwake('timer');
        // Cleanup silencieux (remontages React normaux en dev)
      } catch (error) {
        // Expo Go dev mode peut throw "Unable to deactivate" (safe to ignore)
      }
    };
  }, [isRunning, keepAwakeEnabled]);
};
