// src/hooks/useFirstRun.js
// Première fois (Lot 2, C7) — flag persisté (ne se rejoue jamais après
// complétion/skip) + moment visible, dérivé de la progression réelle du
// rituel en construction (pas un compteur impératif à 4 pas). ADR-014 :
// aucune collecte, aucun profilage, ne bloque jamais rien.

import { useEffect, useState } from 'react';
import { usePersistedState } from './usePersistedState';
import logger from '../utils/logger';

const STORAGE_KEY = '@ResetPulse:hasSeenFirstRun';

export const useFirstRun = () => {
  const [hasSeenFirstRun, setHasSeenFirstRun, isLoading] = usePersistedState(STORAGE_KEY, false);
  const [activityTouched, setActivityTouched] = useState(false);
  const [dialTouched, setDialTouched] = useState(false);
  const [colorTouched, setColorTouched] = useState(false);

  // Résolution du moment visible, ordre de priorité descendant : une couleur
  // choisie saute directement au moment 4 même si le cadran n'a jamais été
  // touché — aucun ordre de gestes n'est imposé à l'user.
  let moment = null;
  if (!isLoading && !hasSeenFirstRun) {
    if (colorTouched) {
      moment = 4;
    } else if (activityTouched && dialTouched) {
      moment = 3;
    } else if (activityTouched) {
      moment = 2;
    } else {
      moment = 1;
    }
  }

  // Diagnostic (C7) : trace l'état résolu à chaque changement — cherché en
  // retest live (Eric signale ne jamais voir la Première fois se charger).
  // À retirer une fois le mystère élucidé.
  useEffect(() => {
    logger.log('[FirstRun] state', { isLoading, hasSeenFirstRun, moment });
  }, [isLoading, hasSeenFirstRun, moment]);

  const markActivityTouched = () => setActivityTouched(true);
  const markDialTouched = () => setDialTouched(true);
  const markColorTouched = () => setColorTouched(true);

  // Complétion (démarrage du timer) et skip partagent le même flag — « ne
  // se rejoue jamais » ne distingue pas comment l'user en est sorti.
  const completeFirstRun = () => setHasSeenFirstRun(true);
  const skipFirstRun = () => setHasSeenFirstRun(true);

  return {
    isLoading,
    hasSeenFirstRun,
    moment,
    markActivityTouched,
    markDialTouched,
    markColorTouched,
    completeFirstRun,
    skipFirstRun,
  };
};

export default useFirstRun;
