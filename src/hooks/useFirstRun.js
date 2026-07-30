// src/hooks/useFirstRun.js
// Première fois (Lot 2, C7) — flag persisté (ne se rejoue jamais après
// complétion/skip) + moment visible, dérivé de la progression réelle du
// rituel en construction (pas un compteur impératif à 4 pas). ADR-014 :
// aucune collecte, aucun profilage, ne bloque jamais rien.

import { useEffect, useState } from 'react';
import { usePersistedState } from './usePersistedState';
import logger from '../utils/logger';

const STORAGE_KEY = '@ResetPulse:hasSeenFirstRun';
// ADR-016 §1 — flag distinct pour le seuil (2 écrans chaleureux), qui ne se
// rejoue JAMAIS (Monde B). Séparé de hasSeenFirstRun (les tips C7, eux,
// vivent après le seuil, sur l'écran réel).
const THRESHOLD_STORAGE_KEY = '@ResetPulse:hasSeenThreshold';

export const useFirstRun = () => {
  const [hasSeenFirstRun, setHasSeenFirstRun, isFirstRunLoading] = usePersistedState(STORAGE_KEY, false);
  const [hasSeenThreshold, setHasSeenThreshold, isThresholdLoading] = usePersistedState(
    THRESHOLD_STORAGE_KEY,
    false
  );
  const isLoading = isFirstRunLoading || isThresholdLoading;
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
  // Le seuil (ADR-016 §1) ne se rejoue jamais — un seul geste de sortie
  // (le CTA de la page 2), pas de skip distinct.
  const completeThreshold = () => setHasSeenThreshold(true);

  return {
    isLoading,
    hasSeenFirstRun,
    hasSeenThreshold,
    moment,
    markActivityTouched,
    markDialTouched,
    markColorTouched,
    completeFirstRun,
    skipFirstRun,
    completeThreshold,
  };
};

export default useFirstRun;
